const { Minutes, User, Meeting, MeetingAttendee } = require('../models');
const { Op } = require('sequelize');

const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    회의록 작성
 * @route   POST /api/minutes
 * @access  Private
 */
const createMinute = asyncHandler(async (req, res) => {
  const {
    meetingId,
    title,
    content,
    attendees,
    meetingDate,
    location,
    meetingLink,
    // todos,
    // links
  } = req.body;

  if (!meetingId) {
    return res.status(400).json({
      error: 'Meeting ID required',
      message: '회의 ID는 필수입니다.',
    });
  }

  const meeting = await Meeting.findByPk(meetingId);
  if (!meeting) {
    return res.status(404).json({ message: '존재하지 않는 회의입니다.' });
  }

  const minute = await Minutes.create({
    meetingId,
    // 팀별 회의록 조회 기능 위해 필요
    teamId: meeting.teamId,
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
 * @desc     예정된 회의 목록 조회
 * @route    GET /api/minutes/upcoming
 * @access   Private
 */
const getUpcomingMeetings = asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD' 형식

  const upcomingMeetings = await Meeting.findAll({
    attributes: ['id', 'title', 'meetingDate', 'startTime', 'meetingUrl'],
    where: {
      status: 'scheduled',
      meetingDate: {
        [Op.gte]: today, // 오늘 날짜보다 크거나 같은
      },
    },
    include: [
      {
        model: MeetingAttendee,
        where: {
          userId: req.user.id, // 현재 로그인한 사용자가 참석자인 경우
        },
        required: true,
        attributes: [], // MeetingAttendee 정보는 필요 없으므로 빈 배열로 설정
      },
    ],
    order: [
      ['meetingDate', 'ASC'], // 날짜 오름차순
      ['startTime', 'ASC'],  // 시간 오름차순
    ],
    limit: 3, // 3개만 조회
  });

  const formattedMeetings = upcomingMeetings.map(meeting => {
    return {
      meetingId: meeting.id, // "입장하기" 버튼이 회의록 작성 페이지로 연결할 때 사용할 ID
      title: meeting.title,
      meetingDateTime: `${meeting.meetingDate}T${meeting.startTime}`, // 날짜와 시간을 조합
      meetingLink: meeting.meetingUrl // Meeting 모델의 meetingUrl 사용
    };
  });

  res.status(200).json(formattedMeetings);
});

/**
 * @desc    회의록 상세 조회
 * @route   GET /api/minutes/:minuteId
 * @access  Private
 */
const getMinute = asyncHandler(async (req, res) => {
  const { minuteId } = req.params;

  const minute = await Minute.findByPk(minuteId, {
    include: {
      model: User,
      as: 'author',
      attributes: ['id', 'name'],
    },
  });

  if (!minute) {
    return res.status(404).json({
      error: 'Minute not found',
      message: '회의록이 없습니다. 작성 페이지로 이동하세요.',
    });
  }

  res.status(200).json(minute);
});

/**
 * @desc    회의록 수정
 * @route   PATCH /api/minutes/:minuteId
 * @access  Private
 */
const updateMinute = asyncHandler(async (req, res) => {
  const { minuteId } = req.params;

  // Sequelize 메서드로 변경
  const minute = await Minutes.findByPk(minuteId);

  if (!minute) {
    return res.status(404).json({ error: 'Minute not found', message: '존재하지 않는 회의록입니다.' });
  }

  // Sequelize는 integer 비교이므로 .toString() 불필요
  if (minute.authorId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized', message: '작성자만 수정할 수 있습니다.' });
  }

  // Object.assign(minute, req.body);
  // await minute.save();

  const {
    title,
    // attendees,
    // meetingDate,
    // location,
    // meetingLink,
    content,
    // todos,
    // links
  } = req.body;

  const updatedMinute = await minute.update({ title, content });

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

  // Sequelize 메서드로 변경
  const minute = await Minutes.findByPk(minuteId);

  if (!minute) {
    return res.status(404).json({ error: 'Minute not found', message: '존재하지 않는 회의록입니다.' });
  }

  // Sequelize는 integer 비교이므로 .toString() 불필요
  if (minute.authorId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized', message: '작성자만 삭제할 수 있습니다.' });
  }

  // Sequelize destroy 메서드 사용
  await minute.destroy();

  res.status(204).send();
});

module.exports = {
  createMinute,
  getUpcomingMeetings,
  getMinute,
  updateMinute,
  deleteMinute,
};
