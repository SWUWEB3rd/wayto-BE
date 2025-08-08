const Minute = require('../models/Minute');
// const Meeting = require('../models/Meeting');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    회의록 작성
 * @route   POST /api/minutes
 * @access  Private
 */
const createMinute = asyncHandler(async (req, res) => {
  const { meetingId, title, content, todos, links } = req.body;
//   const { teamId, meetingId } = req.params;

//   const meeting = await Meeting.findOne({ _id: meetingId, team: teamId });
//   if (!meeting) {
//     return res.status(404).json({
//       error: 'Meeting not found',
//       message: '해당 팀에 속한 회의가 존재하지 않습니다.',
//     });
//   }

  if (!meeting_id) {
    return res.status(400).json({
      error: 'Meeting ID required',
      message: '회의 ID는 필수입니다.',
    });
  }

  const minute = await Minute.create({
    meeting: meetingId,
    authorId: req.user.id,
    title,
    content,
    todos,
    links,
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
//   const { teamId, meetingId, minuteId } = req.params;
  const { minuteId } = req.params;

// const meeting = await Meeting.findOne({ _id: meetingId, team: teamId });
//   if (!meeting) {
//     return res.status(404).json({ error: 'Meeting not found', message: '회의를 찾을 수 없습니다.' });
//   }

  const minute = await Minute.findById(minuteId);
  if (!minute) {
    return res.status(404).json({ error: 'Minute not found', message: '존재하지 않는 회의록입니다.' });
  }

  if (minute.authorId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized', message: '작성자만 수정할 수 있습니다.' });
  }

  Object.assign(minute, req.body);
  await minute.save();

  res.json({
    message: '회의록이 수정되었습니다.',
    minute,
  });
});

/**
 * @desc    회의록 삭제
 * @route   DELETE /api/minutes/:minuteId
 * @access  Private
 */
const deleteMinute = asyncHandler(async (req, res) => {
//   const { teamId, meetingId, minuteId } = req.params;
  const { minuteId } = req.params;

//   const meeting = await Meeting.findOne({ _id: meetingId, team: teamId });
//   if (!meeting) {
//     return res.status(404).json({ error: 'Meeting not found', message: '회의를 찾을 수 없습니다.' });
//   }

  const minute = await Minute.findById(minuteId);
  if (!minute) {
    return res.status(404).json({ error: 'Minute not found', message: '존재하지 않는 회의록입니다.' });
  }

  if (minute.authorId.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized', message: '작성자만 삭제할 수 있습니다.' });
  }

  await minute.deleteOne();

  res.json({ message: '회의록이 삭제되었습니다.' });
});

module.exports = {
  createMinute,
  updateMinute,
  deleteMinute,
};
