import React from 'react';
import ItemList from './ItemList';

function ItemCard({ item, onClick }) {
    const typeIcons = {
        contents: '/icons/contents.png',
        abilities: '/icons/abilities.png',
        adversaries: '/icons/monster.png',
        ancestries: '/icons/ancestry.png',
        weapons: '/icons/weapon.png',
        armor: '/icons/armor.png',
        communities: '/icons/communities.png',
        consumables: '/icons/consumables.png',
        domains: '/icons/domain.png',
        environments: '/icons/environment.png',
        frames: '/icons/frames.png',
        items: '/icons/items.png',
        classes: '/icons/class.png',
        subclasses: '/icons/class.png',
        weapons: '/icons/weapon.png',
    };
    console.log(item.type);
    console.log(typeIcons[item.type.toLowerCase()]);
  return (
    <div 
      className="item-card" 
      onClick={onClick} 
      style={{
        borderRadius: '8px',
        padding: '1rem',
        margin: '0.5rem',
        cursor: 'pointer',
        width: '200px',
        textAlign: 'center'
      }}
    >
      <img 
        src={typeIcons[item.type.toLowerCase()] || '/placeholder-icon.png'} 
        alt={item.type} 
        style={{ width: '64px', height: '64px', marginBottom: '0.5rem' }} 
      />
      <h3>{item.title}</h3>
    </div>
  );
}

export default ItemCard;
