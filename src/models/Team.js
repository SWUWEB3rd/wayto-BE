const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  role: {
    type: String,
    enum: ['manager', 'member'],
    default: 'member',
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '팀 이름은 필수입니다.'],
    trim: true,
    minlength: [2, '팀 이름은 최소 2자 이상이어야 합니다.'],
    maxlength: [50, '팀 이름은 최대 50자까지 입력 가능합니다.'],
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, '팀 설명은 최대 200자까지 입력 가능합니다.'],
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [memberSchema],
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
teamSchema.index({ name: 1 });
teamSchema.index({ createdAt: -1 });
teamSchema.index({ _id: 1, 'members.user': 1 }, { unique: true });

module.exports = mongoose.model('Team', teamSchema);
