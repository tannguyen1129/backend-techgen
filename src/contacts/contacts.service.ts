import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Contact } from './entities/contact.entity';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private contactRepo: Repository<Contact>,
  ) {}

  // Tạo liên hệ mới
  async create(data: any) {
    const contact = this.contactRepo.create(data);
    return await this.contactRepo.save(contact);
  }

  // Lấy danh sách (cho Admin)
  async findAll() {
    return await this.contactRepo.find({
      order: { createdAt: 'DESC' }, // Mới nhất lên đầu
    });
  }

  // Xem chi tiết (và đánh dấu đã đọc)
  async findOne(id: string) {
    const contact = await this.contactRepo.findOne({ where: { id } });
    if (contact && !contact.isRead) {
        await this.contactRepo.update(id, { isRead: true });
    }
    return contact;
  }

  // Cập nhật trạng thái (VD: Đánh dấu đã đọc)
  async update(id: string, data: any) {
    return await this.contactRepo.update(id, data);
  }

  // Xóa liên hệ
  async remove(id: string) {
    return await this.contactRepo.delete(id);
  }
}