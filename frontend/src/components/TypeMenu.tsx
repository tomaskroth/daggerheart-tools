import React from 'react';

interface TypeMenuProps {
  types: string[];
  onTypeClick: (type: string) => void;
}

function TypeMenu({ types, onTypeClick }: TypeMenuProps) {
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
