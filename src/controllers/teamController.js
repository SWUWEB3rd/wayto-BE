const { Op } = require('sequelize');
const { Team, User, TeamMember, Minutes } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    팀 생성
 * @route   POST /api/teams
 * @access  Private
 */
const createTeam = asyncHandler(async (req, res) => {
  const { name, description, teamtag } = req.body;

  const team = await Team.create({
    name,
    description,
    teamtag,
    managerEmail: req.user.email,
    creatorId: req.user.id,
  });

  // 팀장 추가
  await TeamMember.create({
    teamId: team.id,
    userId: req.user.id, // email 대신 userId
    role: 'owner',
  });

  res.status(201).json({
    message: '팀이 생성되었습니다.',
    team,
  });
});

/**
 * @desc    내 팀 목록 조회
 * @route   GET /api/teams
 * @access  Private
 */
const getMyTeams = asyncHandler(async (req, res) => {
  const { id: userId } = req.user;

  // 사용자가 속한 TeamMember 항목들을 찾고, 연관된 Team 정보를 함께 가져옴
  const memberships = await TeamMember.findAll({
    where: { userId },
    include: [
      {
        model: Team,
        required: true,
        attributes: ['id', 'name', 'description', 'teamtag'], // 원하는 필드만 가져오기 (id 포함)
      },
    ],
    // 팀 이름 오름차순 (필요시 수정 가능성 O)
    order: [[Team, 'name', 'ASC']],
  });

  const teams = memberships.map((membership) => membership.Team);

  res.status(200).json({ teams });
});

/**
 * @desc    사용자 검색 (이메일)
 * @route   GET /api/teams/search?q=email
 * @access  Private
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Search query required', message: '검색어를 입력해주세요.' });
  }

  const users = await User.findAll({
    where: { email: { [Op.like]: `%${q}%` } },
    limit: 10,
    attributes: ['id', 'email', 'name'],
  });

  res.json({ users });
});

/**
 * @desc    팀원 추가
 * @route   POST /api/teams/:teamId/members
 * @access  Private
 */
const addMemberToTeam = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { teamId } = req.params;

  const team = await Team.findByPk(teamId);

  if (!team) return res.status(404).json({ error: 'Team not found', message: '존재하지 않는 팀입니다.' });
  
  if (team.managerEmail !== req.user.email) {
    return res.status(403).json({ message: '팀장만 사용할 수 있는 기능입니다.' });
  }

  // [수정] email로 User를 찾아 userId를 사용해야 함
  const userToAdd = await User.findOne({ where: { email } });
  if (!userToAdd) {
    return res.status(404).json({ message: '초대할 사용자를 찾을 수 없습니다.' });
  }

  // const existing = await TeamMember.findOne({ where: { teamId, email } });
  // if (existing) return res.status(400).json({ error: 'User already exists' });

  // await TeamMember.create({ teamId, email, role: 'member' });
  
  const existing = await TeamMember.findOne({
    where: { teamId, userId: userToAdd.id },
  });
  if (existing) return res.status(400).json({ error: 'User already exists' });

  await TeamMember.create({ teamId, userId: userToAdd.id, role: 'member' });

  res.json({ message: '사용자가 팀에 추가되었습니다.' });
});

/**
 * @desc    팀원 목록 조회
 * @route   GET /api/teams/:teamId/members
 * @access  Private (팀 멤버만)
 */
const getTeamMembers = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findByPk(teamId);
  if (!team) return res.status(404).json({ error: 'Team not found', message: '존재하지 않는 팀입니다.' });

  const members = await TeamMember.findAll({
    where: { teamId },
    include: [{ model: User, attributes: ['name', 'email'] }],
  });

  // owner 먼저, 그 다음 이메일 가나다순
  members.sort((a, b) => {
    if (a.role === 'owner') return -1;
    if (b.role === 'owner') return 1;
    // return a.email.localeCompare(b.email);
    return a.User.email.localeCompare(b.User.email);
  });

  const result = members.map(m => ({
    name: m.User.name,
    email: m.User.email,
    role: m.role,
  }));

  res.json({ members: result });
});

/**
 * @desc    팀 상세 조회
 * @route   GET /api/teams/:teamId
 * @access  Private
 */
