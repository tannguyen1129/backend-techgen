import { Injectable, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Candidate } from './entities/candidate.entity';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectRepository(Candidate)
    private candidateRepo: Repository<Candidate>,
    private mailService: MailService,
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
            end:   new Date('2026-01-31T23:59:59+07:00')
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

  // Sửa hàm findAll như sau:
async findAll(
  page: number, 
  limit: number, 
  table?: string, 
  status?: string, 
  fromDate?: string, 
  toDate?: string
) {
  const query = this.candidateRepo.createQueryBuilder('candidate');

  // Lọc theo Bảng
  if (table && table !== 'ALL') {
    query.andWhere('candidate.table = :table', { table });
  }

  // Lọc theo Trạng thái
  if (status && status !== 'ALL') {
    query.andWhere('candidate.status = :status', { status });
  }

  // --- LỌC THEO NGÀY (MỚI) ---
  if (fromDate) {
    // Lấy từ 00:00:00 của ngày bắt đầu
    const start = new Date(fromDate);
    start.setHours(0, 0, 0, 0); 
    query.andWhere('candidate.createdAt >= :start', { start });
  }

  if (toDate) {
    // Lấy đến 23:59:59 của ngày kết thúc
    const end = new Date(toDate);
    end.setHours(23, 59, 59, 999);
    query.andWhere('candidate.createdAt <= :end', { end });
  }
  // ---------------------------

  query.orderBy('candidate.createdAt', 'DESC');
  query.skip((page - 1) * limit);
  query.take(limit);

  const [candidates, total] = await query.getManyAndCount();

  return {
    candidates,
    totalItems: total,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
  };
}

async findOne(id: string): Promise<Candidate> {
    const candidate = await this.candidateRepo.findOne({ where: { id } });
    if (!candidate) {
      throw new NotFoundException(`Không tìm thấy thí sinh với ID: ${id}`);
    }
    return candidate;
  }


  
  // Cập nhật hàm updateStatus để lưu thêm note
async updateStatus(id: string, status: string, note?: string) {
    const candidate = await this.findOne(id);
    if (!candidate) throw new NotFoundException('Candidate not found');

    candidate.status = status;
    if (note) candidate.note = note;
    
    const result = await this.candidateRepo.save(candidate);

    // --- LOGIC GỬI MAIL TỰ ĐỘNG ---
    if (status === 'APPROVED') {
        try {
            console.log(`>>> Đang gửi mail duyệt cho: ${result.email}`);
            await this.mailService.sendUserConfirmation(result);
            console.log(`>>> Gửi mail thành công!`);
        } catch (e) {
            console.error('>>> LỖI GỬI MAIL:', e.message);
            // Không throw error để tránh rollback việc duyệt hồ sơ
        }
    }

    return result;
  }

  async sendManualEmail(id: string, message: string) {
    const candidate = await this.findOne(id);
    try {
        await this.mailService.sendCustomNote(candidate, message);
        return { success: true };
    } catch (e) {
        console.error(e);
        return { success: false, message: e.message };
    }
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