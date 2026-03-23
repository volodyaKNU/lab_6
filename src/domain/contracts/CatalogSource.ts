import type { RawCatalogItem } from '../models/RawCatalogItem';

export interface CatalogSource {
  loadItems(): Promise<RawCatalogItem[]>;
}
