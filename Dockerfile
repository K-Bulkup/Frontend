FROM node:20-alpine

WORKDIR /app

# 의존성 설치
COPY package*.json ./
RUN npm ci

# 소스 코드 복사 및 빌드
COPY . .
ENV NODE_ENV=production
RUN npm run build

# http-server 글로벌 설치
RUN npm install -g http-server

# 올바른 포트 노출
EXPOSE 80

# SPA 지원으로 실행
CMD ["npx", "http-server", "dist", "-p", "80", "-a", "0.0.0.0", "--spa"]