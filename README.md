# 아무 말 대잔치

Spring Boot 백엔드와 React 프론트엔드를 함께 관리하는 Week11 AWS 배포 프로젝트입니다.

## 프로젝트 구조

```text
ktb-project/
├── backend/        # Spring Boot API
└── react-project/  # React + Vite
```

## Backend

- Java 21
- Spring Boot
- Gradle

```bash
cd backend
./gradlew bootRun
```

테스트:

```bash
cd backend
./gradlew test
```

`application.properties`에 필요한 데이터베이스 및 인증 설정은 배포 환경에 맞게 별도로 구성해야 합니다. 실제 비밀번호, JWT secret, AWS 키 등의 민감정보는 Git에 커밋하지 않습니다.

업로드 파일은 `backend/uploads/`에 저장되며 Git에서 제외됩니다. EC2 배포 시에는 해당 디렉터리의 생성과 영속화 정책을 별도로 설정해야 합니다.

## Frontend

```bash
cd react-project
npm ci
npm run dev
```

프로덕션 빌드:

```bash
cd react-project
npm run build
```

빌드 결과물은 `react-project/dist/`에 생성되며 Git에서 제외됩니다.

## 배포

EC2 한 대에서 Spring Boot API와 React 정적 빌드를 함께 운영하는 구성을 기준으로 합니다. 운영 환경의 API 주소, 데이터베이스 접속 정보, JWT secret 및 HTTPS 설정은 Git에 저장하지 않고 EC2 환경변수 또는 별도 보안 설정으로 관리합니다.
