const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User, Team, TeamMember } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');
const emailService = require('../services/emailService');

const clientBaseUrl = process.env.CLIENT_URL || 'https://waayto.com';
const defaultRedirectUrl = process.env.DEFAULT_REDIRECT_URL || 'https://waayto.com';
// 기본: 테스트 노출 on, 운영 시 EXPOSE_CODES_FOR_TEST=false 로 끕니다.
const isTestExposure = process.env.EXPOSE_CODES_FOR_TEST !== 'false';

// JWT 토큰 생성
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// 인증번호 임시 저장소 (실제 서비스에서는 Redis 사용 권장)
const verificationCodes = new Map();

/**
 * @desc    회원가입
 * @route   POST /api/users/signup
 * @access  Public
 */
const signup = asyncHandler(async (req, res) => {
  const { email, password, name, phone } = req.body;

  // 이메일 중복 확인
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({
      error: 'Email already exists',
      message: '이미 가입된 이메일입니다.',
    });
  }

  // 전화번호 중복 확인 (선택사항)
  if (phone) {
    const existingPhone = await User.findOne({ where: { phone } });
    if (existingPhone) {
      return res.status(400).json({
        error: 'Phone already exists',
        message: '이미 등록된 전화번호입니다.',
      });
    }
  }

  // 사용자 생성
  const user = await User.create({
    email,
    password,
    name,
    phone,
  });

  // JWT 토큰 생성
  const token = generateToken(user.id);

  res.status(201).json({
    message: '회원가입이 완료되었습니다.',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    },
    token,
  });
});

/**
 * @desc    로그인
 * @route   POST /api/users/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // 사용자 조회 (비밀번호 포함) - Sequelize 방식으로 변경
  const user = await User.findOne({
    where: { email, isActive: true }
  });

  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      error: 'Invalid credentials',
      message: '이메일 또는 비밀번호가 올바르지 않습니다.',
    });
  }

  // 마지막 로그인 시간 업데이트
  user.lastLoginAt = new Date();
  await user.save();

  // JWT 토큰 생성
  const token = generateToken(user.id);

  res.json({
    message: '로그인되었습니다.',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    },
    token,
    redirectUrl: defaultRedirectUrl,
  });
});

/**
 * @desc    로그아웃
 * @route   POST /api/users/logout
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  // 클라이언트에서 토큰 삭제 유도
  res.json({
    message: '로그아웃되었습니다.',
    redirectUrl: `${defaultRedirectUrl}/login`,
  });
});

/**
 * @desc    회원가입용 이메일 인증번호 전송
 * @route   POST /api/users/signup-sendnum
 * @access  Public
 */
const sendSignupVerification = asyncHandler(async (req, res) => {
  const { email } = req.body;

  // 이메일 중복 확인
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({
      error: 'Email already exists',
      message: '이미 가입된 이메일입니다.',
    });
  }

  // 6자리 인증번호 생성
  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 임시 저장 (5분 유효)
  verificationCodes.set(`signup_${email}`, {
    code: verificationCode,
    expires: Date.now() + 5 * 60 * 1000,
  });

  // 이메일 발송
  await emailService.sendVerificationEmail(email, verificationCode);

  const response = {
    message: '인증번호가 발송되었습니다.',
  };

  if (isTestExposure) {
    response.verificationCode = verificationCode;
  }

  res.json(response);
});

/**
 * @desc    인증번호 검증
 * @route   POST /api/users/verify-number
 * @access  Public
 */
const verifyEmailCode = asyncHandler(async (req, res) => {
  const { email, code, type = 'signup' } = req.body;

  const storedData = verificationCodes.get(`${type}_${email}`);

  if (!storedData) {
    return res.status(400).json({
      error: 'Verification code not found',
      message: '인증번호를 다시 요청해주세요.',
    });
  }

  if (Date.now() > storedData.expires) {
    verificationCodes.delete(`${type}_${email}`);
    return res.status(400).json({
      error: 'Verification code expired',
      message: '인증번호가 만료되었습니다.',
    });
  }

  if (storedData.code !== code) {
    return res.status(400).json({
      error: 'Invalid verification code',
      message: '인증번호가 올바르지 않습니다.',
    });
  }

  // 인증 성공 시 삭제
  verificationCodes.delete(`${type}_${email}`);

  const response = {
    message: '인증이 완료되었습니다.',
  };

  if (isTestExposure) {
    response.code = code;
    response.type = type;
  }

  res.json(response);
});

/**
 * @desc    이메일 중복 확인
 * @route   POST /api/users/verify-id
 * @access  Public
 */
const checkEmailDuplicate = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ where: { email } });

  res.json({
    available: !existingUser,
    message: existingUser ? '이미 사용 중인 이메일입니다.' : '사용 가능한 이메일입니다.',
  });
});

/**
 * @desc    전화번호 중복 확인
 * @route   POST /api/users/verify-phone
 * @access  Public
 */
const checkPhoneDuplicate = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  const existingUser = await User.findOne({ where: { phone } });

  res.json({
    available: !existingUser,
    message: existingUser ? '이미 사용 중인 전화번호입니다.' : '사용 가능한 전화번호입니다.',
  });
});

