import { describe, expect, it } from 'vitest';
import type { CatalogItem } from '../models/CatalogItem';
import { CategoryFilterService } from '../services/CategoryFilterService';

const SAMPLE_ITEMS: CatalogItem[] = [
  {
    id: 'lap-1',
    name: 'Notebook',
    category: 'Laptops',
    price: 30000,
    description: 'x',
    stock: 5,
  },
  {
    id: 'tab-1',
    name: 'Tablet',
    category: 'Tablets',
    price: 18000,
    description: 'x',
    stock: 8,
  },
  {
    id: 'tab-2',
    name: 'Tablet Pro',
    category: 'Tablets',
    price: 24000,
    description: 'x',
    stock: 4,
  },
];

describe('CategoryFilterService', () => {
  it('selects first available category by default and emits only one category list', () => {
    const service = new CategoryFilterService();
    let latestVisibleItems: CatalogItem[] = [];

    const visibleItemsSubscription = service.visibleItems$.subscribe((items) => {
      latestVisibleItems = items;
    });

    service.setItems(SAMPLE_ITEMS);

    expect(service.getSelectedCategory()).toBe('Laptops');
    expect(latestVisibleItems).toHaveLength(1);
    expect(latestVisibleItems[0].category).toBe('Laptops');

    visibleItemsSubscription.unsubscribe();
  });

  it('updates visible items when category changes', () => {
    const service = new CategoryFilterService();
    let latestVisibleItems: CatalogItem[] = [];

    const visibleItemsSubscription = service.visibleItems$.subscribe((items) => {
      latestVisibleItems = items;
    });

    service.setItems(SAMPLE_ITEMS);
    service.setCategory('Tablets');

    expect(service.getSelectedCategory()).toBe('Tablets');
    expect(latestVisibleItems).toHaveLength(2);
    expect(latestVisibleItems.every((item) => item.category === 'Tablets')).toBe(true);

    visibleItemsSubscription.unsubscribe();
  });

  it('falls back to another category when selected one disappears', () => {
    const service = new CategoryFilterService();

    service.setItems(SAMPLE_ITEMS);
    service.setCategory('Tablets');
    service.setItems(SAMPLE_ITEMS.filter((item) => item.category !== 'Tablets'));

    expect(service.getSelectedCategory()).toBe('Laptops');
  });
});
