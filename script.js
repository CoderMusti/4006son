/**
 * ============================================================
 * MOLECULE BUILDER CHALLENGE — script.js
 * ============================================================
 * Sections:
 *   1. CONSTANTS & CONFIG
 *   2. MOLECULE DATA
 *   3. STATE MANAGEMENT
 *   4. PARTICLE BACKGROUND
 *   5. DOM HELPERS
 *   6. SCREEN NAVIGATION
 *   7. WEBCAM SETUP
 *   8. MODEL LOADING
 *   9. PREDICTION LOGIC
 *  10. GAME LOGIC (start / timer / scan / score)
 *  11. UI UPDATES
 *  12. SOUND FX (Web Audio API)
 *  13. EVENT LISTENERS
 * ============================================================
 */

/* ============================================================
   1. CONSTANTS & CONFIG
   ============================================================ */

/** Difficulty settings: time (seconds), required confidence (0–1), bonus multiplier */
const DIFFICULTY_CONFIG = {
  easy:   { time: 120, confidence: 0.75, bonus: 1.0 },
  medium: { time:  75, confidence: 0.80, bonus: 1.5 },
  hard:   { time:  45, confidence: 0.85, bonus: 2.5 },
};

/** Base points awarded for a correct scan */
const BASE_POINTS = 100;

/** After how many seconds remaining does the progress bar turn red */
const TIMER_WARNING_THRESHOLD = 10;


/* ============================================================
   2. MOLECULE DATA
   ============================================================
   Each entry contains display info and an SVG structure.
   The `tmLabel` field must exactly match the class label
   you used in Teachable Machine.
   ============================================================ */
