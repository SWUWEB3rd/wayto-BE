const { Minute } = require('../models');

const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    회의록 작성
 * @route   POST /api/minutes
 * @access  Private
 */
const createMinute = asyncHandler(async (req, res) => {
  const { meetingId,
    title,
    content,
    // todos,
    // links
  } = req.body;

  if (!meetingId) {
    return res.status(400).json({
      error: 'Meeting ID required',
      message: '회의 ID는 필수입니다.',
    });
  }

  const minute = await Minute.create({

    meetingId,
    // 회의록 수정/삭제 사용자 제한을 위해 authorId가 필요함
    authorId: req.user.id,
    // 수정 데이터
    title,
    attendees,
    meetingDate,
    location,
    meetingLink,
    content,

    // TODO: 기존 데이터 (남길지 뺄지 결정)
    // meeting: meetingId,
    // authorId: req.user.id,
    // title,
    // content,
    // todos,
    // links,
  });

  res.status(201).json({
    message: '회의록이 작성되었습니다.',
    minute,
  });
});

/**
 * @desc    회의록 수정
 * @route   PATCH /api/minutes/:minuteId
 * @access  Private
 */
const updateMinute = asyncHandler(async (req, res) => {
  const { minuteId } = req.params;

  const minute = await Minute.findById(minuteId);

  if (!minute) {
    return res.status(404).json({ error: 'Minute not found', message: '존재하지 않는 회의록입니다.' });
  }

  if (minute.authorId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized', message: '작성자만 수정할 수 있습니다.' });
  }

  Object.assign(minute, req.body);
  await minute.save();

  res.status(200).json({
    message: '회의록이 수정되었습니다.',
    minute: updatedMinute,
  });
});

/**
 * @desc    회의록 삭제
 * @route   DELETE /api/minutes/:minuteId
 * @access  Private
 */
const deleteMinute = asyncHandler(async (req, res) => {

  const { minuteId } = req.params;

  const minute = await Minute.findById(minuteId);

  if (!minute) {
    return res.status(404).json({ error: 'Minute not found', message: '존재하지 않는 회의록입니다.' });
  }

  if (minute.authorId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized', message: '작성자만 삭제할 수 있습니다.' });
  }

  await minute.deleteOne();

  res.status(200).json({
    message: '회의록이 삭제되었습니다.',
    minuteId: minuteId,
  });
});

module.exports = {
  createMinute,
  updateMinute,
  deleteMinute,
};
