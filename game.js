// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Get canvas and context
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found!');
        return;
    }
    console.log('Canvas found:', canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context!');
        return;
    }
    console.log('Canvas context obtained');

    // Set initial canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    console.log('Canvas size set to:', canvas.width, 'x', canvas.height);

    // Physics constants
    const GRAVITY = 0.6;
    const JUMP_ACCELERATION = -1.0;
    const MIN_JUMP_VELOCITY = -13;
    const MOVE_SPEED = 13;
    const AIR_CONTROL = 0.98;
    const FRICTION = 0.92;
    const TERMINAL_VELOCITY = 12;

    // Shadow settings
    const SHADOW_OFFSET = 8;
    const SHADOW_BLUR = 15;

    // Camera settings
    const camera = {
        x: 0,
        y: 0,
        width: window.innerWidth,
        height: window.innerHeight,
        baseY: 0,
        verticalDeadzone: 200,
        smoothing: 0.1
    };

    // Game world settings
    const WORLD = {
        width: Infinity,
        height: window.innerHeight,
        platformGenerationDistance: window.innerWidth * 5,
        cleanupDistance: window.innerWidth * 10,
        lastPlatformX: 0,
        minPlatformSpacing: 300,
        maxPlatformSpacing: 500,
        platformWidthRange: { min: 200, max: 400 },
        platformHeightRange: { min: 20, max: 20 },
        groundHeight: 40,
        minPlatformY: 80
    };

    // Set canvas size to match viewport
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        
        // Update world height when canvas resizes
        WORLD.height = canvas.height;
        
        // Update ground position
        const ground = platforms.find(p => p.isGround);
        if (ground) {
            ground.y = WORLD.height - WORLD.groundHeight;
            ground.width = canvas.width * 3;  // Update ground width on resize
        }
        
        // Ensure player stays within new bounds
        if (player) {
            player.y = Math.min(player.y, WORLD.height - player.height);
        }
    }

    // Initial platforms
    const platforms = [
        // Ground is special - it moves with the player and is wider than the screen
        { x: 0, y: WORLD.height - WORLD.groundHeight, width: canvas.width * 3, height: WORLD.groundHeight, color: '#666666', isGround: true }
    ];

    // Player character
    const player = {
        x: canvas.width * 0.1,
        y: WORLD.height - 300,
        width: 40,
        height: 40,
        velocityX: 0,
        velocityY: 0,
        isGrounded: false,
        isTouchingCeiling: false,
        color: '#FF4949'  // Brighter red
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
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
            keys[e.key] = true;
        }
    });

    window.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            keys.Space = false;
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

    // Generate initial set of platforms
    function generateInitialPlatforms() {
        // Starting platforms
        const initialPlatforms = [
            { x: canvas.width * 0.2, y: WORLD.height - 120 },
            { x: canvas.width * 0.6, y: WORLD.height - 180 },
            { x: canvas.width * 1.0, y: WORLD.height - 240 },
            { x: canvas.width * 1.4, y: WORLD.height - 180 },
            { x: canvas.width * 1.8, y: WORLD.height - 120 }
        ];

        initialPlatforms.forEach(platform => {
            platforms.push({
                x: platform.x,
                y: platform.y,
                width: 200,
                height: 20,
                color: '#333333',
                isGround: false
            });
        });

        WORLD.lastPlatformX = Math.max(...platforms.map(p => p.x + p.width));
    }

    // Generate a new platform
    function generatePlatform() {
        const spacing = WORLD.minPlatformSpacing + 
                       Math.random() * (WORLD.maxPlatformSpacing - WORLD.minPlatformSpacing);
        
        const x = WORLD.lastPlatformX + spacing;
        const width = WORLD.platformWidthRange.min + 
                     Math.random() * (WORLD.platformWidthRange.max - WORLD.platformWidthRange.min);
        
        // Create varying heights but ensure they're reachable and within screen bounds
        const minY = WORLD.minPlatformY;  // Minimum distance from top
        const maxY = WORLD.height - WORLD.groundHeight - 80;  // Keep some space above ground
        const y = minY + Math.random() * (maxY - minY);
        
        const platform = {
            x: x,
            y: y,
            width: width,
            height: WORLD.platformHeightRange.min,
            color: '#333333',
            isGround: false
        };

        platforms.push(platform);
        WORLD.lastPlatformX = x + width;
    }

    // Update game world
    function updateWorld() {
        // Update ground position to follow player
        const ground = platforms.find(p => p.isGround);
        if (ground) {
            // Keep ground centered on player and wider than screen
            ground.x = Math.floor(player.x / canvas.width) * canvas.width - canvas.width;
            ground.width = canvas.width * 3;  // Ensure ground is always wider than screen
            ground.y = WORLD.height - WORLD.groundHeight;  // Ensure ground is at bottom
        }

        // Generate new platforms if needed
        while (WORLD.lastPlatformX - player.x < WORLD.platformGenerationDistance) {
            generatePlatform();
        }

        // Remove platforms that are far behind the player
        const cleanupX = player.x - WORLD.cleanupDistance;
        for (let i = platforms.length - 1; i >= 0; i--) {
            const platform = platforms[i];
            if (!platform.isGround && platform.x + platform.width < cleanupX) {
                platforms.splice(i, 1);
            }
        }
    }

    // Update player position and physics
    function updatePlayer() {
        // Store previous position for collision resolution
        const previousX = player.x;
        const previousY = player.y;

        // Only allow horizontal movement if not touching ceiling
        if (!player.isTouchingCeiling) {
            if (keys.ArrowLeft) {
                const acceleration = player.isGrounded ? MOVE_SPEED : MOVE_SPEED * AIR_CONTROL;
                player.velocityX = -acceleration;
            } else if (keys.ArrowRight) {
                const acceleration = player.isGrounded ? MOVE_SPEED : MOVE_SPEED * AIR_CONTROL;
                player.velocityX = acceleration;
            } else {
                player.velocityX *= FRICTION;
            }
        } else {
            // Stop horizontal movement when touching ceiling
            player.velocityX = 0;
        }

        // Apply gradual upward acceleration while space is held
        if (keys.Space && !player.isTouchingCeiling) {
            player.velocityY = Math.max(player.velocityY + JUMP_ACCELERATION, MIN_JUMP_VELOCITY);
        }

        // Apply gravity (always active but countered by jump acceleration when space is held)
        player.velocityY = Math.min(player.velocityY + GRAVITY, TERMINAL_VELOCITY);

        // Update position
        player.x += player.velocityX;
        player.y += player.velocityY;

        // Check world boundaries
        player.x = Math.max(0, Math.min(player.x, WORLD.width - player.width));

        // Reset states
        player.isGrounded = false;
        player.isTouchingCeiling = false;

        // Check platform collisions
        platforms.forEach(platform => {
            if (checkCollision(player, platform)) {
                // Determine the collision side based on previous position
                const wasAbove = previousY + player.height <= platform.y;
                const wasBelow = previousY >= platform.y + platform.height;
                const wasLeft = previousX + player.width <= platform.x;
                const wasRight = previousX >= platform.x + platform.width;

                if (wasBelow) {
                    // Bottom collision (hitting head)
                    player.y = platform.y + platform.height;
                    player.velocityY = 0;
                    player.velocityX = 0;  // Stop horizontal movement
                    player.x = previousX;   // Maintain previous X position
                    player.isTouchingCeiling = true;
                } else if (wasAbove) {
                    // Top collision (landing)
                    player.y = platform.y - player.height;
                    player.velocityY = 0;
                    player.isGrounded = true;
                } else if (wasLeft) {
                    // Left side collision
                    player.x = platform.x - player.width;
                    player.velocityX = 0;
                } else if (wasRight) {
                    // Right side collision
                    player.x = platform.x + platform.width;
                    player.velocityX = 0;
                }
            }
        });

        // Constrain player to world height with some padding at top
        player.y = Math.max(0, Math.min(player.y, WORLD.height - player.height));
        
        // If player falls below ground level, reset to ground
        if (player.y > WORLD.height - player.height - WORLD.groundHeight) {
            player.y = WORLD.height - player.height - WORLD.groundHeight;
            player.velocityY = 0;
            player.isGrounded = true;
        }

        // Update world after player position is updated
        updateWorld();

        // Update camera with smoother following and vertical deadzone
        const targetX = Math.max(0, Math.min(player.x - canvas.width / 2, WORLD.width - canvas.width));
        
        // Only move camera vertically if player is outside the deadzone and within world bounds
        const screenCenterY = camera.y + canvas.height / 2;
        const playerDistanceFromCenter = player.y - screenCenterY;
        
        let targetY = camera.y;
        if (Math.abs(playerDistanceFromCenter) > camera.verticalDeadzone) {
            const targetPlayerY = player.y - canvas.height / 2;
            targetY = Math.max(0, Math.min(targetPlayerY, WORLD.height - canvas.height));
        }
        
        // Smooth camera movement
        camera.x += (targetX - camera.x) * camera.smoothing;
        camera.y += (targetY - camera.y) * camera.smoothing;
    }

    // Draw game
    function draw() {
        // Clear canvas with a lighter background
        ctx.fillStyle = '#2C2C2C';  // Slightly lighter background
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

        // Draw player with shadow and float effect
        const playerScreenX = player.x - camera.x;
        const playerScreenY = player.y - camera.y;
        
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = SHADOW_BLUR;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = SHADOW_OFFSET;
        
        // Draw the main body
        ctx.fillStyle = player.color;
        ctx.fillRect(playerScreenX, playerScreenY, player.width, player.height);
        
        // Draw float effect when moving upward and not touching ceiling
        if (player.velocityY < 0 && !player.isTouchingCeiling) {
            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            ctx.shadowBlur = 20;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            const glowHeight = Math.min(10, Math.abs(player.velocityY) * 2);
            ctx.fillRect(
                playerScreenX,
                playerScreenY + player.height,
                player.width,
                glowHeight
            );
        }
        
        ctx.restore();

        // Draw controls
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('Left/Right Arrows to move, Hold SPACE to jump', 20, 40);
    }

    // Game loop
    function gameLoop() {
        updatePlayer();
        draw();
        requestAnimationFrame(gameLoop);
    }

    // Initial resize and add event listener for window resize
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();  // Initial resize

    // Start the game
    console.log('Starting game');
    generateInitialPlatforms();
    gameLoop();
}); 