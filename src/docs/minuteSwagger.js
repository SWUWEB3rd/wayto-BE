/**
 * @swagger
 * tags:
 *   - name: 회의록 (Minute)
 *     description: 회의록 관련 API
 */

/** 
 * @swagger
 * components:
 *   schemas:
 *     MinuteCreateRequest:
 *       type: object
 *       required:
 *         - teamId
 *         - title
 *         - content
 *         - startTime
 *         - endTime
 *       properties:
 *         teamId:
 *           type: integer
 *           description: "회의록이 속한 팀 ID"
 *           example: 1
 *         title:
 *           type: string
 *           description: "회의록 제목"
 *           minLength: 1
 *           maxLength: 100
 *           example: "주간 스프린트 회의"
 *         attendees:
 *           type: string
 *           description: "참석자 목록"
 *           example: "홍길동, 김철수"
 *         meetingDate:
 *           type: string
 *           format: date
 *           description: "회의 날짜 (YYYY-MM-DD)"
 *           example: "2025-11-20"
 *         startTime:
 *           type: string
 *           format: time
 *           description: "회의 시작 시간 (HH:MM)"
 *           example: "14:00"
 *         endTime:
 *           type: string
 *           format: time
 *           description: "회의 종료 시간 (HH:MM)"
 *           example: "15:00"
 *         location:
 *           type: string
 *           description: "회의 장소"
 *           example: "온라인 (Google Meet)"
 *         meetingLink:
 *           type: string
 *           format: uri
 *           description: "회의 링크"
 *           example: "https://meet.google.com/xyz-abc"
 *         content:
 *           type: string
 *           description: "회의록 본문"
 *           minLength: 1
 *           example: "주요 안건: ..."
 *     Minute:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: "회의록 고유 ID"
 *         title:
 *           type: string
 *           description: "회의록 제목"
 *           example: "주간 스프린트 회의"
 *         attendees:
 *           type: string
 *           description: "참석자"
 *           example: "홍길동, 김철수"
 *         meetingDate:
 *           type: string
 *           format: date-time
 *           description: "회의 날짜"
 *           example: "2025-11-20"
 *         location:
 *           type: string
 *           description: "회의 장소"
 *           example: "온라인 (Google Meet)"
 *         meetingLink:
 *           type: string
 *           format: uri
 *           description: "회의 링크"
 *           example: "https://meet.google.com/xyz-abc"
 *         content:
 *           type: string
 *           description: "회의록 본문"
 *           example: "주요 안건: ..."
 *         meetingId:
 *           type: integer
 *           description: "회의 ID"
 *         authorId:
 *           type: integer
 *           description: "작성자 ID"
 *         author:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               description: "작성자 유저 ID"
 *               example: 15
 *             name:
 *               type: string
 *               description: "작성자 이름"
 *               example: "김철수"
 *         metadata:
 *           type: object
 *           description: "메타데이터"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: "생성 시각"
 *         updated_at:
 *           type: string
 *           description: "수정 시각"
 *     MinuteUpdateRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: "회의록 제목"
 *           minLength: 1
 *           maxLength: 100
 *           example: "업데이트된 회의"
 *         attendees:
 *           type: string
 *           description: "참석자 목록"
 *           example: "홍길동, 김철수"
 *         meetingDate:
 *           type: string
 *           format: date
 *           description: "회의 날짜 (YYYY-MM-DD)"
 *           example: "2025-11-20"
 *         location:
 *           type: string
 *           description: "회의 장소"
 *           example: "온라인 (Google Meet)"
 *         meetingLink:
 *           type: string
 *           format: uri
 *           description: "회의 링크"
 *           example: "https://meet.google.com/xyz-abc"
 *         content:
 *           type: string
 *           description: "회의록 본문 (수정됨)"
 *           minLength: 1
 *           example: "주요 안건: ..."
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
 *       403:
 *         description: 해당 팀 멤버만 회의록을 작성할 수 있습니다.
 */

/**
 * @swagger
 * /api/minutes/recent:
 *   get:
 *     summary: "최근 회의록 목록 3개 조회 (임박한 순)"
 *     description: "현재 사용자가 속한 모든 팀에서 작성된 회의록을 최신순으로 3개 조회합니다."
 *     tags: [회의록 (Minute)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "최근 회의록 목록 조회 성공"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Minute'
 *           example:
 *             id: 7
 *             title: "백엔드 스프린트 킥오프"
 *             attendees: "홍길동, 김철수"
 *             meetingDate: "2025-11-20T00:00:00Z"
 *             location: "온라인 (Google Meet)"
 *             meetingLink: "https://meet.google.com/xyz-abc"
 *             content: "주요 이슈 및 일정 합의"
 *             meetingId: 7
 *             authorId: 15
 *             metadata: {}
 *             created_at: "2025-11-18T03:35:40Z"
 *             updated_at: "2025-11-18T03:36:31Z"
 *             author:
 *               id: 15
 *               name: "김철수"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/minutes/{minuteId}:
 *   get:
 *     summary: 회의록 상세 조회
 *     description: 특정 회의록을 조회합니다. 회의록이 없으면 404와 함께 작성 유도 메시지를 반환합니다.
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
 *         description: 회의록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Minute'
 *             example:
 *               id: 7
 *               title: "백엔드 스프린트 킥오프"
 *               attendees: "홍길동, 김철수"
 *               meetingDate: "2025-11-20T00:00:00Z"
 *               location: "온라인 (Google Meet)"
 *               meetingLink: "https://meet.google.com/xyz-abc"
 *               content: "주요 이슈 및 일정 합의"
 *               meetingId: 7
 *               authorId: 15
 *               metadata: {}
 *               created_at: "2025-11-18T03:35:40Z"
 *               updated_at: "2025-11-18T03:36:31Z"
 *               author:
 *                 id: 15
 *                 name: "김철수"
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
 *       403:
 *         description: 해당 팀 멤버만 회의록을 조회할 수 있습니다.
 *   patch:
 *     summary: 회의록 수정
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
 *         description: 수정 성공
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 수정 권한 없음 (작성자가 아닌 경우)
 *       404:
 *         description: 존재하지 않는 회의록
 *   delete:
 *     summary: 회의록 삭제
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
 *         description: 삭제 완료
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 삭제 권한 없음 (작성자가 아닌 경우)
 *       404:
 *         description: 존재하지 않는 회의록
 */
