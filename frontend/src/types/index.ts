export interface SrdItem {
  id: string;
  slug: string;
  title: string;
  type: string;
  content: string;
  excerpt?: string;
  level?: string | number;
  recallCost?: string | number;
  subtype?: string;
  tags?: string[];
}

export interface SearchResponse {
  items: SrdItem[];
  total: number;
}
