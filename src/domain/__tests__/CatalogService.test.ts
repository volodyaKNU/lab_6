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
    expect(service.getItemsByCategory('Laptops')).toHaveLength(1);

    service.registerFactory(new WearableItemFactory());
    service.addItems([{ id: 'w1', name: 'Watch', category: 'wearables', price: 700, stock: 11 }]);

    expect(service.getItems()).toHaveLength(3);
    expect(service.getCategories()).toContain('Wearables');
  });

  it('supports add, update and remove operations for single item', async () => {
    const service = new CatalogService(
      new FakeCatalogSource([]),
      new InMemoryCatalogRepository(),
      new ItemFactoryRegistry([new ElectronicsItemFactory()]),
    );

    const added = service.addItem({
      id: 'lap-9',
      name: 'CreatorBook',
      category: 'laptops',
      price: 3500,
      stock: 4,
    });

    expect(added.category).toBe('Laptops');

    const updated = service.updateItem({ ...added, stock: 2 });
    expect(updated.stock).toBe(2);
    expect(service.getItems()).toHaveLength(1);

    service.removeItem('lap-9');
    expect(service.getItems()).toHaveLength(0);
  });
});
