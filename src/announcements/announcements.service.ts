import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Announcement } from './entities/announcement.entity';

@Injectable()
export class AnnouncementsService {
  constructor(
    @InjectRepository(Announcement)
    private repo: Repository<Announcement>,
  ) {}

  async create(data: any) {
    return await this.repo.save(data);
  }

  async findAll() {
    // Lấy mới nhất trước
    return await this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async update(id: number, data: any) {
    return await this.repo.update(id, data);
  }

  async remove(id: number) {
    return await this.repo.delete(id);
  }

  

}