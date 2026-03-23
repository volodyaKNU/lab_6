import type { CatalogSource } from '../contracts/CatalogSource';
import type { ItemFactory } from '../contracts/ItemFactory';
import type { ResourceRepository } from '../contracts/ResourceRepository';
import type { CatalogItem } from '../models/CatalogItem';
import type { RawCatalogItem } from '../models/RawCatalogItem';
import { ItemFactoryRegistry } from '../factories/ItemFactoryRegistry';

export class CatalogService {
  constructor(
    private readonly source: CatalogSource,
    private readonly repository: ResourceRepository<CatalogItem>,
    private readonly factoryRegistry: ItemFactoryRegistry,
  ) {}

  async loadCatalog(): Promise<CatalogItem[]> {
    const rawItems = await this.source.loadItems();
    const mappedItems = this.factoryRegistry.createItems(rawItems);
    this.repository.setAll(mappedItems);
    return this.repository.getAll();
  }

  registerFactory(factory: ItemFactory): void {
    this.factoryRegistry.register(factory);
  }

  addItems(rawItems: RawCatalogItem[]): CatalogItem[] {
    const mappedItems = this.factoryRegistry.createItems(rawItems);
    this.repository.addMany(mappedItems);
    return mappedItems;
  }

  getItems(): CatalogItem[] {
    return this.repository.getAll();
  }

  getCategories(): string[] {
    return Array.from(new Set(this.repository.getAll().map((item) => item.category))).sort();
  }
}
