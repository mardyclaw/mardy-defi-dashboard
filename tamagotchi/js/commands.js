/**
 * Commands - Functional button handlers that do REAL things
 */

function initCommands() {
    console.log('⚡ Commands initialized');
}

async function executeAction(action) {
    console.log('Executing action:', action);
    addLocalActivity('command', `Executing: ${action}`);
    
    try {
        switch (action) {
            // ==================== REFRESH ACTIONS ====================
            case 'refresh-wallet':
                await refreshWallet();
                break;
            case 'refresh-sessions':
                await refreshSessions();
                break;
            case 'refresh-system':
                await refreshSystem();
                break;
            case 'refresh-activity':
                await refreshActivity();
                break;
                
            // ==================== WALLET ACTIONS ====================
            case 'check-wallet':
                await checkWalletDetails();
                break;
            case 'browse-marketplace':
                await browseMarketplace();
                break;
                
            // ==================== SESSION ACTIONS ====================
            case 'view-sessions':
                await viewSessionDetails();
                break;
            case 'restart-gateway':
                await restartGateway();
                break;
                
            // ==================== SYSTEM ACTIONS ====================
            case 'system-health':
                await showSystemHealth();
                break;
            case 'top-processes':
                await showTopProcesses();
                break;
                
            // ==================== COMMAND BUTTONS ====================
            case 'marketplace-search':
                showMarketplaceSearch();
                break;
            case 'view-logs':
                await viewLogs();
                break;
            case 'run-task':
                showRunTaskDialog();
                break;
            case 'whoami':
                await showWhoAmI();
                break;
            case 'gateway-status':
                await showGatewayStatus();
                break;
                
            default:
                showToast(`Unknown action: ${action}`, 'warning');
        }
    } catch (error) {
        console.error('Action error:', error);
        showToast(`Error: ${error.message}`, 'error');
        addLocalActivity('error', `Failed: ${action} - ${error.message}`);
    }
}

// ==================== REFRESH FUNCTIONS ====================

async function refreshWallet() {
    const data = await api.getWalletBalance();
    window.dispatchEvent(new CustomEvent('walletUpdate', { detail: data }));
    showToast('Wallet updated', 'success');
}

async function refreshSessions() {
    const data = await api.getSessions();
    window.dispatchEvent(new CustomEvent('sessionsUpdate', { detail: data }));
    showToast('Sessions updated', 'success');
}

async function refreshSystem() {
    const data = await api.getSystemStats();
    window.dispatchEvent(new CustomEvent('systemUpdate', { detail: data }));
    showToast('System stats updated', 'success');
}

async function refreshActivity() {
    const data = await api.getActivity();
    window.dispatchEvent(new CustomEvent('activityUpdate', { detail: data }));
    showToast('Activity log refreshed', 'success');
}

// ==================== WALLET FUNCTIONS ====================

async function checkWalletDetails() {
    showToast('Fetching wallet details...', 'info');
    
    const result = await api.runCommand('wallet-address');
    const balance = await api.getWalletBalance();
    
    let content = `
        <div class="wallet-details">
            <h3 style="color: var(--cyan); margin-bottom: 16px;">💰 Wallet Information</h3>
            <div class="detail-grid" style="display: grid; gap: 12px;">
                <div class="detail-item">
                    <span style="color: var(--text-secondary);">Address:</span>
                    <code style="word-break: break-all; color: var(--green);">${balance.address || 'N/A'}</code>
                </div>
                <div class="detail-item">
                    <span style="color: var(--text-secondary);">ETH Balance:</span>
                    <span style="font-size: 1.5rem; color: var(--green);">${(balance.eth || 0).toFixed(6)} ETH</span>
                </div>
    `;
    
    if (balance.tokens && balance.tokens.length > 0) {
        content += `
                <div class="detail-item">
                    <span style="color: var(--text-secondary);">Other Tokens:</span>
                    <div style="margin-top: 8px;">
                        ${balance.tokens.map(t => `<div>${t.symbol}: ${t.balance}</div>`).join('')}
                    </div>
                </div>
        `;
    }
    
    content += `
                <div class="detail-item" style="margin-top: 8px;">
                    <span style="color: var(--text-muted); font-size: 0.8rem;">Last updated: ${balance.lastUpdated || 'N/A'}</span>
                </div>
            </div>
        </div>
    `;
    
    showModal('Wallet Details', content, [
        { label: 'Refresh', onclick: 'checkWalletDetails()', secondary: true },
        { label: 'Close', onclick: 'closeModal()' }
    ]);
}

