import type { ItemAction } from '../contracts/ItemAction';
import type { CatalogItem } from '../models/CatalogItem';

export class ItemActionService {
  constructor(private readonly actions: ItemAction[]) {}

  registerAction(action: ItemAction): void {
    this.actions.push(action);
  }

  getActionMessage(item: CatalogItem): string {
    const action = this.actions.find((candidate) => candidate.canHandle(item));
    return action?.execute(item) ?? `Базова дія для товару "${item.name}"`;
  }
}
