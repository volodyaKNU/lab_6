import type { ItemAction } from '../contracts/ItemAction';
import type { CatalogItem } from '../models/CatalogItem';

export class TabletAction implements ItemAction {
  canHandle(item: CatalogItem): boolean {
    return item.category === 'Tablets';
  }

  execute(item: CatalogItem): string {
    return `Action for tablet: suggest a stylus bundle for "${item.name}".`;
  }
}
