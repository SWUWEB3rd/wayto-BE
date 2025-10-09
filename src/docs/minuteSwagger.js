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
 *     tags: [회의록 (Minute)]
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
 *     summary: 회의록 단건 조회
 *     tags: [회의록 (Minute)]
 *     parameters:
 *       - in: path
 *         name: minute_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 회의록 반환
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Minute'
 *
 *   patch:
 *     summary: 회의록 수정
 *     tags: [회의록 (Minute)]
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
 *     tags: [회의록 (Minute)]
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
