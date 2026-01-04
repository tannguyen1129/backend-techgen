import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Admin } from './entities/admin.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(Admin) private adminRepo: Repository<Admin>,
    private jwtService: JwtService
  ) {}

  // Tự động tạo Admin mặc định khi Database rỗng
  async onModuleInit() {
    const count = await this.adminRepo.count();
    if (count === 0) {
      const hashedPassword = await bcrypt.hash('7816404122KTNguyen', 10); // Mật khẩu: admin123
      await this.adminRepo.save({ username: 'admin', password: hashedPassword }); // Tài khoản: admin
      console.log('>>> Đã tạo tài khoản Admin mặc định: admin / admin123');
    }
  }

  // Bước 1: Kiểm tra username và password trong DB
  async validateAdmin(username: string, pass: string): Promise<any> {
    const admin = await this.adminRepo.findOne({ where: { username } });
    if (admin && (await bcrypt.compare(pass, admin.password))) {
      const { password, ...result } = admin; // Loại bỏ password trước khi trả về
      return result;
    }
    return null;
  }

  // Bước 2: Tạo Access Token (Token cấp cho Frontend)
  async login(user: any) {
    const validUser = await this.validateAdmin(user.username, user.password);
    
    if (!validUser) {
        return null;
    }
    
    const payload = { username: validUser.username, sub: validUser.id };
    return {
      access_token: this.jwtService.sign(payload), // Dùng secret key trong .env để mã hóa
    };
  }
}