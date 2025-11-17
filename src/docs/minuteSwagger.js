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
 *     summary: "회의록 작성"
 *     tags: [회의록 (Minute)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MinuteCreateRequest'
 *     responses:
 *       201:
 *         description: "회의록 생성 성공"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Minute'
 */

/**
 * @swagger
 * /api/minutes/upcoming:
 *   get:
 *     summary: "예정된 회의 목록 3개 조회 (임박한 순)"
 *     description: "현재 사용자가 참석자로 등록된 회의 중, 'scheduled' 상태이고 오늘 날짜 이후인 회의를 임박한 순서대로 3개 조회합니다."
 *     tags: [회의록 (Minute)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "예정된 회의 목록 조회 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   meetingId:
 *                     type: integer
 *                     description: "회의 ID (회의록 작성 페이지 연결용)"
 *                     example: 123
 *                   title:
 *                     type: string
 *                     description: "회의 제목"
 *                     example: "주간 스프린트 회의"
 *                   meetingDateTime:
 *                     type: string
 *                     format: date-time
 *                     description: "회의 날짜 및 시간 (YYYY-MM-DDTHH:MM:SS)"
 *                     example: '2025-11-20T14:00:00'
 *                   meetingLink:
 *                     type: string
 *                     description: "회의 링크 (예: Google Meet, Zoom)"
 *                     example: "https://meet.google.com/xyz-abc"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/minutes/{minuteId}:
 *   get:
 *     summary: "회의록 상세 조회"
 *     description: "특정 회의록을 조회합니다. 회의록이 없으면 404와 함께 작성 유도 메시지를 반환합니다."
 *     tags: [회의록 (Minute)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: minuteId
 *         required: true
 *         schema:
 *           type: string
 *         description: "회의록 ID"
 *     responses:
 *       200:
 *         description: "회의록 조회 성공"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MeetingMinutesResponse'
 *             example:
 *               title: "백엔드 스프린트 킥오프"
 *               attendees:
 *                 - id: "u_01"
 *                   name: "홍길동"
 *                 - id: "u_02"
 *                   name: "김철수"
 *               meetingDate: "2025-08-05T10:00:00Z"
 *               location: "온라인 (Google Meet)"
 *               meetingLink: "https://meet.google.com/xyz-abc"
 *               content: "주요 이슈 및 일정 합의"
 *       404:
 *         description: "회의록 없음 (작성 유도)"
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
 *     summary: "회의록 수정"
 *     tags: [회의록 (Minute)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: minuteId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MinuteUpdateRequest'
 *     responses:
 *       200:
 *         description: "수정 성공"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: "수정 권한 없음 (작성자가 아닌 경우)"
 *       404:
 *         description: "존재하지 않는 회의록"
 *         description: "수정 성공"
 *
 *   delete:
 *     summary: "회의록 삭제"
 *     tags: [회의록 (Minute)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: minuteId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: "삭제 완료"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: "삭제 권한 없음 (작성자가 아닌 경우)"
 *       404:
 *         description: "존재하지 않는 회의록"
 *         description: "삭제 완료"
 */
