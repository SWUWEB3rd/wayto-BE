// controllers/calendarController.js
const { Op } = require('sequelize');
const { Meeting, Minutes, TeamMember, Team } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');

const getMonthlyCalendar = asyncHandler(async (req, res) => {
  const { year, month, teamId } = req.query;

  if (!year || !month) {
    return res.status(400).json({
      error: 'Year and month required',
      message: '연도와 월은 필수 파라미터입니다.',
    });
  }

  const y = Number(year);
  const m = Number(month);
  const startDate = new Date(y, m - 1, 1);
  const endDate = new Date(y, m, 0);

  const startStr = startDate.toISOString().slice(0, 10);
  const endStr = endDate.toISOString().slice(0, 10);

  // 로그인 사용자의 팀 ID 목록
  const memberships = await TeamMember.findAll({
    where: { userId: req.user.id },
    attributes: ['teamId'],
  });

  let teamIds = memberships.map((tm) => tm.teamId);
  if (teamId) {
    const filtered = Number(teamId);
    teamIds = teamIds.includes(filtered) ? [filtered] : [];
  }

  if (!teamIds.length) {
    return res.json({ range: { start: startStr, end: endStr }, events: [] });
  }

  const meetings = await Meeting.findAll({
    where: {
      teamId: { [Op.in]: teamIds },
      meetingDate: { [Op.between]: [startStr, endStr] },
    },
    include: [
      { model: Team, as: 'team', attributes: ['name'] }, // id 제거
      { model: Minutes, as: 'minutes', attributes: ['id'], required: false },
    ],
    order: [
      ['meetingDate', 'ASC'],
      ['startTime', 'ASC'],
    ],
  });

  const toKst = (dateStr, timeStr) => {
    const t = (timeStr || '00:00:00').padEnd(8, ':00');
    return `${dateStr}T${t}+09:00`;
  };

  const events = meetings.map((m) => {
    const hasMany = Array.isArray(m.minutes);
    const hasMinutes = hasMany ? m.minutes.length > 0 : Boolean(m.minutes);
    return {
      id: `evt_${m.id}`,
      title: m.title,
      team: { name: m.team?.name ?? '' },
      startAt: toKst(String(m.meetingDate), String(m.startTime || '00:00:00')),
      hasMinutes,
    };
  });

  return res.json({
    range: { start: startStr, end: endStr },
    events,
  });
});

module.exports = { getMonthlyCalendar };
