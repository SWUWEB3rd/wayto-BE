// scripts/generate-swagger.js - Swagger 문서 자동 생성 스크립트
const fs = require('fs');
const path = require('path');
const { specs } = require('../src/config/swagger');

/**
 * Swagger JSON 파일 생성
 */
const generateSwaggerJson = () => {
  const outputPath = path.join(__dirname, '../docs/swagger.json');

  // docs 디렉토리가 없으면 생성
  const docsDir = path.dirname(outputPath);
  if (!fs.existsSync(docsDir)) {
    fs.mkdirSync(docsDir, { recursive: true });
  }

  // Swagger 스펙을 JSON 파일로 저장
  fs.writeFileSync(outputPath, JSON.stringify(specs, null, 2));
  console.log(`✅ Swagger JSON generated at: ${outputPath}`);
};

/**
 * Swagger HTML 파일 생성 (정적 파일)
 */
const generateSwaggerHtml = () => {
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>회의관리플랫폼 API 문서</title>
  <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
  <style>
    html {
      box-sizing: border-box;
      overflow: -moz-scrollbars-vertical;
      overflow-y: scroll;
    }
    *, *:before, *:after {
      box-sizing: inherit;
    }
    body {
      margin:0;
      background: #fafafa;
    }
    .swagger-ui .topbar {
      display: none;
    }
    .swagger-ui .info .title {
      color: #3b4151;
    }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
  <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
  <script>
    window.onload = function() {
      const ui = SwaggerUIBundle({
        url: './swagger.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [
          SwaggerUIBundle.presets.apis,
          SwaggerUIStandalonePreset
        ],
        plugins: [
          SwaggerUIBundle.plugins.DownloadUrl
        ],
        layout: "StandaloneLayout",
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        showExtensions: true,
        showCommonExtensions: true,
        docExpansion: 'none',
        defaultModelsExpandDepth: 2,
        defaultModelExpandDepth: 2,
        tryItOutEnabled: true,
        requestInterceptor: function(request) {
          // 개발 서버 URL로 요청 변경
          if (request.url.startsWith('./')) {
            request.url = 'http://localhost:3000/api' + request.url.substring(1);
          }
          return request;
        }
      });
    };
  </script>
</body>
</html>`;

  const outputPath = path.join(__dirname, '../docs/index.html');
  fs.writeFileSync(outputPath, htmlTemplate);
  console.log(`✅ Swagger HTML generated at: ${outputPath}`);
};

/**
 * Postman Collection 생성
 */
const generatePostmanCollection = () => {
  const collection = {
    info: {
      name: "회의관리플랫폼 API",
      description: "팀 협업 및 회의 관리를 위한 REST API",
      schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    variable: [
      {
        key: "baseUrl",
        value: "http://localhost:3000/api",
        type: "string"
      },
      {
        key: "token",
        value: "",
        type: "string"
      }
    ],
    auth: {
      type: "bearer",
      bearer: [
        {
          key: "token",
          value: "{{token}}",
          type: "string"
        }
      ]
    },
    item: []
  };

  // Swagger 스펙에서 Postman 컬렉션 아이템 생성
  Object.entries(specs.paths || {}).forEach(([path, methods]) => {
    Object.entries(methods).forEach(([method, details]) => {
      if (details.operationId || details.summary) {
        const item = {
          name: details.summary || details.operationId,
          request: {
            method: method.toUpperCase(),
            header: [
              {
                key: "Content-Type",
                value: "application/json",
                type: "text"
              }
            ],
            url: {
              raw: `{{baseUrl}}${path}`,
              host: ["{{baseUrl}}"],
              path: path.split('/').filter(p => p)
            }
          }
        };

        // 요청 body 추가
        if (details.requestBody && details.requestBody.content && details.requestBody.content['application/json']) {
          const schema = details.requestBody.content['application/json'].schema;
          if (schema.example) {
            item.request.body = {
              mode: "raw",
              raw: JSON.stringify(schema.example, null, 2)
            };
          }
        }

        // 인증이 필요한 경우
        if (details.security && details.security.length > 0) {
          item.request.auth = {
            type: "bearer",
            bearer: [
              {
                key: "token",
                value: "{{token}}",
                type: "string"
              }
            ]
          };
        }

        collection.item.push(item);
      }
    });
  });

  const outputPath = path.join(__dirname, '../docs/postman-collection.json');
  fs.writeFileSync(outputPath, JSON.stringify(collection, null, 2));
  console.log(`✅ Postman Collection generated at: ${outputPath}`);
};

/**
 * README 업데이트
 */
const updateReadme = () => {
  const readmePath = path.join(__dirname, '../README.md');
  const apiDocsSection = `
