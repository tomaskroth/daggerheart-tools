import React from 'react';
import { useCharacterTraits } from '../hooks/useCharacterTraits';
import type { CharacterState } from '../types/character';

type TraitKey = keyof CharacterState['traits'];

interface TraitDefinition {
  key: TraitKey;
  label: string;
  subSkills: [string, string, string];
}

const TRAIT_DEFINITIONS: TraitDefinition[] = [
  { key: 'agility',   label: 'Agility',   subSkills: ['Sprint', 'Leap', 'Maneuver'] },
  { key: 'strength',  label: 'Strength',  subSkills: ['Lift', 'Smash', 'Grapple'] },
  { key: 'finesse',   label: 'Finesse',   subSkills: ['Control', 'Hide', 'Tinker'] },
  { key: 'instinct',  label: 'Instinct',  subSkills: ['Perceive', 'Sense', 'Navigate'] },
  { key: 'presence',  label: 'Presence',  subSkills: ['Charm', 'Perform', 'Deceive'] },
  { key: 'knowledge', label: 'Knowledge', subSkills: ['Recall', 'Analyze', 'Comprehend'] },
];

function TraitsSection(): React.ReactElement {
  const { traits, setTrait } = useCharacterTraits();

  function handleTraitChange(key: TraitKey, rawValue: string): void {
    const parsed = parseInt(rawValue, 10);
    setTrait(key, isNaN(parsed) ? null : parsed);
  }

  return (
    <section
      className="character-sheet__section"
      data-testid="traits-section"
      aria-label="Traits"
    >
      <h2>Traits</h2>
      <div className="traits-section__columns">
        {TRAIT_DEFINITIONS.map(({ key, label, subSkills }) => (
          <div
            key={key}
            className="traits-section__column"
            data-testid={`trait-column-${key}`}
          >
            <label
              className="traits-section__label"
              htmlFor={`trait-input-${key}`}
            >
              {label}
            </label>
            <input
              id={`trait-input-${key}`}
              className="traits-section__score-input"
              type="number"
              aria-label={`${label} score`}
              data-testid={`trait-input-${key}`}
              value={traits[key] ?? ''}
              onChange={(e) => handleTraitChange(key, e.target.value)}
            />
            <ul className="traits-section__sub-skills" aria-label={`${label} sub-skills`}>
              {subSkills.map((subSkill) => (
                <li key={subSkill} className="traits-section__sub-skill">
                  {subSkill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

TraitsSection.displayName = 'TraitsSection';

export default TraitsSection;
