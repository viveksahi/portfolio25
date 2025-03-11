const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size to match viewport
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Initial resize and add event listener for window resize
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game world settings
const WORLD = {
    width: canvas.width * 5,  // 5 times the screen width
    height: canvas.height * 5, // 5 times the screen height
};

// Camera settings
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

// Game objects - positioned relative to screen size for better scaling
const gameObjects = [
    // Trees
    { type: 'tree', x: canvas.width * 0.2, y: canvas.height * 0.2, width: 40, height: 60, color: '#0B5345' },
    { type: 'tree', x: canvas.width * 0.5, y: canvas.height * 0.3, width: 40, height: 60, color: '#0B5345' },
    { type: 'tree', x: canvas.width * 1.2, y: canvas.height * 0.8, width: 40, height: 60, color: '#0B5345' },
    { type: 'tree', x: canvas.width * 1.8, y: canvas.height * 0.5, width: 40, height: 60, color: '#0B5345' },
    { type: 'tree', x: canvas.width * 2.2, y: canvas.height * 1.2, width: 40, height: 60, color: '#0B5345' },
    // Huts
    { type: 'hut', x: canvas.width * 0.8, y: canvas.height * 0.6, width: 80, height: 80, color: '#8B4513' },
    { type: 'hut', x: canvas.width * 1.5, y: canvas.height * 0.9, width: 80, height: 80, color: '#8B4513' },
    { type: 'hut', x: canvas.width * 2.5, y: canvas.height * 1.4, width: 80, height: 80, color: '#8B4513' },
    // Rocks
    { type: 'rock', x: canvas.width * 0.4, y: canvas.height * 0.5, width: 30, height: 30, color: '#707B7C' },
    { type: 'rock', x: canvas.width * 1.3, y: canvas.height * 1.1, width: 30, height: 30, color: '#707B7C' },
    { type: 'rock', x: canvas.width * 2.3, y: canvas.height * 0.7, width: 30, height: 30, color: '#707B7C' }
];

// Player character - start near top-left corner
const player = {
    x: canvas.width * 0.1,  // Start at 10% of screen width
    y: canvas.height * 0.1, // Start at 10% of screen height
    width: 32,
    height: 32,
    speed: 5,
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
    const nextPosition = { x: player.x, y: player.y };

    if (keys.ArrowUp) {
        nextPosition.y = Math.max(0, player.y - player.speed);
        player.direction = 'up';
    }
    if (keys.ArrowDown) {
        nextPosition.y = Math.min(WORLD.height - player.height, player.y + player.speed);
        player.direction = 'down';
    }
    if (keys.ArrowLeft) {
        nextPosition.x = Math.max(0, player.x - player.speed);
        player.direction = 'left';
    }
    if (keys.ArrowRight) {
        nextPosition.x = Math.min(WORLD.width - player.width, player.x + player.speed);
        player.direction = 'right';
    }

    // Check for collisions with game objects
    const willCollide = gameObjects.some(obj => {
        return (nextPosition.x < obj.x + obj.width &&
                nextPosition.x + player.width > obj.x &&
                nextPosition.y < obj.y + obj.height &&
                nextPosition.y + player.height > obj.y);
    });

    if (!willCollide) {
        player.x = nextPosition.x;
        player.y = nextPosition.y;
    }

    // Update camera to follow player
    camera.x = Math.max(0, Math.min(player.x - canvas.width / 2, WORLD.width - canvas.width));
    camera.y = Math.max(0, Math.min(player.y - canvas.height / 2, WORLD.height - canvas.height));
}

// Draw game objects
function drawObject(obj) {
    const screenX = obj.x - camera.x;
    const screenY = obj.y - camera.y;
    
    // Only draw if object is visible on screen
    if (screenX + obj.width >= 0 && 
        screenX <= canvas.width && 
        screenY + obj.height >= 0 && 
        screenY <= canvas.height) {
        
        ctx.fillStyle = obj.color;
        
        if (obj.type === 'tree') {
            // Draw tree trunk
            ctx.fillStyle = '#5D4037';
            ctx.fillRect(screenX + obj.width/4, screenY + obj.height/2, obj.width/2, obj.height/2);
            // Draw tree top
            ctx.fillStyle = obj.color;
            ctx.beginPath();
            ctx.moveTo(screenX, screenY + obj.height/2);
            ctx.lineTo(screenX + obj.width/2, screenY);
            ctx.lineTo(screenX + obj.width, screenY + obj.height/2);
            ctx.fill();
        } else if (obj.type === 'hut') {
            // Draw hut body
            ctx.fillRect(screenX, screenY + obj.height/3, obj.width, obj.height * 2/3);
            // Draw roof
            ctx.beginPath();
            ctx.moveTo(screenX - 10, screenY + obj.height/3);
            ctx.lineTo(screenX + obj.width/2, screenY);
            ctx.lineTo(screenX + obj.width + 10, screenY + obj.height/3);
            ctx.fillStyle = '#8B4513';
            ctx.fill();
        } else {
            ctx.fillRect(screenX, screenY, obj.width, obj.height);
        }
    }
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#7CAA2D';  // Retro green background
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all game objects
    gameObjects.forEach(drawObject);

    // Draw player character relative to camera
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x - camera.x, player.y - camera.y, player.width, player.height);

    // Draw world boundaries
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(-camera.x, -camera.y, WORLD.width, WORLD.height);

    // Draw debug info
    ctx.fillStyle = '#000000';
    ctx.font = '16px Arial';
    ctx.fillText(`Player: (${Math.round(player.x)}, ${Math.round(player.y)})`, 10, 20);
    ctx.fillText(`Camera: (${Math.round(camera.x)}, ${Math.round(camera.y)})`, 10, 40);
    ctx.fillText('Use arrow keys to move', 10, 60);
}

// Game loop
function gameLoop() {
    updatePlayer();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 