import { Controller, Get, Post, Put, Delete, Body, Param, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';

// --- HÀM HỖ TRỢ FIX LỖI FONT TIẾNG VIỆT ---
const fixUtf8Name = (originalName: string) => {
  // Chuyển buffer từ latin1 sang utf8 để lấy lại dấu Tiếng Việt
  return Buffer.from(originalName, 'latin1').toString('utf8');
};

// --- CẤU HÌNH LƯU FILE ---
const storage = diskStorage({
  destination: join(process.cwd(), 'uploads'),
  filename: (req, file, cb) => {
    // 1. Fix lỗi font cho tên file gốc
    const utf8Name = fixUtf8Name(file.originalname);
    
    // 2. (Tùy chọn) Bạn có thể muốn bỏ dấu tiếng Việt để lưu trên đĩa cho an toàn (tránh lỗi 404 trên một số OS)
    // Nếu muốn giữ nguyên tiếng Việt trên file đĩa thì dùng utf8Name trực tiếp.
    // Ở đây mình giữ nguyên logic cũ nhưng áp dụng fix font:
    
    // Loại bỏ khoảng trắng và ký tự đặc biệt để an toàn URL (Regex đơn giản)
    const safeName = utf8Name.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\.\-\_àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/g, '');

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + safeName);
  },
});

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly service: AnnouncementsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file', { storage }))
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    const data = { ...body };

    if (file) {
        // Lưu đường dẫn file (Tên file trên đĩa đã được xử lý ở storage bên trên)
        data.filePath = '/uploads/' + file.filename;
        
        // QUAN TRỌNG: Lưu tên hiển thị (fileName) vào DB phải có dấu Tiếng Việt đẹp
        // Cần gọi lại hàm fixUtf8Name vì file.originalname ở đây vẫn bị lỗi font
        data.fileName = fixUtf8Name(file.originalname);
    }

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
        // QUAN TRỌNG: Fix lỗi font khi update
        data.fileName = fixUtf8Name(file.originalname);
    }

    if (data.isVisible) {
        data.isVisible = data.isVisible === 'true';
    }

    return this.service.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(+id);
  }
}