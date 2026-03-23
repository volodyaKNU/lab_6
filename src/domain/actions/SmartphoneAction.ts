import type { ItemAction } from '../contracts/ItemAction';
import type { CatalogItem } from '../models/CatalogItem';

export class SmartphoneAction implements ItemAction {
  canHandle(item: CatalogItem): boolean {
    return item.category === 'Smartphones';
  }

  execute(item: CatalogItem): string {
    return `Дія для смартфона: перевірити трейд-ін для "${item.name}".`;
  }
}
