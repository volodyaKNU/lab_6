import { describe, expect, it } from 'vitest';
import { AccessoryAction } from '../actions/AccessoryAction';
import { LaptopAction } from '../actions/LaptopAction';
import { SmartphoneAction } from '../actions/SmartphoneAction';
import { TabletAction } from '../actions/TabletAction';
import { WearableAction } from '../actions/WearableAction';
import type { CatalogItem } from '../models/CatalogItem';
import { ItemActionService } from '../services/ItemActionService';

const laptop: CatalogItem = {
  id: 'l1',
  name: 'DevBook',
  category: 'Laptops',
  price: 1000,
  description: 'x',
  stock: 5,
};

describe('ItemActionService', () => {
  it('selects action by category and supports extension handler', () => {
    const service = new ItemActionService([
      new SmartphoneAction(),
      new LaptopAction(),
      new AccessoryAction(),
      new TabletAction(),
    ]);

    const laptopMessage = service.getActionMessage(laptop);
    expect(laptopMessage).toContain('DevBook');

    service.registerAction(new WearableAction());
    const wearableMessage = service.getActionMessage({
      id: 'w1',
      name: 'Watch',
      category: 'Wearables',
      price: 400,
      description: 'x',
      stock: 2,
    });

    expect(wearableMessage).toContain('Watch');

    const tabletMessage = service.getActionMessage({
      id: 't1',
      name: 'SketchTab',
      category: 'Tablets',
      price: 500,
      description: 'x',
      stock: 3,
    });

    expect(tabletMessage).toContain('SketchTab');
  });
});
