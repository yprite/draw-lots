import React, { useState, useEffect, useRef } from 'react';
import Horse from './Horse';

interface HorseData {
  id: number;
  name: string;
  speed: number;
  position: number;
  isFinished: boolean;
  rank: number | null;
  finishTime: number | null;
  isTeleporting: boolean; // 순간이동 중인지
  isFallen: boolean; // 넘어졌는지
  flashColor: string | null; // 플래시 효과 색상
}

// 8비트 색상 팔레트
const PALETTE = {
  BLACK: '#000000',
  WHITE: '#FFFFFF',
  RED: '#FF0000',
  GREEN: '#00FF00',
  BLUE: '#0000FF',
  YELLOW: '#FFFF00',
  CYAN: '#00FFFF',
  MAGENTA: '#FF00FF',
  ORANGE: '#FF7F00',
  PURPLE: '#7F00FF',
  LIME: '#7FFF00',
  PINK: '#FF007F',
  DARK_GRAY: '#333333',
  LIGHT_GRAY: '#AAAAAA',
};

// 네온 색상 팔레트
const NEON = {
  RED: '#FF0055',
  GREEN: '#00FF66',
  BLUE: '#0066FF',
  YELLOW: '#FFFF00',
  PINK: '#FF00FF',
  CYAN: '#00FFFF',
  ORANGE: '#FF7F00',
  PURPLE: '#7F00FF',
  WHITE: '#FFFFFF',
};

// 말 색상 배열
const HORSE_COLORS = [
  NEON.RED,
  NEON.GREEN,
  NEON.BLUE,
  NEON.YELLOW,
  NEON.CYAN,
  NEON.PINK,
  NEON.ORANGE,
  NEON.PURPLE,
];

