export interface ExperienceEntry {
  name: string;
  modifier: number | null;
}

export interface WeaponEntry {
  slug: string;
  name: string;
  trait: string;
  range: string;
  damage: string;
  burden: string;
  feature: string;
  tier: number;
  category: 'primary' | 'secondary';
}

export interface ArmorEntry {
  slug: string;
  name: string;
  thresholds: string;
  baseScore: number;
  feature: string;
  tier: number;
}

export interface InventoryWeaponEntry {
  name: string;
  damage: string;
  range: string;
  feature: string;
  role: 'primary' | 'secondary';
}

export interface CharacterState {
  // Identity (PBI-008)
  name: string;
  pronouns: string;
  classSlug: string | null;
  heritageSlug: string | null;
  subclassSlug: string | null;
  level: number | null;

  // Traits & Defence (PBI-010)
  traits: Record<'agility' | 'strength' | 'finesse' | 'instinct' | 'presence' | 'knowledge', number | null>;
  evasion: number;
  armorScore: number | null;
  armorSlots: boolean[];

  // Health (PBI-011, PBI-017)
  hpSolidCount: number;
  damageThresholds: { minor: number | null; major: number | null };
  hpSlots: boolean[];
  stressSlots: boolean[];

  // Hope & Gold (PBI-011, PBI-019)
  hopeDiamonds: boolean[];
  proficiencyPips: boolean[];
  experience: ExperienceEntry[];
  gold: { handfuls: number; bags: number; chest: number };

  // Equipment (PBI-012)
  primaryWeapon: WeaponEntry | null;
  secondaryWeapon: WeaponEntry | null;
  activeArmor: ArmorEntry | null;
  inventory: string[];
  inventoryWeapons: [InventoryWeaponEntry, InventoryWeaponEntry];
}

export type CharacterAction =
  | { type: 'SET_IDENTITY'; payload: Partial<Pick<CharacterState, 'name' | 'pronouns' | 'classSlug' | 'heritageSlug' | 'subclassSlug' | 'level' | 'hpSolidCount'>> }
  | { type: 'SET_TRAIT'; payload: { trait: keyof CharacterState['traits']; value: number | null } }
  | { type: 'SET_EVASION'; payload: number }
  | { type: 'SET_ARMOR_SCORE'; payload: number | null }
  | { type: 'TOGGLE_ARMOR_SLOT'; payload: number }
  | { type: 'SET_DAMAGE_THRESHOLD'; payload: { key: 'minor' | 'major'; value: number | null } }
  | { type: 'TOGGLE_HP_SLOT'; payload: number }
  | { type: 'TOGGLE_STRESS_SLOT'; payload: number }
  | { type: 'TOGGLE_HOPE_DIAMOND'; payload: number }
  | { type: 'TOGGLE_PROFICIENCY_PIP'; payload: number }
  | { type: 'SET_EXPERIENCE_NAME'; payload: { index: number; value: string } }
  | { type: 'SET_EXPERIENCE_MODIFIER'; payload: { index: number; value: number | null } }
  | { type: 'SET_GOLD'; payload: Partial<CharacterState['gold']> }
  | { type: 'SET_PRIMARY_WEAPON'; payload: WeaponEntry | null }
  | { type: 'SET_SECONDARY_WEAPON'; payload: WeaponEntry | null }
  | { type: 'SET_ACTIVE_ARMOR'; payload: ArmorEntry | null }
  | { type: 'SET_INVENTORY_LINE'; payload: { index: number; value: string } }
  | { type: 'SET_INVENTORY_WEAPON'; payload: { index: 0 | 1; value: InventoryWeaponEntry } };
