import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface HorseProps {
  id: number;
  name: string;
  position: number;
  isFinished: boolean;
  rank: number | null;
  isTeleporting?: boolean; // 순간이동 중인지
  isFallen?: boolean; // 넘어졌는지
  flashColor?: string | null; // 플래시 효과 색상
}

const Horse: React.FC<HorseProps> = ({ 
  id, 
  name, 
  position, 
  isFinished, 
  rank, 
  isTeleporting = false, 
  isFallen = false, 
  flashColor = null 
}) => {
  // 애니메이션 프레임 상태
  const [frame, setFrame] = useState<number>(0);
  
  // 말의 너비 (px)
  const horseWidth = 80;
  const horseHeight = 40;
  
  // 현대적인 색상 팔레트
  const PALETTE = {
    BLACK: '#222831',
    WHITE: '#EEEEEE',
    RED: '#F05454',
    GREEN: '#4E9F3D',
    BLUE: '#30475E',
    YELLOW: '#F5D042',
    CYAN: '#5EAAA8',
    MAGENTA: '#D65A88',
    ORANGE: '#F78536',
    PURPLE: '#7952B3',
    LIME: '#82C91E',
    PINK: '#F06595',
    TRACK: '#4E9F3D',
    TRACK_LINES: '#3E7B30',
  };
  
  // 말 색상 (각 말마다 다른 색상)
  const HORSE_COLORS = [
    PALETTE.RED,
    PALETTE.BLUE,
    PALETTE.YELLOW,
    PALETTE.CYAN,
    PALETTE.MAGENTA,
    PALETTE.ORANGE,
    PALETTE.PURPLE,
    PALETTE.LIME,
    PALETTE.PINK,
  ];
  
  const horseColor = HORSE_COLORS[id % HORSE_COLORS.length];
  const horseColorLight = adjustColor(horseColor, 30); // 밝은 색상 (그라데이션용)
  const horseColorDark = adjustColor(horseColor, -30); // 어두운 색상 (그라데이션용)
  
  // 색상 밝기 조절 함수
  function adjustColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substring(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substring(2, 4), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substring(4, 6), 16) + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }
  
  // 애니메이션 프레임 업데이트
  useEffect(() => {
    if (!isRacing() && !isTeleporting) return;
    
    const frameInterval = setInterval(() => {
      setFrame(prev => (prev + 1) % 4); // 4프레임 애니메이션
    }, 150);
    
    return () => clearInterval(frameInterval);
  }, [isRacing(), isTeleporting]);
  
  // 경주 중인지 확인
  function isRacing() {
    return !isFinished && position > 5 && !isFallen;
  }

  // 말 렌더링
  const renderHorse = () => {
    // 말의 상태에 따라 다른 스프라이트 사용
    if (isFallen) {
      return renderFallenHorse();
    } else if (isTeleporting) {
      return renderTeleportingHorse();
    } else if (isFinished) {
      return renderFinishedHorse();
    } else {
      return renderRunningHorse();
    }
  };
  
  // 달리는 말 렌더링 (4프레임 애니메이션)
  const renderRunningHorse = () => {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
      }}>
        {/* 말 몸통 */}
        <div style={{
          position: 'absolute',
          width: '60%',
          height: '50%',
          background: `linear-gradient(135deg, ${horseColorLight} 0%, ${horseColor} 50%, ${horseColorDark} 100%)`,
          borderRadius: '40% 20% 20% 40%',
          left: '15%',
          top: '20%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }} />
        
        {/* 말 머리 */}
        <div style={{
          position: 'absolute',
          width: '25%',
          height: '40%',
          background: `linear-gradient(135deg, ${horseColorLight} 0%, ${horseColor} 50%, ${horseColorDark} 100%)`,
          borderRadius: '40% 60% 20% 20%',
          left: '70%',
          top: '15%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }} />
        
        {/* 말 갈기 */}
        <div style={{
          position: 'absolute',
          width: '25%',
          height: '15%',
          background: `${horseColorDark}`,
          borderRadius: '40% 60% 0% 0%',
          left: '70%',
          top: '10%',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }} />
        
        {/* 말 다리 (애니메이션) */}
        {[0, 1, 2, 3].map(legIndex => {
          const legX = 20 + legIndex * 15;
          const legY = 70;
          const legHeight = frame === legIndex ? 20 : 25;
          const legAngle = frame === legIndex ? 15 : -15;
          
          return (
            <div key={legIndex} style={{
              position: 'absolute',
              width: '5%',
              height: `${legHeight}%`,
              background: `linear-gradient(to bottom, ${horseColorDark} 0%, ${PALETTE.BLACK} 100%)`,
              borderRadius: '20%',
              left: `${legX}%`,
              top: `${legY}%`,
              transform: `rotate(${legAngle}deg)`,
              transformOrigin: 'top center',
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }} />
          );
        })}
        
        {/* 말 눈 */}
        <div style={{
          position: 'absolute',
          width: '5%',
          height: '5%',
          backgroundColor: PALETTE.BLACK,
          borderRadius: '50%',
          left: '85%',
          top: '20%',
          boxShadow: '0 0 2px rgba(255,255,255,0.8)',
        }} />
        
        {/* 말 이름 */}
        <div style={{ 
          position: 'absolute',
          bottom: '-22px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '14px',
          fontWeight: 'bold',
          color: PALETTE.WHITE,
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '2px 8px',
          borderRadius: '10px',
          border: `2px solid ${horseColor}`,
          textShadow: `1px 1px 2px ${PALETTE.BLACK}`,
          whiteSpace: 'nowrap',
          fontFamily: 'Arial, sans-serif',
          zIndex: 10,
        }}>
          {name}
        </div>
      </div>
    );
  };
  
  // 넘어진 말 렌더링
  const renderFallenHorse = () => {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        transform: 'rotate(90deg)',
      }}>
        {/* 말 몸통 */}
        <div style={{
          position: 'absolute',
          width: '60%',
          height: '50%',
          background: `linear-gradient(135deg, ${horseColorLight} 0%, ${horseColor} 50%, ${horseColorDark} 100%)`,
          borderRadius: '40% 20% 20% 40%',
          left: '15%',
          top: '20%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }} />
        
        {/* 말 머리 */}
        <div style={{
          position: 'absolute',
          width: '25%',
          height: '40%',
          background: `linear-gradient(135deg, ${horseColorLight} 0%, ${horseColor} 50%, ${horseColorDark} 100%)`,
          borderRadius: '40% 60% 20% 20%',
          left: '70%',
          top: '15%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }} />
        
        {/* 말 갈기 */}
        <div style={{
          position: 'absolute',
          width: '25%',
          height: '15%',
          background: `${horseColorDark}`,
          borderRadius: '40% 60% 0% 0%',
          left: '70%',
          top: '10%',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }} />
        
        {/* 말 다리 (모두 접힘) */}
        {[0, 1, 2, 3].map(legIndex => {
          const legX = 20 + legIndex * 15;
          const legY = 70;
          
          return (
            <div key={legIndex} style={{
              position: 'absolute',
              width: '5%',
              height: '10%',
              background: `linear-gradient(to bottom, ${horseColorDark} 0%, ${PALETTE.BLACK} 100%)`,
              borderRadius: '20%',
              left: `${legX}%`,
              top: `${legY}%`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }} />
          );
        })}
        
        {/* 말 눈 (X 표시) */}
        <div style={{
          position: 'absolute',
          width: '5%',
          height: '5%',
          backgroundColor: PALETTE.BLACK,
          borderRadius: '50%',
          left: '85%',
          top: '20%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: PALETTE.WHITE,
          fontSize: '8px',
          fontWeight: 'bold',
        }}>
          ×
        </div>
        
        {/* 말 이름 */}
        <div style={{ 
          position: 'absolute',
          bottom: '-22px',
          left: '50%',
          transform: 'translateX(-50%) rotate(-90deg)',
          fontSize: '14px',
          fontWeight: 'bold',
          color: PALETTE.WHITE,
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '2px 8px',
          borderRadius: '10px',
          border: `2px solid ${horseColor}`,
          textShadow: `1px 1px 2px ${PALETTE.BLACK}`,
          whiteSpace: 'nowrap',
          fontFamily: 'Arial, sans-serif',
          zIndex: 10,
        }}>
          {name}
        </div>
      </div>
    );
  };
  
  // 순간이동 중인 말 렌더링
  const renderTeleportingHorse = () => {
    const teleportFrames = [0, 1, 2, 3];
    const teleportOpacity = teleportFrames.includes(frame) ? 0.5 + (frame / 10) : 1;
    
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
        opacity: teleportOpacity,
        filter: 'blur(2px)',
      }}>
        {/* 말 몸통 (깜빡임 효과) */}
        <div style={{
          position: 'absolute',
          width: '60%',
          height: '50%',
          background: `linear-gradient(135deg, ${horseColorLight} 0%, ${horseColor} 50%, ${horseColorDark} 100%)`,
          borderRadius: '40% 20% 20% 40%',
          left: '15%',
          top: '20%',
          boxShadow: `0 0 8px 4px ${horseColorLight}`,
          opacity: frame % 2 === 0 ? 0.7 : 1,
        }} />
        
        {/* 말 머리 */}
        <div style={{
          position: 'absolute',
          width: '25%',
          height: '40%',
          background: `linear-gradient(135deg, ${horseColorLight} 0%, ${horseColor} 50%, ${horseColorDark} 100%)`,
          borderRadius: '40% 60% 20% 20%',
          left: '70%',
          top: '15%',
          boxShadow: `0 0 8px 4px ${horseColorLight}`,
          opacity: frame % 2 === 0 ? 0.7 : 1,
        }} />
        
        {/* 말 갈기 */}
        <div style={{
          position: 'absolute',
          width: '25%',
          height: '15%',
          background: `${horseColorDark}`,
          borderRadius: '40% 60% 0% 0%',
          left: '70%',
          top: '10%',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          opacity: frame % 2 === 0 ? 0.7 : 1,
        }} />
        
        {/* 순간이동 효과 (파티클) */}
        {[0, 1, 2, 3, 4].map(particleIndex => {
          const particleX = 10 + particleIndex * 20;
          const particleY = 20 + (particleIndex % 3) * 20;
          const particleVisible = (particleIndex + frame) % 2 === 0;
          
          return particleVisible ? (
            <div key={particleIndex} style={{
              position: 'absolute',
              width: '5%',
              height: '5%',
              background: `radial-gradient(circle, ${horseColorLight} 0%, transparent 70%)`,
              borderRadius: '50%',
              left: `${particleX}%`,
              top: `${particleY}%`,
              boxShadow: `0 0 5px 2px ${horseColorLight}`,
            }} />
          ) : null;
        })}
        
        {/* 말 이름 */}
        <div style={{ 
          position: 'absolute',
          bottom: '-22px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '14px',
          fontWeight: 'bold',
          color: PALETTE.WHITE,
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '2px 8px',
          borderRadius: '10px',
          border: `2px solid ${horseColor}`,
          textShadow: `1px 1px 2px ${PALETTE.BLACK}`,
          whiteSpace: 'nowrap',
          fontFamily: 'Arial, sans-serif',
          zIndex: 10,
        }}>
          {name}
        </div>
      </div>
    );
  };
  
  // 결승선 도착한 말 렌더링
  const renderFinishedHorse = () => {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        position: 'relative',
      }}>
        {/* 말 몸통 */}
        <div style={{
          position: 'absolute',
          width: '60%',
          height: '50%',
          background: `linear-gradient(135deg, ${horseColorLight} 0%, ${horseColor} 50%, ${horseColorDark} 100%)`,
          borderRadius: '40% 20% 20% 40%',
          left: '15%',
          top: '20%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }} />
        
        {/* 말 머리 */}
        <div style={{
          position: 'absolute',
          width: '25%',
          height: '40%',
          background: `linear-gradient(135deg, ${horseColorLight} 0%, ${horseColor} 50%, ${horseColorDark} 100%)`,
          borderRadius: '40% 60% 20% 20%',
          left: '70%',
          top: '15%',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }} />
        
        {/* 말 갈기 */}
        <div style={{
          position: 'absolute',
          width: '25%',
          height: '15%',
          background: `${horseColorDark}`,
          borderRadius: '40% 60% 0% 0%',
          left: '70%',
          top: '10%',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }} />
        
        {/* 말 다리 (모두 멈춤) */}
        {[0, 1, 2, 3].map(legIndex => {
          const legX = 20 + legIndex * 15;
          const legY = 70;
          
          return (
            <div key={legIndex} style={{
              position: 'absolute',
              width: '5%',
              height: '20%',
              background: `linear-gradient(to bottom, ${horseColorDark} 0%, ${PALETTE.BLACK} 100%)`,
              borderRadius: '20%',
              left: `${legX}%`,
              top: `${legY}%`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.3)',
            }} />
          );
        })}
        
        {/* 말 눈 */}
        <div style={{
          position: 'absolute',
          width: '5%',
          height: '5%',
          backgroundColor: PALETTE.BLACK,
          borderRadius: '50%',
          left: '85%',
          top: '20%',
          boxShadow: '0 0 2px rgba(255,255,255,0.8)',
        }} />
        
        {/* 승리 표시 (등수가 1등일 경우) */}
        {rank === 1 && (
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            color: PALETTE.YELLOW,
            fontSize: '20px',
            filter: 'drop-shadow(0 0 3px gold)',
          }}>
            👑
          </div>
        )}
        
        {/* 말 이름 */}
        <div style={{ 
          position: 'absolute',
          bottom: '-22px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '14px',
          fontWeight: 'bold',
          color: PALETTE.WHITE,
          backgroundColor: 'rgba(0,0,0,0.7)',
          padding: '2px 8px',
          borderRadius: '10px',
          border: `2px solid ${horseColor}`,
          textShadow: `1px 1px 2px ${PALETTE.BLACK}`,
          whiteSpace: 'nowrap',
          fontFamily: 'Arial, sans-serif',
          zIndex: 10,
        }}>
          {name}
        </div>
      </div>
    );
  };

  // 말의 상태에 따른 추가 스타일
  const getHorseStyle = () => {
    const baseStyle = {
      position: 'absolute' as const,
      width: `${horseWidth}px`,
      height: `${horseHeight}px`,
      backgroundColor: 'transparent',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      transition: 'transform 0.1s ease-in-out',
      filter: flashColor ? `drop-shadow(0 0 5px ${flashColor})` : 'none',
    };

    return baseStyle;
  };

  // 트랙 배경에 줄무늬 패턴 추가
  const renderTrackLines = () => {
    return (
      <div style={{ position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' }}>
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i} 
            style={{
              position: 'absolute',
              width: '2px',
              height: '100%',
              backgroundColor: PALETTE.TRACK_LINES,
              left: `${i * 5}%`,
              opacity: 0.5
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="horse-track" style={{ position: 'relative', height: '60px', marginBottom: '15px', borderRadius: '8px', border: `2px solid ${PALETTE.WHITE}`, boxShadow: `0 2px 4px rgba(0,0,0,0.3)`, overflow: 'hidden', backgroundColor: PALETTE.TRACK }}>
      {renderTrackLines()}
      <motion.div
        className="horse"
        style={getHorseStyle()}
        animate={{
          left: `calc(${position}%)`,
          opacity: [0.5, 1],
          filter: ['blur(4px)', 'blur(0px)']
        }}
        transition={{ type: 'spring', stiffness: 100, duration: 0.5 }}
      >
        {renderHorse()}
      </motion.div>
      {isFinished && rank && (
        <div style={{ 
          position: 'absolute', 
          right: '10px', 
          top: '10px', 
          color: PALETTE.WHITE, 
          backgroundColor: rank === 1 ? 'rgba(255,215,0,0.8)' : rank === 2 ? 'rgba(192,192,192,0.8)' : rank === 3 ? 'rgba(205,127,50,0.8)' : 'rgba(0,0,0,0.8)', 
          borderRadius: '50%', 
          width: '40px',
          height: '40px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3px', 
          fontSize: '20px',
          fontWeight: 'bold',
          boxShadow: rank === 1 ? '0 0 15px gold' : rank === 2 ? '0 0 10px silver' : rank === 3 ? '0 0 10px #cd7f32' : '0 0 5px white',
          border: `3px solid ${PALETTE.WHITE}`,
          zIndex: 10,
          animation: rank === 1 ? 'winner-pulse 0.8s infinite alternate' : rank === 2 ? 'winner-pulse 1s infinite alternate' : rank === 3 ? 'winner-pulse 1.2s infinite alternate' : 'none',
        }}>
          <style>
            {`
              @keyframes winner-pulse {
                0% { transform: scale(1); }
                100% { transform: scale(1.2); }
              }
              @keyframes winner-rotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}
          </style>
          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
        </div>
      )}
      
      {/* 1등 말에게 추가 효과 */}
      {isFinished && rank === 1 && (
        <>
          <div style={{
            position: 'absolute',
            top: '-30px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '30px',
            animation: 'winner-rotate 3s linear infinite',
            zIndex: 11,
          }}>
            👑
          </div>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            border: '3px dashed gold',
            borderRadius: '10px',
            boxShadow: '0 0 20px gold',
            animation: 'winner-pulse 1s infinite alternate',
            zIndex: 9,
          }} />
        </>
      )}
    </div>
  );
};

export default Horse; 