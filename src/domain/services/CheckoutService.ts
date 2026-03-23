import type { DiscountPolicy } from '../contracts/DiscountPolicy';
import type { CatalogItem } from '../models/CatalogItem';

export class CheckoutService {
  constructor(private discountPolicy: DiscountPolicy) {}

  setDiscountPolicy(policy: DiscountPolicy): void {
    this.discountPolicy = policy;
  }

  calculateSubtotal(items: CatalogItem[]): number {
    return items.reduce((sum, item) => sum + item.price, 0);
  }

  calculateTotal(items: CatalogItem[]): number {
    const subtotal = this.calculateSubtotal(items);
    return this.discountPolicy.apply(subtotal, items);
  }
}
