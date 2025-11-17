/**
 * @swagger
 * tags:
 *   - name: 팀 (Team)
 *     description: 팀 관련 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TeamCreateRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: "생성할 팀의 이름"
 *           example: "새로운 팀"
 *         description:
 *           type: string
 *           maxLength: 200
 *           description: "팀 설명 (선택)"
 *           example: "프로젝트를 합니다."
 *         teamtag:
 *           type: string
 *           maxLength: 50
 *           description: "팀 태그 (선택)"
 *           example: "프로젝트 A"
 *     Team:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 9
 *         name:
 *           type: string
 *           example: "1분기 신규 프로젝트팀"
 *         description:
 *           type: string
 *           example: "신규 프로젝트 런칭을 위한 팀입니다."
 *         teamtag:
 *           type: string
 *           example: "프로젝트A"
 *         managerEmail:
 *           type: string
 *           example: "newuser11@example.com"
 *         creatorId:
 *           type: integer
 *           example: 15
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
 *           example:
 *             name: "1분기 신규 프로젝트팀"
 *             description: "신규 프로젝트 런칭을 위한 팀입니다."
 *             teamtag: "프로젝트A"
 *     responses:
 *       201:
 *         description: 팀 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "팀이 생성되었습니다."
 *                 team:
 *                   $ref: '#/components/schemas/Team'
 *             example:
 *               message: "팀이 생성되었습니다."
 *               team:
 *                 id: 9
 *                 name: "1분기 신규 프로젝트팀"
 *                 description: "신규 프로젝트 런칭을 위한 팀입니다."
 *                 teamtag: "프로젝트A"
 *                 managerEmail: "newuser11@example.com"
 *                 creatorId: 15
 *   get:
 *     summary: 내 팀 목록 조회
 *     description: 현재 로그인한 사용자가 가입한 모든 팀의 목록을 조회합니다.
 *     tags: [팀 (Team)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 팀 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 teams:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Team'
 *                     description: 사용자가 속한 팀
 *             example:
 *               teams:
 *                 - id: 9
 *                   name: "1분기 신규 프로젝트팀"
 *                   description: "신규 프로젝트 런칭을 위한 팀입니다."
 *                   teamtag: "프로젝트A"
 *                   managerEmail: "newuser11@example.com"
 *                   creatorId: 15
 *                 - id: 12
 *                   name: "2분기 기획팀"
 *                   description: "기획팀입니다."
 *                   teamtag: "기획"
 *                   managerEmail: "newuser11@example.com"
 *                   creatorId: 15
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
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
 *         description: 검색어
 *         example: "hong@example.com"
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
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "홍길동"
 *                       email:
 *                         type: string
 *                         example: "hong@example.com"
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
 * /api/teams/{teamId}:
 *   get:
 *     summary: 특정 팀 정보 조회
 *     tags: [팀 (Team)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *           description: 조회할 팀의 ID
 *     responses:
 *       200:
 *         description: 팀 정보 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 team:
 *                   $ref: '#/components/schemas/Team'
 *             example:
 *               team:
 *                 id: 8
 *                 name: "1분기 신규 프로젝트팀"
 *                 description: "신규 프로젝트 런칭을 위한 팀입니다."
 *                 teamtag: "프로젝트A"
 *                 managerEmail: "newuser11@example.com"
 *                 creatorId: 15
 *       404:
 *         description: 존재하지 않는 팀
 */

/**
 * @swagger
 * /api/teams/{teamId}:
 *   patch:
 *     summary: 팀 설명 수정
 *     tags: [팀 (Team)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *           description: 수정할 팀의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                   example: "우리 팀의 새로운 목표는..."
 *     responses:
 *       200:
 *         description: 팀 설명 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 team:
 *                   $ref: '#/components/schemas/Team'
 *             example:
 *               team:
 *                 id: 9
 *                 name: "팀 이름 예시"
 *                 description: "우리 팀의 새로운 목표는..."
 *                 teamtag: "프로젝트A"
 *                 managerEmail: "newuser11@example.com"
 *                 creatorId: 15
 *       404:
 *         description: 존재하지 않는 팀
 */

/**
 * @swagger
 * /api/teams/{teamId}:
 *   delete:
 *     summary: 팀 삭제 (팀장만 가능)
 *     tags: [팀 (Team)]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: 삭제 완료
 *       403:
 *         description: 권한 없음 (팀장 아님)
 *       404:
 *         description: 존재하지 않는 팀
 */

/**
 * @swagger
 * /api/teams/{teamId}/members:
 *   get:
 *     summary: 팀원 목록
 *     tags: [팀 (Team)]
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 팀원 목록 반환
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 members:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       name:
 *                         type: string
 *                       email:
 *                         type: string
 *                       role:
 *                         type: string
 *                         enum: [owner, admin, member]
 *       404:
 *         description: 존재하지 않는 팀
 *   post:
 *     summary: 팀원 추가
 *     description: 검색된 사용자를 팀에 추가 (팀장만 가능)
 *     tags: [팀 (Team)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *           description: 팀 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "hong@example.com"
 *     responses:
 *       200:
 *         description: 팀원 추가 성공
 *       400:
 *         description: 이미 존재하는 팀원
 *       403:
 *         description: 권한 없음 (팀장 아님)
 *       404:
 *         description: 존재하지 않는 팀 또는 존재하지 않는 사용자
 *   delete:
 *     summary: 팀원 강퇴 (팀장만)
 *     tags: [팀 (Team)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: "kickmember@example.com"
 *     responses:
 *       204:
 *         description: 강퇴 완료
 *       403:
 *         description: 권한 없음 (팀장 아님)
 *       404:
 *         description: 존재하지 않는 팀 또는 강퇴할 사용자를 찾을 수 없음
 */

/**
 * @swagger
 * /api/teams/{teamId}/members/me:
 *   delete:
 *     summary: 팀 탈퇴 (본인)
 *     description: 현재 로그인한 사용자를 팀에서 제거 (팀장 탈퇴 불가)
 *     tags: [팀 (Team)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: 탈퇴 완료
 *       403:
 *         description: 권한 없음 (팀장은 탈퇴할 수 없음)
 *       404:
 *         description: 존재하지 않는 팀
 */

/**
 * @swagger
 * /api/teams/{teamId}/minutes:
 *   get:
 *     summary: 팀별 회의록 조회
 *     description: 특정 팀에 속한 모든 회의록 목록을 조회합니다. 팀 멤버만 이 기능을 사용할 수 있습니다.
 *     tags: [팀 (Team)]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *           description: 회의록을 조회할 팀의 ID
 *     responses:
 *       200:
 *         description: 회의록 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 minutes:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: 회의록 ID
 *                       title:
 *                         type: string
 *                         description: 회의록 제목
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: 생성 일시
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: 수정 일시
 *                       author:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             description: 작성자 이름
 *                           email:
 *                             type: string
 *                             description: 작성자 이메일
 *             example:
 *               minutes:
 *               - id: 101
 *                 title: "1주차 주간 회의"
 *                 createdAt: "2025-09-22T10:00:00Z"
 *                 updatedAt: "2025-09-22T11:20:00Z"
 *                 author:
 *                   name: "홍길동"
 *                   email: "hong@example.com"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 권한 없음 (팀 멤버가 아님)
 *       404:
 *         description: 존재하지 않는 팀
 */
