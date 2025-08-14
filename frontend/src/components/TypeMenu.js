import React from 'react';

function TypeMenu({ types, onTypeClick }) {
  types.sort((a, b) => a.localeCompare(b));
  return (
    <div className="type-menu">
      {types.map((type) => (
        <button key={type} onClick={() => onTypeClick(type)}>{type}</button>
      ))}
    </div>
  );
}

export default TypeMenu;
