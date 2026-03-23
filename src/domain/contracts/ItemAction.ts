import type { CatalogItem } from '../models/CatalogItem';

export interface ItemAction {
  canHandle(item: CatalogItem): boolean;
  execute(item: CatalogItem): string;
}
