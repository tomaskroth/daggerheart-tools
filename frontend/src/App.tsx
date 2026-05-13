import React, { useState, useEffect } from 'react';
import SearchBar from './components/SearchBar';
import ItemList from './components/ItemList';
import ItemDetail from './components/ItemDetail';
import TypeMenu from './components/TypeMenu';
import { Analytics } from '@vercel/analytics/react';
import { KofiButton } from 'react-kofi-button';
import { SrdItem, SearchResponse } from './types';

interface AppProps {
  serverUrl: string;
}

function App({ serverUrl }: AppProps) {
  const [items, setItems] = useState<SrdItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<SrdItem | null>(null);
  const [types, setTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    return window.matchMedia != null &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const location = window.location.pathname;

  useEffect(() => {
    fetch(serverUrl + '/srd/types')
      .then(res => res.json())
      .then(setTypes)
      .catch(console.error);
  }, [serverUrl]);

  useEffect(() => {
    const match = location.match(/^\/([^/]+)\/([^/]+)$/);
    if (match) {
      const itemName = decodeURIComponent(match[2].replace('.md', ''));
      fetch(serverUrl + '/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: itemName })
      })
        .then(res => res.json())
        .then((data: SearchResponse) => {
          if (Array.isArray(data.items) && data.items.length > 0) {
            setSelectedItem(data.items[0]);
            setItems(data.items);
          }
        })
        .catch(console.error);
    }
  }, [location, serverUrl]);

  const handleSearch = async (query: string) => {
    const response = await fetch(serverUrl + '/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query })
    });
    const data: SearchResponse = await response.json();
    setItems(data.items ?? []);
    setSelectedType(null);
    setSelectedItem(null);
  };

  const handleTypeClick = async (type: string) => {
    const response = await fetch(serverUrl + '/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ types: [type] })
    });
    const data: SearchResponse = await response.json();
    setItems(Array.isArray(data.items) ? data.items : []);
    setSelectedType(type);
    setSelectedItem(null);
  };

  const toggleDarkMode = () => {
    setDarkMode(dm => {
      localStorage.setItem('darkMode', String(!dm));
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
          <ItemDetail item={selectedItem} onBack={() => setSelectedItem(null)} darkMode={darkMode} />
        ) : (
          <ItemList items={items} onItemClick={setSelectedItem} />
        )}
      </main>
      <footer className="app-footer">
        <p>Made by <a href="https://github.com/tomaskroth/daggerheart-tools" title="Tomas Kroth">Tomás Kroth</a> | All content derived from <a href="https://www.daggerheart.com/srd/" title="Daggerheart SRD">Daggerheart SRD</a></p>
        <a href="https://www.flaticon.com" title="frame icons">Icons created by Flaticon</a>
        <div className="support-button">
          <KofiButton username='tomaskroth' label='Support me' backgroundColor='#7e37e0ff' />
        </div>
      </footer>
      <Analytics />
    </div>
  );
}

export default App;