const getTeamDetail = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findByPk(teamId);
  if (!team) return res.status(404).json({ error: 'Team not found', message: '존재하지 않는 팀입니다.' });

  res.json({ team });
});

/**
 * @desc    팀 설명 수정
 * @route   PATCH /api/teams/:teamId
 * @access  Private
 */
const updateTeamDetail = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { description, teamtag } = req.body;

  const team = await Team.findByPk(teamId);
  if (!team) return res.status(404).json({ error: 'Team not found', message: '존재하지 않는 팀입니다.' });

  if (team.managerEmail !== req.user.email) {
    return res.status(403).json({ message: '팀장만 사용할 수 있는 기능입니다.' });
  }

  if (description) {
    team.description = description;
    await team.save();
  }

  if (teamtag !== undefined) {
    team.teamtag = teamtag;
  }

  res.json({ team });
});

/**
 * @desc    팀별 회의록 조회
 * @route   GET /api/teams/:teamId/minutes
 * @access  Private
 */
const getTeamMinutes = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findByPk(teamId);
  if (!team) {
    return res.status(404).json({ message: '존재하지 않는 팀입니다.' });
  }

  // 팀 멤버인지 체크
  // const member = await TeamMember.findOne({ where: { teamId, email: req.user.email } });
  const member = await TeamMember.findOne({
    where: { teamId, userId: req.user.id },
  });
  if (!member) return res.status(403).json({ error: 'Forbidden', message: '팀 멤버만 조회할 수 있습니다.' });

  const minutes = await Minutes.findAll({
    where: { teamId },
    include: [{
      model: User,
      as: 'author',
      attributes: ['name', 'email']
    }],
    order: [['created_at', 'DESC']], // 최신순 정렬
    attributes: ['id', 'title', 'created_at', 'updated_at']
  });

  res.json({ minutes });
});

/**
 * @desc    팀 탈퇴 (본인)
 * @route   DELETE /api/teams/:teamId/members/me
 * @access  Private
 */
const leaveTeam = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findByPk(teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found', message: '존재하지 않는 팀입니다.' });
  }

  if (team.managerEmail === req.user.email) {
    return res.status(403).json({
      error: 'Forbidden',
      message:
        '팀장은 팀을 탈퇴할 수 없습니다.',
    });
  }

  // await TeamMember.destroy({
  //   where: { teamId, email: req.user.email },
  await TeamMember.destroy({
    where: { teamId, userId: req.user.id },
  });

  res.status(204).send();
});


/**
 * @desc    팀원 강퇴
 * @route   DELETE /api/teams/:teamId/members
 * @access  Private (팀장만)
 */
const kickMember = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { teamId } = req.params;

  const team = await Team.findByPk(teamId);
  
  if (!team) return res.status(404).json({ error: 'Team not found', message: '존재하지 않는 팀입니다.' });

  if (team.managerEmail !== req.user.email) {
    return res.status(403).json({ message: '팀장만 사용할 수 있는 기능입니다.' });
  }

  const userToKick = await User.findOne({ where: { email } });
  if (!userToKick) {
    return res.status(404).json({ message: '강퇴할 사용자를 찾을 수 없습니다.' });
  }

  // await TeamMember.destroy({ where: { teamId, email } });
  await TeamMember.destroy({ where: { teamId, userId: userToKick.id } });

  res.status(204).send();
});

/**
 * @desc    팀 삭제
 * @route   DELETE /api/teams/:teamId
 * @access  Private (팀장만)
 */
const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findByPk(req.params.teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found', message: '존재하지 않는 팀입니다.' });
  }

  if (team.managerEmail !== req.user.email) {
    return res.status(403).json({ message: '팀장만 사용할 수 있는 기능입니다.' });
  }

  await team.destroy(); // 팀 삭제
  await TeamMember.destroy({ where: { teamId: req.params.teamId } });

  res.status(204).send();
});

module.exports = {
  createTeam,
  getMyTeams,
  searchUsers,
  addMemberToTeam,
  getTeamMembers,
  getTeamDetail,
  updateTeamDetail,
  getTeamMinutes,
  leaveTeam,
  kickMember,
  deleteTeam,
};
