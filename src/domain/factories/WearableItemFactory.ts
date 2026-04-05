import type { ItemFactory } from '../contracts/ItemFactory';
import type { CatalogItem } from '../models/CatalogItem';
import type { ProductMetadata } from '../models/ProductMetadata';
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
      description: raw.description ?? 'Wearables extension item',
      stock: Number(raw.stock ?? 0),
      metadata: this.normalizeMetadata(raw.metadata),
    };
  }

  private normalizeMetadata(metadata?: ProductMetadata): ProductMetadata | undefined {
    if (!metadata) {
      return undefined;
    }

    return {
      manufacturedAt: metadata.manufacturedAt,
      warrantyMonths: metadata.warrantyMonths === undefined ? undefined : Number(metadata.warrantyMonths),
      highlights: metadata.highlights ? [...metadata.highlights] : undefined,
    };
  }
}