const MOLECULES = [
  {
    id: 'water',
    tmLabel: 'H2O SU',    // must match Teachable Machine class name
    name: 'SU',
    formula: 'H₂O',
    description: 'Two hydrogen atoms bonded to one oxygen atom. Bent geometry, ~104.5° bond angle.',
    buildHint: 'Use 1 red (O) and 2 white (H) balls, 2 short sticks at ~105° angle.',
    color: '#00d4ff',
    svgPath: `
      <circle cx="60" cy="70" r="18" fill="#e74c3c" opacity="0.9"/>
      <circle cx="28" cy="40" r="11" fill="#ecf0f1" opacity="0.9"/>
      <circle cx="92" cy="40" r="11" fill="#ecf0f1" opacity="0.9"/>
      <line x1="44" y1="58" x2="31" y2="46" stroke="#aaa" stroke-width="3"/>
      <line x1="76" y1="58" x2="89" y2="46" stroke="#aaa" stroke-width="3"/>
      <text x="60" y="74" text-anchor="middle" font-size="10" fill="white" font-weight="bold">O</text>
      <text x="28" y="44" text-anchor="middle" font-size="8" fill="#333" font-weight="bold">H</text>
      <text x="92" y="44" text-anchor="middle" font-size="8" fill="#333" font-weight="bold">H</text>
    `,
  },
  {
    id: 'salt',
    tmLabel: 'NaCl Tuz',
    name: 'TUZ',
    formula: 'NaCl',
    description: 'Sodium chloride. Ionic bond between Na⁺ and Cl⁻. Crystal lattice structure.',
    buildHint: 'Use 1 silver (Na) and 1 green (Cl) ball connected by one stick.',
    color: '#00ff9d',
    svgPath: `
      <circle cx="38" cy="60" r="18" fill="#95a5a6" opacity="0.9"/>
      <circle cx="82" cy="60" r="14" fill="#2ecc71" opacity="0.9"/>
      <line x1="56" y1="60" x2="68" y2="60" stroke="#aaa" stroke-width="4"/>
      <text x="38" y="65" text-anchor="middle" font-size="11" fill="white" font-weight="bold">Na</text>
      <text x="82" y="65" text-anchor="middle" font-size="10" fill="white" font-weight="bold">Cl</text>
      <text x="38" y="86" text-anchor="middle" font-size="8" fill="#aaa">+</text>
      <text x="82" y="86" text-anchor="middle" font-size="8" fill="#aaa">−</text>
    `,
  },
  {
    id: 'ammonia',
    tmLabel: 'Nh3 Amonyak',
    name: 'Amonyak',
    formula: 'NH₃',
    description: 'One nitrogen atom bonded to three hydrogen atoms. Trigonal pyramidal shape.',
    buildHint: 'Use 1 blue (N) ball and 3 white (H) balls in a pyramid with 3 sticks.',
    color: '#b44dff',
    svgPath: `
      <circle cx="60" cy="65" r="18" fill="#3498db" opacity="0.9"/>
      <circle cx="28" cy="38" r="11" fill="#ecf0f1" opacity="0.9"/>
      <circle cx="92" cy="38" r="11" fill="#ecf0f1" opacity="0.9"/>
      <circle cx="60" cy="20" r="11" fill="#ecf0f1" opacity="0.9"/>
      <line x1="44" y1="53" x2="32" y2="44" stroke="#aaa" stroke-width="3"/>
      <line x1="76" y1="53" x2="88" y2="44" stroke="#aaa" stroke-width="3"/>
      <line x1="60" y1="47" x2="60" y2="31" stroke="#aaa" stroke-width="3"/>
      <text x="60" y="70" text-anchor="middle" font-size="10" fill="white" font-weight="bold">N</text>
      <text x="28" y="42" text-anchor="middle" font-size="8" fill="#333" font-weight="bold">H</text>
      <text x="92" y="42" text-anchor="middle" font-size="8" fill="#333" font-weight="bold">H</text>
      <text x="60" y="24" text-anchor="middle" font-size="8" fill="#333" font-weight="bold">H</text>
    `,
  },
  {
    id: 'benzene',
    tmLabel: 'C6H6 Benzen',
    name: 'Benzen',
    formula: 'C₆H₆',
    description: 'Six carbon atoms in a hexagonal ring, each bonded to one hydrogen. Aromatic.',
    buildHint: 'Arrange 6 black (C) balls in a hexagon with alternating double bonds + 6 H balls.',
    color: '#f5ff00',
    svgPath: `
      <!-- Hexagon ring -->
      <polygon points="60,10 97,32 97,76 60,98 23,76 23,32"
               fill="none" stroke="#f39c12" stroke-width="3"/>
      <!-- Inner dashed circle for aromaticity -->
      <circle cx="60" cy="54" r="24" fill="none" stroke="#f1c40f" stroke-width="1.5" stroke-dasharray="4 3"/>
      <!-- Carbon atoms -->
      <circle cx="60" cy="14" r="9" fill="#555"/>
      <circle cx="93" cy="34" r="9" fill="#555"/>
      <circle cx="93" cy="72" r="9" fill="#555"/>
      <circle cx="60" cy="94" r="9" fill="#555"/>
      <circle cx="27" cy="72" r="9" fill="#555"/>
      <circle cx="27" cy="34" r="9" fill="#555"/>
      <text x="60" y="18" text-anchor="middle" font-size="7" fill="white">C</text>
      <text x="93" y="38" text-anchor="middle" font-size="7" fill="white">C</text>
      <text x="93" y="76" text-anchor="middle" font-size="7" fill="white">C</text>
      <text x="60" y="98" text-anchor="middle" font-size="7" fill="white">C</text>
      <text x="27" y="76" text-anchor="middle" font-size="7" fill="white">C</text>
      <text x="27" y="38" text-anchor="middle" font-size="7" fill="white">C</text>
    `,
  },
];


/* ============================================================
   3. STATE MANAGEMENT
   ============================================================ */

/** Central game state object – all mutable state lives here */
const state = {
  screen:          'start',   // 'start' | 'game' | 'success' | 'gameover'
  difficulty:      'easy',
  modelUrl:        '',
  model:           null,      // Loaded Teachable Machine model
  modelReady:      false,
  webcamStream:    null,
  predictionLoop:  null,      // requestAnimationFrame ID

  score:           0,
  round:           0,
  targetMolecule:  null,      // Current MOLECULE object
  timerSeconds:    0,
  timerMax:        0,
  timerInterval:   null,
  roundStartTime:  0,         // performance.now() when round started

  lastScanResult:  null,      // { label, confidence }
  isScanning:      false,
};


