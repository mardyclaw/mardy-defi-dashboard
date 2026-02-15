/**
 * UI - Dashboard panel updates and interactions
 */

// ==================== EVENT HANDLERS ====================

function initUI() {
    // Listen for data updates
    window.addEventListener('systemUpdate', (e) => updateSystemPanel(e.detail));
    window.addEventListener('walletUpdate', (e) => updateWalletPanel(e.detail));
    window.addEventListener('sessionsUpdate', (e) => updateSessionsPanel(e.detail));
    window.addEventListener('activityUpdate', (e) => updateActivityLog(e.detail));
    
    // Button click handlers
    document.querySelectorAll('[data-action]').forEach(btn => {
        btn.addEventListener('click', handleButtonAction);
    });
    
    console.log('🖥️ UI initialized');
}

async function handleButtonAction(e) {
    const action = e.currentTarget.dataset.action;
    const btn = e.currentTarget;
    
    // Visual feedback
    btn.disabled = true;
    if (btn.classList.contains('refresh-btn')) {
        btn.classList.add('spinning');
    }
    
    try {
        await executeAction(action);
    } finally {
        btn.disabled = false;
        btn.classList.remove('spinning');
    }
}

// ==================== SYSTEM PANEL ====================

function updateSystemPanel(data) {
    if (!data) return;
    
    // Header stats
    document.getElementById('header-cpu').textContent = `${data.cpu}%`;
    document.getElementById('header-mem').textContent = `${data.memory}%`;
    document.getElementById('header-uptime').textContent = data.uptimeFormatted || '--';
    
    // Gauges
    updateGauge('cpu', data.cpu);
    updateGauge('mem', data.memory);
    updateGauge('disk', data.disk);
    
    // Details
    document.getElementById('network-status').textContent = data.networkStatus || '--';
    document.getElementById('sys-temp').textContent = data.temperature ? `${data.temperature}°C` : 'N/A';
    document.getElementById('sys-load').textContent = data.loadAvg ? data.loadAvg.join(', ') : '--';
    
    // Alerts
    if (data.alerts && data.alerts.length > 0) {
        showAlertBanner(data.alerts[0].message);
    }
    
    // Notify game of activity
    if (window.onSystemUpdate) window.onSystemUpdate(data);
}

function updateGauge(type, value) {
    const arc = document.getElementById(`${type}-arc`);
    const valueEl = document.getElementById(`${type}-value`);
    
    if (!arc || !valueEl) return;
    
    const circumference = 251.2; // 2 * PI * 40
    const offset = circumference - (value / 100) * circumference;
    
    arc.style.strokeDashoffset = offset;
    valueEl.textContent = `${Math.round(value)}%`;
    
    // Color based on value
    arc.classList.remove('warning', 'critical');
    if (value > 90) {
        arc.classList.add('critical');
    } else if (value > 75) {
        arc.classList.add('warning');
    }
}

// ==================== WALLET PANEL ====================

function updateWalletPanel(data) {
    if (!data) return;
    
    const balanceEl = document.getElementById('wallet-balance');
    const addressEl = document.getElementById('wallet-address');
    
    if (data.error) {
        balanceEl.textContent = '---';
        addressEl.textContent = `Error: ${data.error}`;
        return;
    }
    
    // Animate balance change
    const currentBalance = parseFloat(balanceEl.textContent) || 0;
    const newBalance = data.eth || 0;
    
    if (currentBalance !== newBalance) {
        animateNumber(balanceEl, currentBalance, newBalance, 3);
    }
    
    // Address (truncated)
    if (data.address && data.address !== 'Not connected') {
        const addr = data.address;
        addressEl.textContent = `${addr.slice(0, 8)}...${addr.slice(-6)}`;
        addressEl.title = data.address;
    } else {
        addressEl.textContent = data.address || 'Connecting...';
    }
    
    // Notify game
    if (window.onWalletUpdate) window.onWalletUpdate(data);
}

