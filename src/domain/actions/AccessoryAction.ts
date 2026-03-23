import type { ItemAction } from '../contracts/ItemAction';
import type { CatalogItem } from '../models/CatalogItem';

export class AccessoryAction implements ItemAction {
  canHandle(item: CatalogItem): boolean {
    return item.category === 'Accessories';
  }

  execute(item: CatalogItem): string {
    return `Дія для аксесуара: перевірити сумісність "${item.name}" з основним товаром.`;
  }
}
