import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

// --- CẤU HÌNH LƯU FILE ---
const storage = diskStorage({
  // Lưu vào thư mục 'uploads' ở root dự án (cùng chỗ với ảnh thí sinh)
  destination: join(process.cwd(), 'uploads'),
  filename: (req, file, cb) => {
    // Tạo tên file không trùng: [Thời gian]-[Random]-[Tên gốc]
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  },
});

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage })) // Bắt file từ field tên là 'file'
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    // 1. Copy dữ liệu body ra biến mới
    const data = { ...body };

    // 2. Nếu có file thì gán đường dẫn vào data
    if (file) {
        data.filePath = '/uploads/' + file.filename;
        data.fileName = file.originalname; // Lưu tên gốc để hiển thị cho đẹp
    }

    // 3. Xử lý boolean (Vì FormData gửi lên 'true'/'false' dạng chuỗi)
    if (data.isVisible) {
        data.isVisible = data.isVisible === 'true';
    }

    return this.service.create(data);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('file', { storage }))
  update(@Param('id') id: string, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const data = { ...body };

    if (file) {
        data.filePath = '/uploads/' + file.filename;
        data.fileName = file.originalname;
    }

    if (data.isVisible) {
        data.isVisible = data.isVisible === 'true';
    }

    // Convert id sang number (+id) vì trong database id là số
    return this.service.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}