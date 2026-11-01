// ====================================================
// FOREX RUNNER - CANDLESTICK DODGE GAME ENGINE
// ====================================================

document.addEventListener('DOMContentLoaded', () => {

  // 1. ELEMEN UI & CANVAS
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  
  const startBtn = document.getElementById('startBtn');
  const startOverlay = document.getElementById('startOverlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlaySub = document.getElementById('overlaySub');
  const scoreText = document.getElementById('scoreText');
  const athText = document.getElementById('athText');
  const soundBtn = document.getElementById('soundBtn');

  // 2. VARIABEL GAME STATE
  let isRunning = false;
  let isSoundOn = true;
  let score = 0;
  let ath = parseFloat(localStorage.getItem('forex_runner_ath')) || 0;
  let animationFrameId = null;

  // Render ATH Awal
  athText.innerText = `$${ath.toFixed(2)}`;

  // 3. GAME OBJECTS
  const player = {
    x: 60,
    y: 250,
    radius: 6,
    velocity: 0,
    gravity: 0.35,
    jumpStrength: -6.5,
    isHolding: false
  };

  let candles = [];
  let frameCount = 0;
  let gameSpeed = 2.5;

  // 4. LOGIKA UTAMA: START GAME (FIX MACET HIT/TOUCH)
  function startGame() {
    if (isRunning) return;

    // Reset State
    isRunning = true;
    score = 0;
    gameSpeed = 2.5;
    player.y = canvas.height / 2;
    player.velocity = 0;
    candles = [];
    frameCount = 0;
    scoreText.innerText = `$0.00`;

    // Sembunyikan Overlay
    startOverlay.style.display = 'none';

    // Cancel Frame Lama Jika Ada
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    // Run Game Loop
    gameLoop();
  }

  // 5. EVENT LISTENERS TOMBOL START (DUAL LISTEN: CLICK & TOUCH)
  if (startBtn) {
    const triggerStart = (e) => {
      e.preventDefault();
      e.stopPropagation();
      startGame();
    };

    startBtn.addEventListener('click', triggerStart);
    startBtn.addEventListener('touchstart', triggerStart, { passive: false });
  }

  // 6. CONTROL INPUT (TOUCH HP & KEYBOARD SPACE)
  function pressAction() {
    if (!isRunning) return;
    player.velocity = player.jumpStrength;
    player.isHolding = true;
  }

  function releaseAction() {
    player.isHolding = false;
  }

  // Touch HP Canvas
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!isRunning) startGame();
    else pressAction();
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    releaseAction();
  });

  // Keyboard Desktop
  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (!isRunning && startOverlay.style.display !== 'none') {
        startGame();
      } else {
        pressAction();
      }
    }
  });

  window.addEventListener('keyup', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      releaseAction();
    }
  });

  // Sound Toggle Button
  soundBtn.addEventListener('click', () => {
    isSoundOn = !isSoundOn;
    soundBtn.innerText = isSoundOn ? '🔊' : '🔇';
  });

  // 7. GAME LOOP & ANIMATION
  function gameLoop() {
    if (!isRunning) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;

    // Spawning Candlestick Obstacles
    if (frameCount % 90 === 0) {
      spawnCandle();
    }

    // Update & Draw Player
    player.velocity += player.gravity;
    player.y += player.velocity;

    // Batas Layar Atas & Bawah
    if (player.y < player.radius) player.y = player.radius;
    if (player.y > canvas.height - player.radius) {
      gameOver('MARGIN CALL! (Hit Bottom)');
      return;
    }

    // Gambar Line / Trail Player
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#10b981';
    ctx.fill();
    ctx.shadowBlur = 0; // Reset Shadow

    // Update & Draw Candlesticks
    for (let i = candles.length - 1; i >= 0; i--) {
      let c = candles[i];
      c.x -= gameSpeed;

      // Draw Wicks & Body
      ctx.fillStyle = c.type === 'bear' ? '#ef4444' : '#10b981';
      ctx.fillRect(c.x + c.width / 2 - 1, c.topWickY, 2, c.bottomWickY - c.topWickY); // Wick
      ctx.fillRect(c.x, c.y, c.width, c.height); // Body

      // Collision Detection
      if (
        player.x + player.radius > c.x &&
        player.x - player.radius < c.x + c.width &&
        player.y + player.radius > c.y &&
        player.y - player.radius < c.y + c.height
      ) {
        if (c.type === 'bear') {
          gameOver('MARGIN CALL! (Hit Bearish Candle)');
          return;
        } else if (!c.collected) {
          c.collected = true;
          score += 10.5;
          scoreText.innerText = `$${score.toFixed(2)}`;
        }
      }

      // Remove Offscreen
      if (c.x + c.width < 0) {
        candles.splice(i, 1);
        score += 1.0; // Point pass
        scoreText.innerText = `$${score.toFixed(2)}`;
      }
    }

    // Difficulty Increment
    if (frameCount % 300 === 0) gameSpeed += 0.2;

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // 8. SPAWN CANDLESTICK LOGIC
  function spawnCandle() {
    const candleWidth = 24;
    const isBear = Math.random() > 0.35; // 65% Merah (Obstacle), 35% Hijau (Profit)
    const candleHeight = Math.floor(Math.random() * 150) + 60;
    const yPos = Math.random() * (canvas.height - candleHeight - 40) + 20;

    candles.push({
      x: canvas.width,
      y: yPos,
      width: candleWidth,
      height: candleHeight,
      topWickY: Math.max(0, yPos - 20),
      bottomWickY: Math.min(canvas.height, yPos + candleHeight + 20),
      type: isBear ? 'bear' : 'bull',
      collected: false
    });
  }

  // 9. GAME OVER HANDLER
  function gameOver(reason) {
    isRunning = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    // Update High Score (ATH)
    if (score > ath) {
      ath = score;
      localStorage.setItem('forex_runner_ath', ath);
      athText.innerText = `$${ath.toFixed(2)}`;
    }

    // Show Overlay Mode Game Over
    overlayTitle.innerText = 'GAME OVER';
    overlaySub.innerText = `${reason}\nTotal P&L Score: $${score.toFixed(2)}`;
    startBtn.innerText = '🔄 RESTART TRADING';
    startOverlay.style.display = 'flex';
  }

});

// ====================================================
// TEMPAT SCRIPT UPDATE BARU / FITUR TAMBAHAN KAMU
// (Taruh kode baru/pengembangan fitur kamu di bawah baris ini)
// ====================================================
  
