import React, { useState, useEffect } from 'react';
import { useCharacterEquipment } from '../hooks/useCharacterEquipment';
import { useSrdArmor } from '../hooks/useSrdArmor';
import type { ArmorEntry } from '../types/character';

function ActiveArmorSection(): React.ReactElement {
  const { activeArmor, setActiveArmor } = useCharacterEquipment();
  const { armorItems } = useSrdArmor();
  const [localArmor, setLocalArmor] = useState<ArmorEntry | null>(activeArmor);

  useEffect(() => {
    setLocalArmor(activeArmor);
  }, [activeArmor]);

  function handleDropdownChange(event: React.ChangeEvent<HTMLSelectElement>): void {
    const selectedSlug = event.target.value;
    if (selectedSlug === '') {
      setLocalArmor(null);
      setActiveArmor(null);
      return;
    }
    const selected = armorItems.find((a) => a.slug === selectedSlug) ?? null;
    setLocalArmor(selected);
    setActiveArmor(selected);
  }

  function handleFieldChange(field: keyof Pick<ArmorEntry, 'name' | 'thresholds' | 'feature'>): (event: React.ChangeEvent<HTMLInputElement>) => void {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      const updated: ArmorEntry = {
        slug: localArmor?.slug ?? '',
        name: localArmor?.name ?? '',
        thresholds: localArmor?.thresholds ?? '',
        baseScore: localArmor?.baseScore ?? 0,
        feature: localArmor?.feature ?? '',
        tier: localArmor?.tier ?? 1,
        [field]: event.target.value,
      };
      setLocalArmor(updated);
      setActiveArmor(updated);
    };
  }

  function handleBaseScoreChange(event: React.ChangeEvent<HTMLInputElement>): void {
    const parsed = parseInt(event.target.value, 10);
    const updated: ArmorEntry = {
      slug: localArmor?.slug ?? '',
      name: localArmor?.name ?? '',
      thresholds: localArmor?.thresholds ?? '',
      baseScore: isNaN(parsed) ? 0 : parsed,
      feature: localArmor?.feature ?? '',
      tier: localArmor?.tier ?? 1,
    };
    setLocalArmor(updated);
    setActiveArmor(updated);
  }

  return (
    <section
      className="character-sheet__section active-armor-section"
      data-testid="active-armor-section"
      aria-label="Active Armor"
    >
      <h2>Active Armor</h2>

      <div className="active-armor-section__picker">
        <label htmlFor="armor-select" className="active-armor-section__label">
          Select from SRD
        </label>
        <select
          id="armor-select"
          className="active-armor-section__select"
          data-testid="armor-select"
          aria-label="armor picker"
          value={localArmor?.slug ?? ''}
          onChange={handleDropdownChange}
        >
          <option value="">Select armor…</option>
          {armorItems.map((armor) => (
            <option key={armor.slug} value={armor.slug}>
              {armor.name}
            </option>
          ))}
        </select>
      </div>

      <div className="active-armor-section__fields">
        <div className="active-armor-section__field">
          <label htmlFor="armor-name" className="active-armor-section__field-label">
            Name
          </label>
          <input
            id="armor-name"
            type="text"
            className="active-armor-section__input"
            data-testid="armor-name"
            aria-label="Active Armor Name"
            value={localArmor?.name ?? ''}
            onChange={handleFieldChange('name')}
          />
        </div>

        <div className="active-armor-section__field">
          <label htmlFor="armor-thresholds" className="active-armor-section__field-label">
            Base Thresholds
          </label>
          <input
            id="armor-thresholds"
            type="text"
            className="active-armor-section__input"
            data-testid="armor-thresholds"
            aria-label="Active Armor Base Thresholds"
            value={localArmor?.thresholds ?? ''}
            onChange={handleFieldChange('thresholds')}
          />
        </div>

        <div className="active-armor-section__field">
          <label htmlFor="armor-base-score" className="active-armor-section__field-label">
            Base Score
          </label>
          <input
            id="armor-base-score"
            type="number"
            className="active-armor-section__input"
            data-testid="armor-base-score"
            aria-label="Active Armor Base Score"
            value={localArmor?.baseScore ?? ''}
            onChange={handleBaseScoreChange}
          />
        </div>

        <div className="active-armor-section__field">
          <label htmlFor="armor-feature" className="active-armor-section__field-label">
            Feature
          </label>
          <input
            id="armor-feature"
            type="text"
            className="active-armor-section__input"
            data-testid="armor-feature"
            aria-label="Active Armor Feature"
            value={localArmor?.feature ?? ''}
            onChange={handleFieldChange('feature')}
          />
        </div>
      </div>
    </section>
  );
}

ActiveArmorSection.displayName = 'ActiveArmorSection';

export default ActiveArmorSection;
