/**
 * @swagger
 * tags:
 *   - name: 1:1 문의
 *     description: 사용자 1:1 문의 작성
 */

/**
 * @swagger
 * /api/inquiries:
 *   post:
 *     summary: 1:1 문의 작성
 *     tags: [1:1 문의]
 *     description: 로그인 사용자가 1:1 문의를 등록합니다. 답변은 이메일로 발송됩니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/InquiryCreateRequest'
 *           example:
 *             title: "계정 문제 문의"
 *             content: "로그인이 되지 않습니다. 확인 부탁드립니다."
 *     responses:
 *       201:
 *         description: 문의 등록 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/InquiryCreatedResponse'
 *             example:
 *               id: 123
 *               status: "open"
 *               createdAt: "2025-09-14T11:22:33.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InquiryCreateRequest:
 *       type: object
 *       required: [title, content]
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 200
 *           example: "계정 문제 문의"
 *         content:
 *           type: string
 *           maxLength: 5000
 *           example: "계정에 로그인할 수 없습니다. 확인 부탁드립니다."
 *     InquiryCreatedResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 123
 *         status:
 *           type: string
 *           enum: [open, closed]
 *           example: "open"
 *         createdAt:
 *           type: string
 *           format: date-time
 */
