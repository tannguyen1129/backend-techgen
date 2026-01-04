import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Announcement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  type: string; // 'NEWS' hoặc 'RESULT'

  @Column({ type: 'text' }) // Lưu đoạn tóm tắt ngắn
  summary: string;

  @Column({ type: 'text' }) // Lưu nội dung chính (HTML)
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}