function animateNumber(element, from, to, decimals = 2) {
    const duration = 500;
    const start = performance.now();
    
    function update(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        
        const current = from + (to - from) * eased;
        element.textContent = current.toFixed(decimals);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

// ==================== SESSIONS PANEL ====================

function updateSessionsPanel(data) {
    if (!data) return;
    
    document.getElementById('active-sessions').textContent = data.active || 0;
    
    const gwStatus = document.getElementById('gateway-status');
    gwStatus.textContent = data.gatewayStatus || '--';
    gwStatus.className = data.gatewayStatus === 'running' ? 'mini-value' : 'mini-value warning';
    
    const processList = document.getElementById('process-list');
    if (data.processes && data.processes.length > 0) {
        processList.innerHTML = data.processes.map(p => `
            <div class="process-item">
                <span class="pid">PID ${p.pid}</span>
                <span class="command">${p.command}</span>
                <span class="cpu">${p.cpu}%</span>
            </div>
        `).join('');
    } else {
        processList.innerHTML = '<div class="process-item"><span>No active processes</span></div>';
    }
    
    // Notify game
    if (window.onSessionsUpdate) window.onSessionsUpdate(data);
}

// ==================== ACTIVITY LOG ====================

function updateActivityLog(entries) {
    const log = document.getElementById('activity-log');
    if (!log || !entries || entries.length === 0) return;
    
    log.innerHTML = entries.slice(0, 20).map(entry => {
        const time = new Date(entry.timestamp).toLocaleTimeString();
        return `
            <div class="log-entry">
                <span class="log-time">${time}</span>
                <span class="log-type ${entry.type}">${entry.type.toUpperCase()}</span>
                <span class="log-msg">${entry.message}</span>
            </div>
        `;
    }).join('');
}

function addLocalActivity(type, message) {
    const log = document.getElementById('activity-log');
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
        <span class="log-time">${time}</span>
        <span class="log-type ${type}">${type.toUpperCase()}</span>
        <span class="log-msg">${message}</span>
    `;
    log.insertBefore(entry, log.firstChild);
    
    // Keep only 20 entries
    while (log.children.length > 20) {
        log.removeChild(log.lastChild);
    }
}

// ==================== ALERTS ====================

function showAlertBanner(message) {
    const banner = document.getElementById('alerts-banner');
    const msgEl = document.getElementById('alert-message');
    
    if (banner && msgEl) {
        msgEl.textContent = message;
        banner.style.display = 'flex';
    }
}

function hideAlertBanner() {
    const banner = document.getElementById('alerts-banner');
    if (banner) banner.style.display = 'none';
}

// ==================== MODAL ====================

function showModal(title, content, actions = []) {
    const modal = document.getElementById('modal');
    const titleEl = document.getElementById('modal-title');
    const bodyEl = document.getElementById('modal-body');
    const actionsEl = document.getElementById('modal-actions');
    
    titleEl.textContent = title;
    
    if (typeof content === 'string') {
        bodyEl.innerHTML = content;
    } else {
        bodyEl.innerHTML = '';
        bodyEl.appendChild(content);
    }
    
    actionsEl.innerHTML = actions.map(a => 
        `<button class="cyber-btn ${a.secondary ? 'secondary' : ''}" onclick="${a.onclick}">${a.label}</button>`
    ).join('');
    
    if (actions.length === 0) {
        actionsEl.innerHTML = '<button class="cyber-btn secondary" onclick="closeModal()">Close</button>';
    }
    
    modal.style.display = 'flex';
    
    // Close on backdrop click
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
}

function closeModal() {
    document.getElementById('modal').style.display = 'none';
}

// ==================== TOAST ====================

function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || '📢'}</span>
        <span class="toast-message">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// ==================== EXPORTS ====================

window.initUI = initUI;
window.showModal = showModal;
window.closeModal = closeModal;
window.showToast = showToast;
window.addLocalActivity = addLocalActivity;
window.showAlertBanner = showAlertBanner;
window.hideAlertBanner = hideAlertBanner;