async function browseMarketplace() {
    showToast('Loading ACP marketplace...', 'info');
    
    const data = await api.browseMarketplace();
    
    let content = `
        <div class="marketplace-browser">
            <p style="color: var(--text-secondary); margin-bottom: 16px;">
                Browse available agents in the ACP marketplace.
            </p>
    `;
    
    if (data.error) {
        content += `<div class="error-message" style="color: var(--red);">Error: ${data.error}</div>`;
    } else if (Array.isArray(data) && data.length > 0) {
        content += `<div class="result-list">`;
        data.slice(0, 10).forEach(agent => {
            content += `
                <div class="result-item">
                    <h4>${agent.name || 'Unnamed Agent'}</h4>
                    <p>${agent.description || 'No description'}</p>
                    <div style="font-size: 0.75rem; color: var(--cyan); margin-top: 4px;">
                        ${agent.price ? `Price: ${agent.price}` : ''} 
                        ${agent.category ? `| Category: ${agent.category}` : ''}
                    </div>
                </div>
            `;
        });
        content += `</div>`;
    } else {
        content += `
            <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                <p>No agents found in marketplace.</p>
                <p style="font-size: 0.8rem; margin-top: 8px;">The marketplace may be empty or the API is unavailable.</p>
            </div>
        `;
    }
    
    content += `</div>`;
    
    showModal('ACP Marketplace', content, [
        { label: 'Search', onclick: 'closeModal(); showMarketplaceSearch();', secondary: true },
        { label: 'Close', onclick: 'closeModal()' }
    ]);
}

function showMarketplaceSearch() {
    const content = `
        <div class="marketplace-search">
            <input type="text" class="search-input" id="marketplace-query" placeholder="Search for agents..." autofocus>
            <div id="search-results" class="result-list" style="margin-top: 16px;">
                <p style="color: var(--text-muted); text-align: center;">Enter a query to search the ACP marketplace</p>
            </div>
        </div>
    `;
    
    showModal('Search ACP Marketplace', content, [
        { label: 'Search', onclick: 'doMarketplaceSearch()' },
        { label: 'Close', onclick: 'closeModal()', secondary: true }
    ]);
    
    // Add enter key handler
    setTimeout(() => {
        const input = document.getElementById('marketplace-query');
        if (input) {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') doMarketplaceSearch();
            });
        }
    }, 100);
}

async function doMarketplaceSearch() {
    const query = document.getElementById('marketplace-query').value;
    const resultsEl = document.getElementById('search-results');
    
    if (!query.trim()) {
        showToast('Please enter a search query', 'warning');
        return;
    }
    
    resultsEl.innerHTML = '<div class="loading">Searching...</div>';
    
    try {
        const data = await api.searchMarketplace(query);
        
        if (data.error) {
            resultsEl.innerHTML = `<p style="color: var(--red);">Error: ${data.error}</p>`;
        } else if (data.results && data.results.length > 0) {
            resultsEl.innerHTML = data.results.map(r => `
                <div class="result-item">
                    <h4>${r.name || 'Unnamed'}</h4>
                    <p>${r.description || 'No description'}</p>
                </div>
            `).join('');
        } else {
            resultsEl.innerHTML = `<p style="color: var(--text-muted); text-align: center;">No results found for "${query}"</p>`;
        }
    } catch (e) {
        resultsEl.innerHTML = `<p style="color: var(--red);">Search failed: ${e.message}</p>`;
    }
}

// ==================== SESSION FUNCTIONS ====================

async function viewSessionDetails() {
    showToast('Loading session details...', 'info');
    
    const sessions = await api.getSessions();
    
    let content = `
        <div class="session-details">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
                <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; color: var(--cyan);">${sessions.active || 0}</div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">Active Processes</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2rem; color: ${sessions.gatewayStatus === 'running' ? 'var(--green)' : 'var(--red)'};">
                        ${sessions.gatewayStatus === 'running' ? '✓' : '✗'}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-secondary);">Gateway: ${sessions.gatewayStatus}</div>
                </div>
            </div>
    `;
    
    if (sessions.processes && sessions.processes.length > 0) {
        content += `
            <h4 style="color: var(--cyan); margin-bottom: 8px;">Running Processes:</h4>
            <div style="background: rgba(0,0,0,0.3); border-radius: 8px; padding: 8px;">
        `;
        sessions.processes.forEach(p => {
            content += `
                <div style="display: flex; justify-content: space-between; padding: 8px; border-bottom: 1px solid var(--border-color);">
                    <span style="color: var(--magenta);">PID ${p.pid}</span>
                    <span style="flex: 1; padding: 0 12px; overflow: hidden; text-overflow: ellipsis;">${p.command}</span>
                    <span style="color: var(--yellow);">${p.cpu}% CPU</span>
                </div>
            `;
        });
        content += `</div>`;
    }
    
    content += `</div>`;
    
    showModal('Session Details', content, [
        { label: 'Refresh', onclick: 'viewSessionDetails()', secondary: true },
        { label: 'Close', onclick: 'closeModal()' }
    ]);
}

