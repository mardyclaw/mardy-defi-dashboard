// Pixel Art Sprite System for Mardy's Ocean Lab

class SpriteRenderer {
    constructor(ctx) {
        this.ctx = ctx;
        this.scale = 4; // Pixel scale
    }

    // Draw a pixel at scaled coordinates
    pixel(x, y, color) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.scale, y * this.scale, this.scale, this.scale);
    }

    // Draw Mardy the Lobster (32x32 base, scaled)
    drawMardy(x, y, frame, color = '#e74c3c', accessory = 'none') {
        const ctx = this.ctx;
        const s = this.scale;
        const colors = this.getLobsterColors(color);
        
        ctx.save();
        ctx.translate(x, y);
        
        // Animation offset
        const bounce = Math.sin(frame * 0.15) * 2;
        const clawWave = Math.sin(frame * 0.2) * 3;
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(16*s, 30*s + bounce, 12*s, 4*s, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body (main shell)
        ctx.fillStyle = colors.main;
        this.roundRect(8*s, 12*s + bounce, 16*s, 14*s, 6*s);
        
        // Shell segments
        ctx.fillStyle = colors.dark;
        for (let i = 0; i < 3; i++) {
            ctx.fillRect(9*s, (14 + i*4)*s + bounce, 14*s, 1*s);
        }
        
        // Shell highlight
        ctx.fillStyle = colors.light;
        ctx.fillRect(10*s, 13*s + bounce, 3*s, 2*s);
        
        // Tail
        ctx.fillStyle = colors.main;
        this.drawTail(12*s, 26*s + bounce, frame);
        
        // Legs (4 pairs)
        ctx.fillStyle = colors.main;
        for (let i = 0; i < 4; i++) {
            const legWave = Math.sin(frame * 0.3 + i) * 2;
            // Left legs
            ctx.fillRect(6*s, (16 + i*3)*s + bounce, 3*s, 2*s);
            ctx.fillRect(4*s, (17 + i*3)*s + bounce + legWave, 3*s, 2*s);
            // Right legs
            ctx.fillRect(23*s, (16 + i*3)*s + bounce, 3*s, 2*s);
            ctx.fillRect(25*s, (17 + i*3)*s + bounce + legWave, 3*s, 2*s);
        }
        
        // Left Claw
        ctx.save();
        ctx.translate(4*s, 10*s + bounce);
        ctx.rotate(Math.sin(frame * 0.1) * 0.1 - 0.2);
        this.drawClaw(-8*s, clawWave, colors, true);
        ctx.restore();
        
        // Right Claw
        ctx.save();
        ctx.translate(28*s, 10*s + bounce);
        ctx.rotate(-Math.sin(frame * 0.1) * 0.1 + 0.2);
        this.drawClaw(0, -clawWave, colors, false);
        ctx.restore();
        
        // Head
        ctx.fillStyle = colors.main;
        this.roundRect(10*s, 4*s + bounce, 12*s, 10*s, 4*s);
        
        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(13*s, 8*s + bounce, 2.5*s, 0, Math.PI * 2);
        ctx.arc(19*s, 8*s + bounce, 2.5*s, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye whites (pupils)
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(13.5*s, 7.5*s + bounce, 1*s, 0, Math.PI * 2);
        ctx.arc(19.5*s, 7.5*s + bounce, 1*s, 0, Math.PI * 2);
        ctx.fill();
        
        // Eye stalks
        ctx.fillStyle = colors.main;
        ctx.fillRect(12*s, 2*s + bounce, 2*s, 4*s);
        ctx.fillRect(18*s, 2*s + bounce, 2*s, 4*s);
        
        // Antennae
        ctx.strokeStyle = colors.dark;
        ctx.lineWidth = 1.5*s;
        ctx.lineCap = 'round';
        
        // Left antenna
        ctx.beginPath();
        ctx.moveTo(12*s, 4*s + bounce);
        ctx.quadraticCurveTo(8*s + Math.sin(frame*0.2)*2, -2*s + bounce, 4*s + Math.sin(frame*0.15)*3, -4*s + bounce);
        ctx.stroke();
        
        // Right antenna
        ctx.beginPath();
        ctx.moveTo(20*s, 4*s + bounce);
        ctx.quadraticCurveTo(24*s + Math.sin(frame*0.2 + 1)*2, -2*s + bounce, 28*s + Math.sin(frame*0.15 + 1)*3, -4*s + bounce);
        ctx.stroke();
        
        // Accessory
        this.drawAccessory(accessory, 16*s, bounce, frame);
        
        ctx.restore();
    }

    drawClaw(offsetX, offsetY, colors, isLeft) {
        const ctx = this.ctx;
        const s = this.scale;
        
        // Arm
        ctx.fillStyle = colors.main;
        ctx.fillRect(isLeft ? offsetX + 4*s : offsetX, offsetY, 4*s, 8*s);
        
        // Claw base
        ctx.fillStyle = colors.main;
        this.roundRect(isLeft ? offsetX : offsetX - 2*s, offsetY - 2*s, 8*s, 6*s, 2*s);
        
        // Claw pincer top
        ctx.fillStyle = colors.dark;
        ctx.beginPath();
        ctx.moveTo(isLeft ? offsetX : offsetX + 6*s, offsetY);
        ctx.lineTo(isLeft ? offsetX - 4*s : offsetX + 10*s, offsetY - 4*s);
        ctx.lineTo(isLeft ? offsetX + 2*s : offsetX + 4*s, offsetY);
        ctx.fill();
        
        // Claw pincer bottom
        ctx.beginPath();
        ctx.moveTo(isLeft ? offsetX : offsetX + 6*s, offsetY + 2*s);
        ctx.lineTo(isLeft ? offsetX - 4*s : offsetX + 10*s, offsetY + 6*s);
        ctx.lineTo(isLeft ? offsetX + 2*s : offsetX + 4*s, offsetY + 2*s);
        ctx.fill();
    }

    drawTail(x, y, frame) {
        const ctx = this.ctx;
        const s = this.scale;
        const wave = Math.sin(frame * 0.1) * 2;
        
        // Tail segments
        for (let i = 0; i < 4; i++) {
            const segWidth = 8 - i;
            const segX = x + (4 - segWidth/2) * s;
            ctx.fillRect(segX + wave * (i/4), y + i*3*s, segWidth*s, 3*s);
        }
        
        // Tail fan
        ctx.beginPath();
        ctx.moveTo(x + 4*s + wave, y + 12*s);
        ctx.lineTo(x - 2*s + wave*1.5, y + 18*s);
        ctx.lineTo(x + 4*s + wave, y + 16*s);
        ctx.lineTo(x + 10*s + wave*1.5, y + 18*s);
        ctx.closePath();
        ctx.fill();
    }

    drawAccessory(type, centerX, bounce, frame) {
        const ctx = this.ctx;
        const s = this.scale;
        
        switch(type) {
            case 'tophat':
                ctx.fillStyle = '#1a1a2e';
                ctx.fillRect(centerX - 6*s, -8*s + bounce, 12*s, 2*s);
                ctx.fillRect(centerX - 4*s, -18*s + bounce, 8*s, 10*s);
                ctx.fillStyle = '#c0392b';
                ctx.fillRect(centerX - 4*s, -10*s + bounce, 8*s, 2*s);
                break;
                
            case 'crown':
                ctx.fillStyle = '#f1c40f';
                ctx.fillRect(centerX - 6*s, -6*s + bounce, 12*s, 4*s);
                // Crown points
                ctx.beginPath();
                ctx.moveTo(centerX - 6*s, -6*s + bounce);
                ctx.lineTo(centerX - 4*s, -12*s + bounce);
                ctx.lineTo(centerX - 2*s, -6*s + bounce);
                ctx.lineTo(centerX, -10*s + bounce);
                ctx.lineTo(centerX + 2*s, -6*s + bounce);
                ctx.lineTo(centerX + 4*s, -12*s + bounce);
                ctx.lineTo(centerX + 6*s, -6*s + bounce);
                ctx.fill();
                // Jewels
                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.arc(centerX, -4*s + bounce, 1.5*s, 0, Math.PI * 2);
                ctx.fill();
                break;
                
            case 'halo':
                ctx.strokeStyle = '#f9e79f';
                ctx.lineWidth = 2*s;
                ctx.beginPath();
                ctx.ellipse(centerX, -10*s + bounce + Math.sin(frame*0.1)*2, 8*s, 3*s, 0, 0, Math.PI * 2);
                ctx.stroke();
                // Glow
                ctx.strokeStyle = 'rgba(249, 231, 159, 0.3)';
                ctx.lineWidth = 4*s;
                ctx.stroke();
                break;
                
            case 'glasses':
                ctx.fillStyle = '#2c3e50';
                ctx.fillRect(centerX - 10*s, 6*s + bounce, 8*s, 4*s);
                ctx.fillRect(centerX + 2*s, 6*s + bounce, 8*s, 4*s);
                ctx.fillRect(centerX - 2*s, 7*s + bounce, 4*s, 2*s);
                // Lens shine
                ctx.fillStyle = 'rgba(255,255,255,0.3)';
                ctx.fillRect(centerX - 9*s, 7*s + bounce, 2*s, 1*s);
                ctx.fillRect(centerX + 3*s, 7*s + bounce, 2*s, 1*s);
                break;
                
            case 'bowtie':
                ctx.fillStyle = '#e74c3c';
                ctx.beginPath();
                ctx.moveTo(centerX, 12*s + bounce);
                ctx.lineTo(centerX - 6*s, 8*s + bounce);
                ctx.lineTo(centerX - 6*s, 16*s + bounce);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(centerX, 12*s + bounce);
                ctx.lineTo(centerX + 6*s, 8*s + bounce);
                ctx.lineTo(centerX + 6*s, 16*s + bounce);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#c0392b';
                ctx.beginPath();
                ctx.arc(centerX, 12*s + bounce, 2*s, 0, Math.PI * 2);
                ctx.fill();
                break;
        }
    }

    getLobsterColors(base) {
        const colors = {
            red: { main: '#e74c3c', light: '#ff6b6b', dark: '#c0392b' },
            blue: { main: '#3498db', light: '#5dade2', dark: '#2980b9' },
            purple: { main: '#9b59b6', light: '#bb8fce', dark: '#7d3c98' },
            gold: { main: '#f39c12', light: '#f7dc6f', dark: '#d68910' },
            rainbow: { main: '#e74c3c', light: '#f7dc6f', dark: '#9b59b6' }
        };
        return colors[base] || colors.red;
    }

    roundRect(x, y, w, h, r) {
        const ctx = this.ctx;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fill();
    }

    // Draw helper pet: Byte the Data Fish
    drawByte(x, y, frame) {
        const ctx = this.ctx;
        const s = this.scale;
        const swim = Math.sin(frame * 0.2) * 3;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Body
        ctx.fillStyle = '#4ecdc4';
        ctx.beginPath();
        ctx.ellipse(12*s, 8*s + swim, 10*s, 6*s, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Tail
        ctx.beginPath();
        ctx.moveTo(22*s, 8*s + swim);
        ctx.lineTo(30*s, 2*s + swim);
        ctx.lineTo(30*s, 14*s + swim);
        ctx.closePath();
        ctx.fill();
        
        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(6*s, 6*s + swim, 2*s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(5.5*s, 5.5*s + swim, 0.8*s, 0, Math.PI * 2);
        ctx.fill();
        
        // Data pattern (binary)
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.font = `${2*s}px monospace`;
        ctx.fillText('01', 10*s, 9*s + swim);
        
        // Fin
        ctx.fillStyle = '#26a69a';
        ctx.beginPath();
        ctx.moveTo(12*s, 2*s + swim);
        ctx.lineTo(16*s, -4*s + swim + Math.sin(frame*0.3)*2);
        ctx.lineTo(18*s, 4*s + swim);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }

    // Draw helper pet: Spark the Electric Jellyfish
    drawSpark(x, y, frame) {
        const ctx = this.ctx;
        const s = this.scale;
        const float = Math.sin(frame * 0.15) * 4;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Glow
        const gradient = ctx.createRadialGradient(10*s, 8*s, 0, 10*s, 8*s, 12*s);
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(10*s, 8*s + float, 12*s, 0, Math.PI * 2);
        ctx.fill();
        
        // Dome
        ctx.fillStyle = '#a855f7';
        ctx.beginPath();
        ctx.arc(10*s, 6*s + float, 8*s, Math.PI, 0);
        ctx.fill();
        
        // Body bottom
        ctx.fillRect(2*s, 6*s + float, 16*s, 4*s);
        
        // Tentacles
        ctx.strokeStyle = '#c084fc';
        ctx.lineWidth = 1.5*s;
        ctx.lineCap = 'round';
        
        for (let i = 0; i < 5; i++) {
            const tentX = (4 + i*3) * s;
            const wave = Math.sin(frame * 0.2 + i) * 3;
            ctx.beginPath();
            ctx.moveTo(tentX, 10*s + float);
            ctx.quadraticCurveTo(tentX + wave, 18*s + float, tentX + wave*1.5, 26*s + float);
            ctx.stroke();
        }
        
        // Eyes
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(7*s, 4*s + float, 1.5*s, 0, Math.PI * 2);
        ctx.arc(13*s, 4*s + float, 1.5*s, 0, Math.PI * 2);
        ctx.fill();
        
        // Electric sparks
        if (frame % 20 < 10) {
            ctx.strokeStyle = '#fef08a';
            ctx.lineWidth = s;
            ctx.beginPath();
            ctx.moveTo(18*s, 2*s + float);
            ctx.lineTo(22*s, 0 + float);
            ctx.lineTo(20*s, 4*s + float);
            ctx.stroke();
        }
        
        ctx.restore();
    }

    // Draw helper pet: Coral the Crab Helper
    drawCoral(x, y, frame) {
        const ctx = this.ctx;
        const s = this.scale;
        const walk = Math.abs(Math.sin(frame * 0.2)) * 2;
        
        ctx.save();
        ctx.translate(x, y);
        
        // Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(10*s, 18*s, 8*s, 2*s, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Body
        ctx.fillStyle = '#f97316';
        this.roundRect(4*s, 6*s + walk, 12*s, 8*s, 3*s);
        
        // Spots
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(7*s, 9*s + walk, 1.5*s, 0, Math.PI * 2);
        ctx.arc(13*s, 10*s + walk, 1*s, 0, Math.PI * 2);
        ctx.fill();
        
        // Eyes on stalks
        ctx.fillStyle = '#f97316';
        ctx.fillRect(6*s, 2*s + walk, 2*s, 5*s);
        ctx.fillRect(12*s, 2*s + walk, 2*s, 5*s);
        
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(7*s, 2*s + walk, 2*s, 0, Math.PI * 2);
        ctx.arc(13*s, 2*s + walk, 2*s, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(7.5*s, 1.5*s + walk, 0.8*s, 0, Math.PI * 2);
        ctx.arc(13.5*s, 1.5*s + walk, 0.8*s, 0, Math.PI * 2);
        ctx.fill();
        
        // Claws
        ctx.fillStyle = '#f97316';
        // Left claw
        ctx.save();
        ctx.translate(0, 8*s + walk);
        ctx.rotate(Math.sin(frame * 0.15) * 0.2);
        ctx.fillRect(-4*s, 0, 6*s, 3*s);
        ctx.beginPath();
        ctx.arc(-4*s, 1.5*s, 3*s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Right claw
        ctx.save();
        ctx.translate(20*s, 8*s + walk);
        ctx.rotate(-Math.sin(frame * 0.15) * 0.2);
        ctx.fillRect(-2*s, 0, 6*s, 3*s);
        ctx.beginPath();
        ctx.arc(4*s, 1.5*s, 3*s, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        // Legs
        ctx.fillStyle = '#ea580c';
        for (let i = 0; i < 3; i++) {
            const legWave = Math.sin(frame * 0.3 + i * 1.5) * 2;
            ctx.fillRect((2 + i*4)*s, 14*s + legWave, 2*s, 4*s);
        }
        
        ctx.restore();
    }

    // Draw bubbles
    drawBubble(x, y, size, alpha) {
        const ctx = this.ctx;
        ctx.save();
        
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.6})`;
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Shine
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

// Export
window.SpriteRenderer = SpriteRenderer;
