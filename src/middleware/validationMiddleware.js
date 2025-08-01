const Joi = require('joi');

/**
 * 요청 데이터 검증 미들웨어
 * @param {Object} schema - Joi 검증 스키마
 * @param {string} property - 검증할 속성 ('body', 'params', 'query')
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false, // 모든 에러를 수집
      stripUnknown: true, // 정의되지 않은 필드 제거
    });

    if (error) {
      const errorMessages = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        error: 'Validation failed',
        message: '입력 데이터가 올바르지 않습니다.',
        details: errorMessages,
      });
    }

    // 검증된 데이터로 교체
    req[property] = value;
    next();
  };
};

// 공통 검증 스키마
const commonSchemas = {
  // 이메일 검증
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': '올바른 이메일 형식이 아닙니다.',
      'any.required': '이메일은 필수 항목입니다.',
    }),

  // 비밀번호 검증 (최소 8자, 영문+숫자+특수문자)
  password: Joi.string()
    .min(8)
    .pattern(new RegExp('^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])'))
    .required()
    .messages({
      'string.min': '비밀번호는 최소 8자 이상이어야 합니다.',
      'string.pattern.base': '비밀번호는 영문, 숫자, 특수문자를 포함해야 합니다.',
      'any.required': '비밀번호는 필수 항목입니다.',
    }),

  // 전화번호 검증
  phone: Joi.string()
    .pattern(new RegExp('^010-?\\d{4}-?\\d{4}$'))
    .messages({
      'string.pattern.base': '올바른 전화번호 형식이 아닙니다. (010-0000-0000)',
    }),

  // MongoDB ObjectId 검증
  objectId: Joi.string()
    .pattern(new RegExp('^[0-9a-fA-F]{24}$'))
    .messages({
      'string.pattern.base': '올바른 ID 형식이 아닙니다.',
    }),

  // 이름 검증
  name: Joi.string()
    .min(2)
    .max(20)
    .required()
    .messages({
      'string.min': '이름은 최소 2자 이상이어야 합니다.',
      'string.max': '이름은 최대 20자까지 입력 가능합니다.',
      'any.required': '이름은 필수 항목입니다.',
    }),
};

// 회원가입 검증 스키마
const signupSchema = Joi.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({
      'any.only': '비밀번호가 일치하지 않습니다.',
      'any.required': '비밀번호 확인은 필수 항목입니다.',
    }),
  name: commonSchemas.name,
  phone: commonSchemas.phone.optional(),
});

// 로그인 검증 스키마
const loginSchema = Joi.object({
  email: commonSchemas.email,
  password: Joi.string().required().messages({
    'any.required': '비밀번호는 필수 항목입니다.',
  }),
});

// 팀 생성 검증 스키마
const createTeamSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': '팀 이름은 최소 2자 이상이어야 합니다.',
      'string.max': '팀 이름은 최대 50자까지 입력 가능합니다.',
      'any.required': '팀 이름은 필수 항목입니다.',
    }),
  description: Joi.string().max(200).optional().messages({
    'string.max': '팀 설명은 최대 200자까지 입력 가능합니다.',
  }),
});

// 회의록 작성 검증 스키마
const minuteSchema = Joi.object({
  title: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': '회의록 제목은 필수 항목입니다.',
      'string.max': '회의록 제목은 최대 100자까지 입력 가능합니다.',
      'any.required': '회의록 제목은 필수 항목입니다.',
    }),
  content: Joi.string().optional(),
  todos: Joi.array().items(
    Joi.object({
      task: Joi.string().required(),
      assignee: Joi.string().optional(),
      dueDate: Joi.date().optional(),
    })
  ).optional(),
  links: Joi.array().items(
    Joi.string().uri().messages({
      'string.uri': '올바른 URL 형식이 아닙니다.',
    })
  ).optional(),
});

module.exports = {
  validate,
  commonSchemas,
  signupSchema,
  loginSchema,
  createTeamSchema,
  minuteSchema,
};
