/**
 * @swagger
 * tags:
 *   - name: 캘린더 (Calendar)
 *     description: 팀/사용자 캘린더 통합 조회
 */

/**
 * @swagger
 * /api/calendar:
 *   get:
 *     summary: 캘린더 통합 조회 (월간)
 *     description: 로그인 사용자가 속한 모든 팀의 회의 일정을 월간 뷰로 통합 조회합니다.
 *     tags: [캘린더 (Calendar)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2025
 *         description: 조회 연도 (YYYY)
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           example: 8
 *         description: 조회 월 (1~12)
 *       - in: query
 *         name: teamId
 *         schema:
 *           type: string
 *         description: 특정 팀만 필터링(선택)
 *     responses:
 *       200:
 *         description: 월간 일정 목록
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CalendarMonthlyResponse'
 *             example:
 *               range:
 *                 start: "2025-08-01"
 *                 end: "2025-08-31"
 *               events:
 *                 - id: "evt_1001"
 *                   title: "백엔드 스프린트 킥오프"
 *                   team:
 *                     name: "개발팀"
 *                   startAt: "2025-08-05T10:00:00+09:00"
 *                   hasMinutes: true
 *                 - id: "evt_1002"
 *                   title: "API 스키마 검토"
 *                   team:
 *                     name: "개발팀"
 *                   startAt: "2025-08-12T07:00:00+09:00"
 *                   hasMinutes: false
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CalendarEvent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: "evt_1001"
 *         title:
 *           type: string
 *           example: "백엔드 스프린트 킥오프"
 *         team:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               example: "개발팀"
 *         startAt:
 *           type: string
 *           example: "2025-08-05T10:00:00+09:00"
 *         hasMinutes:
 *           type: boolean
 *           example: true
 *
 *     CalendarMonthlyResponse:
 *       type: object
 *       properties:
 *         range:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *               example: "2025-08-01"
 *             end:
 *               type: string
 *               example: "2025-08-31"
 *         events:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CalendarEvent'
 */
