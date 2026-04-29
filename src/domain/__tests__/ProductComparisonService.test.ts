import { describe, expect, it } from 'vitest';
import type { CatalogItem } from '../models/CatalogItem';
import { ProductComparisonService } from '../services/ProductComparisonService';

const comparedItems: CatalogItem[] = [
  {
    id: 'phone-1',
    name: 'Photon S',
    category: 'Smartphones',
    price: 21999,
    description: '',
    stock: 3,
    metadata: {
      warrantyMonths: 24,
      manufacturedAt: '2026-01-10',
      highlights: ['AMOLED', '5G'],
    },
  },
  {
    id: 'lap-1',
    name: 'SwiftBook Air 14',
    category: 'Laptops',
    price: 45999,
    description: '',
    stock: 2,
  },
  {
    id: 'phone-1',
    name: 'Photon S',
    category: 'Smartphones',
    price: 21999,
    description: '',
    stock: 3,
  },
];

describe('ProductComparisonService', () => {
  it('builds comparison rows and ignores duplicated selected products', () => {
    const service = new ProductComparisonService();
    const comparison = service.createComparison(comparedItems);

    expect(comparison.items.map((item) => item.id)).toEqual(['phone-1', 'lap-1']);
    expect(comparison.rows.find((row) => row.label === 'Price')?.values).toEqual([
      '21999 UAH',
      '45999 UAH',
    ]);
    expect(comparison.rows.find((row) => row.label === 'Highlights')?.values).toEqual([
      'AMOLED, 5G',
      '-',
    ]);
  });
});