/* ============================================================
   4. PARTICLE BACKGROUND
   ============================================================ */
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx    = canvas.getContext('2d');
  let particles = [];

  /** Resize canvas to match viewport */
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  /** Create a single particle with random properties */
  function makeParticle() {
    return {
      x:      Math.random() * canvas.width,
      y:      Math.random() * canvas.height,
      r:      Math.random() * 1.5 + 0.3,
      vx:     (Math.random() - 0.5) * 0.3,
      vy:     -Math.random() * 0.4 - 0.1,
      alpha:  Math.random() * 0.5 + 0.1,
      color:  Math.random() > 0.5 ? '#00d4ff' : '#00ff9d',
    };
  }

  // Initialise particle pool
  for (let i = 0; i < 120; i++) particles.push(makeParticle());

  /** Animation loop */
  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.fill();

      p.x += p.vx;
      p.y += p.vy;

      // Recycle when off-screen
      if (p.y < -5 || p.x < -5 || p.x > canvas.width + 5) {
        particles[i] = makeParticle();
        particles[i].y = canvas.height + 5; // start from bottom
      }
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(tick);
  }
  tick();
})();


/* ============================================================
   5. DOM HELPERS
   ============================================================ */

const $ = id => document.getElementById(id);

/** Show/hide an element by toggling 'hidden' class */
function show(el) { el && el.classList.remove('hidden'); }
function hide(el) { el && el.classList.add('hidden'); }

/**
 * Create & launch confetti particles from the center of screen
 * Called on successful molecule match.
 */
function launchConfetti() {
  const colors = ['#00ff9d', '#00d4ff', '#f5ff00', '#b44dff', '#ff3e6c'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left   = `${Math.random() * 100}vw`;
    el.style.top    = `${Math.random() * -10}vh`;
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.width  = `${Math.random() * 8 + 4}px`;
    el.style.height = `${Math.random() * 8 + 4}px`;
    el.style.animationDelay    = `${Math.random() * 0.8}s`;
    el.style.animationDuration = `${Math.random() * 1 + 1}s`;
    document.body.appendChild(el);
    // Remove after animation
    el.addEventListener('animationend', () => el.remove());
  }
}


/* ============================================================
   6. SCREEN NAVIGATION
   ============================================================ */

/**
 * Transition to a named screen.
 * Removes .active from all screens, then applies it to target.
 * @param {string} name - 'start' | 'game' | 'success' | 'gameover'
 */
function goToScreen(name) {
  state.screen = name;
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = $(`screen${name.charAt(0).toUpperCase() + name.slice(1)}`);
  if (target) {
    target.classList.add('active');
    // Force reflow so CSS transition plays
    void target.offsetWidth;
  }
}


/* ============================================================
   7. WEBCAM SETUP
   ============================================================ */

/**
 * Request webcam access and attach stream to <video>.
 * Uses 'environment' facing mode on mobile (back camera),
 * falls back to 'user' (front/selfie) if not available.
 * Returns a promise that resolves when the stream is ready.
 */
async function setupWebcam() {
  const video = $('webcamVideo');

  // Try environment (back camera) first, fall back to any camera
  const constraints = {
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } },
    audio: false,
  };

  try {
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    state.webcamStream = stream;
    video.srcObject   = stream;
    await new Promise(resolve => video.addEventListener('loadedmetadata', resolve, { once: true }));
    return true;
  } catch (err) {
    console.error('Webcam error:', err);
    updateStatus('❌ Webcam not available. Check permissions.', 'fail');
    return false;
  }
}

/** Stop all webcam tracks (cleanup) */
function stopWebcam() {
  if (state.webcamStream) {
    state.webcamStream.getTracks().forEach(t => t.stop());
    state.webcamStream = null;
  }
}


/* ============================================================
   8. MODEL LOADING
   ============================================================ */

/**
 * Load the Teachable Machine image model from the provided URL.
 * Teachable Machine exports:
 *   <base_url>/model.json
 *   <base_url>/metadata.json
 *
 * The tmImage.load() call fetches both files automatically
 * when given the base URL.
 *
 * @param {string} url - base URL (with trailing slash)
 */
