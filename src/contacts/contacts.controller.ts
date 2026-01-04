import { Controller, Get, Post, Body, Param, Delete, Patch, Query, UseGuards, BadRequestException } from '@nestjs/common';
import { ContactsService } from './contacts.service';
// import { AuthGuard } from '@nestjs/passport'; 

@Controller('contacts')
export class ContactsController {
  constructor(private readonly contactsService: ContactsService) {}

  // API Gửi liên hệ (Public)
  @Post()
  async create(@Body() body: any) {
    // Validate cơ bản tại Controller để chắc chắn có dữ liệu
    if (!body.name || !body.email || !body.message) {
        throw new BadRequestException('Vui lòng nhập đầy đủ Họ tên, Email và Nội dung.');
    }
    return await this.contactsService.create(body);
  }
  
  // ... Các API khác giữ nguyên
  @Get()
  findAll() { return this.contactsService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.contactsService.findOne(id); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) { return this.contactsService.update(id, body); }

  @Delete(':id')
  remove(@Param('id') id: string) { return this.contactsService.remove(id); }
}