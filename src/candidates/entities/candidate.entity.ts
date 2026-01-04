import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Candidate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() fullName: string;
  @Column() dob: string;
  @Column() gender: string;
  @Column({ unique: true }) cccd: string;
  @Column() phone: string;
  @Column() email: string;
  @Column() school: string;
  @Column() province: string;
  @Column() grade: string;
  @Column() className: string;
  
  @Column({ nullable: true }) studentId: string;
  @Column() table: string;
  @Column({ nullable: true }) achievements: string;

  @Column({ nullable: true }) cccdPath: string;
  @Column({ nullable: true }) cccdBackPath: string;
  @Column({ nullable: true }) studentCardPath: string;

  @Column({ default: 'PENDING' }) status: string;

  @Column({ nullable: true, type: 'text' }) 
  note: string;
  @CreateDateColumn() createdAt: Date;
}