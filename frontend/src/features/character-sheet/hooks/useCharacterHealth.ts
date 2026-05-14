import { useCallback } from 'react';
import { useCharacterContext } from '../context/CharacterContext';
import type { CharacterState } from '../types/character';

interface UseCharacterHealthResult {
  damageThresholds: CharacterState['damageThresholds'];
  hpSlots: boolean[];
  stressSlots: boolean[];
  setDamageThreshold: (key: 'minor' | 'major' | 'severe', value: number | null) => void;
  toggleHpSlot: (index: number) => void;
  toggleStressSlot: (index: number) => void;
}

export function useCharacterHealth(): UseCharacterHealthResult {
  const { state, dispatch } = useCharacterContext();

  const setDamageThreshold = useCallback(
    (key: 'minor' | 'major' | 'severe', value: number | null) => {
      dispatch({ type: 'SET_DAMAGE_THRESHOLD', payload: { key, value } });
    },
    [dispatch]
  );

  const toggleHpSlot = useCallback(
    (index: number) => {
      dispatch({ type: 'TOGGLE_HP_SLOT', payload: index });
    },
    [dispatch]
  );

  const toggleStressSlot = useCallback(
    (index: number) => {
      dispatch({ type: 'TOGGLE_STRESS_SLOT', payload: index });
    },
    [dispatch]
  );

  return {
    damageThresholds: state.damageThresholds,
    hpSlots: state.hpSlots,
    stressSlots: state.stressSlots,
    setDamageThreshold,
    toggleHpSlot,
    toggleStressSlot,
  };
}
