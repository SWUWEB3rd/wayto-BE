const { Inquiry } = require('../models');

//문의작성
exports.createInquiry = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const newInquiry = await Inquiry.create({
      user: userId,
      title,
      content,
    });

    res.status(201).json({
      message: '문의가 등록되었습니다.',
      inquiry: newInquiry,
    });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error });
  }
};

//문의내역조회
exports.getInquiry = async (req, res) => {
  try {
    const inquiry = await Inquiry.findOne({
      _id: req.params.inquiry_id,
      user: req.user.id,
    }).populate('user', 'name email');

    if (!inquiry) {
      return res.status(404).json({ message: '문의 내역이 없습니다.' });
    }

    res.status(200).json({ inquiry });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error });
  }
};

//내가 작성한 문의 조회
exports.getMyInquiries = async (req, res) => {
  try {
    const userId = req.user.id;

    const inquiries = await Inquiry.find({ user: userId })
      .sort({ createdAt: -1 }); // 최신순 정렬

    res.status(200).json({ inquiries });
  } catch (error) {
    res.status(500).json({ message: '서버 오류', error });
  }
};
