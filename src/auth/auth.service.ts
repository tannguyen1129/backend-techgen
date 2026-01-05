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

  async onModuleInit() {
    await this.syncUser('admin', process.env.ADMIN_DEFAULT_PASSWORD || 'admin123', 'ADMIN');
    await this.syncUser('media', process.env.VIEWER_DEFAULT_PASSWORD || 'media123', 'VIEWER');
  }

  // Hàm phụ trợ: Tự động tạo hoặc cập nhật mật khẩu user
  private async syncUser(username: string, envPassword: string, role: string) {
    let user = await this.adminRepo.findOne({ where: { username } });

    if (!user) {
      console.log(`>>> Đang tạo mới user: ${username} (${role})...`);
      user = new Admin();
      user.username = username;
      user.role = role;
    } else {
      console.log(`>>> Đang cập nhật mật khẩu user: ${username} từ .env...`);
      // Đảm bảo role đúng (phòng trường hợp db cũ chưa có role)
      user.role = role; 
    }

    // Luôn hash và cập nhật mật khẩu mới nhất từ .env
    user.password = await bcrypt.hash(envPassword, 10);
    await this.adminRepo.save(user);
    console.log(`>>> ĐÃ CẬP NHẬT THÀNH CÔNG USER: ${username}`);
  }

  async validateAdmin(username: string, pass: string): Promise<any> {
    const admin = await this.adminRepo.findOne({ where: { username } });
    if (admin && (await bcrypt.compare(pass, admin.password))) {
      const { password, ...result } = admin;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const validUser = await this.validateAdmin(user.username, user.password);
    if (!validUser) return null;

    const payload = { username: validUser.username, sub: validUser.id, role: validUser.role };
    return {
      access_token: this.jwtService.sign(payload),
      role: validUser.role,
    };
  }
}