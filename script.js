// ====================================================
// FOREX RUNNER - CANDLESTICK DODGE ENGINE (FIXED START)
// ====================================================

document.addEventListener('DOMContentLoaded', () => {

  // 1. ELEMEN UI & CANVAS
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  
  const startBtn = document.getElementById('startBtn');
  const startOverlay = document.getElementById('startOverlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const overlaySub = document.getElementById('overlaySub');
  const overlayIcon = document.getElementById('overlayIcon');
  const resultBox = document.getElementById('resultBox');
  const finalScore = document.getElementById('finalScore');
  const scoreText = document.getElementById('scoreText');
  const athText = document.getElementById('athText');
  const soundBtn = document.getElementById('soundBtn');

  // 2. STATE GAME
  let isRunning = false;
  let isSoundOn = true;
  let score = 0;
  let ath = parseFloat(localStorage.getItem('forex_runner_ath')) || 0;
  let animationFrameId = null;

  if (athText) athText.innerText = `$${ath.toFixed(2)}`;

  // 3. PLAYER OBJECT
  const player = {
    x: 60,
    y: 250,
    radius: 7,
    velocity: 0,
    gravity: 0.38,
    jumpStrength: -6.8
  };

  let candles = [];
  let frameCount = 0;
  let gameSpeed = 2.6;

  // 4. FUNGSI UTAMA START GAME
  function startGame() {
    if (isRunning) return;

    isRunning = true;
    score = 0;
    gameSpeed = 2.6;
    if (canvas) player.y = canvas.height / 2;
    player.velocity = 0;
    candles = [];
    frameCount = 0;

    if (scoreText) scoreText.innerText = `$0.00`;

    // Sembunyikan Overlay Menu Start
    if (startOverlay) {
      startOverlay.style.display = 'none';
    }

    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    gameLoop();
  }

  // 5. EVENT LISTENER TOMBOL START (AMAN UNTUK HP & PC)
  if (startBtn) {
    const handleStartEvent = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      startGame();
    };

    // Binding Click & Touch secara terpisah tanpa bentrok
    startBtn.onclick = handleStartEvent;
    startBtn.ontouchstart = handleStartEvent;
  }

  // 6. KONTROL IN-GAME (TAP / HOLD LAYAR & SPACE)
  function jump() {
    if (!isRunning) return;
    player.velocity = player.jumpStrength;
  }

  if (canvas) {
    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (!isRunning) startGame();
      else jump();
    }, { passive: false });

    canvas.addEventListener('mousedown', (e) => {
      if (!isRunning) startGame();
      else jump();
    });
  }

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      if (!isRunning) startGame();
      else jump();
    }
  });

  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      isSoundOn = !isSoundOn;
      soundBtn.innerText = isSoundOn ? '🔊' : '🔇';
    });
  }

  // 7. GAME LOOP
  function gameLoop() {
    if (!isRunning || !ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    frameCount++;

    // Spawn Candlesticks
    if (frameCount % 85 === 0) {
      spawnCandle();
    }

    // Update Player
    player.velocity += player.gravity;
    player.y += player.velocity;

    // Batas Atas & Bawah
    if (player.y < player.radius) player.y = player.radius;
    if (player.y > canvas.height - player.radius) {
      gameOver('MARGIN CALL! (Hit Bottom)');
      return;
    }

    // Gambar Player
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#10b981';
    ctx.fill();
    ctx.shadowBlur = 0;

    // Render Candlesticks
    for (let i = candles.length - 1; i >= 0; i--) {
      let c = candles[i];
      c.x -= gameSpeed;

      // Draw Wick & Body
      ctx.fillStyle = c.type === 'bear' ? '#ef4444' : '#10b981';
      ctx.fillRect(c.x + c.width / 2 - 1, c.topWickY, 2, c.bottomWickY - c.topWickY);
      ctx.fillRect(c.x, c.y, c.width, c.height);

      // Tabrakan (Collision Detection)
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
          score += 10.0;
          if (scoreText) scoreText.innerText = `$${score.toFixed(2)}`;
        }
      }

      // Hapus yang keluar layar
      if (c.x + c.width < 0) {
        candles.splice(i, 1);
        score += 1.0;
        if (scoreText) scoreText.innerText = `$${score.toFixed(2)}`;
      }
    }

    if (frameCount % 300 === 0) gameSpeed += 0.2;
    animationFrameId = requestAnimationFrame(gameLoop);
  }

    // 8. SPAWN CANDLE LOGIC (CANDLE ATAP & BAWAH Varian Lengkap)
  function spawnCandle() {
    if (!canvas) return;
    const candleWidth = 26;
    const isBear = Math.random() > 0.35; // 65% Merah, 35% Hijau
    const candleHeight = Math.floor(Math.random() * 150) + 80; // Ukuran candle lebih bervariasi

    // Acak Tipe Posisi: 40% Atap (Gantung), 40% Bawah, 20% Melayang Tengah
    let yPos;
    const posType = Math.random();

    if (posType < 0.4) {
      // 1. CANDLE GANTUNG DARIPADA ATAP (yPos = 0)
      yPos = 0;
    } else if (posType < 0.8) {
      // 2. CANDLE NEMPEL DARI BAWAH
      yPos = canvas.height - candleHeight;
    } else {
      // 3. CANDLE MELAYANG DI TENGAH
      yPos = Math.random() * (canvas.height - candleHeight - 40) + 20;
    }

    candles.push({
      x: canvas.width,
      y: yPos,
      width: candleWidth,
      height: candleHeight,
      topWickY: Math.max(0, yPos - 15),
      bottomWickY: Math.min(canvas.height, yPos + candleHeight + 15),
      type: isBear ? 'bear' : 'bull',
      collected: false
    });
  }
  

  // 9. GAME OVER HANDLER
  function gameOver(reason) {
    isRunning = false;
    if (animationFrameId) cancelAnimationFrame(animationFrameId);

    if (score > ath) {
      ath = score;
      localStorage.setItem('forex_runner_ath', ath);
      if (athText) athText.innerText = `$${ath.toFixed(2)}`;
    }

    if (startOverlay) {
      startOverlay.classList.remove('mode-start');
      startOverlay.classList.add('mode-gameover');
      startOverlay.style.display = 'flex';
    }

    if (overlayIcon) overlayIcon.innerHTML = '<span class="icon-emoji">💥</span>';
    if (overlayTitle) overlayTitle.innerText = 'MARGIN CALL!';
    if (overlaySub) overlaySub.innerText = reason;
    
    if (resultBox && finalScore) {
      resultBox.style.display = 'block';
      finalScore.innerText = `$${score.toFixed(2)}`;
    }

    if (startBtn) startBtn.innerHTML = '<span>🔄 RESTART TRADING</span>';
  }

});
      
