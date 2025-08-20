import React from "react";
import "../App.css";



function AbilitiesCard({ item, onBack, darkMode }) {
  if (!item) return null;

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

  const thunderIcon = darkMode 
    ? '/icons/thunder-dark.png'   // use a light version for dark mode
    : '/icons/thunder-light.png';   // use a dark version for light mode


  return (
    <div className="item-detail ability-card">
      <button onClick={onBack}>Back</button>
      <img 
        src={typeIcons[item.type.toLowerCase()] || '/placeholder-icon.png'} 
        className='item-detail-icon'
        alt={item.type}       
      />
      <div className="ability-title-row">
        <h1>{item.title}</h1>
        <div className="ability-meta">
        <span className="level">{item.level ?? "—"}</span>
          <span className="recall">
            {item.recallCost ?? "—"}
            <img src={thunderIcon} alt="Recall" className="recall-icon" />
            </span>          
        </div>
      </div>

      <div
        className="item-content"
        dangerouslySetInnerHTML={{ __html: item.content }}
      />
      {item.subtype && <h2>{item.subtype}</h2>}
    </div>    
  );
}

export default AbilitiesCard;