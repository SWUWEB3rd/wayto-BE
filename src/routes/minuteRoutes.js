const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');
const { validate, minuteSchema } = require('../middleware/validationMiddleware');
const minuteController = require('../controllers/minuteController');

const router = express.Router();

// 회의록 작성
router.post('/', authenticate, validate(minuteSchema), minuteController.createMinute);

// 회의록 수정
router.patch('/:minute_id', authenticate, validate(minuteSchema), minuteController.updateMinute);

// 회의록 삭제
router.delete('/:minute_id', authenticate, minuteController.deleteMinute);

module.exports = router;
