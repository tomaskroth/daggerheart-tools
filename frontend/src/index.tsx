import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ServerStatusGate from './components/ServerStatusGate';
import './App.css';

// const SERVER_URL = 'http://localhost:8080/api';
const SERVER_URL = 'https://daggerheart-tools-4v1t.onrender.com/api';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');

const root = ReactDOM.createRoot(rootElement);
root.render(
  <ServerStatusGate serverUrl={SERVER_URL}>
    <App serverUrl={SERVER_URL} />
  </ServerStatusGate>
);
