import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';

// Import Modules
import { CandidatesModule } from './candidates/candidates.module';
import { AuthModule } from './auth/auth.module';
import { ContactsModule } from './contacts/contacts.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { MailModule } from './mail/mail.module';

// Import Entities
import { Candidate } from './candidates/entities/candidate.entity';
import { Admin } from './auth/entities/admin.entity';
import { Contact } from './contacts/entities/contact.entity';
import { Announcement } from './announcements/entities/announcement.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Đọc file .env

    // 1. Kết nối Database dùng biến môi trường
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Candidate, Admin, Contact, Announcement],
      // CHỈ BẬT synchronize: true Ở MÔI TRƯỜNG DEV
      synchronize: process.env.NODE_ENV !== 'production', 
    }),

    // 2. Sửa đường dẫn file tĩnh (Dùng process.cwd() để lấy thư mục gốc hiện tại)
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'), 
      serveRoot: '/uploads',
    }),

    CandidatesModule,
    AuthModule,
    ContactsModule,
    AnnouncementsModule,
    MailModule,
  ],
})
export class AppModule {}