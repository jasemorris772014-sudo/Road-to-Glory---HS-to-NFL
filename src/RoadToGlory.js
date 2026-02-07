import React, { useState, useEffect ,useRef } from 'react';

export default function RoadToGlory() {
  const [gameState, setGameState] = useState('intro');
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  // Game state
  const [quarter, setQuarter] = useState(1);
  const [gameTime, setGameTime] = useState(900); // 15 minutes per quarter
  const [clockRunning, setClockRunning] = useState(false);
  const [possession, setPossession] = useState('player');
  const [down, setDown] = useState(1);
  const [yardsToGo, setYardsToGo] = useState(10);
  const [ballPosition, setBallPosition] = useState(25);
  const [gameScore, setGameScore] = useState({ player: 0, opponent: 0 });
  const [playInProgress, setPlayInProgress] = useState(false);
  const [playStartTime, setPlayStartTime] = useState(null);
  const [stayedInBounds, setStayedInBounds] = useState(true);
  const [isOvertimeState, setIsOvertimeState] = useState(false);
  
  // Player data
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
    level: 'highschool',
    college: null,
    collegeTier: null,
    teamRecord: { wins: 0, losses: 0 },
    gamesStarted: 0,
    careerStats: {
      touchdowns: 0,
      yards: 0,
      tackles: 0,
      interceptions: 0,
      sacks: 0,
      completions: 0,
      attempts: 0,
      receptions: 0
    }
  });

  // Field players
  const [fieldPlayers, setFieldPlayers] = useState({
    ball: { x: 400, y: 550, vx: 0, vy: 0, thrown: false },
    userPlayer: { x: 400, y: 550, vx: 0, vy: 0, hasBall: false, calling: false },
    qb: { x: 400, y: 550 },
    receivers: [],
    defenders: [],
    ballCarrier: null
  });

  // Input state
  const [keys, setKeys] = useState({});
  const [callingForBall, setCallingForBall] = useState(false);

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
    { name: 'Alabama', minStars: 5, tier: 'Elite' },
    { name: 'Ohio State', minStars: 5, tier: 'Elite' },
    { name: 'Georgia', minStars: 5, tier: 'Elite' },
    { name: 'Clemson', minStars: 5, tier: 'Elite' },
    { name: 'Michigan', minStars: 4, tier: 'Top' },
    { name: 'Penn State', minStars: 4, tier: 'Top' },
    { name: 'USC', minStars: 4, tier: 'Top' },
    { name: 'Texas', minStars: 4, tier: 'Top' },
    { name: 'LSU', minStars: 4, tier: 'Top' },
    { name: 'Florida', minStars: 4, tier: 'Top' },
    { name: 'Notre Dame', minStars: 4, tier: 'Top' },
    { name: 'Oklahoma', minStars: 4, tier: 'Top' },
    { name: 'Wisconsin', minStars: 3, tier: 'Good' },
    { name: 'Oregon', minStars: 3, tier: 'Good' },
    { name: 'Miami', minStars: 3, tier: 'Good' },
    { name: 'Florida State', minStars: 3, tier: 'Good' },
    { name: 'Tennessee', minStars: 3, tier: 'Good' },
    { name: 'Auburn', minStars: 3, tier: 'Good' },
    { name: 'Texas A&M', minStars: 3, tier: 'Good' },
    { name: 'Washington', minStars: 3, tier: 'Good' },
    { name: 'Iowa State', minStars: 2, tier: 'Mid' },
    { name: 'Kansas State', minStars: 2, tier: 'Mid' },
    { name: 'Wake Forest', minStars: 2, tier: 'Mid' },
    { name: 'Boston College', minStars: 2, tier: 'Mid' },
    { name: 'Syracuse', minStars: 2, tier: 'Mid' },
    { name: 'Baylor', minStars: 2, tier: 'Mid' },
    { name: 'TCU', minStars: 2, tier: 'Mid' },
    { name: 'Arizona State', minStars: 2, tier: 'Mid' }
  ];

  const hsTeams = ['Lincoln High', 'Washington Prep', 'Roosevelt Academy', 'Jefferson HS'];
  const playerHSTeam = hsTeams[Math.floor(Math.random() * hsTeams.length)];

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

  // Convert field position to canvas Y
  const yardToCanvasY = (yard) => {
    return 500 - (yard * 4); // 500px tall playing area, 4px per yard
  };

  const canvasYToYard = (y) => {
    return (500 - y) / 4;
  };

  // Keyboard handling
  useEffect(() => {
    const handleKeyDown = (e) => {
      setKeys(prev => ({ ...prev, [e.key]: true }));
      
      // M key to call for ball
      if (e.key === 'm' || e.key === 'M') {
        if (['WR', 'TE', 'RB'].includes(player.position) && playInProgress && possession === 'player') {
          setCallingForBall(true);
          const updatedUser = { ...fieldPlayers.userPlayer, calling: true };
          setFieldPlayers(prev => ({ ...prev, userPlayer: updatedUser }));
        }
      }
    };

    const handleKeyUp = (e) => {
      setKeys(prev => ({ ...prev, [e.key]: false }));
      
      if (e.key === 'm' || e.key === 'M') {
        setCallingForBall(false);
        const updatedUser = { ...fieldPlayers.userPlayer, calling: false };
        setFieldPlayers(prev => ({ ...prev, userPlayer: updatedUser }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [player.position, playInProgress, possession, fieldPlayers.userPlayer]);

  // Game clock - only runs during plays
  useEffect(() => {
    if (gameState === 'playing' && clockRunning && playInProgress) {
      const interval = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 0) {
            setClockRunning(false);
            endQuarter();
            return 0;
          }
          return prev - 1;
        });
      }, 1000); // Real-time seconds
      
      return () => clearInterval(interval);
    }
  }, [gameState, clockRunning, playInProgress]);

  const endQuarter = () => {
    setPlayInProgress(false);
    setClockRunning(false);
    
    if (quarter >= 4) {
      if (gameScore.player === gameScore.opponent) {
        // Go to overtime
        setIsOvertimeState(true);
        setQuarter(5);
        setGameTime(300); // 5 minute OT
        setPossession('player');
        setBallPosition(25);
        setDown(1);
        setYardsToGo(10);
      } else {
        endGame();
      }
    } else {
      setQuarter(prev => prev + 1);
      setGameTime(900);
      setPossession(quarter % 2 === 0 ? 'player' : 'opponent');
      setBallPosition(25);
      setDown(1);
      setYardsToGo(10);
    }
  };

  const endGame = () => {
    const won = gameScore.player > gameScore.opponent;
    const newPlayer = { ...player };
    
    newPlayer.gamesStarted += 1;
    if (won) {
      newPlayer.teamRecord.wins += 1;
    } else {
      newPlayer.teamRecord.losses += 1;
    }
    
    setPlayer(newPlayer);
    setGameState('postgame');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize game
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

  // Start actual gameplay
  const startLiveGame = () => {
    setQuarter(1);
    setGameTime(900);
    setPossession('player');
    setDown(1);
    setYardsToGo(10);
    setBallPosition(25);
    setGameScore({ player: 0, opponent: 0 });
    setPlayInProgress(false);
    setClockRunning(false);
    setIsOvertimeState(false);
    
    setupPlayersForPlay();
    setGameState('playing');
  };

  const setupPlayersForPlay = () => {
    const ballY = yardToCanvasY(ballPosition);
    const isOffense = possession === 'player' && ['QB', 'RB', 'WR', 'TE', 'OL'].includes(player.position);
    
    if (possession === 'player') {
      if (player.position === 'QB') {
        setFieldPlayers({
          ball: { x: 400, y: ballY, vx: 0, vy: 0, thrown: false },
          userPlayer: { x: 400, y: ballY, vx: 0, vy: 0, hasBall: true, calling: false },
          qb: { x: 400, y: ballY },
          receivers: [
            { x: 200, y: ballY, vx: 0, vy: -3, route: 'go', targetY: ballY - 200 },
            { x: 350, y: ballY, vx: 1, vy: -2, route: 'slant', targetY: ballY - 150 },
            { x: 600, y: ballY, vx: 0, vy: -2.5, route: 'out', targetY: ballY - 130 }
          ],
          defenders: [
            { x: 190, y: ballY - 40, vx: 0, vy: -2.5 },
            { x: 340, y: ballY - 40, vx: 1, vy: -2 },
            { x: 610, y: ballY - 40, vx: 0, vy: -2.5 },
            { x: 400, y: ballY - 60, vx: 0, vy: -1 }
          ],
          ballCarrier: null
        });
      } else if (player.position === 'RB') {
        setFieldPlayers({
          ball: { x: 400, y: ballY, vx: 0, vy: 0, thrown: false },
          userPlayer: { x: 380, y: ballY + 10, vx: 0, vy: 0, hasBall: false, calling: false },
          qb: { x: 400, y: ballY },
          receivers: [
            { x: 380, y: ballY + 10, vx: 0, vy: 0, isUser: true },
            { x: 250, y: ballY, vx: 0, vy: -3, route: 'go', targetY: ballY - 180 },
            { x: 550, y: ballY, vx: 0, vy: -2, route: 'slant', targetY: ballY - 130 }
          ],
          defenders: [
            { x: 370, y: ballY - 30, vx: 0, vy: -1 },
            { x: 420, y: ballY - 30, vx: 0, vy: -1 },
            { x: 240, y: ballY - 40, vx: 0, vy: -2.5 }
          ],
          ballCarrier: null
        });
      } else if (player.position === 'WR' || player.position === 'TE') {
        setFieldPlayers({
          ball: { x: 400, y: ballY, vx: 0, vy: 0, thrown: false },
          userPlayer: { x: 150, y: ballY, vx: 0, vy: 0, hasBall: false, calling: false },
          qb: { x: 400, y: ballY },
          receivers: [
            { x: 150, y: ballY, vx: 0, vy: 0, isUser: true },
            { x: 650, y: ballY, vx: 0, vy: -3, route: 'go', targetY: ballY - 200 },
            { x: 400, y: ballY + 5, vx: 0, vy: -2, route: 'flat', targetY: ballY - 80 }
          ],
          defenders: [
            { x: 140, y: ballY - 40, vx: 0, vy: -2.5 },
            { x: 660, y: ballY - 40, vx: 0, vy: -2.5 },
            { x: 400, y: ballY - 50, vx: 0, vy: -1.5 }
          ],
          ballCarrier: null
        });
      }
    } else {
      // Defense setup
      const defX = 300 + Math.random() * 200;
      const defY = ballY - 80;
      
      setFieldPlayers({
        ball: { x: 400, y: ballY, vx: 0, vy: 0, thrown: false },
        userPlayer: { x: defX, y: defY, vx: 0, vy: 0, hasBall: false, calling: false },
        qb: { x: 400, y: ballY },
        receivers: [
          { x: 200, y: ballY, vx: 0, vy: -2.5, route: 'go', targetY: ballY - 180 },
          { x: 350, y: ballY, vx: 1, vy: -2, route: 'slant', targetY: ballY - 140 },
          { x: 600, y: ballY, vx: 0, vy: -2, route: 'out', targetY: ballY - 120 }
        ],
        defenders: [
          { x: defX, y: defY, vx: 0, vy: 0, isUser: true },
          { x: 190, y: ballY - 50, vx: 0, vy: -2 },
          { x: 610, y: ballY - 50, vx: 0, vy: -2 }
        ],
        ballCarrier: { x: 400, y: ballY, vx: 0, vy: -2 }
      });
    }
  };

  const startPlay = (playType) => {
    setPlayInProgress(true);
    setClockRunning(true);
    setPlayStartTime(Date.now());
    setStayedInBounds(true);
    
    if (possession === 'opponent') {
      // Defense play
      runDefensePlay();
    } else if (playType === 'run' && (player.position === 'RB' || player.position === 'QB')) {
      runRunPlay();
    }
    // Pass plays handled in game loop
  };

  const runRunPlay = () => {
    const speed = player.attributes['Speed'] || 70;
    const power = player.attributes['Power'] || 70;
    
    const baseYards = Math.floor((speed + power) / 20);
    const bonus = Math.floor(Math.random() * 10);
    const yards = Math.max(0, baseYards + bonus - 5);
    
    setTimeout(() => {
      endPlay(yards, 'run');
    }, 3000);
  };

  const runDefensePlay = () => {
    // Opponent offense - improved AI
    const offenseSuccess = Math.random() < 0.68; // 68% success rate
    
    setTimeout(() => {
      if (offenseSuccess) {
        const playType = Math.random() > 0.5 ? 'pass' : 'run';
        let yards;
        
        if (playType === 'pass') {
          yards = Math.floor(Math.random() * 20) + 8;
        } else {
          yards = Math.floor(Math.random() * 12) + 3;
        }
        
        // User can make tackles
        const userTackle = Math.random() < ((player.attributes['Tackle'] || 70) / 120);
        if (userTackle) {
          yards = Math.max(0, yards - 5);
          const newPlayer = { ...player };
          newPlayer.careerStats.tackles += 1;
          setPlayer(newPlayer);
        }
        
        endPlay(yards, playType, true);
      } else {
        // Stop/sack
        const newPlayer = { ...player };
        if (Math.random() > 0.7) {
          newPlayer.careerStats.sacks += 1;
        }
        newPlayer.careerStats.tackles += 1;
        setPlayer(newPlayer);
        
        endPlay(0, 'stop', true);
      }
    }, 3000);
  };

  const endPlay = (yards, playType, isOpponentPlay = false) => {
    setPlayInProgress(false);
    
    // Clock runoff for staying in bounds (3 seconds)
    if (stayedInBounds && clockRunning) {
      setGameTime(prev => Math.max(0, prev - 3));
    }
    
    setClockRunning(false);
    
    const newBallPos = ballPosition + (isOpponentPlay ? yards : yards);
    
    // Update stats
    const newPlayer = { ...player };
    if (!isOpponentPlay && playType === 'pass' && player.position === 'QB') {
      newPlayer.careerStats.attempts += 1;
      if (yards > 0) {
        newPlayer.careerStats.completions += 1;
        newPlayer.careerStats.yards += yards;
      }
    } else if (!isOpponentPlay && (playType === 'run' || playType === 'catch')) {
      newPlayer.careerStats.yards += yards;
      if (playType === 'catch') {
        newPlayer.careerStats.receptions += 1;
      }
    }
    
    // Check for touchdown
    if ((isOpponentPlay && newBallPos >= 100) || (!isOpponentPlay && newBallPos >= 100)) {
      if (!isOpponentPlay) {
        newPlayer.careerStats.touchdowns += 1;
        setGameScore(prev => ({ ...prev, player: prev.player + 7 }));
      } else {
        setGameScore(prev => ({ ...prev, opponent: prev.opponent + 7 }));
      }
      
      setPlayer(newPlayer);
      setPossession(isOpponentPlay ? 'player' : 'opponent');
      setBallPosition(25);
      setDown(1);
      setYardsToGo(10);
      
      // Check for overtime sudden death
      if (isOvertimeState && !isOpponentPlay) {
        endGame(); // Player wins in OT
      } else if (isOvertimeState && isOpponentPlay) {
        endGame(); // Opponent wins in OT
      } else {
        setupPlayersForPlay();
      }
      return;
    }
    
    setBallPosition(newBallPos);
    setPlayer(newPlayer);
    
    // Check for first down
    if (yards >= yardsToGo) {
      setDown(1);
      setYardsToGo(10);
    } else {
      setDown(prev => {
        if (prev >= 4) {
          setPossession(isOpponentPlay ? 'player' : 'opponent');
          setBallPosition(100 - newBallPos);
          return 1;
        }
        return prev + 1;
      });
      setYardsToGo(prev => Math.max(prev - yards, 1));
    }
    
    setupPlayersForPlay();
  };

  const attemptFieldGoal = () => {
    setPlayInProgress(true);
    setClockRunning(true);
    
    const distance = 100 - ballPosition + 17;
    const maxDistance = 60;
    const baseChance = 0.9;
    const distancePenalty = Math.max(0, (distance - 30) / maxDistance);
    const successChance = baseChance - distancePenalty;
    
    setTimeout(() => {
      if (Math.random() < successChance) {
        setGameScore(prev => ({ ...prev, player: prev.player + 3 }));
        
        // Check for OT field goal win
        if (isOvertimeState && gameScore.player + 3 > gameScore.opponent) {
          setClockRunning(false);
          setPlayInProgress(false);
          endGame();
          return;
        }
      }
      
      setPossession('opponent');
      setBallPosition(25);
      setDown(1);
      setYardsToGo(10);
      setClockRunning(false);
      setPlayInProgress(false);
      setupPlayersForPlay();
    }, 2000);
  };

  const executePunt = () => {
    setPlayInProgress(true);
    setClockRunning(true);
    
    setTimeout(() => {
      const puntDistance = Math.floor(Math.random() * 20) + 35;
      const newPos = Math.min(100, ballPosition + puntDistance);
      
      setPossession('opponent');
      setBallPosition(100 - newPos);
      setDown(1);
      setYardsToGo(10);
      setClockRunning(false);
      setPlayInProgress(false);
      setupPlayersForPlay();
    }, 2000);
  };

  // Game loop for animations
  useEffect(() => {
    if (gameState !== 'playing' || !playInProgress) return;
    
    const gameLoop = setInterval(() => {
      setFieldPlayers(prev => {
        const updated = { ...prev };
        
        // Move receivers on routes
        updated.receivers = prev.receivers.map(rec => {
          if (rec.isUser) {
            // User-controlled receiver - use arrow keys
            const speed = (player.attributes['Speed'] || 70) / 15;
            let newVx = 0;
            let newVy = 0;
            
            if (keys['ArrowLeft']) newVx = -speed;
            if (keys['ArrowRight']) newVx = speed;
            if (keys['ArrowUp']) newVy = -speed;
            if (keys['ArrowDown']) newVy = speed;
            
            return {
              ...rec,
              x: Math.max(50, Math.min(750, rec.x + newVx)),
              y: Math.max(50, Math.min(550, rec.y + newVy)),
              vx: newVx,
              vy: newVy
            };
          } else {
            // AI receiver running route
            if (Math.abs(rec.y - rec.targetY) > 5) {
              return {
                ...rec,
                x: rec.x + rec.vx,
                y: rec.y + rec.vy
              };
            }
            return rec;
          }
        });
        
        // Move defenders
        updated.defenders = prev.defenders.map(def => {
          if (def.isUser) {
            // User-controlled defender - use arrow keys
            const speed = (player.attributes['Speed'] || 70) / 15;
            let newVx = 0;
            let newVy = 0;
            
            if (keys['ArrowLeft']) newVx = -speed;
            if (keys['ArrowRight']) newVx = speed;
            if (keys['ArrowUp']) newVy = -speed;
            if (keys['ArrowDown']) newVy = speed;
            
            return {
              ...def,
              x: Math.max(50, Math.min(750, def.x + newVx)),
              y: Math.max(50, Math.min(550, def.y + newVy)),
              vx: newVx,
              vy: newVy
            };
          } else {
            // AI defender
            return {
              ...def,
              x: def.x + def.vx,
              y: def.y + def.vy
            };
          }
        });
        
        // Ball carrier movement (opponent offense)
        if (prev.ballCarrier && possession === 'opponent') {
          updated.ballCarrier = {
            ...prev.ballCarrier,
            x: prev.ballCarrier.x + prev.ballCarrier.vx,
            y: prev.ballCarrier.y + prev.ballCarrier.vy
          };
          
          updated.ball = {
            ...prev.ball,
            x: updated.ballCarrier.x,
            y: updated.ballCarrier.y
          };
        }
        
        // Handle QB throwing to calling receiver
        if (player.position !== 'QB' && prev.userPlayer.calling && !prev.ball.thrown && possession === 'player') {
          // QB decides whether to throw (65% if calling)
          if (Math.random() < 0.65) {
            // Throw to user
            const throwSuccess = Math.random() < 0.75; // 75% completion when called
            
            if (throwSuccess) {
              // Ball flies to receiver
              const dx = prev.userPlayer.x - prev.qb.x;
              const dy = prev.userPlayer.y - prev.qb.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              updated.ball = {
                x: prev.userPlayer.x,
                y: prev.userPlayer.y,
                vx: 0,
                vy: 0,
                thrown: true
              };
              
              updated.userPlayer = {
                ...prev.userPlayer,
                hasBall: true,
                calling: false
              };
              
              // End play with catch
              const yards = Math.round(canvasYToYard(prev.qb.y) - canvasYToYard(prev.userPlayer.y));
              setTimeout(() => {
                endPlay(Math.max(0, yards), 'catch');
              }, 500);
            }
          }
        }
        
        return updated;
      });
    }, 50);
    
    return () => clearInterval(gameLoop);
  }, [gameState, playInProgress, keys, player.position, possession, player.attributes]);

  // Canvas rendering
  useEffect(() => {
    if (gameState !== 'playing') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const render = () => {
      // Clear
      ctx.fillStyle = '#2d5016';
      ctx.fillRect(0, 0, 800, 600);
      
      // Draw stands/crowd
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, 800, 80);
      ctx.fillRect(0, 520, 800, 80);
      
      // Fans (simple dots)
      for (let i = 0; i < 50; i++) {
        const x = Math.random() * 800;
        const yTop = Math.random() * 70;
        const yBottom = 530 + Math.random() * 60;
        
        ctx.fillStyle = Math.random() > 0.5 ? '#ff4444' : '#4444ff';
        ctx.beginPath();
        ctx.arc(x, yTop, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(x, yBottom, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Draw yard lines
      for (let yard = 0; yard <= 100; yard += 10) {
        const y = yardToCanvasY(yard);
        if (y < 80 || y > 520) continue;
        
        ctx.strokeStyle = 'white';
        ctx.lineWidth = yard % 10 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(800, y);
        ctx.stroke();
        
        // Yard numbers
        if (yard % 10 === 0 && yard !== 0 && yard !== 100) {
          ctx.fillStyle = 'white';
          ctx.font = 'bold 24px Arial';
          ctx.fillText(yard.toString(), 20, y + 5);
          ctx.fillText(yard.toString(), 740, y + 5);
        }
      }
      
      // Draw players as detailed sprites
      // Defenders (red)
      fieldPlayers.defenders.forEach(def => {
        // Body
        ctx.fillStyle = def.isUser ? '#ff0000' : '#cc3333';
        ctx.beginPath();
        ctx.ellipse(def.x, def.y, def.isUser ? 12 : 9, def.isUser ? 16 : 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Helmet
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(def.x, def.y - (def.isUser ? 10 : 7), def.isUser ? 8 : 6, 0, Math.PI * 2);
        ctx.fill();
        
        // User highlight
        if (def.isUser) {
          ctx.strokeStyle = 'yellow';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(def.x, def.y, 20, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
      
      // Receivers (blue)
      fieldPlayers.receivers.forEach(rec => {
        // Body
        ctx.fillStyle = rec.isUser ? '#0066ff' : '#3399ff';
        ctx.beginPath();
        ctx.ellipse(rec.x, rec.y, rec.isUser ? 12 : 9, rec.isUser ? 16 : 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Helmet
        ctx.fillStyle = '#003399';
        ctx.beginPath();
        ctx.arc(rec.x, rec.y - (rec.isUser ? 10 : 7), rec.isUser ? 8 : 6, 0, Math.PI * 2);
        ctx.fill();
        
        // User highlight
        if (rec.isUser) {
          ctx.strokeStyle = 'yellow';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(rec.x, rec.y, 20, 0, Math.PI * 2);
          ctx.stroke();
          
          // Show "CALLING" indicator
          if (rec.calling || callingForBall) {
            ctx.fillStyle = 'yellow';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('CALLING!', rec.x - 30, rec.y - 30);
          }
        }
      });
      
      // QB (blue)
      if (player.position !== 'QB') {
        ctx.fillStyle = '#3399ff';
        ctx.beginPath();
        ctx.ellipse(fieldPlayers.qb.x, fieldPlayers.qb.y, 9, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#003399';
        ctx.beginPath();
        ctx.arc(fieldPlayers.qb.x, fieldPlayers.qb.y - 7, 6, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // User is QB
        ctx.fillStyle = '#0066ff';
        ctx.beginPath();
        ctx.ellipse(fieldPlayers.userPlayer.x, fieldPlayers.userPlayer.y, 12, 16, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#003399';
        ctx.beginPath();
        ctx.arc(fieldPlayers.userPlayer.x, fieldPlayers.userPlayer.y - 10, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(fieldPlayers.userPlayer.x, fieldPlayers.userPlayer.y, 20, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      // Ball carrier (opponent)
      if (fieldPlayers.ballCarrier && possession === 'opponent') {
        ctx.fillStyle = '#cc3333';
        ctx.beginPath();
        ctx.ellipse(fieldPlayers.ballCarrier.x, fieldPlayers.ballCarrier.y, 9, 12, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#8B0000';
        ctx.beginPath();
        ctx.arc(fieldPlayers.ballCarrier.x, fieldPlayers.ballCarrier.y - 7, 6, 0, Math.PI * 2);
        ctx.fill();
      }
      
      // Ball
      ctx.fillStyle = '#8B4513';
      ctx.strokeStyle = '#654321';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(fieldPlayers.ball.x, fieldPlayers.ball.y, 7, 5, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Laces
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 1;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(fieldPlayers.ball.x + i * 2, fieldPlayers.ball.y - 3);
        ctx.lineTo(fieldPlayers.ball.x + i * 2, fieldPlayers.ball.y + 3);
        ctx.stroke();
      }
      
      // Line of scrimmage
      const losY = yardToCanvasY(ballPosition);
      if (losY >= 80 && losY <= 520) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, losY);
        ctx.lineTo(800, losY);
        ctx.stroke();
      }
      
      // First down line
      const firstDownY = yardToCanvasY(ballPosition + yardsToGo);
      if (firstDownY >= 80 && firstDownY <= 520) {
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(0, firstDownY);
        ctx.lineTo(800, firstDownY);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      animationRef.current = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [gameState, fieldPlayers, ballPosition, yardsToGo, playInProgress, callingForBall, possession]);

  // Handle canvas clicks for QB passing
  const handleCanvasClick = (e) => {
    if (player.position !== 'QB' || playInProgress || possession !== 'player') return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (800 / rect.width);
    const y = (e.clientY - rect.top) * (600 / rect.height);
    
    // Find closest receiver
    let closestReceiver = -1;
    let closestDist = Infinity;
    
    fieldPlayers.receivers.forEach((rec, i) => {
      const dist = Math.sqrt((rec.x - x) ** 2 + (rec.y - y) ** 2);
      if (dist < closestDist && dist < 60) {
        closestDist = dist;
        closestReceiver = i;
      }
    });
    
    if (closestReceiver >= 0) {
      executePassPlay(closestReceiver);
    }
  };

  const executePassPlay = (receiverIndex) => {
    setPlayInProgress(true);
    setClockRunning(true);
    
    const receiver = fieldPlayers.receivers[receiverIndex];
    const defender = fieldPlayers.defenders[receiverIndex] || fieldPlayers.defenders[0];
    
    setTimeout(() => {
      const accuracy = player.attributes['Accuracy'] || 70;
      const distance = Math.abs(receiver.y - fieldPlayers.qb.y);
      const coverage = defender ? Math.abs(receiver.x - defender.x) + Math.abs(receiver.y - defender.y) : 100;
      
      const completionChance = (accuracy / 100) * (coverage / 150) * (100 / (distance / 10));
      const completed = Math.random() < completionChance;
      
      if (completed) {
        const yards = Math.round(canvasYToYard(fieldPlayers.qb.y) - canvasYToYard(receiver.y));
        endPlay(yards, 'pass');
      } else {
        endPlay(0, 'incomplete');
      }
    }, 1500);
  };

  const RetroBox = ({ children, color = 'blue', className = '' }) => (
    <div className={`border-4 border-${color}-900 bg-${color}-100 p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)] ${className}`}>
      {children}
    </div>
  );

  // INTRO
  if (gameState === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-700 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8 pt-8">
            <div className="text-6xl font-bold text-yellow-300 mb-2" style={{ fontFamily: 'monospace', textShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>
              🏈 ROAD TO GLORY
            </div>
            <div className="text-xl text-white font-bold" style={{ fontFamily: 'monospace' }}>
              [ RETRO BOWL CAREER MODE ]
            </div>
          </div>
          
          <RetroBox color="yellow">
            <div className="space-y-6">
              <div>
                <label className="block text-lg font-bold mb-2" style={{ fontFamily: 'monospace' }}>NAME:</label>
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
                <label className="block text-lg font-bold mb-2" style={{ fontFamily: 'monospace' }}>POSITION:</label>
                <div className="grid grid-cols-3 gap-3">
                  {positions.map(pos => (
                    <button
                      key={pos}
                      onClick={() => setPlayer({ ...player, position: pos })}
                      className={`p-4 border-4 border-gray-900 font-bold text-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.8)] ${
                        player.position === pos ? 'bg-green-500 text-white' : 'bg-gray-200'
                      }`}
                      style={{ fontFamily: 'monospace' }}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={startGame}
                disabled={!player.name || !player.position}
                className="w-full bg-green-600 text-white py-5 border-4 border-gray-900 font-bold text-2xl hover:bg-green-500 disabled:bg-gray-500 shadow-[8px_8px_0px_0px_rgba(0,0,0,0.8)]"
                style={{ fontFamily: 'monospace' }}
              >
                START
              </button>
            </div>
          </RetroBox>
        </div>
      </div>
    );
  }

  // HIGH SCHOOL
  if (gameState === 'highschool') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-700 p-4">
        <div className="max-w-3xl mx-auto pt-4">
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-yellow-300 mb-2" style={{ fontFamily: 'monospace', textShadow: '4px 4px 0px rgba(0,0,0,0.8)' }}>
              {playerHSTeam.toUpperCase()}
            </div>
          </div>
          
          <RetroBox color="yellow">
            <button
              onClick={startLiveGame}
              className="w-full p-5 bg-green-500 hover:bg-green-400 border-4 border-gray-900 font-bold text-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,0.8)]"
              style={{ fontFamily: 'monospace' }}
            >
              PLAY GAME
            </button>
          </RetroBox>
        </div>
      </div>
    );
  }

  // PLAYING
  if (gameState === 'playing') {
    const isOffense = possession === 'player' && ['QB', 'RB', 'WR', 'TE', 'OL'].includes(player.position);
    const isDefense = possession === 'opponent' || !isOffense;
    
    return (
      <div className="min-h-screen bg-gray-900 p-4">
        <div className="max-w-5xl mx-auto">
          {/* Scoreboard */}
          <div className="bg-gray-800 border-4 border-yellow-500 p-3 mb-3">
            <div className="grid grid-cols-3 gap-4 text-center text-white" style={{ fontFamily: 'monospace' }}>
              <div>
                <p className="text-4xl font-bold text-green-400">{gameScore.player}</p>
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {isOvertimeState ? 'OT' : `Q${quarter}`} {formatTime(gameTime)}
                </p>
                <p className="text-sm">DOWN {down} | {yardsToGo} YDS | BALL {ballPosition}</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-red-400">{gameScore.opponent}</p>
              </div>
            </div>
          </div>

          {/* Field */}
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            onClick={handleCanvasClick}
            className="border-4 border-white mx-auto block cursor-pointer"
            style={{ maxWidth: '100%', height: 'auto' }}
          />

          {/* Instructions */}
          {!playInProgress && (
            <div className="mt-3 bg-gray-800 border-2 border-white p-2 text-white text-center" style={{ fontFamily: 'monospace' }}>
              {player.position === 'QB' && isOffense && <p>CLICK RECEIVERS TO THROW</p>}
              {['WR', 'TE', 'RB'].includes(player.position) && isOffense && <p>PRESS M TO CALL FOR BALL | ARROW KEYS TO MOVE</p>}
              {isDefense && <p>ARROW KEYS TO MOVE YOUR DEFENDER</p>}
            </div>
          )}

          {/* Controls */}
          {!playInProgress && (
            <div className="mt-4">
              {isOffense && (
                <div className="grid grid-cols-2 gap-3">
                  {(player.position === 'RB' || player.position === 'QB') && (
                    <button
                      onClick={() => startPlay('run')}
                      className="p-4 bg-green-500 hover:bg-green-400 border-4 border-gray-900 font-bold text-xl"
                      style={{ fontFamily: 'monospace' }}
                    >
                      RUN
                    </button>
                  )}
                  {player.position === 'QB' && (
                    <button
                      onClick={() => startPlay('pass')}
                      className="p-4 bg-blue-500 hover:bg-blue-400 border-4 border-gray-900 font-bold text-xl"
                      style={{ fontFamily: 'monospace' }}
                    >
                      PASS
                    </button>
                  )}
                  {down === 4 && (
                    <>
                      <button
                        onClick={attemptFieldGoal}
                        className="p-4 bg-yellow-500 hover:bg-yellow-400 border-4 border-gray-900 font-bold text-xl"
                        style={{ fontFamily: 'monospace' }}
                      >
                        FG
                      </button>
                      <button
                        onClick={executePunt}
                        className="p-4 bg-orange-500 hover:bg-orange-400 border-4 border-gray-900 font-bold text-xl"
                        style={{ fontFamily: 'monospace' }}
                      >
                        PUNT
                      </button>
                    </>
                  )}
                </div>
              )}
              
              {isDefense && possession === 'opponent' && (
                <button
                  onClick={() => startPlay('defense')}
                  className="w-full p-4 bg-red-500 hover:bg-red-400 border-4 border-gray-900 font-bold text-xl"
                  style={{ fontFamily: 'monospace' }}
                >
                  PLAY DEFENSE
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // POSTGAME
  if (gameState === 'postgame') {
    const won = gameScore.player > gameScore.opponent;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-purple-700 p-4">
        <div className="max-w-3xl mx-auto pt-8">
          <RetroBox color="yellow">
            <div className="text-center mb-6">
              <div className="text-5xl mb-4" style={{ fontFamily: 'monospace' }}>
                {won ? '🎉 WIN!' : '😞 LOSS'}
              </div>
              <div className={`p-6 border-4 border-gray-900 ${won ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                <h2 className="text-4xl font-bold" style={{ fontFamily: 'monospace' }}>
                  FINAL: {gameScore.player} - {gameScore.opponent}
                </h2>
                {isOvertimeState && <p className="text-xl mt-2">OVERTIME!</p>}
              </div>
            </div>

            <button
              onClick={() => setGameState('highschool')}
              className="w-full p-6 bg-blue-500 hover:bg-blue-400 border-4 border-gray-900 font-bold text-2xl"
              style={{ fontFamily: 'monospace' }}
            >
              CONTINUE
            </button>
          </RetroBox>
        </div>
      </div>
    );
  }

  return null;
}
