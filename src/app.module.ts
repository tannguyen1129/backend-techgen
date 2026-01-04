import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';

// 1. IMPORT CÁC MODULE CON
import { CandidatesModule } from './candidates/candidates.module';
import { AuthModule } from './auth/auth.module';        
import { ContactsModule } from './contacts/contacts.module';
import { AnnouncementsModule } from './announcements/announcements.module'; // <--- IMPORT MODULE NÀY (QUAN TRỌNG)

// 2. IMPORT CÁC ENTITY
import { Candidate } from './candidates/entities/candidate.entity';
import { Admin } from './auth/entities/admin.entity';
import { Contact } from './contacts/entities/contact.entity';
import { Announcement } from './announcements/entities/announcement.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Kết nối Database
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: 'admin123',
      database: 'umt_techgen_db', 
      // 3. THÊM Announcement VÀO DANH SÁCH ENTITY
      entities: [Candidate, Admin, Contact, Announcement], 
      synchronize: true,
    }),

    // Phục vụ ảnh upload
    ServeStaticModule.forRoot({
      // SỬA LẠI ĐƯỜNG DẪN TUYỆT ĐỐI CHO KHỚP VỚI CONTROLLER
      rootPath: '/home/sotubuadm/web-techgen/umt-backend/uploads', 
      serveRoot: '/uploads',
    }),
    // 4. ĐĂNG KÝ CÁC MODULE TẠI ĐÂY
    CandidatesModule,
    AuthModule,    
    ContactsModule,
    AnnouncementsModule, // <--- PHẢI LÀ MODULE, KHÔNG PHẢI ENTITY
  ],
})
export class AppModule {}