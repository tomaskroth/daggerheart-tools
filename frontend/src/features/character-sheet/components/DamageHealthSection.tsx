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
    key: 'minor' | 'major',
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

      <div className="damage-health-section__thresholds" data-testid="damage-thresholds">
        <p className="damage-health-section__hint" data-testid="damage-threshold-hint">
          Add your current level
        </p>

        <div className="damage-health-section__thresholds-inline" data-testid="damage-thresholds-inline">
          <span className="damage-health-section__threshold-label" data-testid="threshold-label-minor">
            Minor Damage
          </span>
          <input
            id="threshold-minor"
            className="damage-health-section__threshold-input"
            type="number"
            min={0}
            aria-label="Minor to Major damage threshold"
            data-testid="threshold-minor"
            value={damageThresholds.minor ?? ''}
            onChange={(e) => handleThresholdChange('minor', e.target.value)}
          />
          <span className="damage-health-section__threshold-label" data-testid="threshold-label-major">
            Major Damage
          </span>
          <input
            id="threshold-major"
            className="damage-health-section__threshold-input"
            type="number"
            min={0}
            aria-label="Major to Severe damage threshold"
            data-testid="threshold-major"
            value={damageThresholds.major ?? ''}
            onChange={(e) => handleThresholdChange('major', e.target.value)}
          />
          <span className="damage-health-section__threshold-label" data-testid="threshold-label-severe">
            Severe Damage
          </span>
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
