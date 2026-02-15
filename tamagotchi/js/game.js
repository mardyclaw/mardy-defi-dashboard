/**
 * Game - Pet animations in cyber environment
 */

const PETS = {
    mardy: {
        name: 'Mardy',
        role: 'Main Agent',
        color: '#ff4444',
        emoji: '🦞'
    },
    byte: {
        name: 'Byte',
        role: 'API Monitor',
        color: '#00f0ff',
        emoji: '🦋'
    },
    spark: {
        name: 'Spark',
        role: 'Task Runner',
        color: '#ffff00',
        emoji: '⚡'
    },
    coral: {
        name: 'Coral',
        role: 'System Health',
        color: '#ff00ff',
        emoji: '🐙'
    }
};

let canvas, ctx;
let pets = [];
let particles = [];
let dataNodes = [];
let lastUpdate = 0;
let systemData = { cpu: 0, memory: 0 };

class Pet {
    constructor(type, x, y) {
        this.type = type;
        this.config = PETS[type];
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.targetX = x;
        this.targetY = y;
        this.size = type === 'mardy' ? 40 : 25;
        this.angle = 0;
        this.bobOffset = Math.random() * Math.PI * 2;
        this.state = 'idle'; // idle, moving, working, alert
        this.stateTimer = 0;
    }
    
    update(dt) {
        this.bobOffset += dt * 2;
        this.stateTimer -= dt;
        
        // Random movement decisions
        if (this.stateTimer <= 0) {
            this.decideNextAction();
        }
        
        // Move towards target
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 5) {
            this.state = 'moving';
            this.vx = (dx / dist) * 2;
            this.vy = (dy / dist) * 2;
        } else {
            this.vx *= 0.9;
            this.vy *= 0.9;
        }
        
        this.x += this.vx;
        this.y += this.vy;
        
