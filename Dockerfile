# 빌드 스테이지
FROM node:20-alpine as build

WORKDIR /app

# 의존성 설치를 위한 파일 복사
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm ci

# 소스 코드 복사
COPY . .

# 애플리케이션 빌드
RUN npm run build

# 프로덕션 스테이지
FROM nginx:alpine

# Nginx 설정 복사
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 80 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"] 