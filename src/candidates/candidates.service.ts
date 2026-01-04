import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './entities/candidate.entity';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepo: Repository<Candidate>,
  ) {}

  async create(data: any) {
    // 1. Lấy thời gian thực tế (Không cần cộng trừ thủ công nữa)
    const now = new Date(); 

    // Cấu hình thời gian CHUẨN QUỐC TẾ (Thêm đuôi +07:00 vào cuối)
    const rounds = [
        {
            name: "Vòng Sơ loại 1",
            start: new Date('2025-10-01T00:00:00+07:00'), 
            end:   new Date('2025-11-30T23:59:59+07:00')
        },
        {
            name: "Vòng Sơ loại 2",
            // Lưu ý: Đuôi +07:00 để khẳng định đây là giờ Việt Nam
            start: new Date('2025-12-04T14:15:00+07:00'), 
            end:   new Date('2026-01-15T23:59:59+07:00')
        },
    ];

    // 2. Kiểm tra hợp lệ
    let isOpen = false;
    let currentRound = "";

    for (const round of rounds) {
        // So sánh trực tiếp (JS sẽ tự quy đổi về cùng một hệ quy chiếu milliseconds)
        if (now >= round.start && now <= round.end) {
            isOpen = true;
            currentRound = round.name;
            break;
        }
    }

    if (!isOpen) {
        throw new HttpException(
            `Cổng đăng ký hiện đang đóng. (Server Time: ${now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })})`, 
            HttpStatus.BAD_REQUEST
        );
    }

    // 3. Lưu
    return await this.candidateRepo.save(data);
  }

  async findAll(page: number, limit: number, table: string, status: string) {
    const query = this.candidateRepo.createQueryBuilder('c');
    
    // Lọc theo Bảng
    if (table !== 'ALL') query.andWhere('c.table = :table', { table });
    
    // --- THÊM: Lọc theo Trạng thái ---
    if (status !== 'ALL') query.andWhere('c.status = :status', { status });
    // --------------------------------

    query.orderBy('c.createdAt', 'DESC');
    query.skip((page - 1) * limit).take(limit);

    const [candidates, total] = await query.getManyAndCount();
    return { candidates, totalItems: total, totalPages: Math.ceil(total / limit) };
  }


  
  // Cập nhật hàm updateStatus để lưu thêm note
  async updateStatus(id: string, status?: string, note?: string) {
    const updateData: any = {};
    if (status) updateData.status = status;
    if (note !== undefined) updateData.note = note;
    return await this.candidateRepo.update(id, updateData);
}

  // --- THÊM HÀM NÀY ---
  async remove(id: string) {
    // delete theo id
    return await this.candidateRepo.delete(id);
  }

  // --- THÊM HÀM NÀY ĐỂ THỐNG KÊ ---
  async getStatistics() {
    try {
        const total = await this.candidateRepo.count();

        // Status
        const statusStats = await this.candidateRepo.createQueryBuilder('c').select('c.status').addSelect('COUNT(c.id)', 'count').groupBy('c.status').getRawMany();
        
        // Table (Bảng A/B)
        const tableStats = await this.candidateRepo.createQueryBuilder('c').select('c.table').addSelect('COUNT(c.id)', 'count').groupBy('c.table').getRawMany();
        
        // Top Tỉnh
        const provinceStats = await this.candidateRepo.createQueryBuilder('c').select('c.province').addSelect('COUNT(c.id)', 'count').groupBy('c.province').orderBy('count', 'DESC').getRawMany();

        // Giới tính
        const genderStats = await this.candidateRepo.createQueryBuilder('c').select('c.gender').addSelect('COUNT(c.id)', 'count').groupBy('c.gender').getRawMany();

        // Khối lớp
        const gradeStats = await this.candidateRepo.createQueryBuilder('c').select('c.grade').addSelect('COUNT(c.id)', 'count').groupBy('c.grade').orderBy('c.grade', 'ASC').getRawMany();

        // Timeline (Logic JS)
        const allDates = await this.candidateRepo.createQueryBuilder('c').select(['c.createdAt']).orderBy('c.createdAt', 'ASC').getMany();
        const timelineMap = new Map<string, number>();
        allDates.forEach(candidate => {
            if (candidate.createdAt) {
                const dateStr = new Date(candidate.createdAt).toISOString().split('T')[0]; 
                timelineMap.set(dateStr, (timelineMap.get(dateStr) || 0) + 1);
            }
        });
        const timelineStats = Array.from(timelineMap, ([date, count]) => ({ date, count }));

        return {
          total,
          status: statusStats,
          table: tableStats,
          province: provinceStats,
          timeline: timelineStats,
          gender: genderStats,
          grade: gradeStats
        };

    } catch (error) {
        console.error("Lỗi getStatistics:", error);
        return { total: 0, status: [], table: [], province: [], timeline: [], gender: [], grade: [] };
    }
  }

  async update(id: string, updateData: any) {
    // Loại bỏ các trường không cho phép sửa (như id, createdAt, file paths nếu không muốn)
    // Ở đây ta cho phép sửa hết thông tin text
    return await this.candidateRepo.update(id, updateData);
  }
  

}