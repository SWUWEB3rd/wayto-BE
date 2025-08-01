const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '회의관리플랫폼 API',
      version: '1.0.0',
      description: '팀 협업 및 회의 관리를 위한 REST API',
      contact: {
        name: 'API Support',
        email: 'support@meetingplatform.com',
      },
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production'
          ? 'https://api.meetingplatform.com'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT 토큰을 Authorization 헤더에 Bearer 형태로 전송',
        },
      },
      schemas: {
        User: {
          type: 'object',
          required: ['email', 'password', 'name'],
          properties: {
            id: {
              type: 'string',
              description: '사용자 고유 ID',
              example: '64f1b2c3d4e5f6789abcdef0',
            },
            email: {
              type: 'string',
              format: 'email',
              description: '사용자 이메일',
              example: 'user@example.com',
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 20,
              description: '사용자 이름',
              example: '홍길동',
            },
            phone: {
              type: 'string',
              pattern: '^010-?\\d{4}-?\\d{4}$',
              description: '전화번호',
              example: '010-1234-5678',
            },
            isEmailVerified: {
              type: 'boolean',
              description: '이메일 인증 여부',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '계정 생성일',
            },
            lastLoginAt: {
              type: 'string',
              format: 'date-time',
              description: '마지막 로그인 시간',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: '로그인 이메일',
              example: 'user@example.com',
            },
            password: {
              type: 'string',
              minLength: 8,
              description: '비밀번호',
              example: 'Test123!@#',
            },
          },
        },
        SignupRequest: {
          type: 'object',
          required: ['email', 'password', 'confirmPassword', 'name'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: '회원가입 이메일',
              example: 'newuser@example.com',
            },
            password: {
              type: 'string',
              minLength: 8,
              pattern: '^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])',
              description: '비밀번호 (영문, 숫자, 특수문자 포함)',
              example: 'NewUser123!@#',
            },
            confirmPassword: {
              type: 'string',
              description: '비밀번호 확인',
              example: 'NewUser123!@#',
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 20,
              description: '사용자 이름',
              example: '김철수',
            },
            phone: {
              type: 'string',
              pattern: '^010-?\\d{4}-?\\d{4}$',
              description: '전화번호 (선택사항)',
              example: '010-9876-5432',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: '응답 메시지',
              example: '로그인되었습니다.',
            },
            user: {
              $ref: '#/components/schemas/User',
            },
            token: {
              type: 'string',
              description: 'JWT 인증 토큰',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: '에러 코드',
              example: 'Invalid credentials',
            },
            message: {
              type: 'string',
              description: '에러 메시지',
              example: '이메일 또는 비밀번호가 올바르지 않습니다.',
            },
            details: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: {
                    type: 'string',
                    example: 'email',
                  },
                  message: {
                    type: 'string',
                    example: '올바른 이메일 형식이 아닙니다.',
                  },
                },
              },
            },
          },
        },
        VerificationRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: '인증번호를 받을 이메일',
              example: 'user@example.com',
            },
          },
        },
        VerificationCheck: {
          type: 'object',
          required: ['email', 'code'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: '인증 이메일',
              example: 'user@example.com',
            },
            code: {
              type: 'string',
              minLength: 6,
              maxLength: 6,
              description: '6자리 인증번호',
              example: '123456',
            },
            type: {
              type: 'string',
              enum: ['signup', 'findid', 'findpw'],
              description: '인증 타입',
              example: 'signup',
            },
          },
        },
        Team: {
          type: 'object',
          required: ['name', 'owner'],
          properties: {
            id: {
              type: 'string',
              description: '팀 고유 ID',
              example: '64f1b2c3d4e5f6789abcdef1',
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: '팀 이름',
              example: '개발팀',
            },
            description: {
              type: 'string',
              maxLength: 200,
              description: '팀 설명',
              example: '백엔드 개발을 담당하는 팀입니다.',
            },
            owner: {
              type: 'string',
              description: '팀 소유자 ID',
              example: '64f1b2c3d4e5f6789abcdef0',
            },
            members: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  user: {
                    type: 'string',
                    description: '사용자 ID',
                  },
                  role: {
                    type: 'string',
                    enum: ['owner', 'admin', 'member'],
                    description: '역할',
                  },
                  joinedAt: {
                    type: 'string',
                    format: 'date-time',
                    description: '참여일',
                  },
                },
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: '팀 생성일',
            },
          },
        },
      },
      responses: {
        UnauthorizedError: {
          description: '인증 실패',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: 'Authentication required',
                message: '인증 토큰이 필요합니다.',
              },
            },
          },
        },
        ValidationError: {
          description: '입력 데이터 검증 실패',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: 'Validation failed',
                message: '입력 데이터가 올바르지 않습니다.',
                details: [
                  {
                    field: 'email',
                    message: '올바른 이메일 형식이 아닙니다.',
                  },
                ],
              },
            },
          },
        },
        ServerError: {
          description: '서버 내부 오류',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ErrorResponse',
              },
              example: {
                error: 'Internal server error',
                message: '서버에서 오류가 발생했습니다.',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './src/routes/*.js',        // 라우트 파일들 (기능만)
    './src/docs/*.js',          // Swagger 문서 파일들 (문서만)
    './src/controllers/*.js',   // 컨트롤러 파일들 (필요한 경우)
    './src/models/*.js',        // 모델 파일들 (필요한 경우)
  ],
};

const specs = swaggerJsdoc(options);

module.exports = {
  specs,
  swaggerUi,
};
