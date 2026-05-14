import { useState, useEffect } from 'react';
import { searchItems } from '../../../services/srdApi';
import type { SrdItem } from '../../../types';
import type { ArmorEntry } from '../types/character';
import { CHARACTER_SHEET_API_URL } from '../constants';

/**
 * Strip all HTML tags from a string, returning plain text.
 */
function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim();
}

/**
 * Extract the Base Thresholds value from armor HTML content.
 * e.g. "<strong>Base Thresholds:</strong> 5 / 11" → "5 / 11"
 */
function extractThresholds(html: string): string {
  const pattern = /<strong>Base Thresholds:<\/strong>\s*([^<]*?)(?=;?\s*<strong>|<\/p>)/i;
  const match = pattern.exec(html);
  if (match === null) {
    return '';
  }
  return match[1].replace(/^;\s*/, '').trim();
}

/**
 * Extract the Base Score numeric value from armor HTML content.
 * e.g. "<strong>Base Score:</strong> 3" → 3
 */
function extractBaseScore(html: string): number {
  const pattern = /<strong>Base Score:<\/strong>\s*(\d+)/i;
  const match = pattern.exec(html);
  if (match === null) {
    return 0;
  }
  return parseInt(match[1], 10);
}

/**
 * Extract the feature text (plain text) from armor HTML content.
 */
function extractFeatureText(html: string): string {
  const featurePattern = /<strong>Feature:<\/strong>\s*(.*?)<\/p>/is;
  const match = featurePattern.exec(html);
  if (match === null) {
    return '';
  }
  return stripHtmlTags(match[1]).trim();
}

/**
 * Extract the tier number from the trailing <em> tag in armor content.
 */
function extractTier(html: string): number {
  const tierMatch = /Tier\s+(\d)/i.exec(html);
  if (tierMatch === null) {
    return 0;
  }
  return parseInt(tierMatch[1], 10);
}

function parseArmorItem(item: SrdItem): ArmorEntry | null {
  try {
    const content = item.content;

    // Confirm this is an armor entry (not some other ARMOR type item)
    if (!/Armor\s+-\s+Tier/i.test(content)) {
      return null;
    }

    const tier = extractTier(content);
    const thresholds = extractThresholds(content);
    const baseScore = extractBaseScore(content);
    const feature = extractFeatureText(content);

    return {
      slug: item.slug,
      name: item.title,
      thresholds,
      baseScore,
      feature,
      tier,
    };
  } catch {
    // Malformed content degrades gracefully
    return null;
  }
}

interface UseSrdArmorResult {
  armorItems: ArmorEntry[];
  isLoading: boolean;
  error: string | null;
}

export function useSrdArmor(): UseSrdArmorResult {
  const [armorItems, setArmorItems] = useState<ArmorEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    searchItems(CHARACTER_SHEET_API_URL, { types: ['ARMOR'] })
      .then((data) => {
        const items = Array.isArray(data.items) ? data.items : [];
        const parsed = items
          .map(parseArmorItem)
          .filter((entry): entry is ArmorEntry => entry !== null)
          .filter((entry) => entry.tier === 1);
        setArmorItems(parsed);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { armorItems, isLoading, error };
}