async function restartGateway() {
    if (!confirm('Are you sure you want to restart the OpenClaw gateway?')) {
        return;
    }
    
    showToast('Restarting gateway...', 'info');
    addLocalActivity('command', 'Restarting OpenClaw gateway');
    
    const result = await api.runCommand('gateway-restart');
    
    if (result.success) {
        showToast('Gateway restart initiated', 'success');
        addLocalActivity('system', 'Gateway restarted successfully');
    } else {
        showToast(`Restart failed: ${result.error}`, 'error');
        addLocalActivity('error', `Gateway restart failed: ${result.error}`);
    }
}

// ==================== SYSTEM FUNCTIONS ====================

async function showSystemHealth() {
    showToast('Fetching system health...', 'info');
    
    const stats = await api.getSystemStats();
    
    const formatBytes = (bytes) => {
        const gb = bytes / (1024 * 1024 * 1024);
        return gb.toFixed(2) + ' GB';
    };
    
    const content = `
        <div class="system-health">
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 20px;">
                <div style="background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2.5rem; color: ${stats.cpu > 80 ? 'var(--red)' : 'var(--cyan)'};">${stats.cpu}%</div>
                    <div style="color: var(--text-secondary);">CPU</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2.5rem; color: ${stats.memory > 80 ? 'var(--red)' : 'var(--cyan)'};">${stats.memory}%</div>
                    <div style="color: var(--text-secondary);">Memory</div>
                </div>
                <div style="background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 2.5rem; color: ${stats.disk > 90 ? 'var(--red)' : 'var(--cyan)'};">${stats.disk}%</div>
                    <div style="color: var(--text-secondary);">Disk</div>
                </div>
            </div>
            
            <div style="background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px;">
                <h4 style="color: var(--cyan); margin-bottom: 12px;">System Information</h4>
                <div style="display: grid; gap: 8px; font-size: 0.9rem;">
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary);">Hostname:</span>
                        <span>${stats.hostname}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary);">Platform:</span>
                        <span>${stats.platform} (${stats.arch})</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary);">CPU Cores:</span>
                        <span>${stats.cpuCores}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary);">Memory:</span>
                        <span>${formatBytes(stats.memoryUsed)} / ${formatBytes(stats.memoryTotal)}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary);">Load Average:</span>
                        <span>${stats.loadAvg ? stats.loadAvg.join(', ') : 'N/A'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary);">Uptime:</span>
                        <span>${stats.uptimeFormatted}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary);">Network:</span>
                        <span style="color: ${stats.networkStatus === 'online' ? 'var(--green)' : 'var(--red)'};">
                            ${stats.networkStatus}
                        </span>
                    </div>
                    ${stats.temperature ? `
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-secondary);">Temperature:</span>
                        <span style="color: ${stats.temperature > 70 ? 'var(--red)' : 'var(--cyan)'};">
                            ${stats.temperature}°C
                        </span>
                    </div>
                    ` : ''}
                </div>
            </div>
            
            ${stats.alerts && stats.alerts.length > 0 ? `
            <div style="margin-top: 16px; background: rgba(255,51,102,0.2); border: 1px solid var(--red); padding: 12px; border-radius: 8px;">
                <h4 style="color: var(--red); margin-bottom: 8px;">⚠️ Alerts</h4>
                ${stats.alerts.map(a => `<div style="color: var(--red);">• ${a.message}</div>`).join('')}
            </div>
            ` : ''}
        </div>
    `;
    
    showModal('System Health', content, [
        { label: 'Refresh', onclick: 'showSystemHealth()', secondary: true },
        { label: 'Close', onclick: 'closeModal()' }
    ]);
}

