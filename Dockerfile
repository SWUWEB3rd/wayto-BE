FROM node:18-alpine

WORKDIR /app

# 테스트용 인증코드 노출 여부 (필요 시 빌드 ARG로 덮어쓰기)
ARG EXPOSE_CODES_FOR_TEST=false
ENV EXPOSE_CODES_FOR_TEST=${EXPOSE_CODES_FOR_TEST}

# 패키지 파일 복사
COPY package*.json ./

# 의존성 설치
RUN npm ci --only=production

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 3000

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 실행
CMD ["node", "src/app.js"]
