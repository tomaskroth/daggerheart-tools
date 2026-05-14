import { useCallback } from 'react';
import { useCharacterContext } from '../context/CharacterContext';
import type { WeaponEntry, ArmorEntry, InventoryWeaponEntry, CharacterState } from '../types/character';

interface UseCharacterEquipmentResult {
  primaryWeapon: WeaponEntry | null;
  secondaryWeapon: WeaponEntry | null;
  activeArmor: ArmorEntry | null;
  inventory: string[];
  inventoryWeapons: CharacterState['inventoryWeapons'];
  setPrimaryWeapon: (weapon: WeaponEntry | null) => void;
  setSecondaryWeapon: (weapon: WeaponEntry | null) => void;
  setActiveArmor: (armor: ArmorEntry | null) => void;
  setInventoryLine: (index: number, value: string) => void;
  setInventoryWeapon: (index: 0 | 1, value: InventoryWeaponEntry) => void;
}

export function useCharacterEquipment(): UseCharacterEquipmentResult {
  const { state, dispatch } = useCharacterContext();

  const setPrimaryWeapon = useCallback(
    (weapon: WeaponEntry | null) => {
      dispatch({ type: 'SET_PRIMARY_WEAPON', payload: weapon });
    },
    [dispatch]
  );

  const setSecondaryWeapon = useCallback(
    (weapon: WeaponEntry | null) => {
      dispatch({ type: 'SET_SECONDARY_WEAPON', payload: weapon });
    },
    [dispatch]
  );

  const setActiveArmor = useCallback(
    (armor: ArmorEntry | null) => {
      dispatch({ type: 'SET_ACTIVE_ARMOR', payload: armor });
    },
    [dispatch]
  );

  const setInventoryLine = useCallback(
    (index: number, value: string) => {
      dispatch({ type: 'SET_INVENTORY_LINE', payload: { index, value } });
    },
    [dispatch]
  );

  const setInventoryWeapon = useCallback(
    (index: 0 | 1, value: InventoryWeaponEntry) => {
      dispatch({ type: 'SET_INVENTORY_WEAPON', payload: { index, value } });
    },
    [dispatch]
  );

  return {
    primaryWeapon: state.primaryWeapon,
    secondaryWeapon: state.secondaryWeapon,
    activeArmor: state.activeArmor,
    inventory: state.inventory,
    inventoryWeapons: state.inventoryWeapons,
    setPrimaryWeapon,
    setSecondaryWeapon,
    setActiveArmor,
    setInventoryLine,
    setInventoryWeapon,
  };
}
