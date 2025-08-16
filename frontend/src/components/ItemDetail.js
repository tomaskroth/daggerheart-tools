import React from 'react';

function ItemDetail({ item, icon, onBack }) {

  const typeIcons = {
    contents: '/icons/contents.png',
    abilities: '/icons/abilities.png',
    adversaries: '/icons/monster.png',
    ancestries: '/icons/ancestry.png',
    weapons: '/icons/weapon.png',
    armor: '/icons/armor.png',
    communities: '/icons/castle.png',
    consumables: '/icons/consumables.png',
    domains: '/icons/domain.png',
    environments: '/icons/biome.png',
    frames: '/icons/frame.png',
    items: '/icons/items.png',
    classes: '/icons/class.png',
    subclasses: '/icons/class.png',
    weapons: '/icons/weapon.png',
  };

  return (
    <div className="item-detail">
      <button onClick={onBack} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Back</button>
      <h1>{item.title}</h1>
      <img 
        src={typeIcons[item.type.toLowerCase()] || '/placeholder-icon.png'} 
        className='item-detail-icon'
        alt={item.type}       
      />
      
      <div style={{ marginTop: '1rem' }} dangerouslySetInnerHTML={{ __html: item.content }} ></div>
    </div>
  );
}

export default ItemDetail;