        // Bounds
        this.x = Math.max(this.size, Math.min(canvas.width - this.size, this.x));
        this.y = Math.max(this.size, Math.min(canvas.height - this.size, this.y));
    }
    
    decideNextAction() {
        const actions = ['idle', 'wander', 'work'];
        const action = actions[Math.floor(Math.random() * actions.length)];
        
        switch (action) {
            case 'wander':
                this.targetX = Math.random() * (canvas.width - 100) + 50;
                this.targetY = Math.random() * (canvas.height - 60) + 30;
                this.stateTimer = 3 + Math.random() * 4;
                break;
            case 'work':
                // Move to a data node
                if (dataNodes.length > 0) {
                    const node = dataNodes[Math.floor(Math.random() * dataNodes.length)];
                    this.targetX = node.x;
                    this.targetY = node.y;
                    this.state = 'working';
                }
                this.stateTimer = 2 + Math.random() * 3;
                break;
            default:
                this.state = 'idle';
                this.stateTimer = 1 + Math.random() * 2;
        }
    }
    
    draw(ctx) {
        const bob = Math.sin(this.bobOffset) * 3;
        const drawY = this.y + bob;
        
        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.config.color;
        
        // Body
        ctx.beginPath();
        ctx.arc(this.x, drawY, this.size / 2, 0, Math.PI * 2);
        ctx.fillStyle = this.config.color + '40';
        ctx.fill();
        
        // Emoji
        ctx.shadowBlur = 0;
        ctx.font = `${this.size}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.config.emoji, this.x, drawY);
        
        // State indicator
        if (this.state === 'working') {
            this.drawWorkingIndicator(ctx, drawY);
        }
        
        // Name tag for Mardy
        if (this.type === 'mardy') {
            ctx.font = '10px "Rajdhani", sans-serif';
            ctx.fillStyle = '#00f0ff';
            ctx.fillText(this.config.name.toUpperCase(), this.x, drawY + this.size / 2 + 12);
        }
    }
    
    drawWorkingIndicator(ctx, y) {
        const time = Date.now() / 500;
        for (let i = 0; i < 3; i++) {
            const angle = time + (i * Math.PI * 2 / 3);
            const ox = Math.cos(angle) * 20;
            const oy = Math.sin(angle) * 10;
            ctx.beginPath();
            ctx.arc(this.x + ox, y + oy, 3, 0, Math.PI * 2);
            ctx.fillStyle = this.config.color;
            ctx.fill();
        }
    }
    
    react(event) {
        // React to real data events
        switch (event) {
            case 'api_call':
                if (this.type === 'byte') {
                    this.state = 'working';
                    this.stateTimer = 1;
                    spawnParticles(this.x, this.y, '#00f0ff', 5);
                }
                break;
            case 'task_complete':
                if (this.type === 'spark') {
                    spawnParticles(this.x, this.y, '#ffff00', 10);
                }
                break;
            case 'high_cpu':
                if (this.type === 'coral') {
                    this.state = 'alert';
                    this.stateTimer = 2;
                }
                break;
        }
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4 - 2;
        this.color = color;
        this.life = 1;
        this.size = Math.random() * 4 + 2;
    }
    
    update(dt) {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.life -= dt * 2;
    }
    
    draw(ctx) {
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.globalAlpha = 1;
    }
}

class DataNode {
    constructor(x, y, label) {
        this.x = x;
        this.y = y;
        this.label = label;
        this.pulse = Math.random() * Math.PI * 2;
        this.active = false;
    }
    
    update(dt) {
        this.pulse += dt * 3;
    }
    
    draw(ctx) {
        const size = 6 + Math.sin(this.pulse) * 2;
        
        // Connection lines to other nodes
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
        ctx.lineWidth = 1;
        dataNodes.forEach(other => {
            if (other !== this && Math.random() > 0.95) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(other.x, other.y);
                ctx.stroke();
            }
        });
        
        // Node
        ctx.shadowBlur = this.active ? 20 : 10;
        ctx.shadowColor = this.active ? '#00ff88' : '#00f0ff';
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fillStyle = this.active ? '#00ff88' : '#00f0ff';
        ctx.fill();
        
        ctx.shadowBlur = 0;
    }
}

function spawnParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function initGame() {
    canvas = document.getElementById('pet-canvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create pets
    pets = [
        new Pet('mardy', canvas.width / 2, canvas.height / 2),
        new Pet('byte', canvas.width * 0.25, canvas.height * 0.5),
        new Pet('spark', canvas.width * 0.75, canvas.height * 0.5),
        new Pet('coral', canvas.width * 0.5, canvas.height * 0.3)
    ];
    
    // Create data nodes
    createDataNodes();
    
    // Start game loop
    lastUpdate = performance.now();
    requestAnimationFrame(gameLoop);
    
    // Hook into data updates
    window.onSystemUpdate = handleSystemUpdate;
    window.onWalletUpdate = handleWalletUpdate;
    window.onSessionsUpdate = handleSessionsUpdate;
    
    console.log('🎮 Game initialized');
}

function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    createDataNodes();
}

function createDataNodes() {
    dataNodes = [];
    const nodeCount = Math.floor(canvas.width / 80);
    for (let i = 0; i < nodeCount; i++) {
        dataNodes.push(new DataNode(
            (i + 0.5) * (canvas.width / nodeCount),
            Math.random() * (canvas.height - 40) + 20,
            ['API', 'DATA', 'LOG', 'MEM', 'CPU'][i % 5]
        ));
    }
}

function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastUpdate) / 1000, 0.1);
    lastUpdate = timestamp;
    
    update(dt);
    draw();
    
    requestAnimationFrame(gameLoop);
}

function update(dt) {
    // Update pets
    pets.forEach(pet => pet.update(dt));
    
    // Update particles
    particles.forEach(p => p.update(dt));
    particles = particles.filter(p => p.life > 0);
    
    // Update data nodes
    dataNodes.forEach(node => node.update(dt));
    
    // Random node activity
    if (Math.random() < 0.02) {
        const node = dataNodes[Math.floor(Math.random() * dataNodes.length)];
        node.active = true;
        setTimeout(() => node.active = false, 500);
    }
}

function draw() {
    // Clear
    ctx.fillStyle = 'rgba(13, 19, 33, 0.95)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Grid pattern
    drawGrid();
    
    // Data nodes
    dataNodes.forEach(node => node.draw(ctx));
    
    // Particles
    particles.forEach(p => p.draw(ctx));
    
    // Pets
    pets.forEach(pet => pet.draw(ctx));
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';
    ctx.lineWidth = 1;
    
    const gridSize = 30;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// ==================== DATA EVENT HANDLERS ====================

function handleSystemUpdate(data) {
    systemData = data;
    updatePetStatus();
    
    // Alert coral if high CPU/memory
    if (data.cpu > 80 || data.memory > 80) {
        const coral = pets.find(p => p.type === 'coral');
        if (coral) coral.react('high_cpu');
    }
    
    // Trigger visual activity
    if (Math.random() < 0.3) {
        spawnParticles(canvas.width / 2, canvas.height / 2, '#00f0ff', 3);
    }
}

function handleWalletUpdate(data) {
    // Byte reacts to wallet updates
    const byte = pets.find(p => p.type === 'byte');
    if (byte) byte.react('api_call');
}

function handleSessionsUpdate(data) {
    // Spark reacts to session activity
    if (data.active > 0) {
        const spark = pets.find(p => p.type === 'spark');
        if (spark) spark.react('task_complete');
    }
}

function updatePetStatus() {
    const status = document.getElementById('pet-status');
    if (!status) return;
    
    const messages = [
        `CPU: ${systemData.cpu}% | Memory: ${systemData.memory}%`,
        'Monitoring systems...',
        'All systems operational',
        'Watching the network...',
        'Processing data streams...'
    ];
    
    if (systemData.cpu > 80) {
        status.textContent = '⚠️ High CPU usage detected!';
        status.style.color = '#ff8800';
    } else if (systemData.memory > 80) {
        status.textContent = '⚠️ Memory running low!';
        status.style.color = '#ff8800';
    } else {
        status.textContent = messages[Math.floor(Math.random() * messages.length)];
        status.style.color = '#7a8ba8';
    }
}

// Export
window.initGame = initGame;
window.spawnParticles = spawnParticles;
