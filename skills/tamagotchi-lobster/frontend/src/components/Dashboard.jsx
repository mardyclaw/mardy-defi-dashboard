import './Dashboard.css'

function Dashboard({ data, health, mood, petCount, onCleanup, onSettings }) {
  const system = data?.system || {}
  const wallet = data?.wallet || {}
  const sessions = data?.sessions || {}
  const api = data?.api || {}

  const formatBalance = (val) => {
    if (!val || val === 0) return '0.00'
    return parseFloat(val).toFixed(4)
  }

  return (
    <div className="dashboard">
      <div className="stat-card health-card">
        <h3>💚 Health</h3>
        <div className="health-bar-container">
          <div 
            className="health-bar" 
            style={{ 
              width: `${health}%`,
              background: health > 70 ? '#2ecc71' : health > 40 ? '#f39c12' : '#e74c3c'
            }}
          />
          <span className="health-value">{health}%</span>
        </div>
        <p className="health-desc">
          {health > 80 && '🌟 Feeling great!'}
          {health > 60 && health <= 80 && '😊 Doing well'}
          {health > 40 && health <= 60 && '😐 Could be better'}
          {health <= 40 && '😰 Need attention!'}
        </p>
      </div>

      <div className="stat-card">
        <h3>🧠 System Health</h3>
        <div className="stat-row">
          <span>CPU Usage:</span>
          <span className="stat-value">{system.cpu?.toFixed(1) || '0.0'}%</span>
        </div>
        <div className="stat-row">
          <span>Memory:</span>
          <span className="stat-value">{system.memory?.toFixed(1) || '0.0'}%</span>
        </div>
        <div className="stat-row">
          <span>Temperature:</span>
          <span className="stat-value">{system.temp?.toFixed(1) || 'N/A'}°C</span>
        </div>
      </div>

      <div className="stat-card wallet-card">
        <h3>💰 Wallet Balance</h3>
        <div className="balance-row">
          <span className="currency">ETH:</span>
          <span className="amount">{formatBalance(wallet.eth)}</span>
        </div>
        <div className="balance-row">
          <span className="currency">USDC:</span>
          <span className="amount">{formatBalance(wallet.usdc)}</span>
        </div>
        <div className="balance-row">
          <span className="currency">VIRTUAL:</span>
          <span className="amount">{formatBalance(wallet.virtual)}</span>
        </div>
      </div>

      <div className="stat-card">
        <h3>📊 Activity</h3>
        <div className="stat-row">
          <span>Active Sessions:</span>
          <span className="stat-value">{sessions.active || 0}</span>
        </div>
        <div className="stat-row">
          <span>Tasks Completed:</span>
          <span className="stat-value">{sessions.completed || 0}</span>
        </div>
        <div className="stat-row">
          <span>Times Petted:</span>
          <span className="stat-value">{petCount}</span>
        </div>
      </div>

      <div className="stat-card">
        <h3>🔌 API Usage</h3>
        <div className="stat-row">
          <span>Calls Today:</span>
          <span className="stat-value">{api.callsToday || 0}</span>
        </div>
        <div className="stat-row">
          <span>Tokens Used:</span>
          <span className="stat-value">{api.tokensUsed?.toLocaleString() || 0}</span>
        </div>
        <div className="stat-row">
          <span>Avg Response:</span>
          <span className="stat-value">{api.avgResponse || 0}ms</span>
        </div>
      </div>

      <div className="action-buttons">
        <button className="action-btn cleanup-btn" onClick={onCleanup}>
          🗑️ Feed & Cleanup
        </button>
        <button className="action-btn settings-btn" onClick={onSettings}>
          ⚙️ Settings
        </button>
      </div>
    </div>
  )
}

export default Dashboard