## 📚 API 문서

### Swagger UI (개발 서버)
개발 서버 실행 후 브라우저에서 접속:
- **URL**: http://localhost:3000/api-docs
- **JSON**: http://localhost:3000/api-docs.json

### 정적 문서 (배포용)
- **HTML**: [docs/index.html](./docs/index.html)
- **JSON**: [docs/swagger.json](./docs/swagger.json)
- **Postman**: [docs/postman-collection.json](./docs/postman-collection.json)

### API 테스트 방법

1. **Swagger UI 사용**:
   \`\`\`bash
   npm run dev
   # 브라우저에서 http://localhost:3000/api-docs 접속
   \`\`\`

2. **Postman 사용**:
   - \`docs/postman-collection.json\` 파일을 Postman에 import
   - 환경변수 \`baseUrl\`을 \`http://localhost:3000/api\`로 설정
   - 로그인 후 받은 JWT 토큰을 \`token\` 변수에 설정

3. **cURL 사용**:
   \`\`\`bash
   # 회원가입
   curl -X POST http://localhost:3000/api/users/signup \\
     -H "Content-Type: application/json" \\
     -d '{"email":"test@example.com","password":"Test123!@#","confirmPassword":"Test123!@#","name":"테스트"}'
   
   # 로그인
   curl -X POST http://localhost:3000/api/users/login \\
     -H "Content-Type: application/json" \\
     -d '{"email":"test@example.com","password":"Test123!@#"}'
   \`\`\`

### 문서 자동 생성
\`\`\`bash
# Swagger 문서 자동 생성
npm run generate-docs

# 개별 생성
npm run generate-swagger
npm run generate-postman
\`\`\`
`;

  let readmeContent = '';
  if (fs.existsSync(readmePath)) {
    readmeContent = fs.readFileSync(readmePath, 'utf8');
    // 기존 API 문서 섹션 제거
    readmeContent = readmeContent.replace(/## 📚 API 문서[\s\S]*?(?=##|$)/g, '');
  } else {
    readmeContent = `# 회의관리플랫폼 API

팀 협업 및 회의 관리를 위한 REST API 서버입니다.
`;
  }

  // API 문서 섹션 추가
  readmeContent = readmeContent.trim() + '\n\n' + apiDocsSection.trim() + '\n';

  fs.writeFileSync(readmePath, readmeContent);
  console.log(`✅ README.md updated with API documentation section`);
};

// 메인 실행 함수
const main = () => {
  console.log('🚀 Generating API documentation...\n');

  try {
    generateSwaggerJson();
    generateSwaggerHtml();
    generatePostmanCollection();
    updateReadme();

    console.log('\n✅ All documentation generated successfully!');
    console.log('\n📁 Generated files:');
    console.log('  - docs/swagger.json (Swagger 스펙)');
    console.log('  - docs/index.html (정적 Swagger UI)');
    console.log('  - docs/postman-collection.json (Postman 컬렉션)');
    console.log('  - README.md (업데이트됨)');
    console.log('\n🌐 개발 서버에서 확인: http://localhost:3000/api-docs');

  } catch (error) {
    console.error('❌ Documentation generation failed:', error.message);
    process.exit(1);
  }
};

// 스크립트가 직접 실행된 경우에만 실행
if (require.main === module) {
  main();
}

module.exports = {
  generateSwaggerJson,
  generateSwaggerHtml,
  generatePostmanCollection,
  updateReadme
};