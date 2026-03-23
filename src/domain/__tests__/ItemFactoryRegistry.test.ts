import { describe, expect, it } from 'vitest';
import { ElectronicsItemFactory } from '../factories/ElectronicsItemFactory';
import { ItemFactoryRegistry } from '../factories/ItemFactoryRegistry';
import { WearableItemFactory } from '../factories/WearableItemFactory';
import type { RawCatalogItem } from '../models/RawCatalogItem';

const rawItems: RawCatalogItem[] = [
  {
    id: 'base-1',
    name: 'Notebook X',
    category: 'laptops',
    price: 1000,
    stock: 2,
  },
  {
    id: 'ext-1',
    name: 'Band X',
    category: 'wearables',
    price: 300,
    stock: 10,
  },
];

describe('ItemFactoryRegistry', () => {
  it('supports extension through new factory registration', () => {
    const registry = new ItemFactoryRegistry([new ElectronicsItemFactory()]);

    const mappedBeforeExtension = registry.createItems(rawItems);
    expect(mappedBeforeExtension).toHaveLength(1);
    expect(mappedBeforeExtension[0].category).toBe('Laptops');

    registry.register(new WearableItemFactory());
    const mappedAfterExtension = registry.createItems(rawItems);

    expect(mappedAfterExtension).toHaveLength(2);
    expect(mappedAfterExtension.find((item) => item.category === 'Wearables')).toBeDefined();
  });
});
