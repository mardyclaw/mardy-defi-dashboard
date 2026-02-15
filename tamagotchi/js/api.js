/**
 * API - Real data fetching from backend
 */

const API_BASE = window.location.origin;
let connectionStatus = 'loading';
let pollIntervals = {};

// ==================== CORE API ====================

async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        throw error;
    }
}

async function postAPI(endpoint, data) {
    return fetchAPI(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
    });
}

// ==================== DATA ENDPOINTS ====================

async function getSystemStats() {
    return fetchAPI('/api/system/stats');
}

async function getWalletBalance() {
    return fetchAPI('/api/wallet/balance');
}

async function getSessions() {
    return fetchAPI('/api/sessions');
}

async function searchMarketplace(query) {
    return fetchAPI(`/api/marketplace/search?q=${encodeURIComponent(query)}`);
}

async function browseMarketplace(category = '') {
    return fetchAPI(`/api/marketplace/browse?category=${encodeURIComponent(category)}`);
}

async function getActivity() {
    return fetchAPI('/api/activity');
}

async function runCommand(command, args = []) {
    return postAPI('/api/command', { command, args });
}

async function healthCheck() {
    return fetchAPI('/api/health');
}

// ==================== POLLING ====================

function startDataPolling() {
    // Health check every 5s
    pollIntervals.health = setInterval(async () => {
        try {
            await healthCheck();
            setConnectionStatus('online');
        } catch {
            setConnectionStatus('offline');
        }
    }, 5000);
    
    // System stats every 3s
    pollIntervals.system = setInterval(async () => {
        try {
            const stats = await getSystemStats();
            window.dispatchEvent(new CustomEvent('systemUpdate', { detail: stats }));
        } catch (e) {
            console.error('System poll error:', e);
        }
    }, 3000);
    
    // Sessions every 5s
    pollIntervals.sessions = setInterval(async () => {
        try {
            const sessions = await getSessions();
            window.dispatchEvent(new CustomEvent('sessionsUpdate', { detail: sessions }));
        } catch (e) {
            console.error('Sessions poll error:', e);
        }
    }, 5000);
    
    // Wallet every 30s
    pollIntervals.wallet = setInterval(async () => {
        try {
            const wallet = await getWalletBalance();
            window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }));
        } catch (e) {
            console.error('Wallet poll error:', e);
        }
    }, 30000);
    
    // Activity every 10s
    pollIntervals.activity = setInterval(async () => {
        try {
            const activity = await getActivity();
            window.dispatchEvent(new CustomEvent('activityUpdate', { detail: activity }));
        } catch (e) {
            console.error('Activity poll error:', e);
        }
    }, 10000);
    
    // Initial fetch
    refreshAll();
    
    console.log('📡 Data polling started');
}

function stopDataPolling() {
    Object.values(pollIntervals).forEach(clearInterval);
    pollIntervals = {};
}

async function refreshAll() {
    setConnectionStatus('loading');
    
    try {
        const [system, wallet, sessions, activity] = await Promise.all([
            getSystemStats().catch(() => null),
            getWalletBalance().catch(() => null),
            getSessions().catch(() => null),
            getActivity().catch(() => [])
        ]);
        
        if (system) window.dispatchEvent(new CustomEvent('systemUpdate', { detail: system }));
        if (wallet) window.dispatchEvent(new CustomEvent('walletUpdate', { detail: wallet }));
        if (sessions) window.dispatchEvent(new CustomEvent('sessionsUpdate', { detail: sessions }));
        if (activity) window.dispatchEvent(new CustomEvent('activityUpdate', { detail: activity }));
        
        setConnectionStatus('online');
    } catch (e) {
        setConnectionStatus('offline');
    }
}

function setConnectionStatus(status) {
    connectionStatus = status;
    const indicator = document.getElementById('connection-status');
    if (indicator) {
        indicator.className = 'status-indicator ' + status;
    }
}

// ==================== INIT ====================

function initAPI() {
    console.log('🔌 API initialized');
}

// Export
window.initAPI = initAPI;
window.startDataPolling = startDataPolling;
window.stopDataPolling = stopDataPolling;
window.refreshAll = refreshAll;
window.api = {
    getSystemStats,
    getWalletBalance,
    getSessions,
    searchMarketplace,
    browseMarketplace,
    getActivity,
    runCommand,
    healthCheck
};
