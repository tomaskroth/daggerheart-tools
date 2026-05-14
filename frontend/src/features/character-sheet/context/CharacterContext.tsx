import React, { createContext, useContext, useReducer } from 'react';
import type { CharacterState, CharacterAction, ExperienceEntry } from '../types/character';

const initialState: CharacterState = {
  name: '',
  pronouns: '',
  classSlug: null,
  heritageSlug: null,
  subclassSlug: null,
  level: null,

  traits: {
    agility: null,
    strength: null,
    finesse: null,
    instinct: null,
    presence: null,
    knowledge: null,
  },
  evasion: 10,
  armorScore: null,
  armorSlots: Array(6).fill(false) as boolean[],

  hpSolidCount: 6,
  damageThresholds: { minor: null, major: null, severe: null },
  hpSlots: Array(10).fill(false) as boolean[],
  stressSlots: Array(8).fill(false) as boolean[],

  hopeDiamonds: Array(6).fill(false) as boolean[],
  proficiencyPips: [true, false, false, false, false, false],
  experience: Array(5).fill(null).map((): ExperienceEntry => ({ name: '', modifier: null })),
  gold: { handfuls: 0, bags: 0, chest: 0 },

  primaryWeapon: null,
  secondaryWeapon: null,
  activeArmor: null,
  inventory: Array(6).fill('') as string[],
  inventoryWeapons: [
    { name: '', damage: '', range: '', feature: '', role: 'primary' },
    { name: '', damage: '', range: '', feature: '', role: 'primary' },
  ],
};

/**
 * Gauge fill helper — clicking slot at `index` (0-based) on an array of booleans:
 *   - If index >= current filled count → fill all slots 0..index (extend right)
 *   - If index <  current filled count → fill all slots 0..index-1 (retract from right)
 *
 * This matches the physical Daggerheart sheet where trackers fill left→right
 * and empty right→left. Identical to the gold section pattern.
 */
function gaugeToggle(slots: boolean[], index: number): boolean[] {
  const filled = slots.filter(Boolean).length;
  const newCount = index + 1 > filled ? index + 1 : index;
  return slots.map((_, i) => i < newCount);
}

function characterReducer(state: CharacterState, action: CharacterAction): CharacterState {
  switch (action.type) {
    case 'SET_IDENTITY':
      return { ...state, ...action.payload };

    case 'SET_TRAIT':
      return {
        ...state,
        traits: { ...state.traits, [action.payload.trait]: action.payload.value },
      };

    case 'SET_EVASION':
      return { ...state, evasion: action.payload };

    case 'SET_ARMOR_SCORE':
      return { ...state, armorScore: action.payload };

    case 'TOGGLE_ARMOR_SLOT':
      return { ...state, armorSlots: gaugeToggle(state.armorSlots, action.payload) };

    case 'SET_DAMAGE_THRESHOLD':
      return {
        ...state,
        damageThresholds: { ...state.damageThresholds, [action.payload.key]: action.payload.value },
      };

    case 'TOGGLE_HP_SLOT':
      return { ...state, hpSlots: gaugeToggle(state.hpSlots, action.payload) };

    case 'TOGGLE_STRESS_SLOT':
      return { ...state, stressSlots: gaugeToggle(state.stressSlots, action.payload) };

    case 'TOGGLE_HOPE_DIAMOND':
      return { ...state, hopeDiamonds: gaugeToggle(state.hopeDiamonds, action.payload) };

    case 'TOGGLE_PROFICIENCY_PIP':
      return { ...state, proficiencyPips: gaugeToggle(state.proficiencyPips, action.payload) };

    case 'SET_EXPERIENCE_NAME': {
      const experience = state.experience.map((entry, i) =>
        i === action.payload.index ? { ...entry, name: action.payload.value } : entry
      );
      return { ...state, experience };
    }

    case 'SET_EXPERIENCE_MODIFIER': {
      const experience = state.experience.map((entry, i) =>
        i === action.payload.index ? { ...entry, modifier: action.payload.value } : entry
      );
      return { ...state, experience };
    }

    case 'SET_GOLD':
      return { ...state, gold: { ...state.gold, ...action.payload } };

    case 'SET_PRIMARY_WEAPON':
      return { ...state, primaryWeapon: action.payload };

    case 'SET_SECONDARY_WEAPON':
      return { ...state, secondaryWeapon: action.payload };

    case 'SET_ACTIVE_ARMOR':
      return { ...state, activeArmor: action.payload };

    case 'SET_INVENTORY_LINE': {
      const inventory = state.inventory.map((line, i) =>
        i === action.payload.index ? action.payload.value : line
      );
      return { ...state, inventory };
    }

    case 'SET_INVENTORY_WEAPON': {
      const inventoryWeapons = state.inventoryWeapons.map((weapon, i) =>
        i === action.payload.index ? action.payload.value : weapon
      ) as CharacterState['inventoryWeapons'];
      return { ...state, inventoryWeapons };
    }

    default:
      return state;
  }
}

interface CharacterContextValue {
  state: CharacterState;
  dispatch: React.Dispatch<CharacterAction>;
}

const CharacterContext = createContext<CharacterContextValue | null>(null);
CharacterContext.displayName = 'CharacterContext';

interface CharacterProviderProps {
  children: React.ReactNode;
}

export function CharacterProvider({ children }: CharacterProviderProps): React.ReactElement {
  const [state, dispatch] = useReducer(characterReducer, initialState);
  return (
    <CharacterContext.Provider value={{ state, dispatch }}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacterContext(): CharacterContextValue {
  const context = useContext(CharacterContext);
  if (context === null) {
    throw new Error('useCharacterContext must be used within a CharacterProvider');
  }
  return context;
}
