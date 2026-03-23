import type { ItemFactory } from '../contracts/ItemFactory';
import type { CatalogItem } from '../models/CatalogItem';
import type { RawCatalogItem } from '../models/RawCatalogItem';

export class ItemFactoryRegistry {
  private factories: ItemFactory[];

  constructor(factories: ItemFactory[] = []) {
    this.factories = [...factories];
  }

  register(factory: ItemFactory): void {
    this.factories.push(factory);
  }

  createItems(rawItems: RawCatalogItem[]): CatalogItem[] {
    return rawItems
      .map((raw) => {
        const factory = this.factories.find((candidate) => candidate.supports(raw));
        return factory?.create(raw) ?? null;
      })
      .filter((item): item is CatalogItem => item !== null);
  }
}
