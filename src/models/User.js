const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, '이메일은 필수 항목입니다.'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      '올바른 이메일 형식이 아닙니다.',
    ],
  },
  password: {
    type: String,
    required: [true, '비밀번호는 필수 항목입니다.'],
    minlength: [8, '비밀번호는 최소 8자 이상이어야 합니다.'],
    select: false, // 기본적으로 조회 시 제외
  },
  name: {
    type: String,
    required: [true, '이름은 필수 항목입니다.'],
    trim: true,
    minlength: [2, '이름은 최소 2자 이상이어야 합니다.'],
    maxlength: [20, '이름은 최대 20자까지 입력 가능합니다.'],
  },
  phone: {
    type: String,
    trim: true,
    match: [/^010-?\d{4}-?\d{4}$/, '올바른 전화번호 형식이 아닙니다.'],
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  emailVerificationExpires: {
    type: Date,
    select: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  teams: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
  }],
  lastLoginAt: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true, // createdAt, updatedAt 자동 생성
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.emailVerificationExpires;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.__v;
      return ret;
    },
  },
});

// 인덱스 설정
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ createdAt: -1 });

// 비밀번호 해싱 미들웨어
userSchema.pre('save', async function(next) {
  // 비밀번호가 변경되지 않았으면 스킵
  if (!this.isModified('password')) return next();

  try {
    // 비밀번호 해싱
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error);
  }
});

// 비밀번호 확인 메서드
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// 이메일 인증 토큰 생성
userSchema.methods.generateEmailVerificationToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24시간

  return token;
};

// 비밀번호 재설정 토큰 생성
userSchema.methods.generatePasswordResetToken = function() {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10분

  return token;
};

// 사용자 검색을 위한 정적 메서드
userSchema.statics.searchByKeyword = function(keyword) {
  return this.find({
    $or: [
      { name: { $regex: keyword, $options: 'i' } },
      { email: { $regex: keyword, $options: 'i' } },
    ],
    isActive: true,
  }).select('name email _id');
};

// Virtual 필드 - 사용자가 속한 팀 수
userSchema.virtual('teamCount').get(function() {
  return this.teams.length;
});

module.exports = mongoose.model('User', userSchema);
