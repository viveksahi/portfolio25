const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 600;

// Player character
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    width: 32,
    height: 32,
    speed: 4,
    direction: 'down',
    moving: false
};

// Movement state
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false
};

// Create character sprite
const characterSprite = new Image();
characterSprite.src = 'character.png';

// Handle keyboard input
window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
        player.moving = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
        player.moving = false;
    }
});

// Update player position
function updatePlayer() {
    if (keys.ArrowUp) {
        player.y = Math.max(0, player.y - player.speed);
        player.direction = 'up';
    }
    if (keys.ArrowDown) {
        player.y = Math.min(canvas.height - player.height, player.y + player.speed);
        player.direction = 'down';
    }
    if (keys.ArrowLeft) {
        player.x = Math.max(0, player.x - player.speed);
        player.direction = 'left';
    }
    if (keys.ArrowRight) {
        player.x = Math.min(canvas.width - player.width, player.x + player.speed);
        player.direction = 'right';
    }
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#7CAA2D';  // Retro green background like old GameBoy
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw player character (temporary rectangle until sprite is loaded)
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x, player.y, player.width, player.height);

    // Add retro-style text
    ctx.font = "16px 'Press Start 2P', monospace";
    ctx.fillStyle = '#000000';
    ctx.fillText('Welcome to My Portfolio!', 20, 30);
}

// Game loop
function gameLoop() {
    updatePlayer();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 