import { describe, expect, it } from 'vitest';
import type { CatalogItem } from '../models/CatalogItem';
import { PriceRangePipe } from '../pipes/PriceRangePipe';

const items: CatalogItem[] = [
  {
    id: 'acc-1',
    name: 'Adapter',
    category: 'Accessories',
    price: 999,
    description: '',
    stock: 10,
  },
  {
    id: 'phone-1',
    name: 'Phone',
    category: 'Smartphones',
    price: 21999,
    description: '',
    stock: 4,
  },
  {
    id: 'lap-1',
    name: 'Laptop',
    category: 'Laptops',
    price: 45999,
    description: '',
    stock: 2,
  },
];

describe('PriceRangePipe', () => {
  it('returns a copy of all items when range is empty', () => {
    const pipe = new PriceRangePipe();
    const result = pipe.transform(items, {});

    expect(result).toEqual(items);
    expect(result).not.toBe(items);
  });

  it('filters products by inclusive price range', () => {
    const pipe = new PriceRangePipe();

    expect(pipe.transform(items, { min: 1000, max: 30000 }).map((item) => item.id)).toEqual([
      'phone-1',
    ]);
  });

  it('supports only one bound and normalizes reversed bounds', () => {
    const pipe = new PriceRangePipe();

    expect(pipe.transform(items, { max: 1000 }).map((item) => item.id)).toEqual(['acc-1']);
    expect(pipe.transform(items, { min: 30000, max: 1000 }).map((item) => item.id)).toEqual([
      'phone-1',
    ]);
  });
});
