const mongoose = require('mongoose');

// const todoSchema = new mongoose.Schema({
//   task: {
//     type: String,
//     required: [true, '할 일 내용은 필수입니다.'],
//   },
//   assignee: {
//     type: String,
//     trim: true,
//   },
//   dueDate: {
//     type: Date,
//   },
// });

const minuteSchema = new mongoose.Schema({
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meeting',
    required: true,
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: [true, '회의록 제목은 필수입니다.'],
    trim: true,
    maxlength: [100, '회의록 제목은 최대 100자까지 입력 가능합니다.'],
    trim: true
  },
  content: {
    type: String,
    default: null,
  },
  todos: {
    type: [String], // 추후 구조화?
    default: null,
  },
  links: {
    type: String,
    validate: {
      validator: (v) => /^https?:\/\/.+$/.test(v),
      message: '유효한 URL 형식이어야 합니다.',
    },
    default: null,
  },
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
      return ret;
    },
  },
});

// 인덱스 설정
minuteSchema.index({ meeting: 1, createdAt: -1 });

module.exports = mongoose.model('Minute', minuteSchema);
