// routes/calendarRoutes.js
const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const calendarController = require('../controllers/calendarController');

const router = express.Router();

// 월간 일정 조회
router.get('/', authenticate, calendarController.getMonthlyCalendar);

module.exports = router;