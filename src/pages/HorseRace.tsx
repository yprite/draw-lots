import React from 'react';
import { Link } from 'react-router-dom';
import RaceTrack from '../components/HorseRace/RaceTrack';

const HorseRace = () => {
  return (
    <div className="container">
      <Link to="/" className="home-button">메인으로 돌아가기</Link>
      <h1>레트로 경마 게임</h1>
      <RaceTrack />
    </div>
  );
};

export default HorseRace; 