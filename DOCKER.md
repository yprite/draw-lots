# Docker 사용 가이드

이 프로젝트는 Docker를 사용하여 개발 및 배포 환경을 구성할 수 있습니다.

## 개발 환경 실행

개발 환경에서는 코드 변경 시 자동으로 반영되는 핫 리로딩 기능을 사용할 수 있습니다.

```bash
# 개발 환경 컨테이너 빌드 및 실행
docker-compose up react-dev
```

개발 서버는 http://localhost:3000 에서 접근할 수 있습니다.

## 프로덕션 환경 실행

프로덕션 환경에서는 최적화된 빌드를 Nginx 서버를 통해 제공합니다.

```bash
# 프로덕션 환경 컨테이너 빌드 및 실행
docker-compose up react-prod
```

프로덕션 서버는 http://localhost:10050 에서 접근할 수 있습니다.

## 개별 Docker 명령어

docker-compose 없이 직접 Docker 명령어를 사용할 수도 있습니다.

### 개발 환경

```bash
# 개발 환경 이미지 빌드
docker build -t react-racing-dev -f Dockerfile.dev .

# 개발 환경 컨테이너 실행
docker run -it -p 3000:3000 -v ${PWD}:/app -v /app/node_modules react-racing-dev
```

### 프로덕션 환경

```bash
# 프로덕션 환경 이미지 빌드
docker build -t react-racing-prod .

# 프로덕션 환경 컨테이너 실행
docker run -d -p 10050:80 react-racing-prod
```

## 주의사항

- 개발 환경에서는 호스트 머신의 소스 코드가 컨테이너에 마운트되므로 코드 변경 시 자동으로 반영됩니다.
- 프로덕션 환경에서는 빌드 시점의 코드가 이미지에 포함되므로, 코드 변경 시 이미지를 다시 빌드해야 합니다.
- Windows 환경에서 볼륨 마운트 시 경로 설정에 주의해야 합니다. 