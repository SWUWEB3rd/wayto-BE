const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/authMiddleware");
const inquiryController = require("../controllers/inquiryController");

// 1:1 문의 작성
router.post("/", authenticate, inquiryController.createInquiry);

// 1:1 문의 상세 조회
router.get("/:inquiry_id", authenticate, inquiryController.getInquiry);

// 1:1 문의 전체 조회 (내가 작성한)
router.get('/', authenticate, inquiryController.getMyInquiries);

module.exports = router;