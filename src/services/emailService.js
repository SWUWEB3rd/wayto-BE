const nodemailer = require('nodemailer');

// 메일 전송 설정
const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * 회원가입 인증번호 이메일 발송
 * @param {string} email - 수신자 이메일
 * @param {string} verificationCode - 인증번호
 */
const sendVerificationEmail = async (email, verificationCode) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@wayto.com',
      to: email,
      subject: '[WayTo] 회원가입 인증번호',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">WayTo 회원가입 인증</h2>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px; text-align: center;">
            <h3 style="color: #555; margin-bottom: 20px;">인증번호를 입력해주세요</h3>
            <div style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px; margin: 20px 0;">
              ${verificationCode}
            </div>
            <p style="color: #666; margin-top: 20px;">
              인증번호는 5분간 유효합니다.
            </p>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            본 메일은 자동발송 메일입니다. 문의사항이 있으시면 고객센터로 연락해주세요.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('인증번호 이메일 발송 성공:', info.messageId);
    return info;
  } catch (error) {
    console.error('인증번호 이메일 발송 실패:', error);
    throw new Error('이메일 발송에 실패했습니다.');
  }
};

/**
 * 비밀번호 재설정 이메일 발송
 * @param {string} email - 수신자 이메일
 * @param {string} resetUrl - 비밀번호 재설정 링크
 */
const sendPasswordResetEmail = async (email, resetUrl) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@wayto.com',
      to: email,
      subject: '[WayTo] 비밀번호 재설정',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">비밀번호 재설정</h2>
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px;">
            <p style="color: #555; line-height: 1.6;">
              안녕하세요,<br><br>
              비밀번호 재설정을 요청하셨습니다. 아래 링크를 클릭하여 새로운 비밀번호를 설정해주세요.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" style="display: inline-block; padding: 15px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
                비밀번호 재설정하기
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              링크는 1시간 동안 유효합니다.<br>
              만약 비밀번호 재설정을 요청하지 않으셨다면, 이 메일을 무시하셔도 됩니다.
            </p>
          </div>
          <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
            본 메일은 자동발송 메일입니다. 문의사항이 있으시면 고객센터로 연락해주세요.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('비밀번호 재설정 이메일 발송 성공:', info.messageId);
    return info;
  } catch (error) {
    console.error('비밀번호 재설정 이메일 발송 실패:', error);
    throw new Error('이메일 발송에 실패했습니다.');
  }
};

/**
 * 개발 환경용 모의 이메일 서비스
 */
const sendVerificationEmailMock = async (email, verificationCode) => {
  console.log(`\n=== 모의 이메일 발송 ===`);
  console.log(`수신자: ${email}`);
  console.log(`인증번호: ${verificationCode}`);
  console.log(`======================\n`);
  return { messageId: 'mock-' + Date.now() };
};

const sendPasswordResetEmailMock = async (email, resetUrl) => {
  console.log(`\n=== 모의 비밀번호 재설정 이메일 ===`);
  console.log(`수신자: ${email}`);
  console.log(`재설정 링크: ${resetUrl}`);
  console.log(`===============================\n`);
  return { messageId: 'mock-' + Date.now() };
};

module.exports = {
  // 개발환경에서는 모의 함수 사용, 운영환경에서는 실제 함수 사용
  sendVerificationEmail: process.env.NODE_ENV === 'production' ? sendVerificationEmail : sendVerificationEmailMock,
  sendPasswordResetEmail: process.env.NODE_ENV === 'production' ? sendPasswordResetEmail : sendPasswordResetEmailMock,
};
