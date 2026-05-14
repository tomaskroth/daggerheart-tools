import React from 'react';
import { useCharacterEquipment } from '../hooks/useCharacterEquipment';
import InventoryWeaponPanel from './InventoryWeaponPanel';
import type { InventoryWeaponEntry } from '../types/character';

const INVENTORY_LINE_COUNT = 6;

function InventorySection(): React.ReactElement {
  const { inventory, inventoryWeapons, setInventoryLine, setInventoryWeapon } = useCharacterEquipment();

  function handleInventoryLineChange(index: number): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      setInventoryLine(index, event.target.value);
    };
  }

  function handleInventoryWeaponChange(index: 0 | 1, value: InventoryWeaponEntry): void {
    setInventoryWeapon(index, value);
  }

  return (
    <section
      className="character-sheet__section inventory-section"
      data-testid="inventory-section"
      aria-label="Inventory"
    >
      <h2>Inventory</h2>

      <div className="inventory-section__lines" data-testid="inventory-lines">
        {Array.from({ length: INVENTORY_LINE_COUNT }, (_, i) => (
          <div key={i} className="inventory-section__line">
            <label htmlFor={`inventory-line-${i + 1}`} className="inventory-section__line-label">
              {i + 1}.
            </label>
            <input
              id={`inventory-line-${i + 1}`}
              type="text"
              className="inventory-section__line-input"
              data-testid={`inventory-line-${i + 1}`}
              aria-label={`Inventory line ${i + 1}`}
              value={inventory[i] ?? ''}
              onChange={handleInventoryLineChange(i)}
            />
          </div>
        ))}
      </div>

      <div className="inventory-section__weapons" data-testid="inventory-weapons">
        <InventoryWeaponPanel
          index={0}
          value={inventoryWeapons[0]}
          onChange={handleInventoryWeaponChange}
        />
        <InventoryWeaponPanel
          index={1}
          value={inventoryWeapons[1]}
          onChange={handleInventoryWeaponChange}
        />
      </div>
    </section>
  );
}

InventorySection.displayName = 'InventorySection';

export default InventorySection;