async function loadModel(url) {
  setModelStatus('loading', 'Loading model…');
  try {
    // tmImage is available globally from the Teachable Machine script tag
    state.model = await tmImage.load(url + 'model.json', url + 'metadata.json');
    state.modelReady = true;
    setModelStatus('ready', `Model ready (${state.model.getTotalClasses()} classes)`);
    return true;
  } catch (err) {
    console.error('Model load error:', err);
    setModelStatus('error', 'Model failed — check URL');
    return false;
  }
}

/** Update the model status indicator in the predictions panel */
function setModelStatus(status, text) {
  const dot  = $('statusDot');
  const span = $('statusText');
  dot.className  = `status-dot ${status}`;
  span.textContent = text;
}


/* ============================================================
   9. PREDICTION LOGIC
   ============================================================ */

/** Labels shown in the predictions panel (must match Teachable Machine classes) */
const PREDICTION_LABELS = MOLECULES.map(m => m.tmLabel);

/**
 * Build (or rebuild) the prediction list UI in the right panel.
 * Creates one row per class with a name, bar, and percentage.
 */
function buildPredictionUI() {
  const list = $('predictionsList');
  list.innerHTML = '';

  PREDICTION_LABELS.forEach(label => {
    const item = document.createElement('div');
    item.className = 'prediction-item';
    item.id = `pred-${label}`;
    item.innerHTML = `
      <div class="prediction-label-row">
        <span class="prediction-name">${label.toUpperCase()}</span>
        <span class="prediction-pct" id="pct-${label}">0%</span>
      </div>
      <div class="prediction-track">
        <div class="prediction-fill" id="bar-${label}" style="width:0%"></div>
      </div>
    `;
    list.appendChild(item);
  });
}

/**
 * Run one prediction pass on the current webcam frame.
 * Updates the prediction bars in real time.
 * Returns { label, confidence } of the top result.
 *
 * @returns {Promise<{label: string, confidence: number}>}
 */
async function runPrediction() {
  if (!state.model || !state.modelReady) return null;
  const video = $('webcamVideo');
  if (!video || video.readyState < 2) return null;

  // model.predict() accepts a video/canvas/image element
  const predictions = await state.model.predict(video);

  // Find the highest confidence class
  let top = predictions[0];
  predictions.forEach(p => { if (p.probability > top.probability) top = p; });

  // Update the UI bars
  predictions.forEach(p => {
    const pct  = Math.round(p.probability * 100);
    const item = $(`pred-${p.className}`);
    const bar  = $(`bar-${p.className}`);
    const pctEl = $(`pct-${p.className}`);
    if (!item) return;

    if (bar)   bar.style.width = `${pct}%`;
    if (pctEl) pctEl.textContent = `${pct}%`;

    // Apply colour class based on confidence level
    item.classList.remove('high', 'mid', 'low');
    if (pct >= 85)      item.classList.add('high');
    else if (pct >= 50) item.classList.add('mid');
    else                item.classList.add('low');
  });

  return { label: top.className, confidence: top.probability };
}

/**
 * Start a continuous prediction loop using requestAnimationFrame.
 * This updates prediction bars roughly every animation frame (~60fps),
 * but we throttle to ~4fps to reduce CPU usage.
 */
function startPredictionLoop() {
  let lastTime = 0;
  const INTERVAL_MS = 250; // update every 250ms

  async function loop(timestamp) {
    if (timestamp - lastTime >= INTERVAL_MS) {
      lastTime = timestamp;
      if (state.modelReady && state.screen === 'game') {
        const result = await runPrediction();
        if (result) state.lastScanResult = result;
      }
    }
    state.predictionLoop = requestAnimationFrame(loop);
  }

  state.predictionLoop = requestAnimationFrame(loop);
}

/** Cancel the prediction loop */
function stopPredictionLoop() {
  if (state.predictionLoop) {
    cancelAnimationFrame(state.predictionLoop);
    state.predictionLoop = null;
  }
}


/* ============================================================
  10. GAME LOGIC
   ============================================================ */

