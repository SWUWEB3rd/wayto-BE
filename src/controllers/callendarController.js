const { Op } = require('sequelize');
const {
  Meeting,
  Minutes,
  TeamMember,
  Team,
} = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * 로그인한 사용자의 월간 회의 일정을 조회한다.
 * 사용자가 속한 팀의 회의 일정을 모아 날짜 범위와 함께 반환하며,
 * 각 회의에 회의록 존재 여부를 나타내는 hasMinutes 플래그를 포함한다.
 *
 * @route   GET /api/calendar
 * @access  Private
 */
const getMonthlyCalendar = asyncHandler(async (req, res) => {
  const { year, month, teamId } = req.query;

  if (!year || !month) {
    return res.status(400).json({
      error: 'Year and month required',
      message: '연도와 월은 필수 파라미터입니다.',
    });
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  // 로그인한 사용자가 속한 팀 ID 조회
  const memberships = await TeamMember.findAll({
    where: { userId: req.user.id },
    attributes: ['teamId'],
  });

  let teamIds = memberships.map((m) => m.teamId);
  if (teamId) {
    const filtered = Number(teamId);
    teamIds = teamIds.includes(filtered) ? [filtered] : [];
  }

  const meetings = await Meeting.findAll({
    where: {
      teamId: teamIds,
      meetingDate: {
        [Op.between]: [startDate, endDate],
      },
    },
    include: [
      { model: Team, as: 'team', attributes: ['id', 'name'] },
      { model: Minutes, as: 'minutes', attributes: ['id'], required: false },
    ],
    order: [
      ['meetingDate', 'ASC'],
      ['startTime', 'ASC'],
    ],
  });

  const events = meetings.map((m) => ({
    id: `evt_${m.id}`,
    meetingId: m.id,
    title: m.title,
    team: m.team ? { id: m.team.id, name: m.team.name } : null,
    startAt: new Date(`${m.meetingDate}T${m.startTime}`).toISOString(),
    endAt: new Date(`${m.meetingDate}T${m.endTime}`).toISOString(),
    location: m.location,
    status: m.status,
    hasMinutes: Array.isArray(m.minutes) && m.minutes.length > 0,
  }));

  return res.json({
    range: {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0],
    },
    events,
  });
});

/**
 * 특정 회의에 대한 회의록 링크 또는 작성 안내를 반환한다.
 *
 * @route   GET /api/calendar/:meetingId/minute
 * @access  Private
 */
const getMeetingMinuteLink = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;

  const minute = await Minutes.findOne({ where: { meetingId } });

  if (minute) {
    return res.json({
      meetingId,
      minuteId: minute.id,
      link: `/api/minutes/${minute.id}`,
    });
  }

  return res.status(404).json({
    error: 'MinutesNotFound',
    message: '회의록이 없습니다. 작성 페이지로 이동하세요.',
  });
});

module.exports = {
  getMonthlyCalendar,
  getMeetingMinuteLink,
};