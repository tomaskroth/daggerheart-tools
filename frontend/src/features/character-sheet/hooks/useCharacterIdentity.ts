import { useCharacterContext } from '../context/CharacterContext';
import type { CharacterState } from '../types/character';

type IdentityFields = Pick<CharacterState, 'name' | 'pronouns' | 'classSlug' | 'heritageSlug' | 'subclassSlug' | 'level' | 'hpSolidCount'>;

interface UseCharacterIdentityResult extends IdentityFields {
  setName: (value: string) => void;
  setPronouns: (value: string) => void;
  setClassSlug: (value: string | null) => void;
  setHeritageSlug: (value: string | null) => void;
  setSubclassSlug: (value: string | null) => void;
  setLevel: (value: number | null) => void;
  setIdentity: (payload: Partial<IdentityFields>) => void;
}

export function useCharacterIdentity(): UseCharacterIdentityResult {
  const { state, dispatch } = useCharacterContext();

  const setIdentity = (payload: Partial<IdentityFields>) => {
    dispatch({ type: 'SET_IDENTITY', payload });
  };

  return {
    name: state.name,
    pronouns: state.pronouns,
    classSlug: state.classSlug,
    heritageSlug: state.heritageSlug,
    subclassSlug: state.subclassSlug,
    level: state.level,
    hpSolidCount: state.hpSolidCount,
    setName: (value) => setIdentity({ name: value }),
    setPronouns: (value) => setIdentity({ pronouns: value }),
    setClassSlug: (value) => setIdentity({ classSlug: value }),
    setHeritageSlug: (value) => setIdentity({ heritageSlug: value }),
    setSubclassSlug: (value) => setIdentity({ subclassSlug: value }),
    setLevel: (value) => setIdentity({ level: value }),
    setIdentity,
  };
}
