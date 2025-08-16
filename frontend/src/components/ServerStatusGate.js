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
          clearInterval(interval); // Stop checking once server is ready
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
        <div className="spinner" />
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