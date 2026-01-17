import { Controller, Get, Post, Body, Param, Put, Delete, Query, UseInterceptors, UploadedFiles, HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { CandidatesService } from './candidates.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

// Cấu hình lưu ảnh vào thư mục uploads
const storage = diskStorage({
  // Sử dụng process.cwd() để trỏ đúng về thư mục dự án hiện tại
  destination: join(process.cwd(), 'uploads'), 
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + extname(file.originalname));
  },
});

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  // 1. API thống kê (QUAN TRỌNG: Phải đặt trên các API dùng @Get khác)
  @Get('statistics')
  async getStatistics() {
    return await this.candidatesService.getStatistics();
  }

  // 2. API Đăng ký thí sinh (Upload file)
  @Post()
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'cccdFrontFile', maxCount: 1 },
    { name: 'cccdBackFile', maxCount: 1 },
    { name: 'studentCardFile', maxCount: 1 },
  ], { storage }))
  async create(@Body() body: any, @UploadedFiles() files: any) {
    // --- 1. DEBUG LOG (Xem backend thực sự nhận được gì) ---
    console.log('============= START REQUEST ĐĂNG KÝ =============');
    console.log('-> Dữ liệu Text:', body);
    
    if (!files || Object.keys(files).length === 0) {
        console.error('!!! CẢNH BÁO: Biến files RỖNG. Backend không nhận được ảnh !!!');
    } else {
        console.log('-> Dữ liệu Files:', files);
        if (files.studentCardFile) console.log('   + Đã lưu ảnh thẻ tại:', files.studentCardFile[0].path);
    }
    console.log('=================================================');
    // -------------------------------------------------------

    const data = { ...body };
    
    // Xử lý đường dẫn file nếu có upload
    if (files?.cccdFrontFile?.[0]) data.cccdPath = '/uploads/' + files.cccdFrontFile[0].filename;
    if (files?.cccdBackFile?.[0]) data.cccdBackPath = '/uploads/' + files.cccdBackFile[0].filename;
    if (files?.studentCardFile?.[0]) data.studentCardPath = '/uploads/' + files.studentCardFile[0].filename;

    try {
      return await this.candidatesService.create(data);
    } catch (error) {
      console.error('Lỗi khi xử lý:', error);
      
      // Nếu lỗi do Service chủ động ném ra (ví dụ: Đóng đơn), hãy ném tiếp nó ra ngoài
      if (error instanceof HttpException) {
          throw error;
      }

      // Còn lại thì mới là lỗi DB (trùng CCCD)
      throw new HttpException('Lỗi đăng ký, có thể số CCCD đã tồn tại hoặc lỗi hệ thống.', HttpStatus.BAD_REQUEST);
    }
  }

  @Get()
findAll(
  @Query('page') page: string,
  @Query('limit') limit: string,
  @Query('table') table: string,
  @Query('status') status: string,
  @Query('fromDate') fromDate: string, // <-- Thêm
  @Query('toDate') toDate: string,     // <-- Thêm
) {
  return this.candidatesService.findAll(
    +page || 1, 
    +limit || 10, 
    table, 
    status, 
    fromDate, 
    toDate
  );
}

  // 4. API Cập nhật trạng thái (Thêm body note)
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string, note?: string }) {
    return this.candidatesService.updateStatus(id, body.status, body.note);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    // Tách các trường file ra nếu frontend lỡ gửi lên (để an toàn)
    const { cccdPath, cccdBackPath, studentCardPath, ...updateData } = body;
    return await this.candidatesService.update(id, updateData);
  }

  // 5. API Xóa thí sinh
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.candidatesService.remove(id);
  }

  @Post(':id/send-email')
async sendEmailToCandidate(@Param('id') id: string, @Body() body: { message: string }) {
    const candidate = await this.candidatesService.findOne(id);
    if (!candidate) throw new NotFoundException();
    
    // Bạn cần sửa CandidatesService để expose hàm sendCustomNote hoặc inject MailService vào Controller
    // Cách nhanh nhất là inject MailService trực tiếp vào Controller:
    // constructor(private readonly candidatesService: CandidatesService, private mailService: MailService) {}
    
    // Tuy nhiên, để đúng chuẩn, hãy thêm hàm sendNote vào CandidatesService:
    return this.candidatesService.sendManualEmail(id, body.message);
}

}