import { describe, expect, it } from 'vitest';
import type { CatalogSource } from '../contracts/CatalogSource';
import { ElectronicsItemFactory } from '../factories/ElectronicsItemFactory';
import { ItemFactoryRegistry } from '../factories/ItemFactoryRegistry';
import { WearableItemFactory } from '../factories/WearableItemFactory';
import type { RawCatalogItem } from '../models/RawCatalogItem';
import { InMemoryCatalogRepository } from '../repositories/InMemoryCatalogRepository';
import { CatalogService } from '../services/CatalogService';

class FakeCatalogSource implements CatalogSource {
  constructor(private readonly items: RawCatalogItem[]) {}

  async loadItems(): Promise<RawCatalogItem[]> {
    return this.items;
  }
}

describe('CatalogService', () => {
  it('loads catalog and allows SOLID extension', async () => {
    const source = new FakeCatalogSource([
      { id: '1', name: 'Laptop', category: 'laptops', price: 2000, stock: 3 },
      { id: '2', name: 'Phone', category: 'smartphones', price: 1200, stock: 5 },
    ]);

    const service = new CatalogService(
      source,
      new InMemoryCatalogRepository(),
      new ItemFactoryRegistry([new ElectronicsItemFactory()]),
    );

    const items = await service.loadCatalog();
    expect(items).toHaveLength(2);
    expect(service.getCategories()).toEqual(['Laptops', 'Smartphones']);

    service.registerFactory(new WearableItemFactory());
    service.addItems([{ id: 'w1', name: 'Watch', category: 'wearables', price: 700, stock: 11 }]);

    expect(service.getItems()).toHaveLength(3);
    expect(service.getCategories()).toContain('Wearables');
  });
});