/** Pick a random molecule different from the current one */
function pickRandomMolecule() {
  const others = MOLECULES.filter(m => m !== state.targetMolecule);
  return others[Math.floor(Math.random() * others.length)];
}

/**
 * Start the game: set difficulty, load model, open webcam,
 * navigate to game screen, begin first round.
 */
async function startGame() {
  const cfg = DIFFICULTY_CONFIG[state.difficulty];
  state.score = 0;
  state.round = 0;

  updateHeader();
  goToScreen('game');
  buildPredictionUI();

  // Setup webcam (non-blocking — we start the round immediately)
  const camOK = await setupWebcam();
  if (!camOK) return;

  // Load model from the URL entered on the start screen
  const DEFAULT_MODEL_URL = 'https://teachablemachine.withgoogle.com/models/TvZEWC4mn/';
  const rawUrl = $('modelUrlInput').value.trim() || DEFAULT_MODEL_URL;
  state.modelUrl = rawUrl.endsWith('/') ? rawUrl : rawUrl + '/';
  await loadModel(state.modelUrl);

  startPredictionLoop();
  startRound();
}

/**
 * Begin a new round: choose target molecule, reset timer, update UI.
 */
function startRound() {
  state.round++;
  state.targetMolecule = pickRandomMolecule();
  state.isScanning     = false;

  const cfg = DIFFICULTY_CONFIG[state.difficulty];
  state.timerSeconds   = cfg.time;
  state.timerMax       = cfg.time;
  state.roundStartTime = performance.now();

  // Update UI
  renderTargetMolecule();
  resetWebcamOverlay();
  updateStatus('Build your molecule and press SCAN when ready.', '');
  updateHeader();
  $('retryBtn').classList.add('hidden');
  $('roundCounter').textContent = `Round ${state.round}`;

  // Start countdown timer
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(tickTimer, 1000);
  updateTimerBar();
}

/** Called every second while round is active */
function tickTimer() {
  state.timerSeconds--;
  updateTimerBar();
  updateHeader();

  if (state.timerSeconds <= 0) {
    clearInterval(state.timerInterval);
    gameOver();
  }
}

/** Update the progress bar and its colour depending on remaining time */
function updateTimerBar() {
  const bar  = $('timerBar');
  const pct  = (state.timerSeconds / state.timerMax) * 100;
  bar.style.width = `${Math.max(0, pct)}%`;
  if (state.timerSeconds <= TIMER_WARNING_THRESHOLD) {
    bar.classList.add('warning');
  } else {
    bar.classList.remove('warning');
  }
}

/**
 * Handle the SCAN button press.
 * 1. Trigger scan-line animation.
 * 2. Capture a still frame from the webcam.
 * 3. Run a prediction on the still frame.
 * 4. Evaluate the result against the target molecule.
 */
async function handleScan() {
  if (state.isScanning || !state.modelReady) return;
  state.isScanning = true;

  const scanBtn  = $('scanBtn');
  const scanLine = $('scanLine');
  const video    = $('webcamVideo');

  // Visual: scanning animation
  scanBtn.classList.add('scanning');
  scanLine.classList.add('scanning');
  updateStatus('Analysing molecule…', 'info');
  playSound('scan');

  // Wait for scan-line animation to complete
  await sleep(600);

  // Capture still frame into off-screen canvas
  const canvas = $('snapshotCanvas');
  canvas.width  = video.videoWidth  || 640;
  canvas.height = video.videoHeight || 480;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

  // Run prediction on the snapshot canvas
  let result = null;
  try {
    const predictions = await state.model.predict(canvas);
    result = predictions.reduce((best, p) =>
      p.probability > best.probability ? p : best, predictions[0]);
  } catch (err) {
    console.error('Prediction error:', err);
  }

  // Evaluate result
  scanBtn.classList.remove('scanning');
  scanLine.classList.remove('scanning');
  state.isScanning = false;

  if (!result) {
    updateStatus('❌ Could not analyse frame. Try again.', 'fail');
    return;
  }

  const cfg = DIFFICULTY_CONFIG[state.difficulty];
  const matched = result.className === state.targetMolecule.tmLabel
               && result.probability >= cfg.confidence;

  if (matched) {
    handleCorrectScan(result);
  } else {
    handleIncorrectScan(result);
  }
}

