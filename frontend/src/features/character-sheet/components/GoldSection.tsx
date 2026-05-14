import React from 'react';
import { useCharacterHope } from '../hooks/useCharacterHope';

const HANDFUL_COUNT = 9;
const BAG_COUNT = 9;
const CHEST_COUNT = 1;

interface GoldSlotGroupProps {
  label: string;
  totalSlots: number;
  filledCount: number;
  testIdPrefix: string;
  onToggle: (slotIndex: number) => void;
}

function GoldSlotGroup({
  label,
  totalSlots,
  filledCount,
  testIdPrefix,
  onToggle,
}: GoldSlotGroupProps): React.ReactElement {
  return (
    <div
      className="gold-section__group"
      data-testid={`${testIdPrefix}-group`}
      aria-label={label}
    >
      <span className="gold-section__group-label">{label}</span>
      <div className="gold-section__slots">
        {Array.from({ length: totalSlots }, (_, index) => {
          const isMarked = index < filledCount;
          // Slot numbers are 1-indexed for user-facing labels
          const slotNumber = index + 1;
          return (
            <button
              key={index}
              type="button"
              className={[
                'gold-section__slot',
                isMarked ? 'gold-section__slot--marked' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              aria-label={`${label} slot ${slotNumber}${isMarked ? ' marked' : ''}`}
              aria-pressed={isMarked}
              data-testid={`${testIdPrefix}-slot-${slotNumber}`}
              onClick={() => onToggle(index)}
            />
          );
        })}
      </div>
    </div>
  );
}

GoldSlotGroup.displayName = 'GoldSlotGroup';

function GoldSection(): React.ReactElement {
  const { gold, setGold } = useCharacterHope();

  function handleHandfulToggle(index: number): void {
    // index is 0-based; slot number is index + 1
    const slotNumber = index + 1;
    const newCount = slotNumber > gold.handfuls ? slotNumber : slotNumber - 1;
    setGold({ handfuls: newCount });
  }

  function handleBagToggle(index: number): void {
    const slotNumber = index + 1;
    const newCount = slotNumber > gold.bags ? slotNumber : slotNumber - 1;
    setGold({ bags: newCount });
  }

  function handleChestToggle(index: number): void {
    const slotNumber = index + 1;
    const newCount = slotNumber > gold.chest ? slotNumber : slotNumber - 1;
    setGold({ chest: newCount });
  }

  return (
    <section
      className="character-sheet__section gold-section"
      data-testid="gold-section"
      aria-label="Gold"
    >
      <h2>Gold</h2>

      <GoldSlotGroup
        label="Handfuls"
        totalSlots={HANDFUL_COUNT}
        filledCount={gold.handfuls}
        testIdPrefix="handful"
        onToggle={handleHandfulToggle}
      />
      <GoldSlotGroup
        label="Bags"
        totalSlots={BAG_COUNT}
        filledCount={gold.bags}
        testIdPrefix="bag"
        onToggle={handleBagToggle}
      />
      <GoldSlotGroup
        label="Chest"
        totalSlots={CHEST_COUNT}
        filledCount={gold.chest}
        testIdPrefix="chest"
        onToggle={handleChestToggle}
      />
    </section>
  );
}

GoldSection.displayName = 'GoldSection';

export default GoldSection;
