import React from 'react';
import type { InventoryWeaponEntry } from '../types/character';

interface InventoryWeaponPanelProps {
  index: 0 | 1;
  value: InventoryWeaponEntry;
  onChange: (index: 0 | 1, value: InventoryWeaponEntry) => void;
}

const ORDINAL_LABELS: Record<0 | 1, string> = {
  0: 'first',
  1: 'second',
};

function InventoryWeaponPanel({ index, value, onChange }: InventoryWeaponPanelProps): React.ReactElement {
  const ordinal = ORDINAL_LABELS[index];
  const testPrefix = `inventory-weapon-${index + 1}`;

  function handleFieldChange(field: keyof Pick<InventoryWeaponEntry, 'name' | 'damage' | 'range' | 'feature'>): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      onChange(index, { ...value, [field]: event.target.value });
    };
  }

  function handleRoleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const newRole = event.target.value as 'primary' | 'secondary';
    onChange(index, { ...value, role: newRole });
  }

  return (
    <div
      className="inventory-weapon-panel"
      data-testid={testPrefix}
      aria-label={`${ordinal} Inventory Weapon`}
    >
      <div className="inventory-weapon-panel__field">
        <label htmlFor={`${testPrefix}-name`} className="inventory-weapon-panel__label">
          Name
        </label>
        <input
          id={`${testPrefix}-name`}
          type="text"
          className="inventory-weapon-panel__input"
          data-testid={`${testPrefix}-name`}
          aria-label={`${ordinal} Inventory Weapon Name`}
          value={value.name}
          onChange={handleFieldChange('name')}
        />
      </div>

      <div className="inventory-weapon-panel__field">
        <label htmlFor={`${testPrefix}-trait-range`} className="inventory-weapon-panel__label">
          Trait &amp; Range
        </label>
        <input
          id={`${testPrefix}-trait-range`}
          type="text"
          className="inventory-weapon-panel__input"
          data-testid={`${testPrefix}-trait-range`}
          aria-label={`${ordinal} Inventory Weapon Trait & Range`}
          value={value.range}
          onChange={handleFieldChange('range')}
        />
      </div>

      <div className="inventory-weapon-panel__field">
        <label htmlFor={`${testPrefix}-damage`} className="inventory-weapon-panel__label">
          Damage Dice &amp; Type
        </label>
        <input
          id={`${testPrefix}-damage`}
          type="text"
          className="inventory-weapon-panel__input"
          data-testid={`${testPrefix}-damage`}
          aria-label={`${ordinal} Inventory Weapon Damage Dice & Type`}
          value={value.damage}
          onChange={handleFieldChange('damage')}
        />
      </div>

      <div className="inventory-weapon-panel__field">
        <label htmlFor={`${testPrefix}-feature`} className="inventory-weapon-panel__label">
          Feature
        </label>
        <input
          id={`${testPrefix}-feature`}
          type="text"
          className="inventory-weapon-panel__input"
          data-testid={`${testPrefix}-feature`}
          aria-label={`${ordinal} Inventory Weapon Feature`}
          value={value.feature}
          onChange={handleFieldChange('feature')}
        />
      </div>

      <fieldset className="inventory-weapon-panel__role-toggle">
        <legend className="inventory-weapon-panel__role-legend">Role</legend>
        <label className="inventory-weapon-panel__role-label">
          <input
            type="radio"
            name={`${testPrefix}-role`}
            value="primary"
            checked={value.role === 'primary'}
            onChange={handleRoleChange}
            data-testid={`${testPrefix}-role-primary`}
            aria-label={`${ordinal} Inventory Weapon Primary`}
          />
          Primary
        </label>
        <label className="inventory-weapon-panel__role-label">
          <input
            type="radio"
            name={`${testPrefix}-role`}
            value="secondary"
            checked={value.role === 'secondary'}
            onChange={handleRoleChange}
            data-testid={`${testPrefix}-role-secondary`}
            aria-label={`${ordinal} Inventory Weapon Secondary`}
          />
          Secondary
        </label>
      </fieldset>
    </div>
  );
}

InventoryWeaponPanel.displayName = 'InventoryWeaponPanel';

export default InventoryWeaponPanel;
