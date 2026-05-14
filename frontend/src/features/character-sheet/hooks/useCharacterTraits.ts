import { useCallback } from 'react';
import { useCharacterContext } from '../context/CharacterContext';
import type { CharacterState } from '../types/character';

type TraitKey = keyof CharacterState['traits'];

interface UseCharacterTraitsResult {
  traits: CharacterState['traits'];
  evasion: number;
  armorScore: number | null;
  armorSlots: boolean[];
  setTrait: (trait: TraitKey, value: number | null) => void;
  setEvasion: (value: number) => void;
  setArmorScore: (value: number | null) => void;
  toggleArmorSlot: (index: number) => void;
}

export function useCharacterTraits(): UseCharacterTraitsResult {
  const { state, dispatch } = useCharacterContext();

  const setTrait = useCallback(
    (trait: TraitKey, value: number | null) => {
      dispatch({ type: 'SET_TRAIT', payload: { trait, value } });
    },
    [dispatch]
  );

  const setEvasion = useCallback(
    (value: number) => {
      dispatch({ type: 'SET_EVASION', payload: value });
    },
    [dispatch]
  );

  const setArmorScore = useCallback(
    (value: number | null) => {
      dispatch({ type: 'SET_ARMOR_SCORE', payload: value });
    },
    [dispatch]
  );

  const toggleArmorSlot = useCallback(
    (index: number) => {
      dispatch({ type: 'TOGGLE_ARMOR_SLOT', payload: index });
    },
    [dispatch]
  );

  return {
    traits: state.traits,
    evasion: state.evasion,
    armorScore: state.armorScore,
    armorSlots: state.armorSlots,
    setTrait,
    setEvasion,
    setArmorScore,
    toggleArmorSlot,
  };
}
