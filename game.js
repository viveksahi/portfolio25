// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded');
    
    // Sound effects
    const SOUNDS = {
        waterSplash: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2DgHlxdH2Df3Nze4N/d3R2fYGAenN1fYGBeHR3foGBfHh5f4GBfXl6gYKBfHh6gYODfXh4gYSGgHh2fYOHh4B4dnyDiYqDd3N5foWLjId7dXZ+hYyPjIZ5cXR9iJGTjoZ2bnF6i5WXk4t5bG53hpOYmJWJeW5udHyIj5OVk4yCdXFydHqBiY+UlZOOhXt1cXJ0eX+FjZKWl5WQhnt1cHFydHl+hYuRlpiYlY+Ee3VwcXJ0eH2DiY+Ul5iYlpCGfHZwcXJ0d3t/ho2Sk5WXl5WQiH52cXFydHd6fYSLkZOVlpeWkYl+d3JycnR2eXyCiY+Sk5SVlZSSin94c3JydHZ4e4GIjpGTlJWVk5GKgHhzcnJ0dnd6gIeNkJKTlJSTkouAeXRycnR2d3l/ho2QkZKTk5KRi4F6dHJydHZ3eX6Fi46QkZKSkZCLgnt1c3N0dnd5fYSLjY+QkZGQj4uCe3Vzc3R2d3l9g4uOj5CQkI+OioJ8dnNzdHZ3eX2Cio2Oj4+Pj46Lg3x2c3N0dnd5fIGJjY6Oj4+OjYuDfXdzc3R2d3h8gYmMjY6Ojo2Mi4N9d3RzdHZ3eHuAiIyNjY2NjYyLhH13dHN0dnd4e4CHi4yNjY2MjIqEfnd0c3R2d3h7gIeLjI2NjYyLioR+d3RzdHZ3eHqAh4qMjI2NjIuKhH53dHR0dnd4eoCHioyMjIyMi4qEfnd0dHR2d3h6gIaKjIyMjIyLioV+eHR0dHZ3eHqAhoqLjIyMjIuKhX54dHR0dnd4eoCGiouMjIyLi4qFfnh1dHR2d3h6f4aKi4yMjIuLioV+eHV0dHZ3eHp/hoqLi4yMi4uKhX54dXR0dnd4eoCGiouMjIyLi4qFfnh1dHR2d3h6f4aKi4uMjIuLioV+eHV0dHZ3eHp/hoqLi4yMi4uKhX54dXV1dnd4en+GiouLjIyLi4qGfnh1dXV2d3h6f4aKi4uMjIuLioZ+eXV1dXZ3eHp/hoqLi4yMi4uKhn55dXV1d3h4en+GiouLjIyLi4qGfnl1dXV3eHh6f4aKi4uMjIuLioZ+eXV1dXd4eHp/hoqLi4yMi4uKhn55dXV1d3h4en+GiouLjIyLi4qGfnl2dXV3eHh6f4aKi4uMjIuLioZ+eXZ2dXd4eHp/hoqLi4yMi4uKhn55dnZ1d3h4en+GiouLjIyLi4qGfnl2dnV3eHh6f4aKi4uMjIuLioZ+eXZ2dXd4eHp/hoqLi4yMi4uKhn55dnZ1d3h4en+GiouLjIyLi4qGfnl2dnV3eHh6f4aKi4uMjIuLioZ+eXZ2dXd4eHp/hoqLi4yMi4uKhn55dnZ1d3h4en+GiouLjIyLi4qGfnl2dnV3eHh6f4aKi4uMjIuLioZ+eXZ2dXd4eHp/hoqLi4yMi4uKhn55dnZ1d3h4en+GiouLjIyLi4qGfnl2dnV3eHh6f4aKi4uMjIuLioZ+eXZ2')  // Water splash sound
    };

    // Configure sounds
    SOUNDS.waterSplash.volume = 0.4;  // Moderate volume for effects
    
    // Get DOM elements
    const canvas = document.getElementById('gameCanvas');
    const startModal = document.getElementById('startModal');
    const startButton = document.getElementById('startButton');

    if (!canvas || !startModal || !startButton) {
        console.error('Required elements not found!');
        return;
    }
    console.log('Elements found');

    // Start button click handler
    startButton.addEventListener('click', function() {
        startModal.style.display = 'none';
        canvas.style.display = 'block';
        startGame();
    });

    function startGame() {
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
        const GRAVITY = 0.35;              // Keep gravity the same for now
        const JUMP_ACCELERATION = -1.05;   // Reduced from -1.5 (70%)
        const MIN_JUMP_VELOCITY = -8.4;    // Reduced from -12 (70%)
        const MOVE_SPEED = 7.0;            // Reduced from 8.4 to 7.0 for better balance
        const AIR_CONTROL = 0.99;          // Keep air control the same
        const FRICTION = 0.92;             // Keep friction the same
        const TERMINAL_VELOCITY = 8.4;     // Reduced from 12 (70%)

        // Shadow settings
        const SHADOW_OFFSET = 8;
        const SHADOW_BLUR = 15;

        // Visual settings
        const COLORS = {
            background: '#1E1E2E',      // Dark background
            platform: '#4A4A5E',        // Platform color
            ground: '#5D5D7D',          // Ground color
            player: '#4488FF',          // Blue player
            fire: '#FF4400',           // Fire color
            fireParticle: '#FF8844',   // Fire particle color
            uiBackground: 'rgba(0, 0, 0, 0.8)',  // Dark UI background
            uiText: '#FFFFFF',          // White text
            distanceMeter: '#FF4400'    // Fire distance meter color
        };

        // Player sprite settings
        const SPRITE = {
            width: 30,
            height: 40,
            scale: 1,
            color: COLORS.player,
            runFrame: 0,
            runFrameCount: 4,
            frameRate: 8
        };

        // Camera settings
        const camera = {
            x: 0,
            y: 0,
            width: window.innerWidth,
            height: window.innerHeight,
            baseY: 0,
            verticalDeadzone: 150,
            smoothing: 0.15
        };

        // Game world settings
        const WORLD = {
            width: Infinity,
            height: window.innerHeight,
            platformGenerationDistance: window.innerWidth * 3,
            cleanupDistance: window.innerWidth * 6,
            lastPlatformX: 0,
            minPlatformSpacing: 150,        // Reduced from 180 for closer platforms
            maxPlatformSpacing: 300,        // Reduced from 350 for more consistent jumps
            platformWidthRange: { min: 150, max: 280 },  // Wider platforms
            platformHeightRange: { min: 20, max: 20 },
            groundHeight: 40,
            minPlatformY: 100              // Lower minimum height for easier jumps
        };

        // Game state
        const GAME_STATE = {
            score: 0,
            waterCans: 0,
            distanceFromFire: 1000,  // Keep initial distance
            fireSpeed: 4,            // Increased from 2 to 4
            fireAcceleration: 0.01,  // Doubled from 0.005 to 0.01
            gameOver: false,
            lastFireUpdate: Date.now()
        };

        // Platform decoration settings
        const DECORATION = {
            waterCanChance: 0.4,    // 40% chance for a platform to have a water can
            waterCanValue: 100,     // Each water can pushes fire back by 100 units
            waterCanSize: 25,       // Size of water can in pixels
        };

        // Fire wall settings
        const FIRE = {
            x: -canvas.width,      // Start at extreme left of screen
            width: 250,
            particles: [],
            maxParticles: 75,
            particleSize: { min: 10, max: 35 },
            particleSpeed: { min: 1.5, max: 4 },
            updateInterval: 16,
            lastUpdate: Date.now(),
            baseSpeed: 4,          // Increased from 2 to 4
            maxSpeed: 7           // Increased from 6 to 7
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
            { 
                x: 0, 
                y: WORLD.height - WORLD.groundHeight, 
                width: canvas.width * 3, 
                height: WORLD.groundHeight, 
                color: COLORS.ground, 
                isGround: true, 
                decorations: [] 
            }
        ];

        // Player character
        const player = {
            x: canvas.width * 0.5,  // Changed from 0.1 to 0.5 to start in center
            y: WORLD.height - 300,
            width: SPRITE.width * SPRITE.scale,
            height: SPRITE.height * SPRITE.scale,
            velocityX: 0,
            velocityY: 0,
            isGrounded: false,
            isTouchingCeiling: false,
            direction: 1,  // 1 for right, -1 for left
            state: 'idle',
            frameIndex: 0,
            frameDelay: SPRITE.frameRate,
            frameCounter: 0
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
                const newPlatform = {
                    x: platform.x,
                    y: platform.y,
                    width: 200,
                    height: 20,
                    color: COLORS.platform,  // Use the new color scheme
                    isGround: false,
                    decorations: []  // Initialize empty decorations array
                };

                // Add water can with 40% chance
                if (Math.random() < DECORATION.waterCanChance) {
                    newPlatform.decorations.push({
                        type: 'waterCan',
                        x: newPlatform.width / 2 - DECORATION.waterCanSize / 2,
                        y: -DECORATION.waterCanSize,
                        width: DECORATION.waterCanSize,
                        height: DECORATION.waterCanSize,
                        collected: false
                    });
                }

                platforms.push(newPlatform);
            });

            // Update the ground platform to use new color scheme
            const ground = platforms.find(p => p.isGround);
            if (ground) {
                ground.color = COLORS.ground;
            }

            WORLD.lastPlatformX = Math.max(...platforms.map(p => p.x + p.width));
        }

        // Generate a new platform
        function generatePlatform() {
            const spacing = WORLD.minPlatformSpacing + 
                           Math.random() * (WORLD.maxPlatformSpacing - WORLD.minPlatformSpacing);
            
            const x = WORLD.lastPlatformX + spacing;
            const width = WORLD.platformWidthRange.min + 
                         Math.random() * (WORLD.platformWidthRange.max - WORLD.platformWidthRange.min);
            
            const minY = WORLD.minPlatformY;
            const maxY = WORLD.height - WORLD.groundHeight - 80;
            const y = minY + Math.random() * (maxY - minY);
            
            const platform = {
                x: x,
                y: y,
                width: width,
                height: WORLD.platformHeightRange.min,
                color: COLORS.platform,
                isGround: false,
                decorations: []
            };

            // Add water can with 40% chance
            if (Math.random() < DECORATION.waterCanChance) {
                platform.decorations.push({
                    type: 'waterCan',
                    x: platform.width / 2 - DECORATION.waterCanSize / 2,
                    y: -DECORATION.waterCanSize,
                    width: DECORATION.waterCanSize,
                    height: DECORATION.waterCanSize,
                    collected: false
                });
            }

            platforms.push(platform);
            WORLD.lastPlatformX = x + width;
        }

        // Check collision with platform decorations
        function checkDecorationCollisions(platform) {
            // Safety check for platforms without decorations array
            if (!platform.decorations) {
                platform.decorations = [];
                return;
            }

            platform.decorations.forEach(decoration => {
                if (!decoration.collected) {
                    const decorationX = platform.x + decoration.x;
                    const decorationY = platform.y + decoration.y;
                    
                    const decorationRect = {
                        x: decorationX,
                        y: decorationY,
                        width: decoration.width,
                        height: decoration.height
                    };

                    if (checkCollision(player, decorationRect)) {
                        decoration.collected = true;
                        
                        if (decoration.type === 'waterCan') {
                            GAME_STATE.waterCans++;
                            GAME_STATE.score += 10;
                            // Play water splash sound
                            SOUNDS.waterSplash.currentTime = 0; // Reset sound to start
                            SOUNDS.waterSplash.play().catch(e => console.log('Audio play failed:', e));
                            // Reset fire position and increase distance by 200 meters
                            FIRE.x = player.x - 1200; // Move fire back by current screen width + extra distance
                            GAME_STATE.distanceFromFire += 200; // Add 200 meters to the distance
                            GAME_STATE.fireSpeed = FIRE.baseSpeed;
                        }
                    }
                }
            });
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

        // Update player animation state
        function updatePlayerAnimation() {
            // Determine player state
            let newState = 'idle';
            
            if (!player.isGrounded) {
                if (player.velocityY < 0) {
                    newState = 'jumping';
                } else {
                    newState = 'falling';
                }
            } else if (Math.abs(player.velocityX) > 0.5) {
                newState = 'running';
            }

            // Update player direction
            if (keys.ArrowLeft) player.direction = -1;
            if (keys.ArrowRight) player.direction = 1;

            // Update animation frame if state changed
            if (newState !== player.state) {
                player.state = newState;
                player.frameIndex = 0;
                player.frameDelay = SPRITE.frameRate;
                player.frameCounter = 0;
            }

            // Update animation frame
            if (player.frameDelay > 0) {
                player.frameCounter++;
                if (player.frameCounter >= player.frameDelay) {
                    player.frameCounter = 0;
                    player.frameIndex = (player.frameIndex + 1) % SPRITE.runFrameCount;
                }
            }
        }

        // Update player position and physics
        function updatePlayer() {
            if (GAME_STATE.gameOver) {
                if (keys.Space) {
                    // Reset game
                    GAME_STATE.gameOver = false;
                    GAME_STATE.score = 0;
                    GAME_STATE.waterCans = 0;
                    GAME_STATE.distanceFromFire = 1000;  // Reset to 1000 meters
                    GAME_STATE.fireSpeed = FIRE.baseSpeed;
                    GAME_STATE.lastFireUpdate = Date.now();
                    player.x = canvas.width * 0.5;
                    player.y = WORLD.height - 300;
                    FIRE.x = player.x - 1200;  // Position fire 1200 pixels behind player
                    platforms.length = 1;
                    generateInitialPlatforms();
                    initFireParticles();
                }
                return;
            }

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
                // Check decorations
                checkDecorationCollisions(platform);
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

            // Update animation state
            updatePlayerAnimation();
        }

        // Update fire particles and position
        function updateFire() {
            const now = Date.now();
            const delta = (now - GAME_STATE.lastFireUpdate) / 16;
            
            if (!GAME_STATE.gameOver) {
                // Accelerate fire speed
                GAME_STATE.fireSpeed = Math.min(
                    GAME_STATE.fireSpeed + GAME_STATE.fireAcceleration * delta,
                    FIRE.maxSpeed
                );
                
                // Move fire forward
                FIRE.x += GAME_STATE.fireSpeed;
                
                // Update distance between player and fire
                GAME_STATE.distanceFromFire = Math.max(0, player.x - (FIRE.x + FIRE.width));
                
                // Check if fire caught the player
                if (GAME_STATE.distanceFromFire <= 0) {
                    GAME_STATE.gameOver = true;
                }
            }
            
            GAME_STATE.lastFireUpdate = now;
            
            // Update particles
            if (now - FIRE.lastUpdate > FIRE.updateInterval) {
                FIRE.particles.forEach(particle => {
                    particle.x += Math.cos(particle.angle) * particle.speed;
                    particle.y += Math.sin(particle.angle) * particle.speed;
                    
                    if (particle.x > FIRE.width || particle.x < 0) {
                        particle.x = Math.random() * FIRE.width;
                    }
                    if (particle.y > WORLD.height || particle.y < 0) {
                        particle.y = Math.random() * WORLD.height;
                    }
                });
                FIRE.lastUpdate = now;
            }
        }

        // Draw player with shadow
        function drawPlayer() {
            const playerScreenX = player.x - camera.x;
            const playerScreenY = player.y - camera.y;

            // Draw player shadow
            ctx.save();
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            
            // Draw teddy bear emoji
            ctx.font = `${player.height}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🧸', 
                playerScreenX + player.width/2,
                playerScreenY + player.height/2
            );
            
            ctx.restore();
        }

        // Modified draw function
        function draw() {
            // Clear canvas with background
            ctx.fillStyle = COLORS.background;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw fire first
            drawFire();

            // Draw platforms
            platforms.forEach(platform => {
                const screenX = platform.x - camera.x;
                const screenY = platform.y - camera.y;
                
                if (screenX + platform.width >= 0 && 
                    screenX <= canvas.width && 
                    screenY + platform.height >= 0 && 
                    screenY <= canvas.height) {
                    
                    // Draw platform
                    ctx.fillStyle = platform.isGround ? COLORS.ground : COLORS.platform;
                    ctx.fillRect(screenX, screenY, platform.width, platform.height);

                    // Draw water cans
                    platform.decorations.forEach(decoration => {
                        if (!decoration.collected && decoration.type === 'waterCan') {
                            const decorationX = screenX + decoration.x;
                            const decorationY = screenY + decoration.y;

                            // Draw water can
                            ctx.save();
                            ctx.font = `${DECORATION.waterCanSize}px Arial`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText('🚰', 
                                decorationX + decoration.width/2,
                                decorationY + decoration.height/2
                            );
                            ctx.restore();
                        }
                    });
                }
            });

            // Draw player with shadow effects
            drawPlayer();

            // Draw UI
            drawUI();
        }

        // Draw fire
        function drawFire() {
            const screenX = FIRE.x - camera.x;
            
            // Draw base fire rectangle
            ctx.fillStyle = COLORS.fire;
            ctx.fillRect(screenX, 0, FIRE.width, WORLD.height);
            
            // Draw fire particles
            ctx.save();
            ctx.globalAlpha = 0.7;
            FIRE.particles.forEach(particle => {
                ctx.fillStyle = COLORS.fireParticle;
                ctx.beginPath();
                ctx.arc(
                    screenX + particle.x,
                    particle.y,
                    particle.size,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            });
            ctx.restore();
        }

        // Draw UI
        function drawUI() {
            ctx.save();
            
            // Draw UI background
            ctx.fillStyle = COLORS.uiBackground;
            ctx.fillRect(0, 0, canvas.width, 60);
            
            // Draw water cans collected
            ctx.font = 'bold 20px Arial';
            ctx.fillStyle = COLORS.uiText;
            ctx.textAlign = 'left';
            ctx.fillText(`Water Cans: ${GAME_STATE.waterCans}`, 20, 35);
            
            // Draw distance from fire
            ctx.textAlign = 'right';
            ctx.fillText(`Distance: ${Math.floor(GAME_STATE.distanceFromFire)}m`, canvas.width - 20, 35);
            
            // Draw distance meter
            const meterWidth = 200;
            const meterHeight = 10;
            const meterX = (canvas.width - meterWidth) / 2;
            const meterY = 25;
            
            // Background
            ctx.fillStyle = '#333';
            ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
            
            // Fire distance indicator
            const distanceRatio = Math.min(GAME_STATE.distanceFromFire / 1000, 1);
            ctx.fillStyle = COLORS.distanceMeter;
            ctx.fillRect(meterX, meterY, meterWidth * distanceRatio, meterHeight);
            
            // Game Over message
            if (GAME_STATE.gameOver) {
                ctx.font = 'bold 48px Arial';
                ctx.fillStyle = COLORS.fire;
                ctx.textAlign = 'center';
                ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);
                ctx.font = 'bold 24px Arial';
                ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 50);
            }
            
            ctx.restore();
        }

        // Initialize fire particles
        function initFireParticles() {
            for (let i = 0; i < FIRE.maxParticles; i++) {
                FIRE.particles.push({
                    x: Math.random() * FIRE.width,
                    y: Math.random() * WORLD.height,
                    size: FIRE.particleSize.min + Math.random() * (FIRE.particleSize.max - FIRE.particleSize.min),
                    speed: FIRE.particleSpeed.min + Math.random() * (FIRE.particleSpeed.max - FIRE.particleSpeed.min),
                    angle: Math.random() * Math.PI * 2
                });
            }
        }

        // Game loop
        function gameLoop() {
            updatePlayer();
            updateFire();  // Add fire update to game loop
            draw();
            requestAnimationFrame(gameLoop);
        }

        // Initial resize and add event listener for window resize
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();  // Initial resize

        // Start the game
        console.log('Starting game');
        generateInitialPlatforms();
        initFireParticles();
        gameLoop();
    }
});