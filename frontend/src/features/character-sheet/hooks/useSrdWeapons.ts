import { useState, useEffect } from 'react';
import { searchItems } from '../../../services/srdApi';
import type { SrdItem } from '../../../types';
import type { WeaponEntry } from '../types/character';
import { CHARACTER_SHEET_API_URL } from '../constants';

/**
 * Strip all HTML tags from a string, returning plain text.
 * Used to extract feature text from weapon/armor HTML content.
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

/**
 * Extract a named field value from weapon/armor HTML content.
 * Looks for the pattern: <strong>Label:</strong> value
 */
function extractField(html: string, label: string): string {
  // Match the label, then capture everything up to the next <strong> or end of </p>
  const pattern = new RegExp(`<strong>${label}:<\\/strong>\\s*([^<]*(?:<(?!\\/strong>|strong>)[^<]*)*?)(?=;?\\s*<strong>|<\\/p>)`, 'i');
  const match = pattern.exec(html);
  if (match === null) {
    return '';
  }
  return stripHtmlTags(match[1]).replace(/^;\s*/, '').trim();
}

/**
 * Extract the feature text (plain text) from weapon/armor HTML content.
 * The Feature label is followed by a bold-italic name then a colon and the description.
 */
function extractFeatureText(html: string): string {
  // Match after <strong>Feature:</strong> — grab everything up to </p>
  const featurePattern = /<strong>Feature:<\/strong>\s*(.*?)<\/p>/is;
  const match = featurePattern.exec(html);
  if (match === null) {
    return '';
  }
  return stripHtmlTags(match[1]).trim();
}

/**
 * Extract the tier number from the trailing <em> tag in weapon/armor content.
 * e.g. "Primary Weapon - Tier 1" → 1
 */
function extractTier(html: string): number {
  const tierMatch = /Tier\s+(\d)/i.exec(html);
  if (tierMatch === null) {
    return 0;
  }
  return parseInt(tierMatch[1], 10);
}

/**
 * Determine the weapon category from the trailing <em> tag.
 * Returns 'primary' | 'secondary' | null (null means not a weapon category line).
 */
function extractCategory(html: string): 'primary' | 'secondary' | null {
  if (/Primary Weapon/i.test(html)) {
    return 'primary';
  }
  if (/Secondary Weapon/i.test(html)) {
    return 'secondary';
  }
  return null;
}

function parseWeaponItem(item: SrdItem): WeaponEntry | null {
  try {
    const content = item.content;
    const tier = extractTier(content);
    const category = extractCategory(content);
    if (category === null) {
      return null;
    }

    const trait = extractField(content, 'Trait');
    const range = extractField(content, 'Range');
    const damage = extractField(content, 'Damage');
    const burden = extractField(content, 'Burden');
    const feature = extractFeatureText(content);

    return {
      slug: item.slug,
      name: item.title,
      trait,
      range,
      damage,
      burden,
      feature,
      tier,
      category,
    };
  } catch {
    // Malformed content degrades gracefully
    return null;
  }
}

interface UseSrdWeaponsResult {
  weapons: WeaponEntry[];
  isLoading: boolean;
  error: string | null;
}

export function useSrdWeapons(category: 'primary' | 'secondary'): UseSrdWeaponsResult {
  const [weapons, setWeapons] = useState<WeaponEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    searchItems(CHARACTER_SHEET_API_URL, { types: ['WEAPONS'] })
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : [];
        const parsed = items
          .map(parseWeaponItem)
          .filter((entry): entry is WeaponEntry => entry !== null)
          .filter((entry) => entry.tier === 1 && entry.category === category);
        setWeapons(parsed);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setIsLoading(false));
  }, [category]);

  return { weapons, isLoading, error };
}
