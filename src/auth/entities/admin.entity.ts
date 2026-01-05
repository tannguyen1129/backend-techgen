import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('admin')
export class Admin {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) username: string;
  @Column() password: string;
  @Column({ default: 'ADMIN' }) // Mặc định là ADMIN
  role: string;
}