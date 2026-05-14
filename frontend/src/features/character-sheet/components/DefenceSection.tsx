import React from 'react';
import { useCharacterTraits } from '../hooks/useCharacterTraits';

const ARMOR_SLOT_COUNT = 6;

function DefenceSection(): React.ReactElement {
  const { evasion, armorScore, armorSlots, setEvasion, setArmorScore, toggleArmorSlot } =
    useCharacterTraits();

  function handleEvasionChange(rawValue: string): void {
    const parsed = parseInt(rawValue, 10);
    if (!isNaN(parsed)) {
      setEvasion(parsed);
    }
  }

  function handleArmorScoreChange(rawValue: string): void {
    const parsed = parseInt(rawValue, 10);
    setArmorScore(isNaN(parsed) ? null : parsed);
  }

  return (
    <section
      className="character-sheet__section"
      data-testid="defence-section"
      aria-label="Defence"
    >
      <h2>Defence</h2>
      <div className="defence-section__fields">
        <div className="defence-section__field">
          <label htmlFor="evasion-input" className="defence-section__label">
            Evasion
          </label>
          <input
            id="evasion-input"
            className="defence-section__input"
            type="number"
            aria-label="Evasion"
            data-testid="evasion-input"
            value={evasion}
            onChange={(e) => handleEvasionChange(e.target.value)}
          />
        </div>
        <div className="defence-section__field">
          <label htmlFor="armor-score-input" className="defence-section__label">
            Armor Score
          </label>
          <input
            id="armor-score-input"
            className="defence-section__input"
            type="number"
            aria-label="Armor Score"
            data-testid="armor-score-input"
            value={armorScore ?? ''}
            onChange={(e) => handleArmorScoreChange(e.target.value)}
          />
        </div>
      </div>
      <div className="defence-section__armor-slots" aria-label="Armor slots" data-testid="armor-slots">
        {Array.from({ length: ARMOR_SLOT_COUNT }, (_, index) => (
          <button
            key={index}
            className={`defence-section__armor-slot${armorSlots[index] ? ' defence-section__armor-slot--marked' : ''}`}
            aria-label={`Armor heart slot ${index + 1}${armorSlots[index] ? ', marked' : ', unmarked'}`}
            aria-pressed={armorSlots[index]}
            data-testid={`armor-slot-${index}`}
            type="button"
            onClick={() => toggleArmorSlot(index)}
          >
            {armorSlots[index] ? '♥' : '♡'}
          </button>
        ))}
      </div>
    </section>
  );
}

DefenceSection.displayName = 'DefenceSection';

export default DefenceSection;
