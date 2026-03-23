import type { DiscountPolicy } from '../contracts/DiscountPolicy';
import type { CatalogItem } from '../models/CatalogItem';

export class NoDiscountPolicy implements DiscountPolicy {
  apply(subtotal: number, _items: CatalogItem[]): number {
    return subtotal;
  }
}
