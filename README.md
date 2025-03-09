# 경마 게임 (React Racing Game)

React로 구현한 간단한 경마 게임입니다.

## 기능

- 6마리의 말이 각각 다른 속도로 경주합니다.
- 경주 시작 버튼을 누르면 말들이 달리기 시작합니다.
- 각 말은 랜덤한 속도로 이동하여 최종 1~6등을 결정합니다.
- 말들이 달리는 모션은 Framer Motion을 사용하여 애니메이션으로 구현되었습니다.
- 경주 종료 후 1~6등을 화면에 출력합니다.
- 베팅 시스템을 통해 원하는 말에 베팅할 수 있습니다.
- 사운드 효과가 추가되어 있습니다.

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

## 사운드 파일 추가

사운드 효과를 사용하려면 다음 사운드 파일을 `public/sounds` 디렉토리에 추가해야 합니다:

- `start.mp3`: 경주 시작 사운드
- `finish.mp3`: 경주 종료 사운드
- `win.mp3`: 베팅 승리 사운드
- `lose.mp3`: 베팅 패배 사운드

사운드 파일은 다음과 같은 무료 사운드 사이트에서 다운로드할 수 있습니다:
- [Freesound](https://freesound.org/)
- [Pixabay](https://pixabay.com/sound-effects/)
- [Zapsplat](https://www.zapsplat.com/)

## 기술 스택

- React
- TypeScript
- Framer Motion (애니메이션)
- CSS-in-JS (인라인 스타일링)

## 구현 로직

1. 말 객체 생성 (ID, 속도, 위치 정보 포함)
2. 게임 시작 시 속도 랜덤 할당
3. setInterval로 주기적으로 말 이동 업데이트
4. 결승선 도착 순서대로 1~6등 기록 후 화면 출력
5. 베팅 시스템을 통한 게임 재미 요소 추가
6. 사운드 효과로 게임 몰입감 향상 