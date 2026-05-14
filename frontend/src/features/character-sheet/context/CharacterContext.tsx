import React, { createContext, useContext, useReducer } from 'react';
import type { CharacterState, CharacterAction } from '../types/character';

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

  damageThresholds: { minor: null, major: null, severe: null },
  hpSlots: Array(10).fill(false) as boolean[],
  stressSlots: Array(8).fill(false) as boolean[],

  hopeDiamonds: Array(6).fill(false) as boolean[],
  proficiencyPips: [true, false, false, false, false, false],
  experience: Array(5).fill('') as string[],
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

    case 'TOGGLE_ARMOR_SLOT': {
      const armorSlots = state.armorSlots.map((slot, i) =>
        i === action.payload ? !slot : slot
      );
      return { ...state, armorSlots };
    }

    case 'SET_DAMAGE_THRESHOLD':
      return {
        ...state,
        damageThresholds: { ...state.damageThresholds, [action.payload.key]: action.payload.value },
      };

    case 'TOGGLE_HP_SLOT': {
      const hpSlots = state.hpSlots.map((slot, i) =>
        i === action.payload ? !slot : slot
      );
      return { ...state, hpSlots };
    }

    case 'TOGGLE_STRESS_SLOT': {
      const stressSlots = state.stressSlots.map((slot, i) =>
        i === action.payload ? !slot : slot
      );
      return { ...state, stressSlots };
    }

    case 'TOGGLE_HOPE_DIAMOND': {
      const hopeDiamonds = state.hopeDiamonds.map((diamond, i) =>
        i === action.payload ? !diamond : diamond
      );
      return { ...state, hopeDiamonds };
    }

    case 'TOGGLE_PROFICIENCY_PIP': {
      const proficiencyPips = state.proficiencyPips.map((pip, i) =>
        i === action.payload ? !pip : pip
      );
      return { ...state, proficiencyPips };
    }

    case 'SET_EXPERIENCE': {
      const experience = state.experience.map((entry, i) =>
        i === action.payload.index ? action.payload.value : entry
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
