const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, minuteSchema, minuteUpdateSchema } = require('../middleware/validationMiddleware');
const minuteController = require('../controllers/minuteController');

const router = express.Router();

// 회의록 작성
router.post('/', authenticate, validate(minuteSchema), minuteController.createMinute);

// 예정된 회의 목록 조회
router.get('/upcoming', authenticate, minuteController.getUpcomingMeetings);

// 회의록 상세 조회
router.get('/:minuteId', authenticate, minuteController.getMinute);

// 회의록 수정
router.patch('/:minuteId', authenticate, validate(minuteUpdateSchema), minuteController.updateMinute);

// 회의록 삭제
router.delete('/:minuteId', authenticate, minuteController.deleteMinute);

module.exports = router;
