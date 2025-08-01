const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, signupSchema, loginSchema } = require('../middleware/validationMiddleware');
const userController = require('../controllers/userController');

const router = express.Router();

// 회원가입 관련
router.post('/signup', validate(signupSchema), userController.signup);
router.post('/signup-sendnum', userController.sendSignupVerification);
router.post('/verify-number', userController.verifyEmailCode);
router.post('/verify-id', userController.checkEmailDuplicate);
router.post('/verify-phone', userController.checkPhoneDuplicate);

// 로그인 관련
router.post('/login', validate(loginSchema), userController.login);
router.post('/logout', authenticate, userController.logout);

// 아이디/비밀번호 찾기
router.post('/find/id', userController.findUserId);
router.post('/find/pw', userController.findUserPassword);
router.post('/idpw-sendnum', userController.sendIdPwVerification);
router.get('/find/id/success', userController.findIdSuccess);

// 비밀번호 재설정
router.get('/reset-pw', userController.getPasswordResetPage);
router.post('/reset-pw', userController.resetPassword);

// 사용자 프로필 관리 (인증 필요)
router.get('/me', authenticate, userController.getProfile);
router.patch('/me', authenticate, userController.updateProfile);
router.delete('/me', authenticate, userController.deleteAccount);

// 사용자 검색 (팀 관리용, 인증 필요)
router.get('/search', authenticate, userController.searchUsers);

module.exports = router;