/**
 * Correct identification: award points, show success screen.
 * Bonus points awarded for speed (time remaining).
 * @param {{ className: string, probability: number }} result
 */
function handleCorrectScan(result) {
  clearInterval(state.timerInterval);

  const cfg   = DIFFICULTY_CONFIG[state.difficulty];
  const base  = BASE_POINTS;
  const speed = Math.round((state.timerSeconds / state.timerMax) * base * cfg.bonus);
  const total = base + speed;

  state.score += total;
  updateHeader();
  playSound('success');
  launchConfetti();

  // Show success overlay on webcam frame
  showWebcamOverlay('success', '✓', 'MATCH CONFIRMED');

  // Populate and show success screen after brief delay
  setTimeout(() => {
    $('successMolecule').textContent = `${state.targetMolecule.name} (${state.targetMolecule.formula})`;
    $('pointsAwarded').textContent   = `+${total} pts`;
    $('bonusInfo').textContent       = speed > 0
      ? `Includes +${speed} speed bonus (${Math.round(result.probability * 100)}% confidence)`
      : `${Math.round(result.probability * 100)}% confidence`;
    goToScreen('success');
  }, 1200);
}

/**
 * Incorrect or low-confidence scan: show retry option.
 * @param {{ className: string, probability: number }} result
 */
function handleIncorrectScan(result) {
  const pct = Math.round(result.probability * 100);

  showWebcamOverlay('fail', '✗', `${result.className.toUpperCase()} (${pct}%)`);
  playSound('fail');

  const cfg = DIFFICULTY_CONFIG[state.difficulty];
  const required = Math.round(cfg.confidence * 100);

  if (result.className !== state.targetMolecule.tmLabel) {
    updateStatus(
      `Detected: ${result.className} (${pct}%). Target is ${state.targetMolecule.name}. Try again!`,
      'fail'
    );
  } else {
    updateStatus(
      `Correct molecule! But only ${pct}% confidence — need ${required}%. Hold it steadier.`,
      'fail'
    );
  }

  show($('retryBtn'));
}

/** Reset webcam overlay (hide it) */
function resetWebcamOverlay() {
  const overlay = $('webcamOverlay');
  overlay.classList.remove('show-success', 'show-fail');
  overlay.innerHTML = '';
  overlay.style.opacity = '0';
}

/**
 * Show a result overlay on the webcam frame.
 * @param {'success'|'fail'} type
 * @param {string} icon
 * @param {string} label
 */
function showWebcamOverlay(type, icon, label) {
  const overlay = $('webcamOverlay');
  overlay.innerHTML = `
    <div class="overlay-icon">${icon}</div>
    <div class="overlay-label" style="color:${type === 'success' ? 'var(--neon-green)' : 'var(--neon-red)'}">${label}</div>
  `;
  overlay.classList.remove('show-success', 'show-fail');
  overlay.classList.add(`show-${type}`);
}

/** End the game (timer ran out) */
function gameOver() {
  clearInterval(state.timerInterval);
  stopPredictionLoop();
  stopWebcam();
  playSound('gameover');

  $('gameoverMolecule').textContent = state.targetMolecule
    ? `You were working on: ${state.targetMolecule.name}`
    : '';
  $('finalScore').textContent = state.score;
  goToScreen('gameover');
}

/** Full reset back to start screen */
function resetToStart() {
  clearInterval(state.timerInterval);
  stopPredictionLoop();
  stopWebcam();
  state.score = 0;
  state.round = 0;
  state.model = null;
  state.modelReady = false;
  updateHeader();
  goToScreen('start');
}


/* ============================================================
  11. UI UPDATES
   ============================================================ */

/** Render the target molecule card in the left panel */
function renderTargetMolecule() {
  const mol = state.targetMolecule;
  if (!mol) return;

  $('moleculeDisplay').innerHTML = `
    <div class="mol-svg-wrap">
      <div class="mol-glow"></div>
      <svg viewBox="0 0 120 110" xmlns="http://www.w3.org/2000/svg">
        ${mol.svgPath}
      </svg>
    </div>
    <div class="mol-name">${mol.name}</div>
    <div class="mol-formula">${mol.formula}</div>
    <div class="mol-description">${mol.description}</div>
    <div class="mol-instructions">🔧 ${mol.buildHint}</div>
  `;
}

