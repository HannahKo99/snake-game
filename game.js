/**
 * Neon Tactical Snake
 * Core Game Logic
 */

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Game Constants
const GRID_SIZE = 20;
let cols, rows;

// Game Objects
let snake;
let food;
let input;
let particles;

// Game State
let isPlaying = false;
let score = 0;
let highScore = localStorage.getItem('snakeHighScore') || 0;
let lastTime = 0;
let timeScale = 1.0;
let accumulator = 0;
let baseTickRate = 1000 / 8; // Start at 8 FPS (Slower)
let currentTickRate = baseTickRate;

// Energy & Combo
let energy = 100;
const MAX_ENERGY = 100;
let comboCount = 0;
let comboTimer = 0;

// UI Elements
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('high-score');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const finalScoreEl = document.getElementById('final-score');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const pauseBtn = document.getElementById('pause-btn');
const resumeBtn = document.getElementById('resume-btn');
const pauseScreen = document.getElementById('pause-screen');
const energyFill = document.getElementById('energy-fill');

// Game State
let isPaused = false;
const comboContainer = document.getElementById('combo-container');
const comboCountEl = document.getElementById('combo-count');

// Initialize
function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    startBtn.addEventListener('click', startGame);
    restartBtn.addEventListener('click', startGame);
    resumeBtn.addEventListener('click', togglePause);
    pauseBtn.addEventListener('click', togglePause);

    highScoreEl.textContent = highScore;

    input = new Input();
    particles = new ParticleSystem();

    // 初始化 overlay 顯示狀態
    startScreen.classList.add('active');       // 顯示開始畫面
    pauseScreen.classList.remove('active');    // 隱藏暫停畫面
    gameOverScreen.classList.remove('active'); // 隱藏遊戲結束畫面

    // const isMobile = window.innerWidth <= 768;
    // const pauseBtn = document.getElementById('pause-btn');
    // // 桌機或手機都綁定同一事件
    // pauseBtn.addEventListener('click', () => {
    //     togglePause();
    // });

    const mobileSlowBtn = document.getElementById('mobile-bullet-time-btn');
    if (window.innerWidth <= 768) {
        mobileSlowBtn.addEventListener('mousedown', () => { timeScale = 0.3; });
        mobileSlowBtn.addEventListener('mouseup', () => { timeScale = 1.0; });
        mobileSlowBtn.addEventListener('touchstart', () => { timeScale = 0.3; });
        mobileSlowBtn.addEventListener('touchend', () => { timeScale = 1.0; });
    }



    // Start render loop
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    canvas.width = window.innerWidth - 40;
    canvas.height = window.innerHeight - 40;

    // Align to grid
    canvas.width = Math.floor(canvas.width / GRID_SIZE) * GRID_SIZE;
    canvas.height = Math.floor(canvas.height / GRID_SIZE) * GRID_SIZE;

    cols = canvas.width / GRID_SIZE;
    rows = canvas.height / GRID_SIZE;
}

function startGame() {
    if (isPlaying) return;

    isPlaying = true;
    isPaused = false;
    pauseScreen.classList.add('hidden'); // Ensure pause screen is hidden
    score = 0;
    energy = 100;
    comboCount = 0;
    timeScale = 1.0;
    baseTickRate = 1000 / 8; // Reset to initial speed
    currentTickRate = baseTickRate;
    updateUI();

    // 隱藏所有 overlay
    startScreen.classList.remove('active');
    gameOverScreen.classList.remove('active');
    pauseScreen.classList.remove('active');

    snake = new Snake(GRID_SIZE);
    food = new Food(GRID_SIZE);
    food.spawn(cols, rows, snake.body);
    particles = new ParticleSystem(); // Reset particles
}

function gameOver() {
    isPlaying = false;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('snakeHighScore', highScore);
        highScoreEl.textContent = highScore;
    }
    finalScoreEl.textContent = score;

    gameOverScreen.classList.add('active'); // 顯示遊戲結束畫面

    // Explosion effect at head
    particles.emit(snake.body[0].x * GRID_SIZE, snake.body[0].y * GRID_SIZE, '#f00', 50);
}

function togglePause() {
    if (!isPlaying) return;
    isPaused = !isPaused;

    if (isPaused) {
        pauseScreen.classList.add('active');   // 顯示暫停畫面
    } else {
        pauseScreen.classList.remove('active'); // 隱藏暫停畫面
        lastTime = performance.now();           // 防止時間跳動
    }
}

function gameLoop(timestamp) {
    if (isPaused) {
        requestAnimationFrame(gameLoop);
        return;
    }

    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (isPlaying) {
        // Handle Bullet Time
        if (input.isSpacePressed && energy > 0) {
            timeScale = 0.3;
            energy -= 0.5; // Drain energy
        } else {
            timeScale = 1.0;
            energy = Math.min(MAX_ENERGY, energy + 0.1); // Regen energy
        }

        // Game Logic Update
        accumulator += deltaTime * timeScale;

        // Fixed time step for snake movement
        if (accumulator > currentTickRate) {
            update();
            accumulator -= currentTickRate;
        }

        // Smooth updates (particles, ui)
        particles.update();
        updateCombo(deltaTime);
        updateUI();
    }

    draw();

    requestAnimationFrame(gameLoop);
}

function update() {
    const dir = input.getDirection();
    snake.update(dir);

    // Check Collisions
    if (snake.checkCollision(cols, rows)) {
        gameOver();
        return;
    }

    // Check Food
    if (snake.checkFoodCollision(food.position)) {
        handleEatFood();
    }
}

function handleEatFood() {
    snake.grow();

    // Score & Energy
    let points = 10;
    if (food.type === 'energy') {
        energy = Math.min(MAX_ENERGY, energy + 30);
        points = 20;
    } else if (food.type === 'bonus') {
        points = 50;
    }

    // Combo System
    comboCount++;
    comboTimer = 3000; // 3 seconds to keep combo
    const comboMultiplier = Math.min(5, 1 + Math.floor(comboCount / 5));
    score += points * comboMultiplier;

    // Effects
    particles.emit(
        food.position.x * GRID_SIZE + GRID_SIZE / 2,
        food.position.y * GRID_SIZE + GRID_SIZE / 2,
        food.color,
        20
    );

    // Respawn Food
    food.spawn(cols, rows, snake.body);

    // Increase Speed (Difficulty Progression)
    // Decrease tick rate by 2ms for every food, capped at 30 FPS (approx 33ms)
    baseTickRate = Math.max(1000 / 30, baseTickRate - 2);
    currentTickRate = baseTickRate;
}

function updateCombo(dt) {
    if (comboCount > 0) {
        comboTimer -= dt;
        if (comboTimer <= 0) {
            comboCount = 0;
        }
    }
}

function updateUI() {
    scoreEl.textContent = score;
    energyFill.style.width = `${energy}%`;

    if (comboCount > 1) {
        comboContainer.classList.add('active');
        comboCountEl.textContent = `x${comboCount}`;
    } else {
        comboContainer.classList.remove('active');
    }
}

function draw() {
    // Clear Screen with trail effect
    ctx.fillStyle = 'rgba(10, 10, 18, 0.3)'; // Lower alpha for trail
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw Grid (Optional, can be heavy)
    // ctx.strokeStyle = 'rgba(0, 255, 255, 0.05)';
    // ctx.lineWidth = 1;
    // ... grid drawing logic if needed ...

    if (isPlaying) {
        food.draw(ctx);
        snake.draw(ctx);
        particles.draw(ctx);
    }
}

// Start the game engine
init();
