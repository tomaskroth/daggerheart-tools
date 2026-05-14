import React, { useState, useEffect } from 'react';
import type { WeaponEntry } from '../types/character';

interface WeaponPanelProps {
  role: 'primary' | 'secondary';
  weapons: WeaponEntry[];
  value: WeaponEntry | null;
  onWeaponChange: (weapon: WeaponEntry | null) => void;
}

function WeaponPanel({ role, weapons, value, onWeaponChange }: WeaponPanelProps): React.ReactElement {
  const [localWeapon, setLocalWeapon] = useState<WeaponEntry | null>(value);

  // Sync local state when the context value changes from outside (e.g. on initial load)
  useEffect(() => {
    setLocalWeapon(value);
  }, [value]);

  const testPrefix = role === 'primary' ? 'primary' : 'secondary';
  const labelPrefix = role === 'primary' ? 'Primary' : 'Secondary';

  function handleDropdownChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    const selectedSlug = event.target.value;
    if (selectedSlug === '') {
      setLocalWeapon(null);
      onWeaponChange(null);
      return;
    }
    const selected = weapons.find((w) => w.slug === selectedSlug) ?? null;
    setLocalWeapon(selected);
    onWeaponChange(selected);
  }

  function handleFieldChange(field: keyof Pick<WeaponEntry, 'name' | 'trait' | 'range' | 'damage' | 'feature'>): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const updated: WeaponEntry = {
        slug: localWeapon?.slug ?? '',
        name: localWeapon?.name ?? '',
        trait: localWeapon?.trait ?? '',
        range: localWeapon?.range ?? '',
        damage: localWeapon?.damage ?? '',
        burden: localWeapon?.burden ?? '',
        feature: localWeapon?.feature ?? '',
        tier: localWeapon?.tier ?? 1,
        category: role,
        [field]: event.target.value,
      };
      setLocalWeapon(updated);
      onWeaponChange(updated);
    };
  }

  const traitAndRange = localWeapon !== null
    ? `${localWeapon.trait}${localWeapon.trait && localWeapon.range ? ' - ' : ''}${localWeapon.range}`
    : '';

  function handleTraitAndRangeChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const rawValue = event.target.value;
    const updated: WeaponEntry = {
      slug: localWeapon?.slug ?? '',
      name: localWeapon?.name ?? '',
      trait: rawValue,
      range: '',
      damage: localWeapon?.damage ?? '',
      burden: localWeapon?.burden ?? '',
      feature: localWeapon?.feature ?? '',
      tier: localWeapon?.tier ?? 1,
      category: role,
    };
    setLocalWeapon(updated);
    onWeaponChange(updated);
  }

  return (
    <div
      className={`weapon-panel weapon-panel--${role}`}
      data-testid={`${testPrefix}-weapon-panel`}
      aria-label={`${labelPrefix} Weapon`}
    >
      <h3 className="weapon-panel__title">{labelPrefix} Weapon</h3>

      <div className="weapon-panel__picker">
        <label htmlFor={`${testPrefix}-weapon-select`} className="weapon-panel__label">
          Select from SRD
        </label>
        <select
          id={`${testPrefix}-weapon-select`}
          className="weapon-panel__select"
          data-testid={`${testPrefix}-weapon-select`}
          aria-label={`${labelPrefix} weapon picker`}
          value={localWeapon?.slug ?? ''}
          onChange={handleDropdownChange}
        >
          <option value="">Select a weapon…</option>
          {weapons.map((weapon) => (
            <option key={weapon.slug} value={weapon.slug}>
              {weapon.name}
            </option>
          ))}
        </select>
      </div>

      <div className="weapon-panel__fields">
        <div className="weapon-panel__field">
          <label htmlFor={`${testPrefix}-weapon-name`} className="weapon-panel__field-label">
            Name
          </label>
          <input
            id={`${testPrefix}-weapon-name`}
            type="text"
            className="weapon-panel__input"
            data-testid={`${testPrefix}-weapon-name`}
            aria-label={`${labelPrefix} weapon Name`}
            value={localWeapon?.name ?? ''}
            onChange={handleFieldChange('name')}
          />
        </div>

        <div className="weapon-panel__field">
          <label htmlFor={`${testPrefix}-weapon-trait-range`} className="weapon-panel__field-label">
            Trait &amp; Range
          </label>
          <input
            id={`${testPrefix}-weapon-trait-range`}
            type="text"
            className="weapon-panel__input"
            data-testid={`${testPrefix}-weapon-trait-range`}
            aria-label={`${labelPrefix} weapon Trait & Range`}
            value={traitAndRange}
            onChange={handleTraitAndRangeChange}
          />
        </div>

        <div className="weapon-panel__field">
          <label htmlFor={`${testPrefix}-weapon-damage`} className="weapon-panel__field-label">
            Damage Dice &amp; Type
          </label>
          <input
            id={`${testPrefix}-weapon-damage`}
            type="text"
            className="weapon-panel__input"
            data-testid={`${testPrefix}-weapon-damage`}
            aria-label={`${labelPrefix} weapon Damage Dice & Type`}
            value={localWeapon?.damage ?? ''}
            onChange={handleFieldChange('damage')}
          />
        </div>

        <div className="weapon-panel__field">
          <label htmlFor={`${testPrefix}-weapon-feature`} className="weapon-panel__field-label">
            Feature
          </label>
          <input
            id={`${testPrefix}-weapon-feature`}
            type="text"
            className="weapon-panel__input"
            data-testid={`${testPrefix}-weapon-feature`}
            aria-label={`${labelPrefix} weapon Feature`}
            value={localWeapon?.feature ?? ''}
            onChange={handleFieldChange('feature')}
          />
        </div>
      </div>
    </div>
  );
}

WeaponPanel.displayName = 'WeaponPanel';

export default WeaponPanel;
