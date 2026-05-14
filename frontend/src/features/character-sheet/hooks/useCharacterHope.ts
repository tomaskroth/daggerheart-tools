import { useCallback } from 'react';
import { useCharacterContext } from '../context/CharacterContext';
import type { CharacterState, ExperienceEntry } from '../types/character';

interface UseCharacterHopeResult {
  hopeDiamonds: boolean[];
  proficiencyPips: boolean[];
  experience: ExperienceEntry[];
  gold: CharacterState['gold'];
  toggleHopeDiamond: (index: number) => void;
  toggleProficiencyPip: (index: number) => void;
  setExperienceName: (index: number, value: string) => void;
  setExperienceModifier: (index: number, value: number | null) => void;
  setGold: (patch: Partial<CharacterState['gold']>) => void;
}

export function useCharacterHope(): UseCharacterHopeResult {
  const { state, dispatch } = useCharacterContext();

  const toggleHopeDiamond = useCallback(
    (index: number) => {
      dispatch({ type: 'TOGGLE_HOPE_DIAMOND', payload: index });
    },
    [dispatch]
  );

  const toggleProficiencyPip = useCallback(
    (index: number) => {
      dispatch({ type: 'TOGGLE_PROFICIENCY_PIP', payload: index });
    },
    [dispatch]
  );

  const setExperienceName = useCallback(
    (index: number, value: string) => {
      dispatch({ type: 'SET_EXPERIENCE_NAME', payload: { index, value } });
    },
    [dispatch]
  );

  const setExperienceModifier = useCallback(
    (index: number, value: number | null) => {
      dispatch({ type: 'SET_EXPERIENCE_MODIFIER', payload: { index, value } });
    },
    [dispatch]
  );

  const setGold = useCallback(
    (patch: Partial<CharacterState['gold']>) => {
      dispatch({ type: 'SET_GOLD', payload: patch });
    },
    [dispatch]
  );

  return {
    hopeDiamonds: state.hopeDiamonds,
    proficiencyPips: state.proficiencyPips,
    experience: state.experience,
    gold: state.gold,
    toggleHopeDiamond,
    toggleProficiencyPip,
    setExperienceName,
    setExperienceModifier,
    setGold,
  };
}