const RaceTrack: React.FC = () => {
  const [horses, setHorses] = useState<HorseData[]>([]);
  const [isRacing, setIsRacing] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState<boolean>(true);
  const [raceStartTime, setRaceStartTime] = useState<number>(0);
  const [horseCount, setHorseCount] = useState<number>(6);
  const [backgroundPosition, setBackgroundPosition] = useState<number>(0);
  const [shakeIntensity, setShakeIntensity] = useState<number>(0); // 화면 떨림 강도
  const [animationFrame, setAnimationFrame] = useState<number>(0); // 애니메이션 프레임
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const backgroundIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const shakeIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const animationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // 트랙 설정
  const START_LINE_POSITION = 5; // 출발선 위치 (%)
  const FINISH_LINE_POSITION = 90; // 결승선 위치 (%)
  
  // 말 수 제한
  const MIN_HORSE_COUNT = 2;
  const MAX_HORSE_COUNT = 10;
  
  // 병맛 요소 확률
  const TELEPORT_CHANCE = 0.005; // 순간이동 확률 (0.5%)
  const FALL_CHANCE = 0.003; // 넘어질 확률 (0.3%)
  const TELEPORT_DISTANCE = 15; // 순간이동 거리 (%)
  
  // 화면 떨림 설정
  const MAX_SHAKE_INTENSITY = 5; // 최대 떨림 강도 (px)
  
  // 사운드 효과 참조
  const startSoundRef = useRef<HTMLAudioElement | null>(null);
  const finishSoundRef = useRef<HTMLAudioElement | null>(null);

  // 말 이름 입력을 위한 상태 추가
  const [customHorseNames, setCustomHorseNames] = useState<{[key: number]: string}>({});
  const [isEditingNames, setIsEditingNames] = useState<boolean>(false);

  // 말 초기화
  useEffect(() => {
    initializeHorses();
    
    // 사운드 효과 초기화
    startSoundRef.current = new Audio('/sounds/start.mp3');
    finishSoundRef.current = new Audio('/sounds/finish.mp3');
    
    // 사운드 볼륨 설정
    if (startSoundRef.current) startSoundRef.current.volume = 0.5;
    if (finishSoundRef.current) finishSoundRef.current.volume = 0.5;
    
    // 애니메이션 프레임 업데이트
    animationIntervalRef.current = setInterval(() => {
      setAnimationFrame(prev => (prev + 1) % 8); // 8프레임 애니메이션
    }, 100);
    
    return () => {
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, [horseCount]); // horseCount가 변경될 때마다 말 초기화

  // 말 초기화 함수
  const initializeHorses = () => {
    const initialHorses: HorseData[] = Array.from({ length: horseCount }, (_, index) => ({
      id: index + 1,
      // 사용자가 입력한 이름이 있으면 사용하고, 없으면 기본 이름 사용
      name: customHorseNames[index + 1] || `말 ${index + 1}`,
      speed: 0,
      position: START_LINE_POSITION, // 출발선에서 시작
      isFinished: false,
      rank: null,
      finishTime: null,
      isTeleporting: false,
      isFallen: false,
      flashColor: null,
    }));
    setHorses(initialHorses);
  };

  // 말 이름 변경 핸들러
  const handleHorseNameChange = (id: number, name: string) => {
    setCustomHorseNames(prev => ({
      ...prev,
      [id]: name
    }));
  };

  // 말 이름 편집 모드 토글
  const toggleEditNames = () => {
    setIsEditingNames(!isEditingNames);
    if (isEditingNames) {
      // 편집 모드를 종료할 때 말 초기화하여 이름 변경 적용
      initializeHorses();
    }
  };

  // 말 수 변경 시 커스텀 이름 상태도 정리
  useEffect(() => {
    // 말 수가 줄어들면 필요 없는 이름 제거
    const updatedNames = {...customHorseNames};
    Object.keys(updatedNames).forEach(key => {
      if (parseInt(key) > horseCount) {
        delete updatedNames[parseInt(key)];
      }
    });
    setCustomHorseNames(updatedNames);
    initializeHorses();
  }, [horseCount]);

  // 경주 리셋
  const resetRace = () => {
    // 경주 중이면 인터벌 정리
    if (isRacing) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (backgroundIntervalRef.current) {
        clearInterval(backgroundIntervalRef.current);
      }
      if (shakeIntervalRef.current) {
        clearInterval(shakeIntervalRef.current);
      }
    }
    
    // 상태 초기화
    initializeHorses();
    setIsRacing(false);
    setGameOver(false);
    setBackgroundPosition(0);
    setShakeIntensity(0);
  };

  // 말 수 증가
  const increaseHorseCount = () => {
    if (isRacing) return; // 경주 중에는 말 수 변경 불가
    if (horseCount < MAX_HORSE_COUNT) {
      setHorseCount(prev => prev + 1);
    }
  };

  // 말 수 감소
  const decreaseHorseCount = () => {
    if (isRacing) return; // 경주 중에는 말 수 변경 불가
    if (horseCount > MIN_HORSE_COUNT) {
      setHorseCount(prev => prev - 1);
    }
  };

  // 사운드 재생 함수
  const playSound = (sound: HTMLAudioElement | null) => {
    if (sound && isSoundEnabled) {
      sound.currentTime = 0;
      sound.play().catch(e => console.log('사운드 재생 오류:', e));
    }
  };

  // 랜덤 색상 생성
  const getRandomColor = () => {
    const neonColors = Object.values(NEON);
    return neonColors[Math.floor(Math.random() * neonColors.length)];
  };

  // 화면 떨림 효과 계산
  const getShakeStyle = () => {
    if (shakeIntensity === 0) return {};
    
    const x = Math.random() * shakeIntensity * 2 - shakeIntensity;
    const y = Math.random() * shakeIntensity * 2 - shakeIntensity;
    
    return {
      transform: `translate(${x}px, ${y}px)`,
    };
  };

  // 시간을 읽기 쉬운 형식으로 변환하는 함수 추가
  const formatRaceTime = (timeInMs: number): string => {
    const totalSeconds = timeInMs / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((totalSeconds - Math.floor(totalSeconds)) * 100);
    
    // 분이 0이면 표시하지 않음
    if (minutes === 0) {
      return `${seconds}.${milliseconds.toString().padStart(2, '0')}초`;
    }
    
    return `${minutes}분 ${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}초`;
  };

  // 경주 시작
  const startRace = () => {
    if (isRacing) return;
    
    // 시작 사운드 재생
    playSound(startSoundRef.current);
    
    // 게임 리셋
    if (gameOver) {
      resetRace();
    }

    // 각 말에게 랜덤 속도 부여
    const horsesWithSpeed = horses.map(horse => ({
      ...horse,
      speed: Math.random() * 2 + 1, // 1~3 사이의 랜덤 속도
    }));
    setHorses(horsesWithSpeed);
    setIsRacing(true);
    setRaceStartTime(Date.now()); // 경주 시작 시간 기록

    // 배경 스크롤 효과
    backgroundIntervalRef.current = setInterval(() => {
      setBackgroundPosition(prev => (prev + 1) % 100);
    }, 50);

    // 화면 떨림 효과
    shakeIntervalRef.current = setInterval(() => {
      // 경주 중 특별한 이벤트(순간이동, 넘어짐)가 발생하면 떨림 강도 증가
      setShakeIntensity(prev => {
        // 말들의 상태 확인
        const activeTeleports = horses.filter(h => h.isTeleporting).length;
        const activeFalls = horses.filter(h => h.isFallen).length;
        
        // 특별한 이벤트가 많을수록 떨림 강도 증가
        const targetIntensity = Math.min(
          (activeTeleports * 2 + activeFalls * 3) / 2, 
          MAX_SHAKE_INTENSITY
        );
        
        // 부드러운 변화를 위해 현재 값에서 목표 값으로 서서히 변경
        if (Math.abs(prev - targetIntensity) < 0.2) return targetIntensity;
        return prev + (targetIntensity > prev ? 0.2 : -0.2);
      });
    }, 50);

    // 경주 진행
    intervalRef.current = setInterval(() => {
      setHorses(prevHorses => {
        const updatedHorses = prevHorses.map(horse => {
          // 이미 결승선에 도착한 말은 그대로 유지
          if (horse.isFinished) return { ...horse, flashColor: null };
          
          // 넘어진 말은 회복 시간 동안 움직이지 않음
          if (horse.isFallen) {
            // 플래시 효과 색상 변경 (깜빡임 효과)
            const newFlashColor = horse.flashColor ? null : NEON.RED;
            
            // 랜덤하게 회복 (약 5% 확률)
            if (Math.random() < 0.05) {
              return {
                ...horse,
                isFallen: false,
                flashColor: NEON.GREEN, // 회복 시 초록색 플래시
              };
            }
            
            return {
              ...horse,
              flashColor: newFlashColor,
            };
          }
          
          // 순간이동 중인 말
          if (horse.isTeleporting) {
            // 플래시 효과 색상 변경 (깜빡임 효과)
            const newFlashColor = horse.flashColor ? null : getRandomColor();
            
            // 순간이동 완료 (약 20% 확률)
            if (Math.random() < 0.2) {
              const teleportPosition = Math.min(horse.position + TELEPORT_DISTANCE, FINISH_LINE_POSITION);
              return {
                ...horse,
                position: teleportPosition,
                isTeleporting: false,
                flashColor: null,
              };
            }
            
            return {
              ...horse,
              flashColor: newFlashColor,
            };
          }
          
          // 일반적인 이동
          let newPosition = horse.position + horse.speed;
          let isTeleporting = false;
          let isFallen = false;
          let flashColor = null;
          
          // 순간이동 발생 (결승선 근처에서는 발생하지 않음)
          if (Math.random() < TELEPORT_CHANCE && horse.position < FINISH_LINE_POSITION - TELEPORT_DISTANCE) {
            isTeleporting = true;
            flashColor = getRandomColor();
          }
          
          // 넘어짐 발생 (결승선 근처에서는 발생하지 않음)
          if (Math.random() < FALL_CHANCE && horse.position < FINISH_LINE_POSITION - 10) {
            isFallen = true;
            flashColor = NEON.RED; // 넘어질 때 빨간색 플래시
          }
          
          // 결승선 도착 (FINISH_LINE_POSITION%)
          if (newPosition >= FINISH_LINE_POSITION && !horse.isFinished) {
            const currentTime = Date.now();
            return {
              ...horse,
              position: FINISH_LINE_POSITION,
              isFinished: true,
              finishTime: currentTime - raceStartTime, // 도착 시간 기록
              rank: null, // 일단 null로 설정하고 나중에 계산
              isTeleporting: false,
              isFallen: false,
              flashColor: NEON.YELLOW, // 결승선 도착 시 노란색 플래시
            };
          }
          
          return {
            ...horse,
            position: newPosition,
            isTeleporting,
            isFallen,
            flashColor,
          };
        });

        // 모든 말이 결승선에 도착했는지 확인
        const allFinished = updatedHorses.every(horse => horse.isFinished);
        if (allFinished) {
          clearInterval(intervalRef.current!);
          if (backgroundIntervalRef.current) {
            clearInterval(backgroundIntervalRef.current);
          }
          if (shakeIntervalRef.current) {
            clearInterval(shakeIntervalRef.current);
          }
          setIsRacing(false);
          setGameOver(true);
          setShakeIntensity(0); // 떨림 효과 중지
          
          // 결승 사운드 재생
          playSound(finishSoundRef.current);
          
          // 도착 시간에 따라 등수 계산
          const sortedByFinishTime = [...updatedHorses].sort((a, b) => 
            (a.finishTime || Infinity) - (b.finishTime || Infinity)
          );
          
          // 등수만 할당하고 위치는 유지
          const rankedHorses = updatedHorses.map(horse => {
            const rank = sortedByFinishTime.findIndex(h => h.id === horse.id) + 1;
            return {
              ...horse,
              rank: rank,
              flashColor: null,
            };
          });
          
          return rankedHorses;
        }

        return updatedHorses;
      });
    }, 100);
  };

  // 컴포넌트 언마운트 시 인터벌 정리
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (backgroundIntervalRef.current) {
        clearInterval(backgroundIntervalRef.current);
      }
      if (shakeIntervalRef.current) {
        clearInterval(shakeIntervalRef.current);
      }
      if (animationIntervalRef.current) {
        clearInterval(animationIntervalRef.current);
      }
    };
  }, []);

  // 등수별로 정렬된 말 목록 가져오기
  const getSortedHorsesByRank = () => {
    return [...horses].sort((a, b) => {
      // 등수가 없는 경우 가장 뒤로
      if (a.rank === null) return 1;
      if (b.rank === null) return -1;
      return a.rank - b.rank;
    });
  };

  // 픽셀 아트 배경 스타일 계산
  const getPixelBackgroundStyle = () => {
    // 8x8 픽셀 그리드 패턴
    const gridSize = 8;
    const darkColor = PALETTE.DARK_GRAY;
    const lightColor = PALETTE.BLACK;
    
    // 애니메이션 프레임에 따라 색상 변경
    const trackColor = animationFrame % 2 === 0 ? darkColor : lightColor;
    
    return {
      backgroundImage: `
        linear-gradient(90deg, ${trackColor} ${gridSize}px, transparent ${gridSize}px),
        linear-gradient(${trackColor} ${gridSize}px, transparent ${gridSize}px)
      `,
      backgroundSize: `${gridSize * 2}px ${gridSize * 2}px`,
      backgroundPosition: `${-backgroundPosition}px 0`,
      transition: 'background-position 0.05s linear',
    };
  };

  // 픽셀 스타일 트랙 배경
  const getPixelTrackStyle = () => {
    return {
      position: 'relative' as const,
      marginBottom: '20px',
      backgroundColor: PALETTE.BLACK,
      padding: '8px',
      borderRadius: '0',
      border: `4px solid ${PALETTE.WHITE}`,
      overflow: 'hidden',
      boxShadow: `0 0 0 4px ${PALETTE.BLACK}`,
      imageRendering: 'pixelated' as const,
      ...getPixelBackgroundStyle()
    };
  };

  // 픽셀 아트 출발선 렌더링
  const renderPixelStartLine = () => {
    const gridSize = 4;
    const lineWidth = gridSize;
    const patternCount = 100; // 패턴 개수를 크게 늘림
    
    return (
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        bottom: 0, 
        left: `${START_LINE_POSITION}%`, 
        width: `${lineWidth}px`, 
        zIndex: 10,
        height: '100%',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}>
          {Array.from({ length: patternCount }).map((_, index) => (
            <div 
              key={index} 
              style={{
                width: '100%',
                height: `${100 / patternCount}%`,
                backgroundColor: index % 2 === 0 ? NEON.BLUE : PALETTE.WHITE,
              }}
            />
          ))}
        </div>
        <div className="pixel-text" style={{ 
          position: 'absolute', 
          top: '-24px', 
          left: '-30px', 
          color: NEON.BLUE, 
          fontSize: '8px',
          textShadow: `1px 1px 0 ${PALETTE.BLACK}, -1px -1px 0 ${PALETTE.BLACK}, 1px -1px 0 ${PALETTE.BLACK}, -1px 1px 0 ${PALETTE.BLACK}`,
        }}>
          출발선
        </div>
      </div>
    );
  };

  // 픽셀 아트 결승선 렌더링
  const renderPixelFinishLine = () => {
    const gridSize = 4;
    const lineWidth = gridSize;
    const patternCount = 100; // 패턴 개수를 크게 늘림
    
    return (
      <div style={{ 
        position: 'absolute', 
        top: 0, 
        bottom: 0, 
        left: `${FINISH_LINE_POSITION}%`, 
        width: `${lineWidth}px`, 
        zIndex: 10,
        height: '100%',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch'
        }}>
          {Array.from({ length: patternCount }).map((_, index) => (
            <div 
              key={index} 
              style={{
                width: '100%',
                height: `${100 / patternCount}%`,
                backgroundColor: index % 2 === 0 ? NEON.RED : PALETTE.WHITE,
              }}
            />
          ))}
        </div>
        <div className="pixel-text" style={{ 
          position: 'absolute', 
          top: '-24px', 
          left: '-30px', 
          color: NEON.RED, 
          fontSize: '8px',
          textShadow: `1px 1px 0 ${PALETTE.BLACK}, -1px -1px 0 ${PALETTE.BLACK}, 1px -1px 0 ${PALETTE.BLACK}, -1px 1px 0 ${PALETTE.BLACK}`,
        }}>
          결승선
        </div>
      </div>
    );
  };

  // 픽셀 아트 버튼 스타일
  const getPixelButtonStyle = (color: string, isDisabled: boolean = false) => {
    return {
      backgroundColor: isDisabled ? PALETTE.DARK_GRAY : color,
      color: PALETTE.WHITE,
      border: 'none',
      padding: '12px 24px',
      fontFamily: "'Press Start 2P', cursive",
      fontSize: '16px',
      fontWeight: 'bold',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      position: 'relative' as const,
      textTransform: 'uppercase' as const,
      boxShadow: `
        0 6px 0 ${PALETTE.BLACK},
        0 -2px 0 ${PALETTE.BLACK},
        2px 0 0 ${PALETTE.BLACK},
        -2px 0 0 ${PALETTE.BLACK},
        4px 4px 0 ${PALETTE.BLACK},
        -4px 4px 0 ${PALETTE.BLACK},
        4px -4px 0 ${PALETTE.BLACK},
        -4px -4px 0 ${PALETTE.BLACK},
        0 0 10px ${color}
      `,
      margin: '8px',
      outline: 'none',
      opacity: isDisabled ? 0.7 : 1,
      borderRadius: '8px',
      transition: 'all 0.2s',
      transform: 'scale(1)',
      textShadow: `2px 2px 0 ${PALETTE.BLACK}`,
      animation: isDisabled ? 'none' : 'pulse 1.5s infinite alternate',
    };
  };

  return (
    <div 
      className="retro-bg"
      style={{ 
        maxWidth: '800px', 
        margin: '0 auto', 
        padding: '20px',
        ...getShakeStyle(),
        transition: 'transform 0.05s ease-out',
        background: 'linear-gradient(135deg, #111, #333)',
        borderRadius: '20px',
        boxShadow: '0 0 30px rgba(0,0,0,0.7)',
      }}
    >
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            100% { transform: scale(1.05); }
          }
          @keyframes rainbow {
            0% { color: ${NEON.RED}; }
            20% { color: ${NEON.ORANGE}; }
            40% { color: ${NEON.YELLOW}; }
            60% { color: ${NEON.GREEN}; }
            80% { color: ${NEON.BLUE}; }
            100% { color: ${NEON.PURPLE}; }
          }
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.7; }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          
          /* 모바일 최적화 스타일 */
          @media (max-width: 768px) {
            .title-text {
              font-size: 28px !important;
            }
            .horse-count-text {
              font-size: 18px !important;
            }
            .count-button {
              width: 36px !important;
              height: 36px !important;
              font-size: 20px !important;
            }
            .count-value {
              font-size: 22px !important;
              min-width: 40px !important;
              padding: 3px 10px !important;
            }
            .race-button {
              min-width: auto !important;
              padding: 8px 16px !important;
              font-size: 14px !important;
            }
            .sound-label {
              padding: 5px 10px !important;
            }
            .sound-label span {
              font-size: 16px !important;
            }
            .pixel-checkbox {
              width: 20px !important;
              height: 20px !important;
            }
            .result-title {
              font-size: 24px !important;
            }
            .rank-badge {
              width: 40px !important;
              height: 40px !important;
              font-size: 18px !important;
            }
            .horse-name {
              font-size: 18px !important;
            }
            .horse-stats {
              font-size: 14px !important;
              padding: 3px 8px !important;
            }
            .result-item {
              padding: 10px !important;
              margin: 10px 0 !important;
            }
          }
          
          /* 작은 모바일 화면 최적화 */
          @media (max-width: 480px) {
            .title-text {
              font-size: 18px !important;
              white-space: nowrap !important;
              letter-spacing: 0 !important;
            }
            .mobile-controls {
              flex-direction: column !important;
              align-items: flex-start !important;
            }
            .mobile-controls > div, 
            .mobile-controls > button,
            .mobile-controls > label {
              margin-bottom: 15px !important;
              width: 100% !important;
              justify-content: flex-start !important;
            }
            .name-edit-button, .sound-label {
              align-self: flex-start !important;
              margin-left: 0 !important;
            }
            .race-buttons {
              flex-direction: column !important;
              width: 100% !important;
            }
            .race-buttons button {
              width: 100% !important;
              margin: 5px 0 !important;
            }
            .horse-name-editor {
              grid-template-columns: 1fr !important;
            }
          }
          
          /* 중간 크기 모바일 화면 최적화 */
          @media (max-width: 600px) and (min-width: 481px) {
            .title-text {
              font-size: 22px !important;
              white-space: nowrap !important;
            }
          }
          
          .title-text {
            animation: rainbow 3s linear infinite, float 3s ease-in-out infinite;
            font-size: 42px !important;
            font-weight: bold;
            text-shadow: 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000 !important;
            letter-spacing: 2px;
          }
          .horse-count-text {
            font-size: 24px !important;
            font-weight: bold;
            animation: blink 1s infinite;
          }
          .count-button {
            width: 40px !important;
            height: 40px !important;
            border-radius: 50% !important;
            font-size: 24px !important;
            display: flex !important;
            justify-content: center;
            align-items: center;
            animation: pulse 1.5s infinite alternate;
          }
          .count-value {
            font-size: 28px !important;
            min-width: 50px !important;
            background-color: rgba(0,0,0,0.5);
            padding: 5px 15px;
            border-radius: 10px;
            border: 3px solid ${NEON.CYAN};
            box-shadow: 0 0 10px ${NEON.CYAN};
          }
          .race-button {
            min-width: 180px;
            transform-origin: center;
            transition: transform 0.3s;
          }
          .race-button:hover {
            transform: scale(1.1) !important;
          }
          .sound-label {
            background-color: rgba(0,0,0,0.5);
            padding: 8px 15px;
            border-radius: 10px;
            border: 2px solid ${NEON.CYAN};
            transition: all 0.3s;
          }
          .sound-label:hover {
            box-shadow: 0 0 15px ${NEON.CYAN};
          }
          .pixel-checkbox {
            width: 25px;
            height: 25px;
            cursor: pointer;
          }
          .result-title {
            animation: rainbow 3s linear infinite;
            font-size: 36px !important;
            font-weight: bold;
            text-shadow: 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000 !important;
            letter-spacing: 2px;
          }
          .result-item {
            transition: all 0.3s ease;
          }
          .result-item:hover {
            transform: translateX(10px) scale(1.05);
          }
          .rank-badge {
            animation: spin 3s linear infinite;
            display: flex !important;
            justify-content: center;
            align-items: center;
            font-weight: bold !important;
          }
          .rank-badge-1 {
            background: linear-gradient(45deg, gold, yellow) !important;
            color: black !important;
            border: 3px solid orange !important;
            box-shadow: 0 0 10px gold !important;
          }
          .rank-badge-2 {
            background: linear-gradient(45deg, silver, white) !important;
            color: black !important;
            border: 3px solid gray !important;
          }
          .rank-badge-3 {
            background: linear-gradient(45deg, #cd7f32, #e9967a) !important;
            color: black !important;
            border: 3px solid brown !important;
          }
          .horse-name {
            font-size: 24px !important;
            font-weight: bold !important;
            animation: blink 1s infinite;
          }
          .horse-stats {
            font-size: 18px !important;
            color: white !important;
            background-color: rgba(0,0,0,0.7);
            padding: 5px 10px;
            border-radius: 10px;
            margin-left: 10px !important;
          }
        `}
      </style>
      <div className="pixel-container" style={{ 
        padding: '20px', 
        borderRadius: '15px',
        backgroundColor: 'rgba(0,0,0,0.7)',
        border: `5px solid ${NEON.CYAN}`,
        boxShadow: `0 0 20px ${NEON.CYAN}`,
      }}>
        <h1 className="pixel-text title-text" style={{ textAlign: 'center', marginBottom: '30px', whiteSpace: 'normal' }}>
          🏇 경마 게임 🏇
        </h1>
        
        {/* 사운드 설정 및 말 수 조절 */}
        <div className="mobile-controls" style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          {/* 말 수 조절 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span className="pixel-text horse-count-text" style={{ color: NEON.YELLOW }}>말 수:</span>
            <button 
              onClick={decreaseHorseCount} 
              disabled={isRacing || horseCount <= MIN_HORSE_COUNT}
              className="count-button"
              style={{
                ...getPixelButtonStyle(NEON.RED, isRacing || horseCount <= MIN_HORSE_COUNT),
                padding: '0',
              }}
            >
              -
            </button>
            <span className="pixel-text count-value" style={{ textAlign: 'center', color: PALETTE.WHITE }}>{horseCount}</span>
            <button 
              onClick={increaseHorseCount} 
              disabled={isRacing || horseCount >= MAX_HORSE_COUNT}
              className="count-button"
              style={{
                ...getPixelButtonStyle(NEON.GREEN, isRacing || horseCount >= MAX_HORSE_COUNT),
                padding: '0',
              }}
            >
              +
            </button>
          </div>
          
          {/* 말 이름 편집 버튼 */}
          <button
            onClick={toggleEditNames}
            disabled={isRacing}
            className="race-button name-edit-button"
            style={{
              ...getPixelButtonStyle(NEON.CYAN, isRacing),
              padding: '8px 16px',
              fontSize: '14px',
              minWidth: 'auto',
              alignSelf: 'flex-start'
            }}
          >
            {isEditingNames ? '✅ 이름 저장' : '✏️ 말 이름 편집'}
          </button>
          
          {/* 사운드 설정 */}
          <label className="sound-label" style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            alignSelf: 'flex-start'
          }}>
            <input 
              className="pixel-checkbox"
              type="checkbox" 
              checked={isSoundEnabled} 
              onChange={() => setIsSoundEnabled(!isSoundEnabled)}
            />
            <span className="pixel-text" style={{ fontSize: '20px', marginLeft: '10px', color: NEON.YELLOW }}>사운드 {isSoundEnabled ? '🔊' : '🔇'}</span>
          </label>
        </div>
        
        {/* 말 이름 편집 폼 */}
        {isEditingNames && (
          <div style={{ 
            marginBottom: '30px', 
            backgroundColor: 'rgba(0,0,0,0.7)', 
            padding: '20px', 
            borderRadius: '15px',
            border: `3px solid ${NEON.CYAN}`,
            boxShadow: `0 0 15px ${NEON.CYAN}`,
          }}>
            <h3 className="pixel-text" style={{ 
              fontSize: '24px', 
              color: NEON.CYAN, 
              marginBottom: '15px', 
              textAlign: 'center',
              textShadow: `2px 2px 0 ${PALETTE.BLACK}`
            }}>
              🐎 말 이름 설정 🐎
            </h3>
            <div className="horse-name-editor" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
              gap: '15px' 
            }}>
              {Array.from({ length: horseCount }).map((_, index) => {
                const horseId = index + 1;
                return (
                  <div key={horseId} style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '5px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    padding: '10px',
                    borderRadius: '10px',
                    border: `2px solid ${HORSE_COLORS[index % HORSE_COLORS.length]}`,
                  }}>
                    <label className="pixel-text" style={{ 
                      fontSize: '16px', 
                      color: HORSE_COLORS[index % HORSE_COLORS.length],
                      marginBottom: '5px'
                    }}>
                      말 {horseId} 이름:
                    </label>
                    <input
                      type="text"
                      value={customHorseNames[horseId] || ''}
                      onChange={(e) => handleHorseNameChange(horseId, e.target.value)}
                      placeholder={`말 ${horseId}`}
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        color: PALETTE.WHITE,
                        border: `2px solid ${HORSE_COLORS[index % HORSE_COLORS.length]}`,
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontFamily: 'Arial, sans-serif',
                        outline: 'none',
                        boxShadow: `0 0 5px ${HORSE_COLORS[index % HORSE_COLORS.length]}`,
                      }}
                      maxLength={10} // 이름 길이 제한
                    />
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: '15px', textAlign: 'center' }}>
              <button
                onClick={toggleEditNames}
                style={{
                  ...getPixelButtonStyle(NEON.GREEN),
                  padding: '8px 16px',
                  fontSize: '16px',
                }}
              >
                ✅ 이름 저장하기
              </button>
            </div>
          </div>
        )}
        
        {/* 경주 시작 및 리셋 버튼 */}
        <div className="race-buttons" style={{ marginBottom: '30px', textAlign: 'center', display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <button
            onClick={startRace}
            disabled={isRacing}
            className="race-button"
            style={getPixelButtonStyle(NEON.GREEN, isRacing)}
          >
            {gameOver ? '🔄 다시 시작' : '🏁 경주 시작'}
          </button>
          
          <button
            onClick={resetRace}
            className="race-button"
            style={getPixelButtonStyle(NEON.RED)}
          >
            ❌ 리셋
          </button>
        </div>

        {/* 경주 트랙 */}
        <div style={getPixelTrackStyle()}>
          {/* 출발선 */}
          {renderPixelStartLine()}
          
          {/* 결승선 */}
          {renderPixelFinishLine()}
          
          {horses.map(horse => (
            <Horse
              key={horse.id}
              id={horse.id}
              name={horse.name}
              position={horse.position}
              isFinished={horse.isFinished}
              rank={horse.rank}
              isTeleporting={horse.isTeleporting}
              isFallen={horse.isFallen}
              flashColor={horse.flashColor}
            />
          ))}
        </div>

        {/* 경주 결과 */}
        {gameOver && (
          <div className="pixel-container" style={{ 
            marginTop: '32px', 
            backgroundColor: '#FF00FF', 
            border: `8px solid ${NEON.YELLOW}`, 
            borderRadius: '20px',
            boxShadow: `0 0 20px ${NEON.CYAN}, 0 0 40px ${NEON.BLUE}`,
            padding: '20px',
            animation: 'pulse 1.5s infinite alternate',
            overflow: 'hidden',
            position: 'relative',
          }}>
            <style>
              {`
                @keyframes pulse {
                  0% { transform: scale(1); }
                  100% { transform: scale(1.03); }
                }
                @keyframes rainbow {
                  0% { color: ${NEON.RED}; }
                  20% { color: ${NEON.ORANGE}; }
                  40% { color: ${NEON.YELLOW}; }
                  60% { color: ${NEON.GREEN}; }
                  80% { color: ${NEON.BLUE}; }
                  100% { color: ${NEON.PURPLE}; }
                }
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
                @keyframes blink {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.5; }
                }
                .result-title {
                  animation: rainbow 3s linear infinite;
                  font-size: 36px !important;
                  font-weight: bold;
                  text-shadow: 3px 3px 0 #000, -3px -3px 0 #000, 3px -3px 0 #000, -3px 3px 0 #000 !important;
                  letter-spacing: 2px;
                }
                .result-item {
                  transition: all 0.3s ease;
                }
                .result-item:hover {
                  transform: translateX(10px) scale(1.05);
                }
                .rank-badge {
                  animation: spin 3s linear infinite;
                  display: flex !important;
                  justify-content: center;
                  align-items: center;
                  font-weight: bold !important;
                }
                .rank-badge-1 {
                  background: linear-gradient(45deg, gold, yellow) !important;
                  color: black !important;
                  border: 3px solid orange !important;
                  box-shadow: 0 0 10px gold !important;
                }
                .rank-badge-2 {
                  background: linear-gradient(45deg, silver, white) !important;
                  color: black !important;
                  border: 3px solid gray !important;
                }
                .rank-badge-3 {
                  background: linear-gradient(45deg, #cd7f32, #e9967a) !important;
                  color: black !important;
                  border: 3px solid brown !important;
                }
                .horse-name {
                  font-size: 24px !important;
                  font-weight: bold !important;
                  animation: blink 1s infinite;
                }
                .horse-stats {
                  font-size: 18px !important;
                  color: white !important;
                  background-color: rgba(0,0,0,0.7);
                  padding: 5px 10px;
                  border-radius: 10px;
                  margin-left: 10px !important;
                }
              `}
            </style>
            <h2 className="pixel-text result-title" style={{ textAlign: 'center', marginBottom: '20px' }}>
              🏁 경주 결과 🏁
            </h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {getSortedHorsesByRank().map(horse => (
                <li key={horse.id} className="result-item" style={{ 
                  padding: '15px', 
                  margin: '15px 0', 
                  backgroundColor: horse.rank === 1 ? 'rgba(255, 215, 0, 0.3)' : 
                                   horse.rank === 2 ? 'rgba(192, 192, 192, 0.3)' : 
                                   horse.rank === 3 ? 'rgba(205, 127, 50, 0.3)' : 
                                   'rgba(255, 255, 255, 0.2)',
                  border: `5px solid ${horse.rank === 1 ? NEON.YELLOW : 
                                      horse.rank === 2 ? NEON.CYAN : 
                                      horse.rank === 3 ? NEON.ORANGE : 
                                      NEON.WHITE}`,
                  borderRadius: '15px',
                  boxShadow: `0 0 15px ${horse.rank === 1 ? NEON.YELLOW : 
                                        horse.rank === 2 ? NEON.CYAN : 
                                        horse.rank === 3 ? NEON.ORANGE : 
                                        NEON.WHITE}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
                    <span className={`rank-badge ${horse.rank === 1 ? 'rank-badge-1' : horse.rank === 2 ? 'rank-badge-2' : horse.rank === 3 ? 'rank-badge-3' : ''}`} style={{ 
                      width: '50px', 
                      height: '50px', 
                      backgroundColor: PALETTE.BLACK, 
                      color: PALETTE.WHITE, 
                      textAlign: 'center', 
                      lineHeight: '50px', 
                      border: `3px solid ${PALETTE.WHITE}`,
                      borderRadius: '50%',
                      fontSize: '24px'
                    }}>
                      {horse.rank === 1 ? '🥇' : horse.rank === 2 ? '🥈' : horse.rank === 3 ? '🥉' : horse.rank}
                    </span>
                    <span className="pixel-text horse-name" style={{ color: HORSE_COLORS[horse.id % HORSE_COLORS.length] }}>
                      {horse.name} <span style={{ 
                        backgroundColor: 'rgba(0,0,0,0.7)', 
                        padding: '2px 8px', 
                        borderRadius: '8px', 
                        fontSize: '20px',
                        color: horse.rank === 1 ? 'gold' : 
                               horse.rank === 2 ? 'silver' : 
                               horse.rank === 3 ? '#cd7f32' : 
                               PALETTE.WHITE,
                        textShadow: '1px 1px 2px black',
                        marginLeft: '5px',
                        border: `2px solid ${horse.rank === 1 ? 'gold' : 
                                            horse.rank === 2 ? 'silver' : 
                                            horse.rank === 3 ? '#cd7f32' : 
                                            PALETTE.WHITE}`
                      }}>
                        {horse.rank}등
                      </span>
                    </span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      <span className="pixel-text horse-stats">
                        🏃 속도: {horse.speed.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            {/* 축하 메시지 */}
            <div style={{ 
              marginTop: '20px', 
              textAlign: 'center', 
              fontSize: '24px', 
              fontWeight: 'bold',
              color: NEON.WHITE,
              textShadow: `2px 2px 0 ${PALETTE.BLACK}`,
              animation: 'rainbow 3s linear infinite',
            }}>
              🎉 축하합니다! 🎊
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RaceTrack; 