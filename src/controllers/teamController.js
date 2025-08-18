const { Team, User } = require('../models');

const { asyncHandler } = require('../middleware/errorMiddleware');

/**
 * @desc    팀 생성
 * @route   POST /api/teams
 * @access  Private
 */
const createTeam = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const team = await Team.create({
    name,
    description,
    manager: req.user.id,
    members: [{ user: req.user.id, role: 'manager' }],
  });

  await User.findByIdAndUpdate(req.user.id, {
    $addToSet: { teams: team._id },
  });

  res.status(201).json({
    message: '팀이 생성되었습니다.',
    team,
  });
});

/**
 * @desc    사용자 검색
 * @route   GET /api/teams/search?q=keyword
 * @access  Private
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      error: 'Search query required',
      message: '검색어를 입력해주세요.',
    });
  }

  const users = await User.searchByKeyword(q).limit(10);
  res.json({ users });
});

/**
 * @desc    팀원 추가
 * @route   POST /api/teams/:teamId/members
 * @access  Private
 */
const addMemberToTeam = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const { teamId } = req.params;

  const team = await Team.findById(teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found', message: '존재하지 않는 팀입니다.' });
  }
  if (team.members.some(m => m.user.toString() === userId)) {
  return res.status(400).json({ error: 'User already exists' });
  }

  team.members.push({ user: userId, role: 'member' });
  await team.save();

  await User.findByIdAndUpdate(userId, {
    $addToSet: { teams: team._id },
  });

  res.json({ message: '사용자가 팀에 추가되었습니다.' });
});

/**
 * @desc    팀원 목록 조회
 * @route   GET /api/teams/:teamId/members
 * @access  Private (팀 멤버만)
 */
const getTeamMembers = asyncHandler(async (req, res) => {
  const { teamId } = req.params;

  const team = await Team.findById(teamId)
    .populate('members.user', 'name email')
    .select('members manager');

  if (!team) {
    return res.status(404).json({ error: 'Team not found', message: '존재하지 않는 팀입니다.' });
  }

  // 권한 체크: 해당 팀 멤버가 아니면 접근 불가
  if (!team.members.some(m => String(m.user._id) === String(req.user.id))) {
    return res.status(403).json({ error: 'Forbidden', message: '팀에 속한 사용자만 조회할 수 있습니다.' });
  }

  res.json({ members: team.members });
});


/**
 * @desc    팀 상세 조회
 * @route   GET /api/teams/:teamId
 * @access  Private
 */
const getTeamDetail = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.teamId)
    .populate('members.user', 'name email')
    .populate('manager', 'name email');

  if (!team) {
    return res.status(404).json({ error: 'Team not found', message: '존재하지 않는 팀입니다.' });
  }

  res.json({ team });
});

/**
 * @desc    팀 탈퇴 (본인)
 * @route   DELETE /api/teams/:teamId/members/me
 * @access  Private
 */
const leaveTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found', message: '존재하지 않는 팀입니다.' });
  }

  team.members.pull({ user: req.user.id });
  await team.save();

  await User.findByIdAndUpdate(req.user.id, {
    $pull: { teams: team._id },
  });

  res.json({ message: '팀에서 탈퇴했습니다.' });
});

/**
 * @desc    팀원 강퇴
 * @route   DELETE /api/teams/:teamId/members/:userId
 * @access  Private (팀장만)
 */
const kickMember = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found', message: '존재하지 않는 팀입니다.' });
  }

  if (team.manager.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized', message: '팀장만 강퇴할 수 있습니다.' });
  }

  team.members.pull({ user: req.params.userId });
  await team.save();

  await User.findByIdAndUpdate(req.params.userId, {
    $pull: { teams: team._id },
  });

  res.json({ message: '팀원이 강퇴되었습니다.' });
});

/**
 * @desc    팀 삭제
 * @route   DELETE /api/teams/:teamId
 * @access  Private (팀장만)
 */
const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.teamId);
  if (!team) {
    return res.status(404).json({ error: 'Team not found', message: '존재하지 않는 팀입니다.' });
  }

  if (team.manager.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized', message: '팀장만 삭제할 수 있습니다.' });
  }

  await team.deleteOne();

  // 모든 사용자 팀 목록에서 제거
  await User.updateMany(
    { teams: team._id },
    { $pull: { teams: team._id } }
  );

  res.json({ message: '팀이 삭제되었습니다.' });
});

module.exports = {
  createTeam,
  searchUsers,
  addMemberToTeam,
  getTeamMembers,
  getTeamDetail,
  leaveTeam,
  kickMember,
  deleteTeam,
};
