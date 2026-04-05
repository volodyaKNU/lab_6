import type { ProductMetadata } from './ProductMetadata';

export interface RawCatalogItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description?: string;
  stock?: number;
  metadata?: ProductMetadata;
}
