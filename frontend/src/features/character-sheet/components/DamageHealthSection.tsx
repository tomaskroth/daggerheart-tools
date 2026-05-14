import React from 'react';
import { useCharacterHealth } from '../hooks/useCharacterHealth';

const STRESS_SOLID_COUNT = 4;

function DamageHealthSection(): React.ReactElement {
  const {
    hpSolidCount,
    damageThresholds,
    hpSlots,
    stressSlots,
    setDamageThreshold,
    toggleHpSlot,
    toggleStressSlot,
  } = useCharacterHealth();

  function handleThresholdChange(
    key: 'minor' | 'major' | 'severe',
    rawValue: string
  ): void {
    const parsed = parseInt(rawValue, 10);
    setDamageThreshold(key, isNaN(parsed) ? null : parsed);
  }

  return (
    <section
      className="character-sheet__section damage-health-section"
      data-testid="damage-health-section"
      aria-label="Damage &amp; Health"
    >
      <h2>Damage &amp; Health</h2>

      <div className="damage-health-section__thresholds">
        <p className="damage-health-section__hint" data-testid="damage-threshold-hint">
          Add your current level
        </p>

        <div className="damage-health-section__threshold-row">
          <label
            className="damage-health-section__threshold-label"
            htmlFor="threshold-minor"
          >
            Minor Damage
          </label>
          <input
            id="threshold-minor"
            className="damage-health-section__threshold-input"
            type="number"
            aria-label="Minor Damage threshold"
            data-testid="threshold-minor"
            value={damageThresholds.minor ?? ''}
            onChange={(e) => handleThresholdChange('minor', e.target.value)}
          />
        </div>

        <div className="damage-health-section__threshold-row">
          <label
            className="damage-health-section__threshold-label"
            htmlFor="threshold-major"
          >
            Major Damage
          </label>
          <input
            id="threshold-major"
            className="damage-health-section__threshold-input"
            type="number"
            aria-label="Major Damage threshold"
            data-testid="threshold-major"
            value={damageThresholds.major ?? ''}
            onChange={(e) => handleThresholdChange('major', e.target.value)}
          />
        </div>

        <div className="damage-health-section__threshold-row">
          <label
            className="damage-health-section__threshold-label"
            htmlFor="threshold-severe"
          >
            Severe Damage
          </label>
          <input
            id="threshold-severe"
            className="damage-health-section__threshold-input"
            type="number"
            aria-label="Severe Damage threshold"
            data-testid="threshold-severe"
            value={damageThresholds.severe ?? ''}
            onChange={(e) => handleThresholdChange('severe', e.target.value)}
          />
        </div>
      </div>

      <div
        className="damage-health-section__tracker"
        data-testid="hp-tracker"
        aria-label="HP tracker"
      >
        <span className="damage-health-section__tracker-label">HP</span>
        <div className="damage-health-section__slots">
          {hpSlots.map((isMarked, index) => {
            const isDashed = index >= hpSolidCount;
            return (
              <button
                key={index}
                type="button"
                className={[
                  'damage-health-section__slot',
                  isDashed
                    ? 'damage-health-section__slot--dashed'
                    : 'damage-health-section__slot--solid',
                  isMarked ? 'damage-health-section__slot--marked' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={`HP slot ${index + 1}${isMarked ? ' marked' : ''}`}
                aria-pressed={isMarked}
                data-testid={`hp-slot-${index + 1}`}
                data-slot-type={isDashed ? 'dashed' : 'solid'}
                onClick={() => toggleHpSlot(index)}
              />
            );
          })}
        </div>
      </div>

      <div
        className="damage-health-section__tracker"
        data-testid="stress-tracker"
        aria-label="Stress tracker"
      >
        <span className="damage-health-section__tracker-label">Stress</span>
        <div className="damage-health-section__slots">
          {stressSlots.map((isMarked, index) => {
            const isDashed = index >= STRESS_SOLID_COUNT;
            return (
              <button
                key={index}
                type="button"
                className={[
                  'damage-health-section__slot',
                  isDashed
                    ? 'damage-health-section__slot--dashed'
                    : 'damage-health-section__slot--solid',
                  isMarked ? 'damage-health-section__slot--marked' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={`Stress slot ${index + 1}${isMarked ? ' marked' : ''}`}
                aria-pressed={isMarked}
                data-testid={`stress-slot-${index + 1}`}
                data-slot-type={isDashed ? 'dashed' : 'solid'}
                onClick={() => toggleStressSlot(index)}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

DamageHealthSection.displayName = 'DamageHealthSection';

export default DamageHealthSection;
