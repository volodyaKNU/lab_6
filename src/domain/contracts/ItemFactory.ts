import type { CatalogItem } from '../models/CatalogItem';
import type { RawCatalogItem } from '../models/RawCatalogItem';

export interface ItemFactory {
  supports(raw: RawCatalogItem): boolean;
  create(raw: RawCatalogItem): CatalogItem;
}
