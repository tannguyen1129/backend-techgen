import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Announcement {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // --- CÁC TRƯỜNG CŨ CỦA BẠN ---
  @Column()
  type: string; // 'NEWS' hoặc 'RESULT'

  @Column({ type: 'text' }) 
  summary: string;

  @Column({ type: 'text' }) 
  content: string;
  // -----------------------------

  // --- CÁC TRƯỜNG MỚI CHO FILE UPLOAD ---
  @Column({ nullable: true })
  filePath: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ default: true }) // Mình thêm trường này để ẩn/hiện bài viết nếu cần
  isVisible: boolean;

  @CreateDateColumn()
  createdAt: Date;
}