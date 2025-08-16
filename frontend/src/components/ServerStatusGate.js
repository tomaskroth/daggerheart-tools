import React, { useEffect, useState } from 'react';

function ServerStatusGate({ serverUrl, children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let interval;
    const checkServer = async () => {
      try {
        const res = await fetch(serverUrl, { method: 'GET' });
        if (res.status === 200) {
          setReady(true);
        } else {
          setReady(false);
        }
      } catch {
        setReady(false);
      }
    };
    checkServer();
    interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, [serverUrl]);

  if (!ready) {
    return (
      <div style={{ textAlign: 'center', marginTop: '5rem' }}>
        <div className="spinner" style={{
          border: '8px solid #ece0f8',
          borderTop: '8px solid #6b4cd6',
          borderRadius: '50%',
          width: '64px',
          height: '64px',
          animation: 'spin 1s linear infinite',
          margin: '0 auto'
        }} />
        <p>Daggerheart Tools is starting up...</p>
        <style>
          {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }
  return children;
}

export default ServerStatusGate;