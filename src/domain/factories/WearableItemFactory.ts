import type { ItemFactory } from '../contracts/ItemFactory';
import type { CatalogItem } from '../models/CatalogItem';
import type { RawCatalogItem } from '../models/RawCatalogItem';

export class WearableItemFactory implements ItemFactory {
  supports(raw: RawCatalogItem): boolean {
    return raw.category.toLowerCase() === 'wearables';
  }

  create(raw: RawCatalogItem): CatalogItem {
    return {
      id: raw.id,
      name: raw.name,
      category: 'Wearables',
      price: Number(raw.price),
      description: raw.description ?? 'Розширена категорія товарів',
      stock: Number(raw.stock ?? 0),
    };
  }
}
