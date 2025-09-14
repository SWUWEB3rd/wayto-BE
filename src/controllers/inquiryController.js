// src/controllers/inquiryController.js
const { Inquiry } = require('../models');                 // 필요한 것만
const { createInquirySchema } = require('../validators/inquirySchemas'); // 생성용만

// 1) 1:1 문의 작성 (POST /api/inquiries)
exports.createInquiry = async (req, res) => {
  try {
    const { error, value } = createInquirySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'BadRequest', message: error.message });
    }

    const inquiry = await Inquiry.create({
      userId: req.user.id,    // 인증 미들웨어에서 셋 된 사용자 ID
      category: value.category,
      title: value.title,
      content: value.content,
      // status는 모델 default 사용: e.g. 'pending' 또는 'open'
    });

    return res.status(201).json({
      message: '문의가 등록되었습니다.',
      id: inquiry.id,
      status: inquiry.status,
      createdAt: inquiry.createdAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'ServerError', message: '서버 오류' });
  }
};
