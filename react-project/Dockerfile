# 1단계: React 빌드
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# 2단계: Nginx로 React 실행
FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

# 직접 작성한 Nginx 설정을 기본 설정 위치에 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]