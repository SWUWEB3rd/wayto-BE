const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, teamSchema } = require('../middleware/validationMiddleware');
const teamController = require('../controllers/teamController');

const router = express.Router();

// 팀 생성
router.post('/', authenticate, validate(teamSchema), teamController.createTeam);

// 사용자 검색 (팀에 초대할 유저 탐색)
router.get('/search', authenticate, teamController.searchUsers);

// 팀 상세 조회 및 설명 수정
router.get('/:teamId', authenticate, teamController.getTeamDetail);
router.patch('/:teamId', authenticate, teamController.updateTeamDetail);

// 팀 삭제
router.delete('/:teamId', authenticate, teamController.deleteTeam);

// 사용자 팀에 추가
router.post('/:teamId/members', authenticate, teamController.addMemberToTeam);

// 팀원 목록 조회
router.get('/:teamId/members', authenticate, teamController.getTeamMembers);

// 팀원 강퇴 (팀장만 가능)
router.delete('/:teamId/members', authenticate, teamController.kickMember);

// 팀 탈퇴 (본인이 탈퇴)
router.delete('/:teamId/members/me', authenticate, teamController.leaveTeam);

module.exports = router;
