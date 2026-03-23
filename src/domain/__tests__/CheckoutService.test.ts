import { describe, expect, it } from 'vitest';
import type { DiscountPolicy } from '../contracts/DiscountPolicy';
import type { CatalogItem } from '../models/CatalogItem';
import { NoDiscountPolicy } from '../discounts/NoDiscountPolicy';
import { CheckoutService } from '../services/CheckoutService';

class FixedDiscountPolicy implements DiscountPolicy {
  apply(subtotal: number): number {
    return subtotal - 100;
  }
}

const selection: CatalogItem[] = [
  { id: '1', name: 'Item A', category: 'A', price: 500, description: '', stock: 1 },
  { id: '2', name: 'Item B', category: 'B', price: 200, description: '', stock: 1 },
];

describe('CheckoutService', () => {
  it('calculates total and supports discount policy replacement', () => {
    const service = new CheckoutService(new NoDiscountPolicy());

    expect(service.calculateSubtotal(selection)).toBe(700);
    expect(service.calculateTotal(selection)).toBe(700);

    service.setDiscountPolicy(new FixedDiscountPolicy());
    expect(service.calculateTotal(selection)).toBe(600);
  });
});
