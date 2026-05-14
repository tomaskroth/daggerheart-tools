import { useState, useEffect } from 'react';
import { searchItems } from '../../../services/srdApi';
import type { SrdItem } from '../../../types';
import { CHARACTER_SHEET_API_URL } from '../constants';

interface UseSrdClassesResult {
  classes: SrdItem[];
  isLoading: boolean;
  error: string | null;
}

export function useSrdClasses(): UseSrdClassesResult {
  const [classes, setClasses] = useState<SrdItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    searchItems(CHARACTER_SHEET_API_URL, { types: ['CLASSES'] })
      .then((data) => {
        setClasses(Array.isArray(data.items) ? data.items : []);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { classes, isLoading, error };
}
