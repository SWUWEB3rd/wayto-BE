const express = require('express');
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

// Swagger 기본 틀
const swaggerDoc = {
  openapi: '3.0.0',
  info: {
    title: 'WhenToMeet API',
    version: '1.0.0',
    description: '회의 일정 조율 서비스 API 명세서'
  },
  paths: {}
};

// swagger 폴더 안 JSON 파일 모두 읽어서 paths 합치기
const swaggerFiles = fs.readdirSync(path.join(__dirname, 'swagger'));
swaggerFiles.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger', file), 'utf8'));
  swaggerDoc.paths = { ...swaggerDoc.paths, ...data.paths };
});

// Swagger UI 연결
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

app.listen(3000, () => {
  console.log('Swagger UI: http://localhost:3000/api-docs');
});
