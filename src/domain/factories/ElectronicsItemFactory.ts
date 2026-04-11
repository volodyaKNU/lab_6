import type { ItemFactory } from '../contracts/ItemFactory';
import type { CatalogItem } from '../models/CatalogItem';
import type { ProductMetadata } from '../models/ProductMetadata';
import type { RawCatalogItem } from '../models/RawCatalogItem';

const SUPPORTED_CATEGORIES = new Set(['laptops', 'smartphones', 'accessories', 'tablets']);

export class ElectronicsItemFactory implements ItemFactory {
  supports(raw: RawCatalogItem): boolean {
    return SUPPORTED_CATEGORIES.has(raw.category.toLowerCase());
  }

  create(raw: RawCatalogItem): CatalogItem {
    return {
      id: raw.id,
      name: raw.name,
      category: this.formatCategory(raw.category),
      price: Number(raw.price),
      description: raw.description ?? 'Description is not available',
      stock: Number(raw.stock ?? 0),
      metadata: this.normalizeMetadata(raw.metadata),
    };
  }

  private formatCategory(category: string): string {
    return category[0].toUpperCase() + category.slice(1).toLowerCase();
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
