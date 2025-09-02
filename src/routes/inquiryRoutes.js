// src/routes/inquiryRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const inquiryController = require('../controllers/inquiryController');

// 1:1 문의 작성
router.post('/', authenticate, inquiryController.createInquiry);

// 내가 작성한 1:1 문의 목록
router.get('/', authenticate, inquiryController.getMyInquiries);

// 1:1 문의 상세 (내 것만)
router.get('/:inquiry_id', authenticate, inquiryController.getInquiry);

module.exports = router;
