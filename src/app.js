// src/app.js - Swagger 통합된 버전 (수정)
require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const { connectDB } = require('./config/database');
const { specs, swaggerUi } = require('./config/swagger');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// 데이터베이스 연결
connectDB();

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15분
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: {
    error: 'Too many requests from this IP, please try again later.',
    message: '너무 많은 요청입니다. 잠시 후 다시 시도해주세요.',
  },
  standardHeaders: true, // rate limit 정보를 헤더에 포함
  legacyHeaders: false,  // X-RateLimit-* 헤더 비활성화
});

// 미들웨어 설정
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      "style-src": ["'self'", "'unsafe-inline'", "https://unpkg.com"],
      "img-src": ["'self'", "data:", "https:"], // Swagger 이미지 허용
    },
  },
}));

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting을 API 라우트에만 적용
app.use('/api', limiter);

// 로깅 설정 (환경별 차별화)
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  explorer: true,
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info .title { color: #3b4151; font-size: 2em; }
    .swagger-ui .scheme-container { background: #fafafa; padding: 15px; }
  `,
  customSiteTitle: "회의관리플랫폼 API 문서",
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    docExpansion: 'none',
    defaultModelsExpandDepth: 2,
    defaultModelExpandDepth: 2,
    tryItOutEnabled: true,
    requestInterceptor: (request) => {
      // 개발 환경에서 CORS 이슈 방지
      console.log('API Request:', request.method, request.url);
      return request;
    }
  }
}));

// Swagger JSON 엔드포인트
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

console.log(`📚 API Documentation available at http://localhost:${process.env.PORT || 3000}/api-docs`);

// 👇 추가: 대시 버전도 열어줌 (호환용)
app.get('/api-docs-json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});


// 헬스 체크 (루트 경로도 추가)
app.get('/', (req, res) => {
  res.json({
    name: '회의관리플랫폼 API',
    version: '1.0.0',
    status: 'running',
    docs: '/api-docs',
  });
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB',
    }
  });
});

// API 라우트
app.use('/api', routes);

// 404 핸들러 (API 문서 링크 포함)
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404).json({
    error: 'Not Found',
    message: `경로 '${req.originalUrl}'를 찾을 수 없습니다.`,
    suggestion: process.env.NODE_ENV !== 'production' 
      ? 'API 문서를 확인하세요: /api-docs' 
      : '올바른 API 경로를 확인해주세요.',
  });
});

// 에러 핸들링 미들웨어
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  
  if (process.env.NODE_ENV !== 'production') {
    console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
    console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
    console.log(`🏠 Home: http://localhost:${PORT}/`);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

// 예상치 못한 에러 처리
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

module.exports = app;
