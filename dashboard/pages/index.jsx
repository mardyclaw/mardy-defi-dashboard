import React from 'react';

export default function Dashboard() {
  const [price, setPrice] = React.useState('$0.1234');

  return (
    <div style={{
      background: 'linear-gradient(135deg, #0a0e27 0%, #1a1f3a 100%)',
      color: '#e0e0e0',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      padding: '20px',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <header style={{
          textAlign: 'center',
          marginBottom: '40px',
          paddingBottom: '30px',
          borderBottom: '2px solid rgba(100, 200, 255, 0.3)'
        }}>
          <h1 style={{
            fontSize: '42px',
            background: 'linear-gradient(90deg, #64c8ff, #4da6ff)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '10px'
          }}>
            🦞 RSC / USDC Market
          </h1>
          <p style={{ fontSize: '18px', color: '#64c8ff', marginTop: 0 }}>
            Morpho Blue Lending Market on Base
          </p>
        </header>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '40px'
        }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(100, 200, 255, 0.2)',
            borderRadius: '12px',
            padding: '25px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '14px', color: '#64c8ff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 'bold' }}>
              Current Price
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
              {price}
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(100, 200, 255, 0.2)',
            borderRadius: '12px',
            padding: '25px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '14px', color: '#64c8ff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 'bold' }}>
              Total Supply
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
              0 USDC
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(100, 200, 255, 0.2)',
            borderRadius: '12px',
            padding: '25px',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ fontSize: '14px', color: '#64c8ff', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 'bold' }}>
              Utilization Rate
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#fff', marginBottom: '8px' }}>
              0%
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(100, 150, 255, 0.1)',
          border: '2px solid #6496ff',
          borderRadius: '12px',
          padding: '25px',
          marginBottom: '40px'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#64c8ff' }}>Oracle Status</h3>
          <div style={{ marginTop: '15px', fontFamily: "'Courier New', monospace", fontSize: '12px', color: '#64c8ff' }}>
            <strong>Network:</strong> Base Sepolia<br />
            <strong>Status:</strong> Ready for deployment<br />
            <code style={{ display: 'block', marginTop: '8px', padding: '10px', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', wordBreak: 'break-all' }}>
              Oracle Address: 0x...
            </code>
          </div>
        </div>

        <div style={{ textAlign: 'center', color: '#64c8ff', fontSize: '14px' }}>
          <p>🚀 Dashboard live on Vercel</p>
          <p>Next: Deploy oracle → Create market → Go live</p>
        </div>
      </div>
    </div>
  );
}
