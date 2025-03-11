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

// Physics constants
const GRAVITY = 0.4;
const MIN_JUMP_FORCE = -10;
const MAX_JUMP_FORCE = -18;
const JUMP_CHARGE_RATE = 0.5;
const MOVE_SPEED = 4;
const FRICTION = 0.8;

// Game world settings
const WORLD = {
    width: canvas.width * 3,
    height: canvas.height * 2,
};

// Camera settings
const camera = {
    x: 0,
    y: 0,
    width: canvas.width,
    height: canvas.height
};

// Shadow settings
const SHADOW_OFFSET = 8;
const SHADOW_BLUR = 15;

// Platforms - positioned relative to screen size with adjusted heights
const platforms = [
    // Ground
    { x: 0, y: WORLD.height - 40, width: WORLD.width, height: 40, color: '#333333' },
    // Starting platforms - heights reduced and more evenly spaced
    { x: canvas.width * 0.2, y: WORLD.height - 120, width: 200, height: 20, color: '#333333' },
    { x: canvas.width * 0.6, y: WORLD.height - 180, width: 200, height: 20, color: '#333333' },
    { x: canvas.width * 1.0, y: WORLD.height - 240, width: 200, height: 20, color: '#333333' },
    { x: canvas.width * 1.4, y: WORLD.height - 180, width: 200, height: 20, color: '#333333' },
    { x: canvas.width * 1.8, y: WORLD.height - 120, width: 200, height: 20, color: '#333333' },
    // Higher platforms - heights reduced and more evenly spaced
    { x: canvas.width * 0.4, y: WORLD.height - 300, width: 150, height: 20, color: '#333333' },
    { x: canvas.width * 0.8, y: WORLD.height - 360, width: 150, height: 20, color: '#333333' },
    { x: canvas.width * 1.2, y: WORLD.height - 300, width: 150, height: 20, color: '#333333' },
    { x: canvas.width * 1.6, y: WORLD.height - 240, width: 150, height: 20, color: '#333333' }
];

// Player character - Thomas
const player = {
    x: canvas.width * 0.1,
    y: WORLD.height - 300,
    width: 40,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    isGrounded: false,
    jumpCharge: 0,
    isCharging: false,
    color: '#DE4949',  // Thomas's red color
    name: "Thomas",
    thoughts: [
        "I was alone.",
        "But somehow, that was okay.",
        "The world felt... interesting.",
        "I discovered I could jump higher...",
        "...if I focused my energy longer."
    ],
    currentThought: 0,
    thoughtTimer: 0
};

// Movement state
const keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

// Handle keyboard input
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        keys.Space = true;
        if (player.isGrounded && !player.isCharging) {
            player.isCharging = true;
            player.jumpCharge = 0;  // Reset jump charge when starting
        }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'Space') {
        keys.Space = false;
        if (player.isCharging) {
            // Apply the charged jump
            player.velocityY = Math.min(MAX_JUMP_FORCE, MIN_JUMP_FORCE - player.jumpCharge);
            player.isGrounded = false;
            player.isCharging = false;
        }
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        keys[e.key] = false;
    }
});

// Check collision between two rectangles
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Update player position and physics
function updatePlayer() {
    // Apply horizontal movement
    if (keys.ArrowLeft) {
        player.velocityX = -MOVE_SPEED;
    } else if (keys.ArrowRight) {
        player.velocityX = MOVE_SPEED;
    } else {
        player.velocityX *= FRICTION;
    }

    // Handle jump charging
    if (player.isCharging && player.isGrounded) {
        player.jumpCharge = Math.min(player.jumpCharge + JUMP_CHARGE_RATE, Math.abs(MAX_JUMP_FORCE - MIN_JUMP_FORCE));
        player.velocityY = 0;  // Stay in place while charging
    }

    // Apply gravity if not charging
    if (!player.isCharging) {
        player.velocityY += GRAVITY;
    }

    // Update position
    player.x += player.velocityX;
    player.y += player.velocityY;

    // Check world boundaries
    player.x = Math.max(0, Math.min(player.x, WORLD.width - player.width));

    // Reset grounded state
    player.isGrounded = false;

    // Check platform collisions
    platforms.forEach(platform => {
        if (checkCollision(player, platform)) {
            // Top collision (landing)
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isGrounded = true;
            }
            // Bottom collision (hitting head)
            else if (player.velocityY < 0 && player.y >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Side collisions
            else if (player.velocityX > 0) {
                player.x = platform.x - player.width;
                player.velocityX = 0;
            } else if (player.velocityX < 0) {
                player.x = platform.x + platform.width;
                player.velocityX = 0;
            }
        }
    });

    // Update camera to follow player
    camera.x = Math.max(0, Math.min(player.x - canvas.width / 2, WORLD.width - canvas.width));
    camera.y = Math.max(0, Math.min(player.y - canvas.height / 2, WORLD.height - canvas.height));

    // Update thought timer
    player.thoughtTimer++;
    if (player.thoughtTimer > 180) {
        player.thoughtTimer = 0;
        player.currentThought = (player.currentThought + 1) % player.thoughts.length;
    }
}

// Draw game
function draw() {
    // Clear canvas with a dark background
    ctx.fillStyle = '#1C1C1C';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw platforms with shadows
    platforms.forEach(platform => {
        const screenX = platform.x - camera.x;
        const screenY = platform.y - camera.y;
        
        if (screenX + platform.width >= 0 && 
            screenX <= canvas.width && 
            screenY + platform.height >= 0 && 
            screenY <= canvas.height) {
            
            // Draw platform shadow
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = SHADOW_BLUR;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = SHADOW_OFFSET;
            
            ctx.fillStyle = platform.color;
            ctx.fillRect(screenX, screenY, platform.width, platform.height);
            
            ctx.restore();
        }
    });

    // Draw player (Thomas) with shadow and jump charge indicator
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = SHADOW_BLUR;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = SHADOW_OFFSET;
    
    // Draw the main body
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - camera.x, player.y - camera.y, player.width, player.height);
    
    // Draw jump charge indicator if charging
    if (player.isCharging) {
        const chargePercent = player.jumpCharge / (MAX_JUMP_FORCE - MIN_JUMP_FORCE);
        const glowIntensity = 0.3 + (chargePercent * 0.7);  // Glow gets brighter as charge increases
        
        // Draw glow effect
        ctx.shadowColor = `rgba(255, 255, 255, ${glowIntensity})`;
        ctx.shadowBlur = 20;
        
        // Draw charge bar
        ctx.fillStyle = `rgba(255, 255, 255, ${glowIntensity})`;
        ctx.fillRect(
            player.x - camera.x,
            player.y - camera.y - 10,
            player.width * chargePercent,
            5
        );
    }
    
    ctx.restore();

    // Draw current thought
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '20px Arial';
    ctx.fillText(player.thoughts[player.currentThought], 20, 40);

    // Draw debug info
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.fillText('Left/Right Arrows to move, Hold SPACE to charge jump', 20, 80);
}

// Game loop
function gameLoop() {
    updatePlayer();
    draw();
    requestAnimationFrame(gameLoop);
}

// Start the game
gameLoop(); 