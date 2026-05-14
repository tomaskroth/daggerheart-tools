import { useState, useEffect } from 'react';
import { searchItems } from '../../../services/srdApi';
import type { SrdItem } from '../../../types';
import { CHARACTER_SHEET_API_URL } from '../constants';

interface UseSrdSubclassesResult {
  subclasses: SrdItem[];
  isLoading: boolean;
  error: string | null;
}

export function useSrdSubclasses(classSlug: string | null): UseSrdSubclassesResult {
  const [allSubclasses, setAllSubclasses] = useState<SrdItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    searchItems(CHARACTER_SHEET_API_URL, { types: ['SUBCLASSES'] })
      .then((data) => {
        setAllSubclasses(Array.isArray(data.items) ? data.items : []);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const subclasses: SrdItem[] =
    classSlug === null
      ? []
      : allSubclasses.filter((item) =>
          Array.isArray(item.tags) && item.tags.includes(`class:${classSlug}`)
        );

  return { subclasses, isLoading, error };
}
