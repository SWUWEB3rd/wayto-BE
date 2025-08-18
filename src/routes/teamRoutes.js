const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, teamSchema } = require('../middleware/validationMiddleware');
const teamController = require('../controllers/teamController');

const router = express.Router();

// 팀 생성
router.post('/', authenticate, validate(teamSchema), teamController.createTeam);

// 사용자 검색 (팀에 초대할 유저 탐색)
router.get('/search', authenticate, teamController.searchUsers);

// 사용자 팀에 추가
router.post('/:team_id/members', authenticate, teamController.addMemberToTeam);

// 팀원 목록 조회
router.get('/:team_id/members', authenticate, teamController.getTeamMembers);

// 팀 상세 조회
router.get('/:team_id', authenticate, teamController.getTeamDetail);

// 팀 탈퇴 (본인이 탈퇴)
router.delete('/:team_id/members/me', authenticate, teamController.leaveTeam);

// 팀원 강퇴 (팀장만 가능)
router.delete('/:team_id/members/:user_id', authenticate, teamController.kickMember);

// 팀 삭제 (팀장만 가능)
router.delete('/:team_id', authenticate, teamController.deleteTeam);

module.exports = router;
