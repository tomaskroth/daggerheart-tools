import React from 'react';
import { CharacterProvider } from '../context/CharacterContext';
import ClassHeader from './ClassHeader';
import ClassFeatureSection from './ClassFeatureSection';
import TraitsSection from './TraitsSection';
import DefenceSection from './DefenceSection';
import DamageHealthSection from './DamageHealthSection';
import HopeSection from './HopeSection';
import ExperienceSection from './ExperienceSection';
import GoldSection from './GoldSection';
import ActiveWeaponsSection from './ActiveWeaponsSection';
import ActiveArmorSection from './ActiveArmorSection';
import InventorySection from './InventorySection';

function CharacterSheetPageInner(): React.ReactElement {
  return (
    <div className="character-sheet" data-testid="character-sheet">
      <h1 className="character-sheet__title">Character Sheet</h1>
      <div className="character-sheet__columns">
        <div className="character-sheet__column character-sheet__column--left" data-testid="left-column">
          <ClassHeader />
          {/* Traits & Defence (PBI-010) */}
          <TraitsSection />
          <DefenceSection />
          <DamageHealthSection />
          <HopeSection />
          <ExperienceSection />
          <GoldSection />
        </div>
        <div className="character-sheet__column character-sheet__column--right" data-testid="right-column">
          <ActiveWeaponsSection />
          <ActiveArmorSection />
          <InventorySection />
        </div>
      </div>
      {/* Class Feature spans full width below the two-column grid (PBI-016) */}
      <ClassFeatureSection />
    </div>
  );
}

CharacterSheetPageInner.displayName = 'CharacterSheetPageInner';

function CharacterSheetPage(): React.ReactElement {
  return (
    <CharacterProvider>
      <CharacterSheetPageInner />
    </CharacterProvider>
  );
}

CharacterSheetPage.displayName = 'CharacterSheetPage';

export default CharacterSheetPage;
