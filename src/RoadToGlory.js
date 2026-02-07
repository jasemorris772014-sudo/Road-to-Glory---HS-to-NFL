import React, { useState, useEffect } from 'react';

export default function RoadToGlory() {
  const [gameState, setGameState] = useState('intro');
  const [playState, setPlayState] = useState(null);
  const [currentPlay, setCurrentPlay] = useState(0);
  const [gameScore, setGameScore] = useState({ player: 0, opponent: 0 });
  const [gameplayState, setGameplayState] = useState(null);
  const [trainingSkills, setTrainingSkills] = useState([]);
  const [scoutNotification, setScoutNotification] = useState(null);
  const [playoffStatus, setPlayoffStatus] = useState(null);
  
  const [player, setPlayer] = useState({
    name: '',
    position: '',
    height: 70,
    weight: 180,
    stars: 2,
    attributes: {},
    overall: 65,
    grades: 50,
    coachRelation: 50,
    season: 0,
    level: 'highschool', // highschool, college
    college: null,
    teamRecord: { wins: 0, losses: 0 },
    gamesStarted: 0,
    careerStats: {
      touchdowns: 0,
      yards: 0,
      tackles: 0,
      interceptions: 0,
      sacks: 0,
      blocks: 0
    }
  });

  const positions = ['QB', 'RB', 'WR', 'TE', 'OL', 'DL', 'LB', 'CB', 'S'];
  
  const positionAttributes = {
    QB: ['Arm Strength', 'Accuracy', 'Speed', 'Awareness', 'Decision Making', 'Pocket Presence'],
    RB: ['Speed', 'Agility', 'Power', 'Vision', 'Catching', 'Elusiveness'],
    WR: ['Speed', 'Athleticism', 'Jumping', 'Agility', 'Catching', 'Route Running', 'Spectacular Catch'],
    TE: ['Catching', 'Route Running', 'Blocking', 'Speed', 'Strength', 'Hands'],
    OL: ['Strength', 'Pass Blocking', 'Run Blocking', 'Awareness', 'Footwork', 'Power'],
    DL: ['Strength', 'Speed', 'Power Moves', 'Finesse Moves', 'Tackle', 'Pursuit'],
    LB: ['Speed', 'Tackle', 'Coverage', 'Pursuit', 'Hit Power', 'Awareness'],
    CB: ['Speed', 'Agility', 'Man Coverage', 'Zone Coverage', 'Catching', 'Jumping'],
    S: ['Speed', 'Tackle', 'Zone Coverage', 'Hit Power', 'Awareness', 'Catching']
  };

  const colleges = [
    { name: 'Alabama', minStars: 4, tier: 'Elite' },
    { name: 'Ohio State', minStars: 4, tier: 'Elite' },
    { name: 'Georgia', minStars: 4, tier: 'Elite' },
    { name: 'Michigan', minStars: 3, tier: 'Good' },
    { name: 'Penn State', minStars: 3, tier: 'Good' },
    { name: 'Wisconsin', minStars: 2, tier: 'Mid' },
    { name: 'Iowa State', minStars: 2, tier: 'Mid' }
  ];

  const hsTeams = ['Lincoln High', 'Washington Prep', 'Roosevelt Academy', 'Jefferson HS'];
  const playerHSTeam = hsTeams[Math.floor(Math.random() * hsTeams.length)];

  // Helper functions
  const initializeAttributes = (position) => {
    const attrs = {};
    positionAttributes[position].forEach(attr => {
      attrs[attr] = Math.floor(Math.random() * 20) + 55;
    });
    return attrs;
  };

  const calculateOverall = (attributes) => {
    const values = Object.values(attributes);
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };

  // Play engine
  const startPlayingGame = () => {
    setCurrentPlay(0);
    setGameScore({ player: 0, opponent: 0 });
    setGameplayState({
      touchdowns: 0,
      yards: 0,
      tackles: 0,
      interceptions: 0,
      sacks: 0,
      blocks: 0,
      catches: 0,
      targets: 0
    });
    setGameState('playing');
    nextPlay();
  };

  const nextPlay = () => {
    if (currentPlay >= 12) {
      finishGame();
      return;
    }

    const pos = player.position;
    const isOffense = ['QB', 'RB', 'WR', 'TE', 'OL'].includes(pos);
    
    // Determine play type
    let playType;
    if (isOffense) {
      const rand = Math.random();
      if (pos === 'OL') {
        playType = rand > 0.5 ? 'pass_block' : 'run_block';
      } else if (pos === 'QB') {
        playType = rand > 0.4 ? 'pass' : 'run';
      } else if (pos === 'RB') {
        playType = rand > 0.3 ? 'run' : 'pass';
      } else { // WR/TE
        playType = rand > 0.6 ? 'pass' : 'run_block';
      }
    } else {
      // Defense
      const rand = Math.random();
      playType = rand > 0.6 ? 'pass_defense' : 'run_defense';
    }

    setPlayState({
      playNumber: currentPlay + 1,
      playType: playType,
      down: (currentPlay % 4) + 1,
      distance: Math.floor(Math.random() * 15) + 5,
      fieldPosition: 25 + Math.floor(Math.random() * 50),
      result: null,
      userAction: null
    });
  };

  const executePlay = (action) => {
    const pos = player.position;
    const play = { ...playState };
    play.userAction = action;
    
    let success = false;
    let yards = 0;
    let result = '';
    const newGameplay = { ...gameplayState };

    // Calculate success based on attributes and action
    const relevantAttr = getRelevantAttribute(pos, play.playType, action);
    const successChance = player.attributes[relevantAttr] / 100;
    success = Math.random() < successChance;

    // Execute based on position and play type
    if (pos === 'QB' && play.playType === 'pass') {
      if (action === 'short') {
        yards = success ? Math.floor(Math.random() * 15) + 5 : 0;
        result = success ? `Complete for ${yards} yards!` : 'Incomplete pass';
      } else if (action === 'medium') {
        yards = success ? Math.floor(Math.random() * 20) + 15 : 0;
        result = success ? `Complete for ${yards} yards!` : 'Incomplete pass';
      } else if (action === 'deep') {
        yards = success ? Math.floor(Math.random() * 40) + 25 : 0;
        if (success && yards > 50) {
          newGameplay.touchdowns += 1;
          setGameScore(prev => ({ ...prev, player: prev.player + 7 }));
          result = `TOUCHDOWN! ${yards} yard bomb!`;
        } else {
          result = success ? `Complete for ${yards} yards!` : 'Incomplete pass';
        }
      }
      newGameplay.yards += yards;
    } else if (pos === 'RB') {
      if (play.playType === 'run') {
        if (action === 'outside') {
          yards = success ? Math.floor(Math.random() * 12) + 3 : Math.floor(Math.random() * 3);
        } else if (action === 'inside') {
          yards = success ? Math.floor(Math.random() * 8) + 2 : Math.floor(Math.random() * 2);
        } else if (action === 'power') {
          yards = success ? Math.floor(Math.random() * 6) + 1 : 0;
        }
        result = `${yards} yard gain`;
        newGameplay.yards += yards;
        if (play.fieldPosition + yards >= 100) {
          newGameplay.touchdowns += 1;
          setGameScore(prev => ({ ...prev, player: prev.player + 7 }));
          result = `TOUCHDOWN! ${yards} yard run!`;
        }
      } else if (play.playType === 'pass') {
        // Receiving play
        const targeted = Math.random() > 0.7; // 30% chance to be targeted
        newGameplay.targets += targeted ? 1 : 0;
        if (targeted && success) {
          yards = Math.floor(Math.random() * 20) + 5;
          newGameplay.catches += 1;
          newGameplay.yards += yards;
          result = `Caught for ${yards} yards!`;
        } else if (targeted) {
          result = 'Pass incomplete';
        } else {
          result = 'Not targeted this play';
        }
      }
    } else if (pos === 'WR' || pos === 'TE') {
      if (play.playType === 'pass') {
        const targeted = Math.random() > (pos === 'WR' ? 0.65 : 0.75); // WR 35%, TE 25% target rate
        newGameplay.targets += targeted ? 1 : 0;
        if (targeted && success) {
          yards = Math.floor(Math.random() * 25) + 10;
          newGameplay.catches += 1;
          newGameplay.yards += yards;
          if (play.fieldPosition + yards >= 100) {
            newGameplay.touchdowns += 1;
            setGameScore(prev => ({ ...prev, player: prev.player + 7 }));
            result = `TOUCHDOWN! ${yards} yard catch!`;
          } else {
            result = `Caught for ${yards} yards!`;
          }
        } else if (targeted) {
          result = 'Pass incomplete';
        } else {
          result = 'Not targeted - blocking downfield';
          newGameplay.blocks += 1;
        }
      } else {
        // Blocking on run play
        newGameplay.blocks += success ? 1 : 0;
        result = success ? 'Great block!' : 'Missed block';
      }
    } else if (pos === 'OL') {
      if (play.playType === 'pass_block') {
        newGameplay.blocks += success ? 1 : 0;
        result = success ? 'Stonewalled the rusher!' : 'QB pressured';
      } else {
        newGameplay.blocks += success ? 1 : 0;
        result = success ? 'Opened a huge hole!' : 'Defender broke through';
      }
    } else if (['DL', 'LB', 'CB', 'S'].includes(pos)) {
      // Defense
      if (play.playType === 'run_defense') {
        if (action === 'pursue') {
          if (success) {
            newGameplay.tackles += 1;
            yards = -Math.floor(Math.random() * 5) - 2;
            result = `TACKLE! ${Math.abs(yards)} yard loss!`;
          } else {
            result = 'Runner broke free';
          }
        } else if (action === 'contain') {
          if (success) {
            newGameplay.tackles += 1;
            result = 'Stopped for minimal gain';
          } else {
            result = 'Missed tackle';
          }
        }
      } else if (play.playType === 'pass_defense') {
        if (action === 'coverage') {
          if (success && Math.random() > 0.85) {
            newGameplay.interceptions += 1;
            result = 'INTERCEPTION!';
            setGameScore(prev => ({ ...prev, player: prev.player + 3 }));
          } else if (success) {
            result = 'Pass broken up!';
          } else {
            result = 'Receiver caught it';
          }
        } else if (action === 'blitz') {
          if (success && Math.random() > 0.7) {
            newGameplay.sacks += 1;
            result = 'SACK!';
          } else if (success) {
            result = 'QB pressured';
          } else {
            result = 'Blocked';
          }
        }
      }
    }

    // Opponent scores sometimes
    if (Math.random() > 0.85) {
      setGameScore(prev => ({ ...prev, opponent: prev.opponent + 7 }));
    }

    play.result = result;
    setPlayState(play);
    setGameplayState(newGameplay);
    setCurrentPlay(currentPlay + 1);
  };

  const getRelevantAttribute = (pos, playType, action) => {
    if (pos === 'QB') {
      if (action === 'short' || action === 'medium') return 'Accuracy';
      return 'Arm Strength';
    } else if (pos === 'RB') {
      if (playType === 'pass') return 'Catching';
      if (action === 'outside') return 'Speed';
      if (action === 'power') return 'Power';
      return 'Agility';
    } else if (pos === 'WR' || pos === 'TE') {
      if (playType === 'pass') return 'Catching';
      return 'Blocking';
    } else if (pos === 'OL') {
      return playType === 'pass_block' ? 'Pass Blocking' : 'Run Blocking';
    } else if (['DL', 'LB', 'CB', 'S'].includes(pos)) {
      if (action === 'coverage') return pos === 'CB' ? 'Man Coverage' : 'Zone Coverage';
      if (action === 'blitz') return 'Speed';
      return 'Tackle';
    }
    return Object.keys(player.attributes)[0];
  };

  const finishGame = () => {
    const won = gameScore.player > gameScore.opponent;
    const newPlayer = { ...player };
    
    // Update career stats
    newPlayer.careerStats.touchdowns += gameplayState.touchdowns;
    newPlayer.careerStats.yards += gameplayState.yards;
    newPlayer.careerStats.tackles += gameplayState.tackles;
    newPlayer.careerStats.interceptions += gameplayState.interceptions;
    newPlayer.careerStats.sacks += gameplayState.sacks;
    newPlayer.careerStats.blocks += gameplayState.blocks;
    newPlayer.gamesStarted += 1;

    // Update team record
    if (won) {
      newPlayer.teamRecord.wins += 1;
    } else {
      newPlayer.teamRecord.losses += 1;
    }

    // Improve attributes based on performance
    const performanceScore = gameplayState.touchdowns * 10 + gameplayState.yards * 0.1 + 
                            gameplayState.tackles * 5 + gameplayState.sacks * 8 + 
                            gameplayState.interceptions * 10;
    
    if (performanceScore > 30) {
      const attrKeys = Object.keys(newPlayer.attributes);
      const randomAttr = attrKeys[Math.floor(Math.random() * attrKeys.length)];
      newPlayer.attributes[randomAttr] = Math.min(99, newPlayer.attributes[randomAttr] + 2);
      newPlayer.overall = calculateOverall(newPlayer.attributes);
    }

    // Scout notification for high school
    if (player.level === 'highschool' && performanceScore > 40) {
      const scoutSchools = ['Alabama', 'Ohio State', 'Georgia', 'Michigan', 'USC'];
      const scoutSchool = scoutSchools[Math.floor(Math.random() * scoutSchools.length)];
      setScoutNotification(`🔍 ${scoutSchool} scouts were at the game watching you!`);
    }

    // Check for playoffs
    if (newPlayer.teamRecord.wins >= 8) {
      setPlayoffStatus({
        made: true,
        message: '🏆 YOUR TEAM MADE THE PLAYOFFS!'
      });
    }

    setPlayer(newPlayer);
    setGameState('postgame');
  };

  const simGame = () => {
    // Quick sim with random results
    const won = Math.random() > 0.5;
    const newPlayer = { ...player };
    
    // Generate random stats
    const pos = player.position;
    const isOffense = ['QB', 'RB', 'WR', 'TE'].includes(pos);
    
    if (isOffense) {
      const tds = Math.floor(Math.random() * 3);
      const yards = Math.floor(Math.random() * 100) + 50;
      newPlayer.careerStats.touchdowns += tds;
      newPlayer.careerStats.yards += yards;
    } else {
      const tackles = Math.floor(Math.random() * 10) + 3;
      const sacks = Math.random() > 0.7 ? 1 : 0;
      const ints = Math.random() > 0.85 ? 1 : 0;
      newPlayer.careerStats.tackles += tackles;
      newPlayer.careerStats.sacks += sacks;
      newPlayer.careerStats.interceptions += ints;
    }

    newPlayer.gamesStarted += 1;
    if (won) {
      newPlayer.teamRecord.wins += 1;
    } else {
      newPlayer.teamRecord.losses += 1;
    }

    setGameScore({ 
      player: Math.floor(Math.random() * 20) + 20,
      opponent: won ? Math.floor(Math.random() * 15) + 10 : Math.floor(Math.random() * 20) + 25
    });

    setPlayer(newPlayer);
    setGameState('postgame');
  };

  // Season progression
  const continueToNextGame = () => {
    setScoutNotification(null);
    setPlayoffStatus(null);
    setGameState(player.level === 'highschool' ? 'highschool' : 'college');
  };

  const startGame = () => {
    if (player.name && player.position) {
      const attrs = initializeAttributes(player.position);
      setPlayer({
        ...player,
        attributes: attrs,
        overall: calculateOverall(attrs)
      });
      setGameState('highschool');
    }
  };

  const playHighSchoolSeason = (focus) => {
    const newPlayer = { ...player };
    
    const attrKeys = Object.keys(newPlayer.attributes);
    let improvementCount = focus === 'performance' ? 3 : focus === 'grades' ? 1 : 2;
    
    for (let i = 0; i < improvementCount; i++) {
      const randomAttr = attrKeys[Math.floor(Math.random() * attrKeys.length)];
      newPlayer.attributes[randomAttr] = Math.min(99, newPlayer.attributes[randomAttr] + Math.floor(Math.random() * 8) + 3);
    }

    if (focus === 'grades') {
      newPlayer.grades += Math.floor(Math.random() * 20) + 15;
    } else if (focus === 'performance') {
      newPlayer.grades += Math.floor(Math.random() * 10) + 5;
    } else {
      newPlayer.grades += Math.floor(Math.random() * 15) + 10;
    }

    newPlayer.grades = Math.min(100, newPlayer.grades);
    newPlayer.overall = calculateOverall(newPlayer.attributes);

    const avgScore = (newPlayer.overall + newPlayer.grades) / 2;
    let stars = 2;
    if (avgScore >= 90) stars = 5;
    else if (avgScore >= 75) stars = 4;
    else if (avgScore >= 60) stars = 3;

    const heightGain = Math.floor(Math.random() * 3);
    const weightGain = Math.floor(Math.random() * 15) + 5;

    newPlayer.height += heightGain;
    newPlayer.weight += weightGain;
    newPlayer.stars = stars;

    setPlayer(newPlayer);
    setGameState('recruiting');
  };

  const chooseCollege = (college) => {
    setPlayer({
      ...player,
      college: college.name,
      season: 1,
      level: 'college',
      teamRecord: { wins: 0, losses: 0 }
    });
    setGameState('college');
  };

  const trainSkills = () => {
    if (trainingSkills.length === 0) return;
    
    const newPlayer = { ...player };
    
    trainingSkills.forEach(skill => {
      newPlayer.attributes[skill] = Math.min(99, newPlayer.attributes[skill] + Math.floor(Math.random() * 5) + 3);
    });

    const otherAttrs = Object.keys(newPlayer.attributes).filter(a => !trainingSkills.includes(a));
    const randomOther = otherAttrs[Math.floor(Math.random() * otherAttrs.length)];
    newPlayer.attributes[randomOther] = Math.min(99, newPlayer.attributes[randomOther] + 2);

    newPlayer.coachRelation += Math.floor(Math.random() * 10) + 5;
    newPlayer.coachRelation = Math.min(100, newPlayer.coachRelation);
    newPlayer.overall = calculateOverall(newPlayer.attributes);
    newPlayer.season += 1;
    newPlayer.weight += Math.floor(Math.random() * 8) + 2;

    setPlayer(newPlayer);
    setTrainingSkills([]);
    
    if (newPlayer.season >= 5) {
      setGameState('draft');
    } else {
      setGameState('college');
    }
  };

  const studyHard = () => {
    const newPlayer = { ...player };
    newPlayer.grades += Math.floor(Math.random() * 12) + 8;
    newPlayer.grades = Math.min(100, newPlayer.grades);
    
    const attrKeys = Object.keys(newPlayer.attributes);
    const randomAttr = attrKeys[Math.floor(Math.random() * attrKeys.length)];
    newPlayer.attributes[randomAttr] = Math.min(99, newPlayer.attributes[randomAttr] + 2);
    
    newPlayer.coachRelation += Math.floor(Math.random() * 5) + 3;
    newPlayer.coachRelation = Math.min(100, newPlayer.coachRelation);
    newPlayer.overall = calculateOverall(newPlayer.attributes);
    newPlayer.season += 1;
    newPlayer.weight += Math.floor(Math.random() * 6) + 1;

    setPlayer(newPlayer);
    
    if (newPlayer.season >= 5) {
      setGameState('draft');
    } else {
      setGameState('college');
    }
  };

  const checkForGame = () => {
    const canStart = player.stars >= 4 || player.season >= 3;
    const willStart = canStart && (player.overall >= 70 && player.coachRelation >= 50);
    
    if (willStart) {
      setGameState('pregame');
    } else {
      setGameState('practice');
    }
  };

  const getDraftRound = () => {
    const productionBonus = (player.careerStats.touchdowns * 2) + 
                           (player.careerStats.tackles * 0.5) +
                           (player.careerStats.sacks * 3) +
                           (player.careerStats.interceptions * 4) +
                           (player.gamesStarted * 0.5);
    const totalScore = player.overall + productionBonus;

    if (player.gamesStarted === 0) return 'Undrafted';
    if (totalScore >= 120) return 'Round 1-2';
    if (totalScore >= 100) return 'Round 3-4';
    if (totalScore >= 80) return 'Round 5-7';
    return 'Undrafted Free Agent';
  };

  const recruiterInterested = colleges.filter(c => player.stars >= c.minStars);

  // UI Components
  const RetroBox = ({ children, color = 'blue', className = '' }) => (
    <div className={`border-4 border-${color}-900 bg-${color}-100 p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] ${className}`}>
      {children}
    </div>
  );

  const StatBar = ({ label, value, max = 99, color = 'green' }) => (
    <div className="mb-2">
      <div className="flex justify-between text-sm font-bold mb-1">
        <span>{label}</span>
        <span>{value}/{max}</span>
      </div>
      <div className="h-4 bg-gray-800 border-2 border-gray-900">
        <div 
          className={`h-full bg-${color}-500`}
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
    </div>
  );

  // GAME STATES

  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 pt-8">
            <div className="text-6xl font-bold text-yellow-300 mb-2" style={{ fontFamily: 'monospace', textShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>
              🏈 ROAD TO GLORY
            </div>
            <div className="text-xl text-white font-bold" style={{ fontFamily: 'monospace' }}>
              [ RETRO FOOTBALL CAREER SIM ]
            </div>
          </div>
          
          <RetroBox color="yellow">
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-bold mb-2" style={{ fontFamily: 'monospace' }}>PLAYER NAME:</label>
                <input
                  type="text"
                  className="w-full p-3 border-4 border-gray-900 text-xl font-bold bg-white"
                  style={{ fontFamily: 'monospace' }}
                  value={player.name}
                  onChange={(e) => setPlayer({ ...player, name: e.target.value })}
                  placeholder="Enter name..."
                />
              </div>

              <div>
                <label className="block text-lg font-bold mb-2" style={{ fontFamily: 'monospace' }}>SELECT POSITION:</label>
                <div className="grid grid-cols-3 gap-3">
                  {positions.map(pos => (
                    <button
                      key={pos}
                      onClick={() => setPlayer({ ...player, position: pos })}
                      className={`p-4 border-4 border-gray-900 font-bold text-xl transition shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] ${
                        player.position === pos
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 hover:bg-gray-300'
                      }`}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <RetroBox color="gray" className="bg-gray-800 text-white">
                <h3 className="font-bold text-xl mb-3" style={{ fontFamily: 'monospace' }}>STARTING STATS:</h3>
                <div style={{ fontFamily: 'monospace' }}>
                  <p className="text-lg">HEIGHT: {Math.floor(player.height / 12)}'{player.height % 12}"</p>
                  <p className="text-lg">WEIGHT: {player.weight} LBS</p>
                  <p className="text-sm text-yellow-300 mt-2">★ Play real games to develop your skills!</p>
                </div>
              </RetroBox>

              <button
                onClick={startGame}
                disabled={!player.name || !player.position}
                className="w-full bg-green-600 text-white py-5 border-4 border-gray-900 font-bold text-2xl hover:bg-green-500 disabled:bg-gray-500 disabled:cursor-not-allowed shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]"
                style={{ fontFamily: 'monospace' }}
              >
                {player.name && player.position ? '▶ START JOURNEY' : '⚠ SELECT NAME & POSITION'}
              </button>
            </div>
          </RetroBox>
        </div>
      </div>
    );
  }

  if (gameState === 'highschool') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 p-4">
        <div className="max-w-3xl mx-auto pt-4">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-yellow-300 mb-2" style={{ fontFamily: 'monospace', textShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>
              {playerHSTeam.toUpperCase()}
            </div>
            <div className="text-2xl text-white font-bold" style={{ fontFamily: 'monospace' }}>
              SENIOR SEASON | RECORD: {player.teamRecord.wins}-{player.teamRecord.losses}
            </div>
          </div>
          
          <RetroBox color="yellow">
            <div className="bg-blue-900 p-4 border-4 border-gray-900 mb-4 text-white">
              <h3 className="font-bold text-2xl mb-2" style={{ fontFamily: 'monospace' }}>{player.name} - {player.position}</h3>
              <div style={{ fontFamily: 'monospace' }} className="text-lg">
                <p>HEIGHT: {Math.floor(player.height / 12)}'{player.height % 12}" | WEIGHT: {player.weight} LBS</p>
                <p className="mt-2 text-yellow-300 text-2xl">
                  RATING: {'★'.repeat(player.stars)}{'☆'.repeat(5 - player.stars)} ({player.stars}-STAR)
                </p>
                <p className="text-xl mt-1">OVERALL: {player.overall}</p>
              </div>
            </div>

            <div className="bg-red-200 p-4 border-4 border-red-900 mb-4">
              <p className="font-bold text-lg text-center" style={{ fontFamily: 'monospace' }}>
                ⚠ NO D1 SCHOOLS RECRUITING YOU YET!
              </p>
            </div>

            <h3 className="font-bold mb-3 text-xl" style={{ fontFamily: 'monospace' }}>NEXT GAME:</h3>
            <div className="space-y-3">
              <button
                onClick={() => setGameState('pregame')}
                className="w-full p-5 bg-green-500 hover:bg-green-400 border-4 border-gray-900 font-bold text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)]"
                style={{ fontFamily: 'monospace' }}
              >
                🏈 PLAY NEXT GAME
              </button>
              
              <button
                onClick={() => playHighSchoolSeason('performance')}
                className="w-full p-4 bg-purple-400 hover:bg-purple-300 border-4 border-gray-900 text-left shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)]"
              >
                <div className="font-bold text-xl" style={{ fontFamily: 'monospace' }}>⏭ SKIP TO RECRUITING</div>
                <div className="text-sm font-bold">Sim rest of season and see who's interested</div>
              </button>
            </div>
          </RetroBox>
        </div>
      </div>
    );
  }

  if (gameState === 'pregame') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 p-4">
        <div className="max-w-3xl mx-auto pt-8">
          <RetroBox color="yellow">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4" style={{ fontFamily: 'monospace', textShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>
                🏈 GAME DAY! 🏈
              </div>
              <div className="bg-green-600 text-white p-6 border-4 border-gray-900 mb-4">
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'monospace' }}>
                  {player.level === 'highschool' ? playerHSTeam.toUpperCase() : player.college.toUpperCase()}
                </h2>
                <p className="text-2xl font-bold" style={{ fontFamily: 'monospace' }}>
                  RECORD: {player.teamRecord.wins}-{player.teamRecord.losses}
                </p>
                <p className="text-xl font-bold mt-2" style={{ fontFamily: 'monospace' }}>
                  {player.name} | {player.position} | OVR {player.overall}
                </p>
              </div>
            </div>

            <div className="bg-gray-800 text-white p-4 border-4 border-gray-900 mb-6">
              <p className="text-center text-xl font-bold mb-2" style={{ fontFamily: 'monospace' }}>
                CHOOSE YOUR APPROACH:
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={startPlayingGame}
                className="w-full p-6 bg-green-500 hover:bg-green-400 border-4 border-gray-900 font-bold text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]"
                style={{ fontFamily: 'monospace' }}
              >
                🎮 PLAY THE GAME
              </button>

              <button
                onClick={simGame}
                className="w-full p-6 bg-blue-500 hover:bg-blue-400 border-4 border-gray-900 font-bold text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]"
                style={{ fontFamily: 'monospace' }}
              >
                ⏭ SIM THE GAME
              </button>
            </div>
          </RetroBox>
        </div>
      </div>
    );
  }

  if (gameState === 'playing' && playState) {
    const pos = player.position;
    const isOffense = ['QB', 'RB', 'WR', 'TE', 'OL'].includes(pos);

    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
        <div className="max-w-4xl mx-auto pt-4">
          {/* Scoreboard */}
          <div className="bg-gray-800 border-4 border-yellow-500 p-4 mb-4">
            <div className="grid grid-cols-2 gap-4 text-center text-white" style={{ fontFamily: 'monospace' }}>
              <div>
                <p className="text-lg">YOUR TEAM</p>
                <p className="text-5xl font-bold text-green-400">{gameScore.player}</p>
              </div>
              <div>
                <p className="text-lg">OPPONENT</p>
                <p className="text-5xl font-bold text-red-400">{gameScore.opponent}</p>
              </div>
            </div>
          </div>

          <RetroBox color="blue" className="bg-blue-900 text-white mb-4">
            <div style={{ fontFamily: 'monospace' }}>
              <p className="text-2xl font-bold">PLAY {playState.playNumber}/12</p>
              <p className="text-xl">Down: {playState.down} | Distance: {playState.distance} | Field: {playState.fieldPosition}</p>
              <p className="text-lg mt-2">Play Type: {playState.playType.toUpperCase().replace('_', ' ')}</p>
            </div>
          </RetroBox>

          {/* Player stats */}
          <RetroBox color="green" className="bg-green-900 text-white mb-4">
            <h3 className="text-xl font-bold mb-2" style={{ fontFamily: 'monospace' }}>YOUR STATS TODAY:</h3>
            <div className="grid grid-cols-3 gap-2 text-center" style={{ fontFamily: 'monospace' }}>
              {isOffense ? (
                <>
                  <div className="bg-blue-700 p-2 border-2 border-blue-500">
                    <p className="text-sm">YARDS</p>
                    <p className="text-2xl font-bold">{gameplayState.yards}</p>
                  </div>
                  <div className="bg-yellow-700 p-2 border-2 border-yellow-500">
                    <p className="text-sm">TDs</p>
                    <p className="text-2xl font-bold">{gameplayState.touchdowns}</p>
                  </div>
                  {(['WR', 'TE', 'RB'].includes(pos)) && (
                    <div className="bg-purple-700 p-2 border-2 border-purple-500">
                      <p className="text-sm">CATCHES</p>
                      <p className="text-2xl font-bold">{gameplayState.catches}/{gameplayState.targets}</p>
                    </div>
                  )}
                  {pos === 'OL' && (
                    <div className="bg-purple-700 p-2 border-2 border-purple-500">
                      <p className="text-sm">BLOCKS</p>
                      <p className="text-2xl font-bold">{gameplayState.blocks}</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="bg-red-700 p-2 border-2 border-red-500">
                    <p className="text-sm">TACKLES</p>
                    <p className="text-2xl font-bold">{gameplayState.tackles}</p>
                  </div>
                  <div className="bg-blue-700 p-2 border-2 border-blue-500">
                    <p className="text-sm">SACKS</p>
                    <p className="text-2xl font-bold">{gameplayState.sacks}</p>
                  </div>
                  <div className="bg-yellow-700 p-2 border-2 border-yellow-500">
                    <p className="text-sm">INTs</p>
                    <p className="text-2xl font-bold">{gameplayState.interceptions}</p>
                  </div>
                </>
              )}
            </div>
          </RetroBox>

          {/* Play result */}
          {playState.result && (
            <RetroBox color="yellow" className="bg-yellow-400 mb-4">
              <p className="text-2xl font-bold text-center" style={{ fontFamily: 'monospace' }}>
                {playState.result}
              </p>
            </RetroBox>
          )}

          {/* Action buttons */}
          {!playState.result && (
            <RetroBox color="green">
              <h3 className="text-2xl font-bold mb-4 text-center" style={{ fontFamily: 'monospace' }}>
                CHOOSE YOUR ACTION:
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {pos === 'QB' && playState.playType === 'pass' && (
                  <>
                    <button onClick={() => executePlay('short')} className="p-4 bg-green-500 hover:bg-green-400 border-4 border-gray-900 font-bold text-xl" style={{ fontFamily: 'monospace' }}>SHORT PASS</button>
                    <button onClick={() => executePlay('medium')} className="p-4 bg-blue-500 hover:bg-blue-400 border-4 border-gray-900 font-bold text-xl" style={{ fontFamily: 'monospace' }}>MEDIUM PASS</button>
                    <button onClick={() => executePlay('deep')} className="p-4 bg-purple-500 hover:bg-purple-400 border-4 border-gray-900 font-bold text-xl col-span-2" style={{ fontFamily: 'monospace' }}>DEEP BOMB</button>
                  </>
                )}
                {pos === 'RB' && playState.playType === 'run' && (
                  <>
                    <button onClick={() => executePlay('outside')} className="p-4 bg-green-500 hover:bg-green-400 border-4 border-gray-900 font-bold text-xl" style={{ fontFamily: 'monospace' }}>OUTSIDE RUN</button>
                    <button onClick={() => executePlay('inside')} className="p-4 bg-blue-500 hover:bg-blue-400 border-4 border-gray-900 font-bold text-xl" style={{ fontFamily: 'monospace' }}>INSIDE RUN</button>
                    <button onClick={() => executePlay('power')} className="p-4 bg-red-500 hover:bg-red-400 border-4 border-gray-900 font-bold text-xl col-span-2" style={{ fontFamily: 'monospace' }}>POWER RUN</button>
                  </>
                )}
                {(pos === 'WR' || pos === 'TE' || pos === 'RB') && playState.playType === 'pass' && (
                  <>
                    <button onClick={() => executePlay('route')} className="p-4 bg-green-500 hover:bg-green-400 border-4 border-gray-900 font-bold text-xl col-span-2" style={{ fontFamily: 'monospace' }}>RUN ROUTE</button>
                  </>
                )}
                {(pos === 'WR' || pos === 'TE') && playState.playType === 'run_block' && (
                  <>
                    <button onClick={() => executePlay('block')} className="p-4 bg-orange-500 hover:bg-orange-400 border-4 border-gray-900 font-bold text-xl col-span-2" style={{ fontFamily: 'monospace' }}>BLOCK DOWNFIELD</button>
                  </>
                )}
                {pos === 'OL' && (
                  <>
                    <button onClick={() => executePlay('block')} className="p-4 bg-orange-500 hover:bg-orange-400 border-4 border-gray-900 font-bold text-xl col-span-2" style={{ fontFamily: 'monospace' }}>{playState.playType === 'pass_block' ? 'PASS BLOCK' : 'RUN BLOCK'}</button>
                  </>
                )}
                {!isOffense && playState.playType === 'run_defense' && (
                  <>
                    <button onClick={() => executePlay('pursue')} className="p-4 bg-red-500 hover:bg-red-400 border-4 border-gray-900 font-bold text-xl" style={{ fontFamily: 'monospace' }}>PURSUE</button>
                    <button onClick={() => executePlay('contain')} className="p-4 bg-blue-500 hover:bg-blue-400 border-4 border-gray-900 font-bold text-xl" style={{ fontFamily: 'monospace' }}>CONTAIN</button>
                  </>
                )}
                {!isOffense && playState.playType === 'pass_defense' && (
                  <>
                    <button onClick={() => executePlay('coverage')} className="p-4 bg-purple-500 hover:bg-purple-400 border-4 border-gray-900 font-bold text-xl" style={{ fontFamily: 'monospace' }}>COVERAGE</button>
                    <button onClick={() => executePlay('blitz')} className="p-4 bg-red-500 hover:bg-red-400 border-4 border-gray-900 font-bold text-xl" style={{ fontFamily: 'monospace' }}>BLITZ</button>
                  </>
                )}
              </div>
            </RetroBox>
          )}

          {playState.result && (
            <button
              onClick={nextPlay}
              className="w-full mt-4 p-6 bg-green-500 hover:bg-green-400 border-4 border-gray-900 font-bold text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: 'monospace' }}
            >
              {currentPlay >= 12 ? '✓ END GAME' : '▶ NEXT PLAY'}
            </button>
          )}
        </div>
      </div>
    );
  }

  if (gameState === 'postgame') {
    const won = gameScore.player > gameScore.opponent;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 p-4">
        <div className="max-w-3xl mx-auto pt-8">
          <RetroBox color="yellow">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4" style={{ fontFamily: 'monospace', textShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>
                {won ? '🎉 VICTORY! 🎉' : '😞 DEFEAT 😞'}
              </div>
              <div className={`p-6 border-4 border-gray-900 mb-4 ${won ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'monospace' }}>
                  FINAL: {gameScore.player} - {gameScore.opponent}
                </h2>
                <p className="text-2xl font-bold" style={{ fontFamily: 'monospace' }}>
                  TEAM RECORD: {player.teamRecord.wins}-{player.teamRecord.losses}
                </p>
              </div>
            </div>

            {scoutNotification && (
              <div className="bg-yellow-400 p-4 border-4 border-yellow-600 mb-4">
                <p className="text-xl font-bold text-center" style={{ fontFamily: 'monospace' }}>
                  {scoutNotification}
                </p>
              </div>
            )}

            {playoffStatus && playoffStatus.made && (
              <div className="bg-green-400 p-4 border-4 border-green-600 mb-4">
                <p className="text-2xl font-bold text-center" style={{ fontFamily: 'monospace' }}>
                  {playoffStatus.message}
                </p>
              </div>
            )}

            <button
              onClick={continueToNextGame}
              className="w-full p-6 bg-blue-500 hover:bg-blue-400 border-4 border-gray-900 font-bold text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: 'monospace' }}
            >
              ▶ CONTINUE SEASON
            </button>
          </RetroBox>
        </div>
      </div>
    );
  }

  // Include recruiting, college, practice, and draft screens from previous version
  if (gameState === 'recruiting') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 p-4">
        <div className="max-w-3xl mx-auto pt-4">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-yellow-300 mb-2" style={{ fontFamily: 'monospace', textShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>
              RECRUITING SEASON
            </div>
          </div>
          
          <RetroBox color="yellow">
            <div className="bg-yellow-600 p-4 border-4 border-gray-900 mb-4 text-white">
              <h3 className="font-bold text-2xl mb-2" style={{ fontFamily: 'monospace' }}>SENIOR SEASON FINAL</h3>
              <div style={{ fontFamily: 'monospace' }} className="text-lg">
                <p>TEAM RECORD: {player.teamRecord.wins}-{player.teamRecord.losses}</p>
                <p>HEIGHT: {Math.floor(player.height / 12)}'{player.height % 12}" | WEIGHT: {player.weight} LBS</p>
                <p className="mt-2 text-3xl">
                  {'★'.repeat(player.stars)} {player.stars}-STAR
                </p>
                <p className="text-xl mt-2">OVERALL: {player.overall} | GRADES: {player.grades}/100</p>
              </div>
            </div>

            {recruiterInterested.length === 0 ? (
              <RetroBox color="red" className="bg-red-300 text-center">
                <h3 className="font-bold text-2xl mb-3" style={{ fontFamily: 'monospace' }}>😔 NO D1 OFFERS</h3>
                <p className="mb-4 font-bold">Not enough to attract programs. Journey ends.</p>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-8 py-3 border-4 border-gray-900 font-bold hover:bg-blue-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)]"
                  style={{ fontFamily: 'monospace' }}
                >
                  ↻ TRY AGAIN
                </button>
              </RetroBox>
            ) : (
              <>
                <h3 className="font-bold text-2xl mb-4" style={{ fontFamily: 'monospace' }}>🎓 SCHOLARSHIP OFFERS:</h3>
                <div className="space-y-3">
                  {recruiterInterested.map(college => (
                    <button
                      key={college.name}
                      onClick={() => chooseCollege(college)}
                      className="w-full p-5 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-300 hover:to-blue-400 border-4 border-gray-900 text-left shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)]"
                    >
                      <div className="font-bold text-2xl" style={{ fontFamily: 'monospace' }}>{college.name}</div>
                      <div className="text-lg font-bold">TIER: {college.tier.toUpperCase()}</div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </RetroBox>
        </div>
      </div>
    );
  }

  if (gameState === 'college') {
    const canStart = player.stars >= 4 || player.season >= 3;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-900 to-red-700 p-4">
        <div className="max-w-3xl mx-auto pt-4">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-yellow-300 mb-2" style={{ fontFamily: 'monospace', textShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>
              {player.college.toUpperCase()}
            </div>
            <div className="text-2xl text-white font-bold" style={{ fontFamily: 'monospace' }}>
              YEAR {player.season} OF 4 | RECORD: {player.teamRecord.wins}-{player.teamRecord.losses}
            </div>
          </div>
          
          <RetroBox color="yellow">
            <div className="bg-red-800 p-4 border-4 border-gray-900 mb-4 text-white">
              <h3 className="font-bold text-xl mb-2" style={{ fontFamily: 'monospace' }}>{player.name} | {player.position}</h3>
              <div style={{ fontFamily: 'monospace' }}>
                <p className="text-lg">HEIGHT: {Math.floor(player.height / 12)}'{player.height % 12}" | WEIGHT: {player.weight} LBS</p>
                <p className="text-2xl mt-2">OVERALL: {player.overall} | COACH: {player.coachRelation}/100</p>
                <p className="mt-2 text-lg">GAMES: {player.gamesStarted} | TDs: {player.careerStats.touchdowns} | YDS: {player.careerStats.yards}</p>
              </div>
            </div>

            {!canStart && (
              <div className="bg-yellow-400 p-4 border-4 border-gray-900 mb-4">
                <p className="font-bold text-center text-xl" style={{ fontFamily: 'monospace' }}>
                  ⚠️ {player.stars}-STAR - BACKUP UNTIL YEAR 3
                </p>
              </div>
            )}

            <button
              onClick={checkForGame}
              className="w-full p-6 bg-green-500 hover:bg-green-400 border-4 border-gray-900 font-bold text-2xl mb-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: 'monospace' }}
            >
              ▶ ADVANCE SEASON
            </button>
          </RetroBox>
        </div>
      </div>
    );
  }

  if (gameState === 'practice') {
    const availableSkills = positionAttributes[player.position];
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-900 to-orange-700 p-4">
        <div className="max-w-3xl mx-auto pt-4">
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-yellow-300 mb-2" style={{ fontFamily: 'monospace', textShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>
              PRACTICE & DEVELOPMENT
            </div>
          </div>
          
          <RetroBox color="yellow">
            <div className="bg-orange-200 p-4 border-4 border-gray-900 mb-4">
              <p className="font-bold text-center text-xl" style={{ fontFamily: 'monospace' }}>
                📋 NOT STARTING - DEVELOP YOUR SKILLS
              </p>
            </div>

            <div className="mb-6">
              <h3 className="font-bold text-xl mb-3" style={{ fontFamily: 'monospace' }}>
                SELECT UP TO 3 SKILLS:
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {availableSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => {
                      if (trainingSkills.includes(skill)) {
                        setTrainingSkills(trainingSkills.filter(s => s !== skill));
                      } else if (trainingSkills.length < 3) {
                        setTrainingSkills([...trainingSkills, skill]);
                      }
                    }}
                    className={`p-4 border-4 border-gray-900 font-bold text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] ${
                      trainingSkills.includes(skill)
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    style={{ fontFamily: 'monospace' }}
                    disabled={!trainingSkills.includes(skill) && trainingSkills.length >= 3}
                  >
                    {skill.toUpperCase()}
                    <div className="text-sm mt-1">({player.attributes[skill]})</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={trainSkills}
                disabled={trainingSkills.length === 0}
                className="w-full p-5 bg-green-500 hover:bg-green-400 border-4 border-gray-900 font-bold text-2xl disabled:bg-gray-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]"
                style={{ fontFamily: 'monospace' }}
              >
                💪 TRAIN SKILLS
              </button>

              <button
                onClick={studyHard}
                className="w-full p-5 bg-purple-500 hover:bg-purple-400 border-4 border-gray-900 font-bold text-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]"
                style={{ fontFamily: 'monospace' }}
              >
                📚 STUDY
              </button>
            </div>
          </RetroBox>
        </div>
      </div>
    );
  }

  if (gameState === 'draft') {
    const draftResult = getDraftRound();
    const isUndrafted = draftResult.includes('Undrafted');
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black p-4">
        <div className="max-w-3xl mx-auto pt-8">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold text-yellow-300 mb-2" style={{ fontFamily: 'monospace', textShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>
              🏈 NFL DRAFT 🏈
            </div>
          </div>
          
          <RetroBox color="yellow">
            <div className="bg-gray-800 text-white p-6 border-4 border-gray-900 mb-4">
              <h3 className="font-bold text-2xl mb-3 text-center" style={{ fontFamily: 'monospace' }}>COLLEGE CAREER</h3>
              <div style={{ fontFamily: 'monospace' }} className="text-lg">
                <p className="font-bold text-xl">{player.name} - {player.position}</p>
                <p>{player.college}</p>
                <p className="mt-2">OVERALL: {player.overall}</p>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="bg-green-700 p-2">GAMES: {player.gamesStarted}</div>
                  <div className="bg-blue-700 p-2">TDs: {player.careerStats.touchdowns}</div>
                  <div className="bg-purple-700 p-2">YARDS: {player.careerStats.yards}</div>
                  <div className="bg-red-700 p-2">TACKLES: {player.careerStats.tackles}</div>
                </div>
              </div>
            </div>

            <div className={`p-10 border-4 border-gray-900 text-center shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] ${
              isUndrafted ? 'bg-red-400' : 'bg-green-400'
            }`}>
              <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'monospace' }}>
                {isUndrafted ? '😔' : '🎉'} {draftResult}
              </h2>
              <p className="text-xl font-bold" style={{ fontFamily: 'monospace' }}>
                {isUndrafted ? 'UNDRAFTED FREE AGENT' : 'WELCOME TO THE NFL!'}
              </p>
            </div>

            <button
              onClick={() => window.location.reload()}
              className="w-full mt-6 bg-blue-600 text-white py-6 border-4 border-gray-900 font-bold text-2xl hover:bg-blue-500 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: 'monospace' }}
            >
              ↻ PLAY AGAIN
            </button>
          </RetroBox>
        </div>
      </div>
    );
  }

  return <div>Game state: {gameState}</div>;
}

