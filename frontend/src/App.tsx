import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { CharacterSheetPage } from './features/character-sheet';
import SearchBar from './components/SearchBar';
import ItemList from './components/ItemList';
import ItemDetail from './components/ItemDetail';
import TypeMenu from './components/TypeMenu';
import { Analytics } from '@vercel/analytics/react';
import { KofiButton } from 'react-kofi-button';
import { useSrdTypes } from './hooks/useSrdTypes';
import { useSrdSearch } from './hooks/useSrdSearch';
import { fetchItemBySlug } from './services/srdApi';
import { SrdItem } from './types';

interface AppProps {
  serverUrl: string;
}

interface DetailRouteProps {
  serverUrl: string;
  darkMode: boolean;
}

function DetailRoute({ serverUrl, darkMode }: DetailRouteProps) {
  const { filename } = useParams<{ type: string; filename: string }>();
  const navigate = useNavigate();
  const slug = decodeURIComponent(filename ?? '').replace('.md', '');
  const [item, setItem] = useState<SrdItem | null>(null);

  useEffect(() => {
    if (slug) {
      fetchItemBySlug(serverUrl, slug)
        .then(setItem)
        .catch(() => setItem(null));
    }
  }, [slug, serverUrl]);

  if (!item) return null;

  return <ItemDetail item={item} onBack={() => navigate(-1)} darkMode={darkMode} />;
}

function App({ serverUrl }: AppProps) {
  const { types } = useSrdTypes(serverUrl);
  const { items, search, filterByType } = useSrdSearch(serverUrl);
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      return stored === 'true';
    }
    return window.matchMedia != null &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(dm => {
      localStorage.setItem('darkMode', String(!dm));
      return !dm;
    });
  };

  const handleSearch = (query: string) => {
    search(query);
    navigate('/');
  };

  const handleTypeClick = (type: string) => {
    filterByType(type);
    navigate('/');
  };

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
        <nav className="app-nav">
          <Link to="/character-sheet" className="app-nav__link">Character Sheet</Link>
        </nav>
      </header>
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <ItemList
                items={items}
                onItemClick={(item) => navigate(`/${item.type.toLowerCase()}/${item.slug}.md`)}
              />
            }
          />
          <Route
            path="/:type/:filename"
            element={<DetailRoute serverUrl={serverUrl} darkMode={darkMode} />}
          />
          <Route
            path="/character-sheet"
            element={<CharacterSheetPage />}
          />
        </Routes>
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

App.displayName = 'App';
DetailRoute.displayName = 'DetailRoute';

export default App;
