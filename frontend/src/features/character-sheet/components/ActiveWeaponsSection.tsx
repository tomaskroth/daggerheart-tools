import React from 'react';
import { useCharacterHope } from '../hooks/useCharacterHope';
import { useCharacterEquipment } from '../hooks/useCharacterEquipment';
import { useSrdWeapons } from '../hooks/useSrdWeapons';
import WeaponPanel from './WeaponPanel';
import type { WeaponEntry } from '../types/character';

function ActiveWeaponsSection(): React.ReactElement {
  const { proficiencyPips, toggleProficiencyPip } = useCharacterHope();
  const { primaryWeapon, secondaryWeapon, setPrimaryWeapon, setSecondaryWeapon } = useCharacterEquipment();
  const { weapons: primaryWeapons } = useSrdWeapons('primary');
  const { weapons: secondaryWeapons } = useSrdWeapons('secondary');

  function handlePrimaryWeaponChange(weapon: WeaponEntry | null): void {
    setPrimaryWeapon(weapon);
  }

  function handleSecondaryWeaponChange(weapon: WeaponEntry | null): void {
    setSecondaryWeapon(weapon);
  }

  return (
    <section
      className="character-sheet__section active-weapons-section"
      data-testid="active-weapons-section"
      aria-label="Active Weapons"
    >
      <h2>Active Weapons</h2>

      <div
        className="active-weapons-section__proficiency"
        data-testid="proficiency-tracker"
        aria-label="Proficiency tracker"
      >
        <span className="active-weapons-section__proficiency-label">Proficiency</span>
        <div className="active-weapons-section__pips">
          {proficiencyPips.map((isFilled, index) => (
            <button
              key={index}
              type="button"
              className={[
                'active-weapons-section__pip',
                isFilled ? 'active-weapons-section__pip--filled' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`Proficiency pip ${index + 1}${isFilled ? ' filled' : ''}`}
              aria-pressed={isFilled}
              data-testid={`proficiency-pip-${index + 1}`}
              onClick={() => toggleProficiencyPip(index)}
            />
          ))}
        </div>
      </div>

      <WeaponPanel
        role="primary"
        weapons={primaryWeapons}
        value={primaryWeapon}
        onWeaponChange={handlePrimaryWeaponChange}
      />

      <WeaponPanel
        role="secondary"
        weapons={secondaryWeapons}
        value={secondaryWeapon}
        onWeaponChange={handleSecondaryWeaponChange}
      />
    </section>
  );
}

ActiveWeaponsSection.displayName = 'ActiveWeaponsSection';

export default ActiveWeaponsSection;
