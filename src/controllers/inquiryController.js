// src/controllers/inquiryController.js
const { Inquiry, User, Sequelize } = require('../models');
const { createInquirySchema, listQuerySchema } = require('../validators/inquirySchemas');
const { Op } = Sequelize;

// 1) 1:1 문의 작성
exports.createInquiry = async (req, res) => {
  try {
    const { error, value } = createInquirySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: 'BadRequest', message: error.message });
    }

    const newInquiry = await Inquiry.create({
      userId: req.user.id,    // ✅ Sequelize 컬럼명
      category: value.category,
      title: value.title,
      content: value.content,
      // status는 모델 default: 'pending'
    });

    return res.status(201).json({
      message: '문의가 등록되었습니다.',
      inquiry: newInquiry,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 오류' });
  }
};

// 2) 내가 작성한 문의 목록 (필터/페이지네이션 포함)
exports.getMyInquiries = async (req, res) => {
  try {
    const { error, value } = listQuerySchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: 'BadRequest', message: error.message });
    }

    const { page, limit, status, category, order } = value;
    const offset = (page - 1) * limit;

    const where = { userId: req.user.id };
    if (status) where.status = status;
    if (category) where.category = category;

    const { rows, count } = await Inquiry.findAndCountAll({
      where,
      order: [['created_at', order.toUpperCase()]], // ✅ created_at(모델 옵션)
      limit,
      offset,
      // include는 필요 시 작성자 정보 보기 위해 사용 가능
      // include: [{ model: User, as: 'user', attributes: ['id', 'name', 'email'] }],
    });

    return res.status(200).json({
      inquiries: rows,
      page,
      limit,
      total: count,
      totalPages: Math.ceil(count / limit),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 오류' });
  }
};

// 3) 문의 상세 (내 것만)
exports.getInquiry = async (req, res) => {
  try {
    const inquiryId = req.params.inquiry_id;

    const inquiry = await Inquiry.findOne({
      where: { id: inquiryId, userId: req.user.id }, // ✅ Sequelize where
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] } // 관계 초기화 필요
      ],
    });

    if (!inquiry) {
      return res.status(404).json({ message: '문의 내역이 없습니다.' });
    }

    return res.status(200).json({ inquiry });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: '서버 오류' });
  }
};