/** Update header score, level, timer */
function updateHeader() {
  $('scoreDisplay').textContent = state.score;
  $('levelDisplay').textContent = state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);

  const s = state.timerSeconds;
  const m = Math.floor(s / 60);
  const sec = String(s % 60).padStart(2, '0');
  $('timerDisplay').textContent = `${m}:${sec}`;
}

/**
 * Update the status message bar below the webcam.
 * @param {string} text
 * @param {'success'|'fail'|'info'|''} type
 */
function updateStatus(text, type) {
  const el = $('statusMessage');
  el.textContent = text;
  el.className   = 'status-message ' + (type || '');
}


/* ============================================================
  12. SOUND FX (Web Audio API)
   ============================================================ */

/** Lazy-initialised AudioContext */
let _audioCtx = null;
function getAudioCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return _audioCtx;
}

/**
 * Play a simple synthesised sound effect.
 * No external files needed — pure Web Audio API oscillators.
 * @param {'scan'|'success'|'fail'|'gameover'} type
 */
function playSound(type) {
  try {
    const ctx = getAudioCtx();

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    switch (type) {
      case 'scan':
        // Rising sweep
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(800, now + 0.3);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;

      case 'success':
        // Happy ascending arpeggio
        [523, 659, 784, 1047].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = 'triangle';
          o.frequency.value = freq;
          const t = now + i * 0.1;
          g.gain.setValueAtTime(0.12, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
          o.start(t); o.stop(t + 0.35);
        });
        return; // skip default osc

      case 'fail':
        // Low descending blip
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.3);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.linearRampToValueAtTime(0, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
        break;

      case 'gameover':
        // Descending minor chord
        [440, 370, 294].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g); g.connect(ctx.destination);
          o.type = 'sawtooth';
          o.frequency.value = freq;
          const t = now + i * 0.2;
          g.gain.setValueAtTime(0.1, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
          o.start(t); o.stop(t + 0.6);
        });
        return;
    }
  } catch (e) {
    // Sound is non-critical; silently ignore errors
  }
}

/** Tiny async sleep utility */
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }


/* ============================================================
  13. EVENT LISTENERS
   ============================================================ */

/** ── Difficulty selector ── */
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.difficulty = btn.dataset.diff;
  });
});

/** ── Start button ── */
$('startBtn').addEventListener('click', () => {
  // Brief AudioContext resume for browsers that require user gesture
  try { getAudioCtx().resume(); } catch (_) {}
  startGame();
});

/** ── Scan button ── */
$('scanBtn').addEventListener('click', () => {
  handleScan();
});

/** ── Retry button ── */
$('retryBtn').addEventListener('click', () => {
  resetWebcamOverlay();
  hide($('retryBtn'));
  updateStatus('Build your molecule and press SCAN when ready.', '');
});

/** ── Next molecule button ── */
$('nextMolBtn').addEventListener('click', () => {
  clearInterval(state.timerInterval);
  resetWebcamOverlay();
  startRound();
});

/** ── Continue (after success) ── */
$('continueBtn').addEventListener('click', () => {
  goToScreen('game');
  startRound();
});

/** ── Play again (after game over) ── */
$('playAgainBtn').addEventListener('click', () => {
  resetToStart();
});

/** ── Help / Instructions modal ── */
$('helpBtn').addEventListener('click', () => {
  $('instructionsModal').classList.remove('hidden');
});
$('closeInstructions').addEventListener('click', () => {
  $('instructionsModal').classList.add('hidden');
});
$('instructionsModal').addEventListener('click', (e) => {
  if (e.target === $('instructionsModal')) $('instructionsModal').classList.add('hidden');
});

/** ── Keyboard shortcut: Space = Scan ── */
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space' && state.screen === 'game') {
    e.preventDefault();
    handleScan();
  }
});

/** ── Init header on page load ── */
updateHeader();
