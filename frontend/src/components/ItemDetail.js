import React from 'react';

function ItemDetail({ item, onBack }) {
  return (
    <div className="item-detail">
      <button onClick={onBack} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>Back</button>
      <h1>{item.title}</h1>
      <p><strong>Type:</strong> {item.type}</p>
      <div style={{ marginTop: '1rem' }} dangerouslySetInnerHTML={{ __html: item.content }} ></div>
    </div>
  );
}

export default ItemDetail;
