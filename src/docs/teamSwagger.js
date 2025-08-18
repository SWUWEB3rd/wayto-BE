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
 *     security: [ { bearerAuth: [] } ]
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
 */

/**
 * @swagger
 * /api/teams/search:
 *   get:
 *     summary: 사용자 검색
 *     description: 팀에 추가할 사용자 검색
 *     tags: [팀 (Team)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: 검색어 (이름 또는 이메일)
 *         example: "홍길동"
 *     responses:
 *       200:
 *         description: 검색 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: "64f1b2c3d4e5f6789abcdef0"
 *                       name:
 *                         type: string
 *                         example: "홍길동"
 *                       email:
 *                         type: string
 *                         example: "hong@example.com"
 *             example:
 *               users: [
 *                 {
 *                   "_id": "64f1b2c3d4e5f6789abcdef0",
 *                   "name": "홍길동",
 *                   "email": "hong@example.com"
 *                 },
 *                 {
 *                   "_id": "64f1b2c3d4e5f6789abcdef1",
 *                   "name": "홍철수",
 *                   "email": "hongcs@example.com"
 *                 }
 *               ]
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Search query required"
 *               message: "검색어를 입력해주세요."
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
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

/**
 * @swagger
 * /api/teams/{team_id}/members:
 *   get:
 *     summary: 팀원 목록
 *     tags: [팀 (Team)]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: team_id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/TeamMember' }
 *   post:
 *     summary: 팀원 추가
 *     description: 검색된 사용자를 팀에 추가 (팀장만 가능)
 *     tags: [팀 (Team)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: team_id
 *         required: true
 *         schema:
 *           type: string
 *         description: 팀 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: string
 *                 example: "64f1b2c3d4e5f6789abcdef0"
 *     responses:
 *       200:
 *         description: 팀원 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Team'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 권한 없음 (팀장 아님)
 */

/**
 * @swagger
 * /api/teams/{team_id}/members/me:
 *   delete:
 *     summary: 팀 탈퇴 (본인)
 *     description: 현재 로그인한 사용자를 팀에서 제거
 *     tags: [팀 (Team)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: team_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: 탈퇴 완료
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       404:
 *         description: 팀 또는 멤버십 없음
 */

/**
 * @swagger
 * /api/teams/{team_id}/members/{user_id}:
 *   delete:
 *     summary: 팀원 제거 (팀장만)
 *     tags: [팀 (Team)]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: team_id
 *         required: true
 *         schema: { type: string }
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       204: { description: 삭제 완료 }
 */
