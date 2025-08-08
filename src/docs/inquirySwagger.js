/**
 * @swagger
 * tags:
 *   - name: 1:1 문의
 *     description: 사용자 1:1 문의 관련 API
 */

/**
 * @swagger
 * /api/inquiries:
 *   post:
 *     summary: 1:1 문의 작성
 *     tags: [1:1 문의]
 *     description: 사용자로부터 1:1 문의를 작성받아 관리자에게 전송합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, content]
 *             properties:
 *               title:
 *                 type: string
 *                 example: "계정 문제 문의"
 *               content:
 *                 type: string
 *                 example: "계정에 로그인할 수 없습니다. 확인 부탁드립니다."
 *     responses:
 *       201:
 *         description: 문의 등록 성공
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/inquiries/{inquiry_id}:
 *   get:
 *     summary: 1:1 문의 상세 조회
 *     tags: [1:1 문의]
 *     description: 사용자가 본인의 문의 및 관리자 답변을 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: inquiry_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 문의 조회 성공
 *       404:
 *         description: 문의를 찾을 수 없음
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/inquiries:
 *   get:
 *     summary: 1:1 문의 전체 조회
 *     tags: [1:1 문의]
 *     description: 로그인한 사용자가 작성한 모든 1:1 문의 목록을 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 문의 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inquiries:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Inquiry'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
