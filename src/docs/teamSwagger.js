/**
 * @swagger
 * tags:
 *   - name: 팀 (Team)
 *     description: 팀 관련 API
 */

/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: 팀 생성
 *     tags: [팀 (Team)]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamCreateRequest'
 *     responses:
 *       201:
 *         description: 팀 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *
 *   get:
 *     summary: 내가 속한 팀 목록 조회
 *     tags: [팀 (Team)]
 *     responses:
 *       200:
 *         description: 팀 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Team'
 */

/**
 * @swagger
 * /api/teams/{team_id}:
 *   get:
 *     summary: 특정 팀 정보 조회
 *     tags: [팀 (Team)]
 *     parameters:
 *       - in: path
 *         name: team_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 팀 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *
 *   patch:
 *     summary: 팀 정보 수정
 *     tags: [팀 (Team)]
 *     parameters:
 *       - in: path
 *         name: team_id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TeamCreateRequest'
 *     responses:
 *       200:
 *         description: 수정 완료
 *
 *   delete:
 *     summary: 팀 삭제 (팀장만 가능)
 *     tags: [팀 (Team)]
 *     parameters:
 *       - in: path
 *         name: team_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 삭제 완료
 */