/**
 * @desc    아이디 찾기
 * @route   POST /api/users/find/id
 * @access  Public
 */
const findUserId = asyncHandler(async (req, res) => {
  const { name, phone } = req.body;

  const phoneDigits = phone.replace(/-/g, '');

  let user = await User.findOne({ where: { name, phone, isActive: true } });
  if (!user && phoneDigits !== phone) {
    user = await User.findOne({ where: { name, phone: phoneDigits, isActive: true } });
  }

  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      message: '회원 정보를 찾을 수 없습니다.',
    });
  }

  res.json({
    message: '아이디를 찾았습니다.',
    email: user.email,
  });
});

/**
 * @desc    비밀번호 찾기
 * @route   POST /api/users/find/pw
 * @access  Public
 */
const findUserPassword = asyncHandler(async (req, res) => {
  const { email, name } = req.body;

  const normalizedEmail = email.toLowerCase();
  const user = await User.findOne({ where: { email: normalizedEmail, name, isActive: true } });
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      message: '회원 정보를 찾을 수 없습니다.',
    });
  }

  // 비밀번호 재설정 토큰 생성
  const resetToken = user.generatePasswordResetToken();
  await user.save();

  // 사용자 안내용 6자리 코드(이메일 본문에 표시용)
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

  // 재설정 링크 이메일 발송
  const resetUrl = `${clientBaseUrl}/reset-password?token=${resetToken}`;
  await emailService.sendPasswordResetEmail(email, resetUrl, resetCode);

  const response = {
    message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.',
    email: user.email,
  };

  if (isTestExposure) {
    response.resetUrl = resetUrl;
    response.resetCode = resetCode;
  }

  res.json(response);
});

/**
 * @desc    프로필 조회
 * @route   GET /api/users/me
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const { Team } = require('../models');

  const user = await User.findByPk(req.user.id, {
    include: [{
      model: Team,
      as: 'teams',
      attributes: ['id', 'name', 'description'],
      through: { attributes: [] }
    }],
    attributes: { exclude: ['password'] }
  });

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      birthday: user.birthday,
      gender: user.gender,  
      teams: user.teams,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    },
  });
});

/**
 * @desc    프로필 수정
 * @route   PATCH /api/users/me
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, birthday, gender} = req.body;

  const user = await User.findByPk(req.user.id);

  // 다른 필드 업데이트
  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (birthday !== undefined) user.birthday = birthday;
  if (gender !== undefined) user.gender = gender; 

  await user.save();

  res.json({
    message: '프로필이 업데이트되었습니다.',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      birthday: user.birthday,
      gender: user.gender, 
    },
  });
});

/**
 * @desc    회원 탈퇴
 * @route   DELETE /api/users/me
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  await User.update(
    { isActive: false },
    { where: { id: req.user.id } }
  );

  res.json({
    message: '회원 탈퇴가 완료되었습니다.',
  });
});

// 추가 컨트롤러들
const sendIdPwVerification = asyncHandler(async (req, res) => {
  const { phone, type } = req.body;

  const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

  verificationCodes.set(`${type}_${phone}`, {
    code: verificationCode,
    expires: Date.now() + 5 * 60 * 1000,
  });

  // SMS 발송 로직 (실제 구현 필요)
  console.log(`SMS sent to ${phone}: ${verificationCode}`);

  res.json({
    message: '인증번호가 발송되었습니다.',
  });
});

const findIdSuccess = asyncHandler(async (req, res) => {
  res.json({
    message: '아이디 찾기가 완료되었습니다.',
    instruction: '로그인 페이지로 이동하여 로그인해주세요.',
  });
});

const getPasswordResetPage = asyncHandler(async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({
      error: 'Reset token required',
      message: '유효하지 않은 접근입니다.',
    });
  }

  res.json({
    message: '비밀번호 재설정 페이지입니다.',
    token,
  });
});

const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;
  const { Op } = require('sequelize');

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    where: {
      passwordResetToken: hashedToken,
      passwordResetExpires: { [Op.gt]: new Date() }
    }
  });

  if (!user) {
    return res.status(400).json({
      error: 'Invalid or expired token',
      message: '유효하지 않거나 만료된 토큰입니다.',
    });
  }

  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  res.json({
    message: '비밀번호가 재설정되었습니다.',
  });
});

const searchUsers = asyncHandler(async (req, res) => {
  // 사용자 검색 로직 (필요하면 구현)
  res.json({
    message: 'User search functionality',
    users: []
  });
});

/**
 * @desc    이메일 변경 요청 (인증번호 발송)
 * @route   POST /api/users/email-change/request
 * @access  Private
 */
