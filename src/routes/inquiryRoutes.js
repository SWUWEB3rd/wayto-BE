// src/routes/inquiryRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const inquiryController = require('../controllers/inquiryController');

// 1:1 문의 작성만 제공
router.post('/', authenticate, inquiryController.createInquiry);

module.exports = router;
