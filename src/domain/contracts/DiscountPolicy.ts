import type { CatalogItem } from '../models/CatalogItem';

export interface DiscountPolicy {
  apply(subtotal: number, items: CatalogItem[]): number;
}
