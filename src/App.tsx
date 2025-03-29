import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HorseRace from './pages/HorseRace';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={
            <div className="container">
              <h1>미니 게임 모음</h1>
              <div className="game-grid">
                <Link to="/games/horse-race" className="game-card">
                  <h2>레트로 경마 게임</h2>
                  <p>픽셀 아트 스타일의 클래식한 경마 게임! 당신의 말을 선택하고 우승을 향해 달리세요.</p>
                </Link>
                <Link to="/games/monkey-tree" className="game-card">
                  <h2>원숭이 나무에 올라가</h2>
                  <p>귀여운 원숭이들의 바나나를 향한 레이스! 여러분이 응원하는 원숭이가 가장 먼저 나무 꼭대기의 바나나에 도달할까요?</p>
                </Link>
              </div>
            </div>
          } />
          <Route path="/games/horse-race" element={<HorseRace />} />
          {/* <Route path="/games/monkey-tree" element={<MonkeyTree />} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
