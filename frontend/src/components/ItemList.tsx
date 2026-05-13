import React from 'react';
import { SrdItem } from '../types';
import ItemCard from './ItemCard';

interface ItemListProps {
  items?: SrdItem[];
  onItemClick: (item: SrdItem) => void;
}

function ItemList({ items = [], onItemClick }: ItemListProps) {
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
