import type { ItemAction } from '../contracts/ItemAction';
import type { CatalogItem } from '../models/CatalogItem';

export class WearableAction implements ItemAction {
  canHandle(item: CatalogItem): boolean {
    return item.category === 'Wearables';
  }

  execute(item: CatalogItem): string {
    return `Дія для wearables: активувати синхронізацію з мобільним застосунком для "${item.name}".`;
  }
}
