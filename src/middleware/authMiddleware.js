const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * JWT 토큰 검증 미들웨어
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication required',
        message: '인증 토큰이 필요합니다.',
      });
    }

    const token = authHeader.substring(7); // "Bearer " 제거

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({
        error: 'Invalid token',
        message: '유효하지 않은 토큰입니다.',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        error: 'Invalid token',
        message: '유효하지 않은 토큰입니다.',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        error: 'Token expired',
        message: '토큰이 만료되었습니다. 다시 로그인해주세요.',
      });
    }

    return res.status(500).json({
      error: 'Authentication error',
      message: '인증 처리 중 오류가 발생했습니다.',
    });
  }
};

/**
 * 선택적 인증 미들웨어 (토큰이 있으면 검증, 없어도 통과)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (user) {
      req.user = user;
    }

    next();
  } catch (error) {
    // 선택적 인증이므로 오류가 있어도 계속 진행
    next();
  }
};

/**
 * 팀 소유자 권한 검증
 */
const requireTeamOwner = (req, res, next) => {
  // 실제 구현에서는 팀 소유자 검증 로직 필요
  // 예: Team 모델에서 teamId와 userId 확인
  next();
};

/**
 * 팀 멤버 권한 검증
 */
const requireTeamMember = (req, res, next) => {
  // 실제 구현에서는 팀 멤버 검증 로직 필요
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  requireTeamOwner,
  requireTeamMember,
};
