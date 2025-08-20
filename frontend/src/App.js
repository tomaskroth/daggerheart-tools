import React, { useState, useEffect, use } from 'react';
import { useLocation } from 'react-router-dom'; // Add this import if using react-router
import SearchBar from './components/SearchBar';
import ItemList from './components/ItemList';
import ItemDetail from './components/ItemDetail';
import TypeMenu from './components/TypeMenu';
import { Analytics } from "@vercel/analytics/react"


function App({serverUrl}) {
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored !== null) {
      return stored === "true";
    }
    // fallback to system preference
    return window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Get current URL path
  const location = window.location.pathname; // If not using react-router, use this

  
  useEffect(() => {
    fetch(serverUrl+"/srd/types")
      .then(res => res.json())
      .then(setTypes)
      .catch(console.error);
  }, []);

  useEffect(() => {
  // Check if path matches /type/ItemName.md
    const match = location.match(/^\/([^/]+)\/([^/]+)$/);
    if (match) {
      const itemName = decodeURIComponent(match[2].replace('.md', ''));
      fetch(serverUrl+'/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: itemName })
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data.items) && data.items.length > 0) {
            setSelectedItem(data.items[0]);
            setItems(data.items);
          }
        })
        .catch(console.error);
    }
  }, [location]);

  const handleSearch = async (query) => {
    const response = await fetch(serverUrl+'/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query })
    });
    const data = await response.json();
    setItems(data.items || []);
    setSelectedType(null);
    setSelectedItem(null);
  };

  const handleTypeClick = async (type) => {
    const response = await fetch(serverUrl+'/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ types: [type] })
    });
    const data = await response.json();
    setItems(Array.isArray(data.items) ? data.items : []);
    setSelectedType(type);
    setSelectedItem(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(dm => {
      localStorage.setItem('darkMode', !dm);
      return !dm;
    });
  };

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <div className={`app${darkMode ? ' dark-mode' : ''}`}>
      <header className="app-header">
        <h1>
          <img src="/logo.webp" alt="Daggerheart Logo" style={{ height: '4rem', verticalAlign: 'middle' }} />
        </h1>
        <h1>
          <span>Compendium</span>
        </h1>
        <button
          className="dark-mode-toggle"
          onClick={toggleDarkMode}
          aria-label="Toggle dark mode"
        >
          {!darkMode ? '🌙' : '☀️'}
        </button>
        <SearchBar onSearch={handleSearch} />
        <TypeMenu types={types} onTypeClick={handleTypeClick} />
      </header>
      <main>
        {selectedItem ? (
          <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} darkMode={darkMode}/>
        ) : (
          <ItemList items={items} onItemClick={setSelectedItem} />
        )}
      </main>
      <footer className="app-footer">
        <p>Made by <a href="https://github.com/tomaskroth/daggerheart-tools" title="Tomas Kroth">Tomás Kroth</a> | All content derived from <a href="https://www.daggerheart.com/srd/" title="Daggerheart SRD">Daggerheart SRD</a></p>
        <a href="https://www.flaticon.com" title="frame icons">Icons created by Flaticon</a>        
      </footer>
      <Analytics/>
    </div>
  );
}

export default App;