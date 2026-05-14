import { useState, useCallback } from 'react';
import { searchItems } from '../services/srdApi';
import { SrdItem } from '../types';

export function useSrdSearch(serverUrl: string): {
    items: SrdItem[];
    selectedType: string | null;
    loading: boolean;
    error: string | null;
    search: (query: string) => void;
    filterByType: (type: string) => void;
    clearSelection: () => void;
} {
    const [items, setItems] = useState<SrdItem[]>([]);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const search = useCallback((query: string) => {
        setLoading(true);
        setError(null);
        searchItems(serverUrl, { q: query })
            .then((data) => {
                setItems(data.items ?? []);
                setSelectedType(null);
            })
            .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
            .finally(() => setLoading(false));
    }, [serverUrl]);

    const filterByType = useCallback((type: string) => {
        setLoading(true);
        setError(null);
        searchItems(serverUrl, { types: [type] })
            .then((data) => {
                setItems(Array.isArray(data.items) ? data.items : []);
                setSelectedType(type);
            })
            .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
            .finally(() => setLoading(false));
    }, [serverUrl]);

    const clearSelection = useCallback(() => {
        setItems([]);
        setSelectedType(null);
    }, []);

    return { items, selectedType, loading, error, search, filterByType, clearSelection };
}
