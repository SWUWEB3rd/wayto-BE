const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorMiddleware');
const emailService = require('../services/emailService');

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
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      error: 'Email already exists',
      message: '이미 가입된 이메일입니다.',
    });
  }

  // 전화번호 중복 확인 (선택사항)
  if (phone) {
    const existingPhone = await User.findOne({ phone });
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
  const token = generateToken(user._id);

  res.status(201).json({
    message: '회원가입이 완료되었습니다.',
    user: {
      id: user._id,
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

  // 사용자 조회 (비밀번호 포함)
  const user = await User.findOne({ email, isActive: true }).select('+password');

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
  const token = generateToken(user._id);

  res.json({
    message: '로그인되었습니다.',
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    },
    token,
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
  const existingUser = await User.findOne({ email });
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

  res.json({
    message: '인증번호가 발송되었습니다.',
  });
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

  res.json({
    message: '인증이 완료되었습니다.',
  });
});

/**
 * @desc    이메일 중복 확인
 * @route   POST /api/users/verify-id
 * @access  Public
 */
const checkEmailDuplicate = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const existingUser = await User.findOne({ email });

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

  const existingUser = await User.findOne({ phone });

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
  const { phone, verificationCode } = req.body;

  // 인증번호 확인
  const storedData = verificationCodes.get(`findid_${phone}`);
  if (!storedData || storedData.code !== verificationCode) {
    return res.status(400).json({
      error: 'Invalid verification code',
      message: '인증번호가 올바르지 않습니다.',
    });
  }

  const user = await User.findOne({ phone, isActive: true });
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      message: '해당 전화번호로 가입된 계정이 없습니다.',
    });
  }

  // 이메일 마스킹 처리
  const email = user.email;
  const [localPart, domain] = email.split('@');
  const maskedEmail = localPart.slice(0, 3) + '*'.repeat(localPart.length - 3) + '@' + domain;

  res.json({
    message: '아이디를 찾았습니다.',
    email: maskedEmail,
  });
});

/**
 * @desc    비밀번호 찾기
 * @route   POST /api/users/find/pw
 * @access  Public
 */
const findUserPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email, isActive: true });
  if (!user) {
    return res.status(404).json({
      error: 'User not found',
      message: '해당 이메일로 가입된 계정이 없습니다.',
    });
  }

  // 비밀번호 재설정 토큰 생성
  const resetToken = user.generatePasswordResetToken();
  await user.save();

  // 재설정 링크 이메일 발송
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await emailService.sendPasswordResetEmail(email, resetUrl);

  res.json({
    message: '비밀번호 재설정 링크가 이메일로 발송되었습니다.',
  });
});

/**
 * @desc    프로필 조회
 * @route   GET /api/users/me
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).populate('teams', 'name description');

  res.json({
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
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
  const { name, phone, currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');

  // 비밀번호 변경 시 현재 비밀번호 확인
  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({
        error: 'Current password required',
        message: '현재 비밀번호를 입력해주세요.',
      });
    }

    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({
        error: 'Invalid current password',
        message: '현재 비밀번호가 올바르지 않습니다.',
      });
    }

    user.password = newPassword;
  }

  // 다른 필드 업데이트
  if (name) user.name = name;
  if (phone) user.phone = phone;

  await user.save();

  res.json({
    message: '프로필이 업데이트되었습니다.',
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
    },
  });
});

/**
 * @desc    회원 탈퇴
 * @route   DELETE /api/users/me
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user.id, { isActive: false });

  res.json({
    message: '회원 탈퇴가 완료되었습니다.',
  });
});

/**
 * @desc    사용자 검색
 * @route   GET /api/users/search
 * @access  Private
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      error: 'Search query required',
      message: '검색어를 입력해주세요.',
    });
  }

  const users = await User.searchByKeyword(q).limit(10);

  res.json({
    users,
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

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      error: 'Invalid or expired token',
      message: '유효하지 않거나 만료된 토큰입니다.',
    });
  }

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.json({
    message: '비밀번호가 재설정되었습니다.',
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
};
