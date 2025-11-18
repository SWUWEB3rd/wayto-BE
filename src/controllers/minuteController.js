const { Minutes, User, Meeting, TeamMember } = require('../models');
const { Op } = require('sequelize');

const { asyncHandler } = require('../middleware/errorMiddleware');

const checkTeamMembership = async (userId, teamId) => {
  // if (!teamId) return false; // teamId가 없으면 검증 불가

  const member = await TeamMember.findOne({
    where: {
      userId: userId,
      teamId: teamId
    }
  });
  return !!member; // 멤버십이 존재하면 true, 아니면 false
};

/**
 * @desc    회의록 작성 (회의 자동 생성)
 * @route   POST /api/minutes
 * @access  Private
 */
const createMinute = asyncHandler(async (req, res) => {
  const {
    teamId,
    title,
    content,
    attendees,
    meetingDate,
    startTime,  // Meeting 생성 위해 필요
    endTime,    // Meeting 생성 위해 필요
    location,
    meetingLink,
  } = req.body;

  const isTeamMember = await checkTeamMembership(req.user.id, teamId);
  if (!isTeamMember) {
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: '해당 팀에 속한 멤버만 회의록을 작성할 수 있습니다.' 
    });
  }

  // if (!meetingId) {
  //   return res.status(400).json({
  //     error: 'Meeting ID required',
  //     message: '회의 ID는 필수입니다.',
  //   });
  // }

  // const meeting = await Meeting.findByPk(meetingId);
  // if (!meeting) {
  //   return res.status(404).json({ message: '존재하지 않는 회의입니다.' });
  // }

  const newMeeting = await Meeting.create({
    teamId,
    organizerId: req.user.id,
    title,
    meetingDate,
    startTime,
    endTime,
    location,
    meetingUrl: meetingLink,
    status: 'completed', // 회의록이 작성되므로 '완료' 상태로 생성
  });

  const minute = await Minutes.create({
    meetingId: newMeeting.id, // 방금 생성된 회의 ID 사용
    teamId, // req.body에서 받은 teamId 사용
    authorId: req.user.id,
    title,
    attendees,
    meetingDate,
    location,
    meetingLink,
    content,
  });

  res.status(201).json({
    message: '회의록이 작성되었습니다.',
    minute,
  });
});

/**
 * @desc     최근 회의록 3개 조회
 * @route    GET /api/minutes/recent
 * @access   Private
 */
const getRecentMinutes = asyncHandler(async (req, res) => {
  // 사용자가 속한 모든 팀 ID 조회
  const teamMemberships = await TeamMember.findAll({
    where: { userId: req.user.id },
    attributes: ['teamId'],
  });

  const teamIds = teamMemberships.map(tm => tm.teamId);

  if (teamIds.length === 0) {
    return res.status(200).json([]); // 참여 중인 팀이 없으면 빈 배열 반환
  }

  // 해당 팀 ID를 가진 회의록을 작성 시간(createdAt) 기준 최근 3개 조회
  const recentMinutes = await Minutes.findAll({
    where: {
      teamId: {
        [Op.in]: teamIds,
      },
    },
    order: [['created_at', 'DESC']],
    limit: 3,
    include: {
      model: User,
      as: 'author',
      attributes: ['id', 'name'],
    },
  });

  res.status(200).json(recentMinutes);
});

// /**
//  * @desc     예정된 회의 목록 조회
//  * @route    GET /api/minutes/upcoming
//  * @access   Private
//  */
// const getUpcomingMeetings = asyncHandler(async (req, res) => {
//   const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD' 형식

//   const upcomingMeetings = await Meeting.findAll({
//     attributes: ['id', 'title', 'meetingDate', 'startTime', 'meetingUrl'],
//     where: {
//       status: 'scheduled',
//       meetingDate: {
//         [Op.gte]: today, // 오늘 날짜보다 크거나 같은
//       },
//     },
//     include: [
//       {
//         model: MeetingAttendee,
//         where: {
//           userId: req.user.id, // 현재 로그인한 사용자가 참석자인 경우
//         },
//         required: true,
//         attributes: [], // MeetingAttendee 정보는 필요 없으므로 빈 배열로 설정
//       },
//     ],
//     order: [
//       ['meetingDate', 'ASC'], // 날짜 오름차순
//       ['startTime', 'ASC'],  // 시간 오름차순
//     ],
//     limit: 3, // 3개만 조회
//   });

//   const formattedMeetings = upcomingMeetings.map(meeting => {
//     return {
//       meetingId: meeting.id, // "입장하기" 버튼이 회의록 작성 페이지로 연결할 때 사용할 ID
//       title: meeting.title,
//       meetingDateTime: `${meeting.meetingDate}T${meeting.startTime}`, // 날짜와 시간을 조합
//       meetingLink: meeting.meetingUrl // Meeting 모델의 meetingUrl 사용
//     };
//   });

//   res.status(200).json(formattedMeetings);
// });

/**
 * @desc    회의록 상세 조회
 * @route   GET /api/minutes/:minuteId
 * @access  Private
 */
const getMinute = asyncHandler(async (req, res) => {
  const { minuteId } = req.params;

  const minute = await Minutes.findByPk(minuteId, {
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

  const isTeamMember = await checkTeamMembership(req.user.id, minute.teamId);
  if (!isTeamMember) {
    return res.status(403).json({ 
      error: 'Forbidden', 
      message: '해당 회의록이 속한 팀 멤버만 조회할 수 있습니다.' 
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

  if (minute.authorId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized', message: '작성자만 수정할 수 있습니다.' });
  }

  const {
    title,
    attendees,
    meetingDate,
    location,
    meetingLink,
    content
  } = req.body;

  const updatedMinute = await minute.update({
    title,
    attendees,
    meetingDate,
    location,
    meetingLink,
    content
  });

  // 원본 회의(Meeting) 정보도 함께 업데이트
  const meeting = await Meeting.findByPk(minute.meetingId);
  if (meeting) {
    await meeting.update({
      title,
      meetingDate,
      location,
      meetingUrl: meetingLink,
    });
  }

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

  const minute = await Minutes.findByPk(minuteId);

  if (!minute) {
    return res.status(404).json({ error: 'Minute not found', message: '존재하지 않는 회의록입니다.' });
  }

  if (minute.authorId !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized', message: '작성자만 삭제할 수 있습니다.' });
  }

  // Sequelize destroy 메서드 사용
  await minute.destroy();

  res.status(204).send();
});

module.exports = {
  createMinute,
  getRecentMinutes,
  getMinute,
  updateMinute,
  deleteMinute,
};
