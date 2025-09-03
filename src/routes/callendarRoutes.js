const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const calendarController = require('../controllers/calendarController');

const router = express.Router();

// 월간 일정 조회
router.get('/', authenticate, calendarController.getMonthlyCalendar);

// 특정 회의의 회의록 링크 또는 안내
router.get('/:meetingId/minute', authenticate, calendarController.getMeetingMinuteLink);

module.exports = router;