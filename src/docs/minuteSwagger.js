/**
 * @swagger
 * tags:
 *   - name: 회의록 (Minute)
 *     description: 회의록 관련 API
 */

/**
 * @swagger
 * /api/minutes:
 *   post:
 *     summary: 회의록 작성
 *     tags: [회의록 (Minutes)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MinuteCreateRequest'
 *     responses:
 *       201:
 *         description: 회의록 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Minute'
 */

/**
 * @swagger
 * /api/minutes/{minute_id}:
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
 * 
 *   patch:
 *     summary: 회의록 수정
 *     tags: [회의록 (Minutes)]
 *     parameters:
 *       - in: path
 *         name: minute_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MinuteCreateRequest'
 *     responses:
 *       200:
 *         description: 수정 성공
 *
 *   delete:
 *     summary: 회의록 삭제
 *     tags: [회의록 (Minutes)]
 *     parameters:
 *       - in: path
 *         name: minute_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 완료
 */