async function showTopProcesses() {
    showToast('Fetching top processes...', 'info');
    
    const result = await api.runCommand('system-processes');
    
    const content = `
        <div class="processes">
            <p style="color: var(--text-secondary); margin-bottom: 12px;">Top processes by CPU usage:</p>
            <pre style="background: rgba(0,0,0,0.5); padding: 12px; border-radius: 8px; overflow-x: auto; font-size: 0.75rem; line-height: 1.4;">${result.output || 'No output'}</pre>
        </div>
    `;
    
    showModal('Top Processes', content, [
        { label: 'Refresh', onclick: 'showTopProcesses()', secondary: true },
        { label: 'Close', onclick: 'closeModal()' }
    ]);
}

// ==================== OTHER FUNCTIONS ====================

async function viewLogs() {
    showToast('Loading activity logs...', 'info');
    
    const activity = await api.getActivity();
    
    let content = `<div class="logs-view">`;
    
    if (activity && activity.length > 0) {
        content += `<div style="background: rgba(0,0,0,0.3); border-radius: 8px; max-height: 400px; overflow-y: auto;">`;
        activity.forEach(entry => {
            const time = new Date(entry.timestamp).toLocaleString();
            content += `
                <div style="padding: 10px; border-bottom: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="color: var(--text-muted); font-size: 0.75rem;">${time}</span>
                        <span style="background: var(--cyan); color: var(--bg-dark); padding: 2px 8px; border-radius: 4px; font-size: 0.7rem;">${entry.type}</span>
                    </div>
                    <div style="color: var(--text-primary);">${entry.message}</div>
                </div>
            `;
        });
        content += `</div>`;
    } else {
        content += `<p style="text-align: center; color: var(--text-muted);">No activity logs yet.</p>`;
    }
    
    content += `</div>`;
    
    showModal('Activity Logs', content, [
        { label: 'Refresh', onclick: 'viewLogs()', secondary: true },
        { label: 'Close', onclick: 'closeModal()' }
    ]);
}

function showRunTaskDialog() {
    const content = `
        <div class="run-task">
            <p style="color: var(--text-secondary); margin-bottom: 16px;">
                This feature allows spawning sub-agents for specific tasks.
            </p>
            <div style="background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; text-align: center;">
                <span style="font-size: 3rem;">🚀</span>
                <p style="margin-top: 12px; color: var(--cyan);">Coming Soon</p>
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 8px;">
                    Task spawning via the dashboard is under development.
                </p>
            </div>
        </div>
    `;
    
    showModal('Run Task', content);
}

async function showWhoAmI() {
    showToast('Fetching agent identity...', 'info');
    
    const result = await api.runCommand('acp-whoami');
    
    let content;
    if (result.success) {
        content = `<pre style="background: rgba(0,0,0,0.5); padding: 16px; border-radius: 8px; overflow-x: auto; color: var(--green);">${result.output}</pre>`;
    } else {
        content = `<p style="color: var(--red);">Could not fetch agent identity: ${result.error}</p>`;
    }
    
    showModal('Agent Identity (whoami)', content);
}

async function showGatewayStatus() {
    showToast('Checking gateway status...', 'info');
    
    const result = await api.runCommand('gateway-status');
    
    let content;
    if (result.success) {
        content = `<pre style="background: rgba(0,0,0,0.5); padding: 16px; border-radius: 8px; overflow-x: auto; color: var(--cyan); white-space: pre-wrap;">${result.output}</pre>`;
    } else {
        content = `<p style="color: var(--red);">Could not fetch gateway status: ${result.error}</p>`;
    }
    
    showModal('Gateway Status', content, [
        { label: 'Restart Gateway', onclick: 'closeModal(); restartGateway();', secondary: true },
        { label: 'Close', onclick: 'closeModal()' }
    ]);
}

// Export
window.initCommands = initCommands;
window.executeAction = executeAction;
window.doMarketplaceSearch = doMarketplaceSearch;
window.checkWalletDetails = checkWalletDetails;
window.viewSessionDetails = viewSessionDetails;
window.showSystemHealth = showSystemHealth;
window.showTopProcesses = showTopProcesses;
window.viewLogs = viewLogs;
window.showWhoAmI = showWhoAmI;
window.showGatewayStatus = showGatewayStatus;
window.showMarketplaceSearch = showMarketplaceSearch;
window.restartGateway = restartGateway;
