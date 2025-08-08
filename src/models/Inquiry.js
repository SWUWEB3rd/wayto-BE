const mongoose = require('mongoose');

const inquirySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, '제목은 필수 항목입니다.'],
    trim: true,
  },
  content: {
    type: String,
    required: [true, '내용은 필수 항목입니다.'],
    trim: true,
  },
  status: {
    type: String,
    enum: ['대기 중', '답변 완료'],
    default: '대기 중',
  },
  response: {
    type: String,
    default: '', // 관리자가 답변 작성 시 업데이트
  },
}, {
  timestamps: true, // createdAt, updatedAt 자동 생성
});

module.exports = mongoose.model('Inquiry', inquirySchema);
