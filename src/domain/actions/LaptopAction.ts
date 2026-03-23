import type { ItemAction } from '../contracts/ItemAction';
import type { CatalogItem } from '../models/CatalogItem';

export class LaptopAction implements ItemAction {
  canHandle(item: CatalogItem): boolean {
    return item.category === 'Laptops';
  }

  execute(item: CatalogItem): string {
    return `Дія для ноутбука: запропонувати розширену гарантію для "${item.name}".`;
  }
}
