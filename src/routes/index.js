const express = require('express');

const userRoutes = require('./userRoutes');
const teamRoutes = require('./teamRoutes');
const meetingRoutes = require('./meetingRoutes');
const minuteRoutes = require('./minuteRoutes');
const inquiryRoutes = require('./inquiryRoutes');
const calendarRoutes = require('./calendarRoutes');
const whentomeetRoutes = require('./whentomeetRoutes');
const navigationRoutes = require('./navigationRoutes');

const router = express.Router();

// API 버전 정보
router.get('/', (req, res) => {
  res.json({
    message: 'Meeting Management API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      teams: '/api/teams',
      meetings: '/api/meetings',
      minutes: '/api/minutes',
      inquiries: '/api/inquiries',
      calendar: '/api/calendar',
      whentomeet: '/api/whentomeet',
      navigation: '/api/navigation',
    },
  });
});

// 라우트 연결
router.use('/users', userRoutes);
router.use('/teams', teamRoutes);
router.use('/meetings', meetingRoutes);
router.use('/minutes', minuteRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/calendar', calendarRoutes);
router.use('/whentomeet', whentomeetRoutes);
router.use('/navigation', navigationRoutes);

// 에러 및 접근성 관련 라우트
router.get('/error/404', (req, res) => {
  res.status(404).json({
    error: 'Page not found',
    message: '요청하신 페이지를 찾을 수 없습니다.',
  });
});

router.get('/help/tutorial', (req, res) => {
  res.json({
    message: 'Tutorial and help information',
    tutorials: [
      {
        section: 'getting-started',
        title: '시작하기',
        description: '플랫폼 사용법 안내',
      },
      {
        section: 'team-management',
        title: '팀 관리',
        description: '팀 생성 및 멤버 관리 방법',
      },
      {
        section: 'meeting-scheduling',
        title: '회의 일정 관리',
        description: '웬투밋을 활용한 회의 일정 조율',
      },
    ],
  });
});

router.post('/access', (req, res) => {
  res.status(401).json({
    error: 'Authentication required',
    message: '로그인이 필요한 서비스입니다.',
    redirectTo: '/users/login',
  });
});

module.exports = router;
