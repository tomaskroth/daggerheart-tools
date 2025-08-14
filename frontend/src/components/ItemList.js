import React from 'react';
import ItemCard from './ItemCard.js';

function ItemList({ items = [], onItemClick }) {
    
  if (!items || !Array.isArray(items)) return null;
  return (
    <div className="item-list" style={{ display: 'flex', flexWrap: 'wrap' }}>
      {items.map(item => (
        <ItemCard key={item.id} item={item} onClick={() => onItemClick(item)} />
      ))}
    </div>
  );
}

export default ItemList;
