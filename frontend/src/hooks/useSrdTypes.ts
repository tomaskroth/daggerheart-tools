import { useState, useEffect } from 'react';
import { fetchTypes } from '../services/srdApi';

export function useSrdTypes(serverUrl: string): {
    types: string[];
    loading: boolean;
    error: Error | null;
} {
    const [types, setTypes] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setLoading(true);
        fetchTypes(serverUrl)
            .then(setTypes)
            .catch((err: unknown) => setError(err instanceof Error ? err : new Error(String(err))))
            .finally(() => setLoading(false));
    }, [serverUrl]);

    return { types, loading, error };
}
