import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [search, setSearch] = useState("");
  const [items, setItems] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState("");

  // Fetch all types on component mount
  useEffect(() => {
    fetch("http://localhost:8080/api/types")
      .then((res) => res.json())
      .then((data) => setTypes(Array.isArray(data) ? data : []))
      .catch(() => setTypes([]));
  }, []);

  // Search handler
  const handleSearch = () => {
    if (!search.trim()) return;
    fetch(`http://localhost:8080/api/search?q=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
    setSelectedType("");
  };

  // Type menu click handler
  const handleTypeClick = (type) => {
    setSelectedType(type);
    fetch(`http://localhost:8080/api/search?types=${encodeURIComponent(type)}`)
      .then((res) => res.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]));
  };

  return (
    <div>
      {/* Navbar with logo and type menu */}
      <nav className="navbar">
        <img src="logo.webp" alt="Daggerheart" className="logo" />
        <div className="type-menu">
          {types.length > 0 ? (
            types.map((t) => (
              <button key={t} onClick={() => handleTypeClick(t)}>
                {t}
              </button>
            ))
          ) : (
            <span style={{ color: "#ffd166" }}>Loading types...</span>
          )}
        </div>
      </nav>

      {/* Search bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search Daggerheart SRD..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {/* Items display */}
      <div>
        {items.length > 0 ? (
          items.map((item) => (
            <div className="item-card" key={item.slug}>
              <h3>{item.title}</h3>
              <p className="type">{item.type}</p>
              <div
                className="item-content"
                dangerouslySetInnerHTML={{ __html: item.content }}
              />
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", marginTop: "2rem" }}>
            {selectedType
              ? `No items found for "${selectedType}"`
              : search
              ? `No results found for "${search}"`
              : "Use the search bar or select a type to see items."}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
