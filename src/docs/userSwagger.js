/**
 * @swagger
 * tags:
 *   - name: 인증 (Authentication)
 *     description: 사용자 인증 관련 API
 *   - name: 사용자 관리 (User Management)
 *     description: 사용자 정보 관리 API
 *   - name: 계정 찾기 (Account Recovery)
 *     description: 아이디/비밀번호 찾기 API
 */

/**
 * @swagger
 * /api/users/signup:
 *   post:
 *     summary: 회원가입
 *     description: 새로운 사용자 계정을 생성합니다.
 *     tags: [인증 (Authentication)]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *           example:
 *             email: "newuser@example.com"
 *             password: "NewUser123!@#"
 *             confirmPassword: "NewUser123!@#"
 *             name: "김철수"
 *             phone: "010-9876-5432"
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               message: "회원가입이 완료되었습니다."
 *               user:
 *                 id: "64f1b2c3d4e5f6789abcdef0"
 *                 email: "newuser@example.com"
 *                 name: "김철수"
 *                 phone: "010-9876-5432"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: 로그인
 *     description: 이메일과 비밀번호로 로그인하여 JWT 토큰을 발급받습니다.
 *     tags: [인증 (Authentication)]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "user@example.com"
 *             password: "Test123!@#"
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               message: "로그인되었습니다."
 *               user:
 *                 id: "64f1b2c3d4e5f6789abcdef0"
 *                 email: "user@example.com"
 *                 name: "홍길동"
 *                 phone: "010-1234-5678"
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: 로그인 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Invalid credentials"
 *               message: "이메일 또는 비밀번호가 올바르지 않습니다."
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */

/**
 * @swagger
 * /api/users/logout:
 *   post:
 *     summary: 로그아웃
 *     description: 현재 로그인된 사용자를 로그아웃합니다.
 *     tags: [인증 (Authentication)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "로그아웃되었습니다."
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/users/signup-sendnum:
 *   post:
 *     summary: 회원가입용 이메일 인증번호 전송
 *     description: 회원가입을 위한 이메일 인증번호를 발송합니다.
 *     tags: [인증 (Authentication)]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerificationRequest'
 *           example:
 *             email: "newuser@example.com"
 *     responses:
 *       200:
 *         description: 인증번호 발송 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "인증번호가 발송되었습니다."
 *       400:
 *         description: 이미 가입된 이메일
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Email already exists"
 *               message: "이미 가입된 이메일입니다."
 */

/**
 * @swagger
 * /api/users/verify-number:
 *   post:
 *     summary: 인증번호 검증
 *     description: 이메일로 받은 인증번호를 검증합니다.
 *     tags: [인증 (Authentication)]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerificationCheck'
 *           example:
 *             email: "user@example.com"
 *             code: "123456"
 *             type: "signup"
 *     responses:
 *       200:
 *         description: 인증 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "인증이 완료되었습니다."
 *       400:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalid_code:
 *                 summary: 잘못된 인증번호
 *                 value:
 *                   error: "Invalid verification code"
 *                   message: "인증번호가 올바르지 않습니다."
 *               expired_code:
 *                 summary: 만료된 인증번호
 *                 value:
 *                   error: "Verification code expired"
 *                   message: "인증번호가 만료되었습니다."
 */

/**
 * @swagger
 * /api/users/verify-id:
 *   post:
 *     summary: 이메일 중복 확인
 *     description: 회원가입 전 이메일 중복 여부를 확인합니다.
 *     tags: [인증 (Authentication)]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "check@example.com"
 *     responses:
 *       200:
 *         description: 중복 확인 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                   description: 사용 가능 여부
 *                 message:
 *                   type: string
 *                   description: 결과 메시지
 *             examples:
 *               available:
 *                 summary: 사용 가능한 이메일
 *                 value:
 *                   available: true
 *                   message: "사용 가능한 이메일입니다."
 *               unavailable:
 *                 summary: 이미 사용 중인 이메일
 *                 value:
 *                   available: false
 *                   message: "이미 사용 중인 이메일입니다."
 */

/**
 * @swagger
 * /api/users/verify-phone:
 *   post:
 *     summary: 전화번호 중복 확인
 *     description: 회원가입 전 전화번호 중복 여부를 확인합니다.
 *     tags: [인증 (Authentication)]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone]
 *             properties:
 *               phone:
 *                 type: string
 *                 pattern: '^010-?\d{4}-?\d{4}$'
 *                 example: "010-1234-5678"
 *     responses:
 *       200:
 *         description: 중복 확인 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 available:
 *                   type: boolean
 *                 message:
 *                   type: string
 *             examples:
 *               available:
 *                 summary: 사용 가능한 전화번호
 *                 value:
 *                   available: true
 *                   message: "사용 가능한 전화번호입니다."
 *               unavailable:
 *                 summary: 이미 사용 중인 전화번호
 *                 value:
 *                   available: false
 *                   message: "이미 사용 중인 전화번호입니다."
 */

/**
 * @swagger
 * /api/users/find/id:
 *   post:
 *     summary: 아이디 찾기
 *     description: 전화번호와 인증번호로 등록된 이메일(아이디)을 찾습니다.
 *     tags: [계정 찾기 (Account Recovery)]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, verificationCode]
 *             properties:
 *               phone:
 *                 type: string
 *                 pattern: '^010-?\d{4}-?\d{4}$'
 *                 example: "010-1234-5678"
 *               verificationCode:
 *                 type: string
 *                 minLength: 6
 *                 maxLength: 6
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: 아이디 찾기 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "아이디를 찾았습니다."
 *                 email:
 *                   type: string
 *                   description: "마스킹 처리된 이메일"
 *                   example: "use***@example.com"
 *       400:
 *         description: 인증번호 오류 또는 잘못된 요청
 *       404:
 *         description: 해당 전화번호로 가입된 계정 없음
 */

