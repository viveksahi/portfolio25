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
    const GRAVITY = 0.35;              // Reduced from 0.5 for floatier jumps
    const JUMP_ACCELERATION = -1.5;    // Increased from -1.2 for stronger jumps
    const MIN_JUMP_VELOCITY = -12;     // Reduced from -15 for more controlled jumps
    const MOVE_SPEED = 12;             // Reduced from 15 for more controlled movement
    const AIR_CONTROL = 0.99;          // Increased from 0.98 for better air control
    const FRICTION = 0.92;             // Increased from 0.90 for smoother movement
    const TERMINAL_VELOCITY = 12;      // Reduced from 15 for more time to react

    // Shadow settings
    const SHADOW_OFFSET = 8;
    const SHADOW_BLUR = 15;

    // Visual settings
    const COLORS = {
        background: '#1E1E2E',      // Darker background
        platform: '#4A4A5E',        // Lighter platform color
        ground: '#5D5D7D',          // Lighter ground color
        player: '#FF5D5D',          // Brighter player color
        coin: '#FFD700',            // Bright gold
        uiBackground: 'rgba(0, 0, 0, 0.8)',  // Darker UI background
        uiText: '#FFFFFF'           // White text
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
        currentEmotion: '😊',
        currentFeeling: 'I am feeling happy today!',
        emotions: [
            { emoji: '😊', text: 'I am feeling happy today!' },
            { emoji: '😢', text: 'I am feeling sad right now...' },
            { emoji: '😴', text: 'I am feeling tired...' },
            { emoji: '😡', text: 'I am feeling angry!' },
            { emoji: '🤔', text: 'I am feeling thoughtful.' },
            { emoji: '😌', text: 'I am feeling peaceful.' },
            { emoji: '🥳', text: 'I am feeling excited!' },
            { emoji: '😰', text: 'I am feeling anxious.' },
            { emoji: '🥰', text: 'I am feeling loved.' },
            { emoji: '😤', text: 'I am feeling frustrated.' }
        ]
    };

    // Platform decoration settings
    const DECORATION = {
        emojiChance: 0.3,  // 30% chance for a platform to have an emoji
        coinChance: 0.4,   // 40% chance for a platform to have a coin
        coinValue: 10,     // Each coin is worth 10 points
        coinSize: 20,      // Size of coin in pixels
        emojiSize: 30      // Size of emoji in pixels
    };

    // Sound effects
    const SOUNDS = {
        coin: new Audio('data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU='),
        emoji: new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2DgHlxdH2Df3Nze4N/d3R2fYGAenN1fYGBeHR3foGBfHh5f4GBfXl6gYKBfHh6gYODfXh4gYSGgHh2fYOHh4B4dnyDiYqDd3N5foWLjId7dXZ+hYyPjIZ5cXR9iJGTjoZ2bnF6i5WXk4t5bG53hpOYmJWJeW5udHyIj5OVk4yCdXFydHqBiY+UlZOOhXt1cXJ0eX+FjZKWl5WQhnt1cHFydHl+hYuRlpiYlY+Ee3VwcXJ0eH2DiY+Ul5iYlpCGfHZwcXJ0d3t/ho2Sk5WXl5WQiH52cXFydHd6fYSLkZOVlpeWkYl+d3JycnR2eXyCiY+Sk5SVlZSSin94c3JydHZ4e4GIjpGTlJWVk5GKgHhzcnJ0dnd6gIeNkJKTlJSTkouAeXRycnR2d3l/ho2QkZKTk5KRi4F6dHJydHZ3eX6Fi46QkZKSkZCLgnt1c3N0dnd5fYSLjY+QkZGQj4uCe3Vzc3R2d3l9g4uOj5CQkI+OioJ8dnNzdHZ3eX2Cio2Oj4+Pj46Lg3x2c3N0dnd5fIGJjY6Oj4+OjYuDfXdzc3R2d3h8gYmMjY6Ojo2Mi4N9d3RzdHZ3eHuAiIyNjY2NjYyLhH13dHN0dnd4e4CHi4yNjY2MjIqEfnd0c3R2d3h7gIeLjI2NjYyLioR+d3RzdHZ3eHqAh4qMjI2NjIuKhH53dHR0dnd4eoCHioyMjIyMi4qEfnd0dHR2d3h6gIaKjIyMjIyLioV+eHR0dHZ3eHqAhoqLjIyMjIuKhX54dHR0dnd4eoCGiouMjIyLi4qFfnh1dHR2d3h6f4aKi4yMjIuLioV+eHV0dHZ3eHp/hoqLi4yMi4uKhX54dXR0dnd4en+GiouLjIyLi4qFfnh1dHR2d3h6f4aKi4uMjIuLioV+eHV0dHZ3eHp/hoqLi4yMi4uKhX54dXV1dnd4en+GiouLjIyLi4qGfnh1dXV2d3h6f4aKi4uMjIuLioZ+eXV1dXZ3eHp/hoqLi4yMi4uKhn55dXV1d3h4en+GiouLjIyLi4qGfnl1dXV3eHh6f4aKi4uMjIuLioZ+eXV1dXd4eHp/hoqLi4yMi4uKhn55dXV1d3h4en+GiouLjIyLi4qGfnl2dXV3eHh6f4aKi4uMjIuLioZ+eXZ2dXd4eHp/hoqLi4yMi4uKhn55dnZ1d3h4en+GiouLjIyLi4qGfnl2dnV3eHh6f4aKi4uMjIuLioZ+eXZ2dXd4eHp/hoqLi4yMi4uKhn55dnZ1d3h4en+GiouLjIyLi4qGfnl2dnV3eHh6f4aKi4uMjIuLioZ+eXZ2dXd4eHp/hoqLi4yMi4uKhn55dnZ1d3h4en+GiouLjIyLi4qGfnl2dnV3eHh6f4aKi4uMjIuLioZ+eXZ2dXd4eHp/hoqLi4yMi4uKhn55dnZ1d3h4en+GiouLjIyLi4qGfnl2dnV3eHh6f4aKi4uMjIuLioZ+eXZ2')
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
            const newPlatform = {
                x: platform.x,
                y: platform.y,
                width: 200,
                height: 20,
                color: COLORS.platform,  // Use the new color scheme
                isGround: false,
                decorations: []  // Initialize empty decorations array
            };

            // Add emoji with 30% chance
            if (Math.random() < DECORATION.emojiChance) {
                const randomEmotion = GAME_STATE.emotions[Math.floor(Math.random() * GAME_STATE.emotions.length)];
                newPlatform.decorations.push({
                    type: 'emoji',
                    x: newPlatform.width / 2 - DECORATION.emojiSize / 2,
                    y: -DECORATION.emojiSize,
                    width: DECORATION.emojiSize,
                    height: DECORATION.emojiSize,
                    content: randomEmotion.emoji,
                    collected: false
                });
            }

            // Add coin with 40% chance
            if (Math.random() < DECORATION.coinChance) {
                newPlatform.decorations.push({
                    type: 'coin',
                    x: newPlatform.width / 3,
                    y: -DECORATION.coinSize,
                    width: DECORATION.coinSize,
                    height: DECORATION.coinSize,
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

        // Add emoji with 30% chance
        if (Math.random() < DECORATION.emojiChance) {
            const randomEmotion = GAME_STATE.emotions[Math.floor(Math.random() * GAME_STATE.emotions.length)];
            platform.decorations.push({
                type: 'emoji',
                x: platform.width / 2 - DECORATION.emojiSize / 2,
                y: -DECORATION.emojiSize,
                width: DECORATION.emojiSize,
                height: DECORATION.emojiSize,
                content: randomEmotion.emoji,
                collected: false
            });
        }

        // Add coin with 40% chance
        if (Math.random() < DECORATION.coinChance) {
            platform.decorations.push({
                type: 'coin',
                x: platform.width / 3,
                y: -DECORATION.coinSize,
                width: DECORATION.coinSize,
                height: DECORATION.coinSize,
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
                    
                    if (decoration.type === 'coin') {
                        GAME_STATE.score += DECORATION.coinValue;
                        // Play coin sound
                        SOUNDS.coin.currentTime = 0;
                        SOUNDS.coin.play().catch(err => console.log('Audio play failed:', err));
                    } else if (decoration.type === 'emoji') {
                        const newEmotion = GAME_STATE.emotions.find(e => e.emoji === decoration.content);
                        if (newEmotion) {
                            GAME_STATE.currentEmotion = newEmotion.emoji;
                            GAME_STATE.currentFeeling = newEmotion.text;
                            // Play emoji sound
                            SOUNDS.emoji.currentTime = 0;
                            SOUNDS.emoji.play().catch(err => console.log('Audio play failed:', err));
                        }
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
    }

    // Draw game
    function draw() {
        // Clear canvas with background
        ctx.fillStyle = COLORS.background;
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
                
                ctx.fillStyle = platform.isGround ? COLORS.ground : COLORS.platform;
                ctx.fillRect(screenX, screenY, platform.width, platform.height);
                
                ctx.restore();

                // Draw decorations
                platform.decorations.forEach(decoration => {
                    if (!decoration.collected) {
                        const decorationX = screenX + decoration.x;
                        const decorationY = screenY + decoration.y;

                        if (decoration.type === 'coin') {
                            // Draw coin with glow
                            ctx.save();
                            ctx.shadowColor = COLORS.coin;
                            ctx.shadowBlur = 15;
                            ctx.fillStyle = COLORS.coin;
                            ctx.beginPath();
                            ctx.arc(
                                decorationX + decoration.width/2,
                                decorationY + decoration.height/2,
                                decoration.width/2,
                                0,
                                Math.PI * 2
                            );
                            ctx.fill();
                            ctx.restore();
                        } else if (decoration.type === 'emoji') {
                            // Draw emoji with glow
                            ctx.save();
                            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
                            ctx.shadowBlur = 10;
                            ctx.font = `${decoration.height}px Arial`;
                            ctx.textAlign = 'center';
                            ctx.textBaseline = 'middle';
                            ctx.fillText(
                                decoration.content,
                                decorationX + decoration.width/2,
                                decorationY + decoration.height/2
                            );
                            ctx.restore();
                        }
                    }
                });
            }
        });

        // Draw player with enhanced shadow and glow
        const playerScreenX = player.x - camera.x;
        const playerScreenY = player.y - camera.y;
        
        // Draw the main body
        ctx.fillStyle = COLORS.player;
        ctx.fillRect(playerScreenX, playerScreenY, player.width, player.height);
        
        // Draw float effect when moving upward
        if (player.velocityY < 0 && !player.isTouchingCeiling) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            const glowHeight = Math.min(15, Math.abs(player.velocityY) * 2);
            ctx.fillRect(
                playerScreenX,
                playerScreenY + player.height,
                player.width,
                glowHeight
            );
        }

        // Draw UI with enhanced visibility
        ctx.save();
        ctx.fillStyle = COLORS.uiBackground;
        ctx.fillRect(0, 0, canvas.width, 60);
        
        // Draw current emotion and feeling
        ctx.font = 'bold 20px Arial';
        ctx.fillStyle = COLORS.uiText;
        ctx.textAlign = 'left';
        ctx.fillText(`${GAME_STATE.currentEmotion} ${GAME_STATE.currentFeeling}`, 20, 35);
        
        // Draw score with glow
        ctx.shadowColor = COLORS.coin;
        ctx.shadowBlur = 10;
        ctx.textAlign = 'right';
        ctx.fillText(`Score: ${GAME_STATE.score}`, canvas.width - 20, 35);
        
        ctx.restore();

        // Draw controls with better visibility
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Left/Right Arrows to move, Hold SPACE to jump', 20, 80);
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