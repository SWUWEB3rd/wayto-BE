const Team = require('../models/Team');
const User = require('../models/User');
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
    owner: req.user.id,
    members: [req.user.id],
  });

  await User.findByIdAndUpdate(req.user.id, {
    $push: { teams: team._id },
  });

  res.status(201).json({
    message: '팀이 생성되었습니다.',
    team,
  });
});

// 사용자 검색 기능: user? or team?

// /**
//  * @desc    사용자 검색
//  * @route   GET /api/teams/search?q=keyword
//  * @access  Private
//  */
// const searchUsers = asyncHandler(async (req, res) => {
//   const { q } = req.query;

//   if (!q) {
//     return res.status(400).json({
//       error: 'Search query required',
//       message: '검색어를 입력해주세요.',
//     });
//   }

//   const users = await User.searchByKeyword(q).limit(10);
//   res.json({ users });
// });

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

  if (team.members.includes(userId)) {
    return res.status(400).json({ error: 'User already exists', message: '이미 팀에 속한 사용자입니다.' });
  }

  team.members.push(userId);
  await team.save();

  await User.findByIdAndUpdate(userId, {
    $push: { teams: team._id },
  });

  res.json({ message: '사용자가 팀에 추가되었습니다.' });
});

/**
 * @desc    팀 상세 조회
 * @route   GET /api/teams/:teamId
 * @access  Private
 */
const getTeamDetail = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.teamId)
    .populate('members', 'name email')
    .populate('owner', 'name email');

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

  team.members.pull(req.user.id);
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

  if (team.owner.toString() !== req.user.id) {
    return res.status(403).json({ error: 'Unauthorized', message: '팀장만 강퇴할 수 있습니다.' });
  }

  team.members.pull(req.params.userId);
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

  if (team.owner.toString() !== req.user.id) {
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
  getTeamDetail,
  leaveTeam,
  kickMember,
  deleteTeam,
};