/**
 * @swagger
 * /api/users/find/pw:
 *   post:
 *     summary: 비밀번호 찾기
 *     description: 이메일로 비밀번호 재설정 링크를 발송합니다.
 *     tags: [계정 찾기 (Account Recovery)]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "user@example.com"
 *     responses:
 *       200:
 *         description: 재설정 링크 발송 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "비밀번호 재설정 링크가 이메일로 발송되었습니다."
 *       404:
 *         description: 해당 이메일로 가입된 계정 없음
 */

/**
 * @swagger
 * /api/users/me:
 *   get:
 *     summary: 내 프로필 조회
 *     description: 현재 로그인된 사용자의 프로필 정보를 조회합니다.
 *     tags: [사용자 관리 (User Management)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   allOf:
 *                     - $ref: '#/components/schemas/User'
 *                     - type: object
 *                       properties:
 *                         teams:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               description:
 *                                 type: string
 *             example:
 *               user:
 *                 id: "64f1b2c3d4e5f6789abcdef0"
 *                 email: "user@example.com"
 *                 name: "홍길동"
 *                 phone: "010-1234-5678"
 *                 teams: [
 *                   {
 *                     id: "64f1b2c3d4e5f6789abcdef1",
 *                     name: "개발팀",
 *                     description: "백엔드 개발팀"
 *                   }
 *                 ]
 *                 createdAt: "2023-09-01T10:30:00.000Z"
 *                 lastLoginAt: "2023-09-15T14:25:30.000Z"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 *   patch:
 *     summary: 내 프로필 수정
 *     description: 현재 로그인된 사용자의 프로필 정보를 수정합니다.
 *     tags: [사용자 관리 (User Management)]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 20
 *                 example: "김철수"
 *               phone:
 *                 type: string
 *                 pattern: '^010-?\d{4}-?\d{4}$'
 *                 example: "010-9876-5432"
 *               currentPassword:
 *                 type: string
 *                 description: "비밀번호 변경 시 필요"
 *                 example: "OldPass123!@#"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 pattern: '^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'
 *                 description: "새로운 비밀번호"
 *                 example: "NewPass123!@#"
 *           example:
 *             name: "김철수"
 *             phone: "010-9876-5432"
 *     responses:
 *       200:
 *         description: 프로필 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "프로필이 업데이트되었습니다."
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 유효하지 않은 입력 데이터
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *
 *   delete:
 *     summary: 회원 탈퇴
 *     description: 현재 로그인된 사용자의 계정을 탈퇴(비활성화)합니다.
 *     tags: [사용자 관리 (User Management)]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 회원 탈퇴 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "회원 탈퇴가 완료되었습니다."
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */

/**
 * @swagger
 * /api/users/idpw-sendnum:
 *   post:
 *     summary: 아이디/비밀번호 찾기용 인증번호 전송
 *     description: 아이디 또는 비밀번호 찾기를 위한 SMS 인증번호를 발송합니다.
 *     tags: [계정 찾기 (Account Recovery)]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [phone, type]
 *             properties:
 *               phone:
 *                 type: string
 *                 pattern: '^010-?\d{4}-?\d{4}$'
 *                 description: 인증번호를 받을 전화번호
 *                 example: "010-1234-5678"
 *               type:
 *                 type: string
 *                 enum: [findid, findpw]
 *                 description: 찾기 유형
 *                 example: "findid"
 *     responses:
 *       200:
 *         description: 인증번호 발송 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "인증번호가 발송되었습니다."
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

/**
 * @swagger
 * /api/users/find/id/success:
 *   get:
 *     summary: 아이디 찾기 성공 페이지
 *     description: 아이디 찾기 완료 후 표시할 안내 페이지 정보를 반환합니다.
 *     tags: [계정 찾기 (Account Recovery)]
 *     security: []
 *     responses:
 *       200:
 *         description: 성공 페이지 정보
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "아이디 찾기가 완료되었습니다."
 *                 instruction:
 *                   type: string
 *                   example: "로그인 페이지로 이동하여 로그인해주세요."
 */

/**
 * @swagger
 * /api/users/reset-pw:
 *   get:
 *     summary: 비밀번호 재설정 페이지 조회
 *     description: 비밀번호 재설정 토큰 유효성을 검증하고 재설정 페이지 정보를 반환합니다.
 *     tags: [계정 찾기 (Account Recovery)]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *         description: 비밀번호 재설정 토큰
 *         example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
 *     responses:
 *       200:
 *         description: 유효한 토큰
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "비밀번호 재설정 페이지입니다."
 *                 token:
 *                   type: string
 *                   example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
 *       400:
 *         description: 잘못된 또는 만료된 토큰
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Reset token required"
 *               message: "유효하지 않은 접근입니다."
 *
 *   post:
 *     summary: 비밀번호 재설정하기
 *     description: 재설정 토큰을 사용하여 새로운 비밀번호로 변경합니다.
 *     tags: [계정 찾기 (Account Recovery)]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [token, newPassword]
 *             properties:
 *               token:
 *                 type: string
 *                 description: 비밀번호 재설정 토큰
 *                 example: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 pattern: '^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'
 *                 description: 새로운 비밀번호 (영문, 숫자, 특수문자 포함)
 *                 example: "NewPassword123!@#"
 *     responses:
 *       200:
 *         description: 비밀번호 재설정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "비밀번호가 재설정되었습니다."
 *       400:
 *         description: 유효하지 않거나 만료된 토큰
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               error: "Invalid or expired token"
 *               message: "유효하지 않거나 만료된 토큰입니다."
 */
