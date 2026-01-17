import { Module, Global } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';
import { MailService } from './mail.service';

@Global() // Để dùng được ở mọi nơi mà không cần import lại
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          host: config.get('MAIL_HOST'),
          port: 587,
          secure: false, // Outlook port 587 bắt buộc false (dùng STARTTLS)
          auth: {
            user: config.get('MAIL_USER'),
            pass: config.get('MAIL_PASS'),
          },
          tls: {
            ciphers: 'SSLv3',
            rejectUnauthorized: false, // Giúp tránh lỗi chứng chỉ SSL
          },
        },
        defaults: {
          from: `"UMT TechGen" <${config.get('MAIL_USER')}>`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}