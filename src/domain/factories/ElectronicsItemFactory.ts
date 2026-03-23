import type { ItemFactory } from '../contracts/ItemFactory';
import type { CatalogItem } from '../models/CatalogItem';
import type { RawCatalogItem } from '../models/RawCatalogItem';

const SUPPORTED_CATEGORIES = new Set(['laptops', 'smartphones', 'accessories']);

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
      description: raw.description ?? 'Опис недоступний',
      stock: Number(raw.stock ?? 0),
    };
  }

  private formatCategory(category: string): string {
    return category[0].toUpperCase() + category.slice(1).toLowerCase();
  }
}
