/**
 * Theme - Matrix rain effect and cyber styling
 */

let matrixCanvas, matrixCtx;
let columns = [];
const fontSize = 14;
const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

function initTheme() {
    matrixCanvas = document.getElementById('matrix-bg');
    matrixCtx = matrixCanvas.getContext('2d');
    
    resizeMatrix();
    window.addEventListener('resize', resizeMatrix);
    
    // Start matrix animation
    setInterval(drawMatrix, 50);
    
    console.log('🎨 Theme initialized');
}

function resizeMatrix() {
    matrixCanvas.width = window.innerWidth;
    matrixCanvas.height = window.innerHeight;
    
    const columnCount = Math.floor(matrixCanvas.width / fontSize);
    columns = new Array(columnCount).fill(0);
}

function drawMatrix() {
    // Semi-transparent black to create trail effect
    matrixCtx.fillStyle = 'rgba(10, 14, 23, 0.05)';
    matrixCtx.fillRect(0, 0, matrixCanvas.width, matrixCanvas.height);
    
    matrixCtx.fillStyle = '#00f0ff';
    matrixCtx.font = fontSize + 'px monospace';
    
    for (let i = 0; i < columns.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = columns[i] * fontSize;
        
        // Fade effect
        const alpha = Math.random() * 0.5 + 0.1;
        matrixCtx.fillStyle = `rgba(0, 240, 255, ${alpha})`;
        
        matrixCtx.fillText(char, x, y);
        
        // Reset or continue
        if (y > matrixCanvas.height && Math.random() > 0.975) {
            columns[i] = 0;
        }
        columns[i]++;
    }
}

// Glow effect for elements
function addGlowPulse(element) {
    element.classList.add('glow-pulse');
}

function removeGlowPulse(element) {
    element.classList.remove('glow-pulse');
}

// Export
window.initTheme = initTheme;
window.addGlowPulse = addGlowPulse;
window.removeGlowPulse = removeGlowPulse;
