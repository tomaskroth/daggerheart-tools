import { SrdItem, SearchResponse } from '../types';

export type SearchParams = { q: string } | { types: string[] };

export async function fetchItemBySlug(serverUrl: string, slug: string): Promise<SrdItem> {
    const response = await fetch(`${serverUrl}/srd/${slug}`);
    if (!response.ok) throw new Error(`fetchItemBySlug failed: ${response.status}`);
    return response.json() as Promise<SrdItem>;
}

export async function fetchTypes(serverUrl: string): Promise<string[]> {
    const response = await fetch(serverUrl + '/srd/types');
    if (!response.ok) throw new Error(`fetchTypes failed: ${response.status}`);
    return response.json() as Promise<string[]>;
}

export async function searchItems(serverUrl: string, params: SearchParams): Promise<SearchResponse> {
    const response = await fetch(serverUrl + '/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!response.ok) throw new Error(`searchItems failed: ${response.status}`);
    return response.json() as Promise<SearchResponse>;
}
