import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  // 1. Mail xác nhận hồ sơ hợp lệ (Gửi khi Duyệt)
  async sendUserConfirmation(candidate: any) {
    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px;">
        <h3 style="color: #002855; border-bottom: 2px solid #002855; padding-bottom: 10px;">THÔNG BÁO KẾT QUẢ ĐĂNG KÝ</h3>
        
        <p>Thân gửi thí sinh <b>${candidate.fullName}</b>,</p>
        
        <p>Ban Tổ chức cuộc thi <b>UMT TechGen 2026</b> xin trân trọng thông báo: Hồ sơ đăng ký tham gia của bạn đã được kiểm tra và ghi nhận <b>hợp lệ</b>.</p>
        
        <p>Thông tin ghi nhận trên hệ thống:</p>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9; width: 150px;"><b>Mã hồ sơ:</b></td>
            <td style="padding: 8px; border: 1px solid #ddd;">${candidate.id.slice(0, 8).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd; background-color: #f9f9f9;"><b>Bảng thi đấu:</b></td>
            <td style="padding: 8px; border: 1px solid #ddd;">Bảng ${candidate.table}</td>
          </tr>
        </table>

        <div style="background-color: #f0f4f8; border: 1px solid #d9e2ec; padding: 15px; margin: 20px 0; border-radius: 4px;">
            <p style="margin-top: 0; font-weight: bold; color: #002855;">Kênh thông tin chính thức:</p>
            <p>Để thuận tiện cho việc cập nhật thông báo, lịch thi và giải đáp thắc mắc nhanh chóng, Ban Tổ chức đề nghị thí sinh tham gia nhóm Zalo chính thức theo đường dẫn sau:</p>
            <div style="text-align: center; margin: 15px 0;">
                <a href="https://zalo.me/g/qtdqno963" target="_blank" style="background-color: #002855; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px;">
                    Tham gia Nhóm Zalo Thí sinh
                </a>
            </div>
            <p style="font-size: 13px; color: #666; margin-bottom: 0; text-align: center;">(Link dự phòng: https://zalo.me/g/qtdqno963)</p>
        </div>

        <p>Thông tin chi tiết về quy chế và các hướng dẫn tiếp theo sẽ được gửi đến bạn trong thời gian sớm nhất. Vui lòng thường xuyên kiểm tra hộp thư điện tử.</p>
        
        <br>
        <p style="margin-bottom: 5px;">Trân trọng,</p>
        <p style="font-weight: bold; color: #002855;">Ban Tổ chức UMT TechGen</p>
      </div>
    `;

    await this.mailerService.sendMail({
      to: candidate.email,
      subject: '[UMT TechGen 2026] Thông báo tiếp nhận hồ sơ đăng ký',
      html: htmlContent,
    });
  }

  
  // 2. Mail yêu cầu cập nhật thông tin (Gửi thủ công)
  async sendCustomNote(candidate: any, note: string) {
    const htmlContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px;">
        <h3 style="color: #002855; border-bottom: 1px solid #ccc; padding-bottom: 10px;">YÊU CẦU BỔ SUNG THÔNG TIN HỒ SƠ</h3>
        
        <p>Thân gửi thí sinh <b>${candidate.fullName}</b>,</p>
        
        <p>Trong quá trình rà soát hồ sơ đăng ký tham gia cuộc thi UMT TechGen 2026, Ban Tổ chức nhận thấy một số thông tin của bạn cần được xác minh hoặc cập nhật lại để đảm bảo tính hợp lệ.</p>
        
        <p>Nội dung cần lưu ý:</p>
        <div style="background-color: #f5f5f5; border-left: 4px solid #666; padding: 15px; margin: 15px 0; font-style: italic;">
          ${note}
        </div>
        
        <p>Bạn vui lòng phản hồi trực tiếp vào email này để cập nhật lại thông tin theo yêu cầu trong thời gian sớm nhất để hoàn tất thủ tục đăng ký.</p>
        
        <br>
        <p style="margin-bottom: 5px;">Trân trọng,</p>
        <p style="font-weight: bold; color: #002855;">Ban Tổ chức UMT TechGen</p>
      </div>
    `;

    await this.mailerService.sendMail({
      to: candidate.email,
      subject: '[UMT TechGen 2026] V/v Bổ sung thông tin hồ sơ',
      html: htmlContent,
    });
  }
}