const requestEmailChange = asyncHandler(async (req, res) => {
    const { newEmail, currentPassword } = req.body;
    const userId = req.user.id; // authenticate 미들웨어에서 가져옴

    const user = await User.findByPk(userId);

    // 1. 현재 비밀번호 일치 확인
    if (!(await user.comparePassword(currentPassword))) {
        return res.status(401).json({
            error: 'Invalid current password',
            message: '현재 비밀번호가 일치하지 않습니다.',
        });
    }

    // 2. 새 이메일 중복 확인
    const existingUser = await User.findOne({ where: { email: newEmail } });
    if (existingUser) {
        return res.status(409).json({
            error: 'EmailInUse',
            message: '이미 사용 중인 이메일입니다.',
        });
    }

    // 3. 6자리 인증번호 생성 및 임시 저장 (type: email_change)
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // (이메일 변경 요청 데이터 임시 저장: newEmail, code, expires)
    // 실제 서비스에서는 Redis를 사용하지만, 예시에서는 Map 사용
    verificationCodes.set(`email_change_${userId}`, { 
        code: verificationCode, 
        newEmail: newEmail,
        expires: Date.now() + 5 * 60 * 1000 // 5분 유효
    });

    // 4. 새 이메일로 인증번호 발송
    await emailService.sendVerificationEmail(newEmail, verificationCode);

    res.status(200).json({
        message: '인증코드가 새 이메일로 발송되었습니다.',
    });
});

/**
 * @desc    이메일 변경 인증 (코드 검증 및 적용)
 * @route   POST /api/users/me/verify-email
 * @access  Private
 */
const verifyEmailChange = asyncHandler(async (req, res) => {
    const { code } = req.body;
    const userId = req.user.id;

    const storedData = verificationCodes.get(`email_change_${userId}`);

    // 1. 저장된 데이터 확인 및 만료 시간 체크
    if (!storedData || Date.now() > storedData.expires) {
        if (storedData) verificationCodes.delete(`email_change_${userId}`);
        return res.status(410).json({ // 410 Gone (리소스 영구 제거/만료) 사용
            error: 'VerificationExpired',
            message: '인증 코드가 만료되었거나 유효하지 않습니다.',
        });
    }
    
    // 2. 인증 코드 일치 확인
    if (storedData.code !== code) {
        return res.status(400).json({
            error: 'Invalid verification code',
            message: '인증 코드가 올바르지 않습니다.',
        });
    }

    // 3. 인증 성공 시 이메일 업데이트 및 저장 데이터 삭제
    const user = await User.findByPk(userId);
    user.email = storedData.newEmail;
    await user.save(); 

    verificationCodes.delete(`email_change_${userId}`);

    res.status(200).json({
        message: '이메일이 변경되었습니다.',
        user: { id: user.id, email: user.email, name: user.name, phone: user.phone }, // 업데이트된 정보 반환
    });
});
/**
 * @desc    비밀번호 변경 (로그인 상태)
 * @route   POST /api/users/me/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id;

    // 0. 새 비밀번호 재확인
    if (newPassword !== confirmNewPassword) {
        return res.status(400).json({
            error: 'PasswordMismatch',
            message: '새 비밀번호와 재확인 비밀번호가 일치하지 않습니다.',
        });
    }
    const user = await User.findByPk(userId, { attributes: ['id', 'password'] });

    // 1. 현재 비밀번호 일치 확인
    if (!(await user.comparePassword(currentPassword))) {
        return res.status(401).json({
            error: 'PasswordMismatch',
            message: '현재 비밀번호가 일치하지 않습니다.',
        });
    }

    // 2. 새 비밀번호로 업데이트 (Sequelize Model에서 자동으로 해시 처리된다고 가정)
    user.password = newPassword;
    await user.save();

    res.status(200).json({
        message: '비밀번호가 변경되었습니다.',
    });
});
/**
 * @desc    사용자 정보 수정 전 비밀번호 재확인
 * @route   POST /api/users/me/password-check
 * @access  Private
 */
const verifyPasswordCheck = asyncHandler(async (req, res) => {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
        return res.status(400).json({
            error: 'Password required',
            message: '비밀번호를 입력해주세요.',
        });
    }

    const user = await User.findByPk(userId, { attributes: ['id', 'password'] });
    
    // 1. 비밀번호 일치 확인
    if (!user || !(await user.comparePassword(password))) {
        // UI에 표시되는 "비밀번호가 일치하지 않습니다." 메시지에 대응
        return res.status(409).json({ 
            error: 'PasswordMismatch',
            message: '입력하신 비밀번호가 일치하지 않습니다. 다시 한번 입력해주세요.',
        });
    }

    // 2. 성공 응답
    res.json({
        valid: true,
        message: '비밀번호가 확인되었습니다. 회원 정보를 수정할 수 있습니다.',
    });
});
module.exports = {
  signup,
  login,
  logout,
  sendSignupVerification,
  verifyEmailCode,
  checkEmailDuplicate,
  checkPhoneDuplicate,
  findUserId,
  findUserPassword,
  sendIdPwVerification,
  findIdSuccess,
  getPasswordResetPage,
  resetPassword,
  getProfile,
  updateProfile,
  deleteAccount,
  searchUsers,
  requestEmailChange, 
  verifyEmailChange, 
  changePassword,
  verifyPasswordCheck,
};
