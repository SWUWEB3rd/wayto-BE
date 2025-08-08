/**
 * @swagger
 * tags:
 *   - name: 캘린더 (Calendar)
 *     description: 팀/사용자 캘린더 통합 조회
 *   - name: 회의록 (Minutes)
 *     description: 회의록 상세 조회
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
 *                 - id: "evt_01"
 *                   meetingId: "m_1001"
 *                   title: "백엔드 스프린트 킥오프"
 *                   team:
 *                     id: "t_dev"
 *                     name: "개발팀"
 *                   startAt: "2025-08-05T10:00:00Z"
 *                   endAt: "2025-08-05T11:00:00Z"
 *                   location: "회의실 A"
 *                   status: "scheduled"
 *                 - id: "evt_02"
 *                   meetingId: "m_1002"
 *                   title: "API 스키마 검토"
 *                   team:
 *                     id: "t_dev"
 *                     name: "개발팀"
 *                   startAt: "2025-08-12T07:00:00Z"
 *                   endAt: "2025-08-12T08:00:00Z"
 *                   location: "온라인(Zoom)"
 *                   status: "scheduled"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/meetings/{meeting_id}/minutes:
 *   get:
 *     summary: 회의록 상세 조회
 *     description: 특정 회의(meeting_id)의 회의록을 조회합니다. 회의록이 없으면 404와 함께 작성 유도 메시지를 반환합니다.
 *     tags: [회의록 (Minutes)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: meeting_id
 *         required: true
 *         schema:
 *           type: string
 *           example: "m_1001"
 *         description: 회의 ID
 *     responses:
 *       200:
 *         description: 회의록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeetingMinutesResponse'
 *             example:
 *               meetingId: "m_1001"
 *               title: "백엔드 스프린트 킥오프"
 *               createdBy:
 *                 id: "u_01"
 *                 name: "홍길동"
 *               attendees:
 *                 - id: "u_01"
 *                   name: "홍길동"
 *                 - id: "u_02"
 *                   name: "김철수"
 *               startedAt: "2025-08-05T10:00:00Z"
 *               endedAt: "2025-08-05T11:00:00Z"
 *               decisions:
 *                 - "회원 관리 API 스펙 확정"
 *               actionItems:
 *                 - owner: "u_02"
 *                   content: "Swagger 보완 항목 정리"
 *                   due: "2025-08-07"
 *               notes: "주요 이슈 및 일정 합의"
 *       404:
 *         description: 회의록 없음 (작성 유도)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "MinutesNotFound"
 *               message: "회의록이 없습니다. 작성 페이지로 이동하세요."
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
 *         id: { type: string, example: "evt_01" }
 *         meetingId: { type: string, example: "m_1001" }
 *         title: { type: string, example: "백엔드 스프린트 킥오프" }
 *         team:
 *           type: object
 *           properties:
 *             id: { type: string, example: "t_dev" }
 *             name: { type: string, example: "개발팀" }
 *         startAt: { type: string, format: date-time, example: "2025-08-05T10:00:00Z" }
 *         endAt: { type: string, format: date-time, example: "2025-08-05T11:00:00Z" }
 *         location: { type: string, example: "회의실 A" }
 *         status:
 *           type: string
 *           enum: [scheduled, canceled, finished]
 *           example: "scheduled"
 *
 *     CalendarMonthlyResponse:
 *       type: object
 *       properties:
 *         range:
 *           type: object
 *           properties:
 *             start: { type: string, example: "2025-08-01" }
 *             end: { type: string, example: "2025-08-31" }
 *         events:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CalendarEvent'
 *
 *     MeetingMinutesResponse:
 *       type: object
 *       properties:
 *         meetingId: { type: string, example: "m_1001" }
 *         title: { type: string, example: "백엔드 스프린트 킥오프" }
 *         createdBy:
 *           type: object
 *           properties:
 *             id: { type: string, example: "u_01" }
 *             name: { type: string, example: "홍길동" }
 *         attendees:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id: { type: string, example: "u_02" }
 *               name: { type: string, example: "김철수" }
 *         startedAt: { type: string, format: date-time, example: "2025-08-05T10:00:00Z" }
 *         endedAt: { type: string, format: date-time, example: "2025-08-05T11:00:00Z" }
 *         decisions:
 *           type: array
 *           items: { type: string }
 *         actionItems:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               owner: { type: string, example: "u_02" }
 *               content: { type: string, example: "Swagger 보완 항목 정리" }
 *               due: { type: string, example: "2025-08-07" }
 *         notes: { type: string, example: "주요 이슈 및 일정 합의" }
 */