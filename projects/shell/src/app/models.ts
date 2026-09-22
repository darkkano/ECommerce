export type ProductKind = 'garment' | 'footwear' | 'accessory' | 'look';

export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  kind: ProductKind;
  fabric: string;
  colors: string[];
  sizes: string[];
  image: string;
  blurb: string;
  description: string;
  tags: string[];
}

export interface SearchHit {
  product: Product;
  vectorScore: number;
  lexicalScore: number;
  hybridScore: number;
  affinity: number;
  keywordMatch: boolean;
  reasons: string[];
  dims: string[];
}

export interface IntentChip {
  id: string;
  label: string;
}

export interface SearchResponse {
  query: string;
  mode: 'semantic' | 'keyword';
  corrected: { text: string; changes: { from: string; to: string }[] } | null;
  intent: {
    id: string;
    summary: string;
    chips: IntentChip[];
    tokens: string[];
    dims: number;
  };
  counts: {
    catalog: number;
    semantic: number;
    keyword: number;
  };
  hits: SearchHit[];
  keywordHits: SearchHit[];
  semanticHits: SearchHit[];
  metrics: {
    totalMs: number;
    dims: number;
    engine: string;
  };
}

export type SearchMode = 'semantic' | 'keyword';
