import type { CatalogItem } from '../models/CatalogItem';

export interface ProductComparisonRow {
  label: string;
  values: string[];
}

export interface ProductComparisonTable {
  items: CatalogItem[];
  rows: ProductComparisonRow[];
}

export class ProductComparisonService {
  createComparison(items: CatalogItem[]): ProductComparisonTable {
    const comparedItems = this.uniqueById(items);

    return {
      items: comparedItems,
      rows: [
        this.createRow('Category', comparedItems, (item) => item.category),
        this.createRow('Price', comparedItems, (item) => `${item.price} UAH`),
        this.createRow('Stock', comparedItems, (item) => `${item.stock} pcs`),
        this.createRow('Warranty', comparedItems, (item) =>
          item.metadata?.warrantyMonths
            ? `${item.metadata.warrantyMonths} months`
            : '-',
        ),
        this.createRow('Manufactured', comparedItems, (item) =>
          item.metadata?.manufacturedAt ?? '-',
        ),
        this.createRow('Highlights', comparedItems, (item) =>
          item.metadata?.highlights && item.metadata.highlights.length > 0
            ? item.metadata.highlights.join(', ')
            : '-',
        ),
      ],
    };
  }

  private createRow(
    label: string,
    items: CatalogItem[],
    resolveValue: (item: CatalogItem) => string,
  ): ProductComparisonRow {
    return {
      label,
      values: items.map(resolveValue),
    };
  }

  private uniqueById(items: CatalogItem[]): CatalogItem[] {
    const seenIds = new Set<string>();
    const uniqueItems: CatalogItem[] = [];

    for (const item of items) {
      if (!seenIds.has(item.id)) {
        seenIds.add(item.id);
        uniqueItems.push(item);
      }
    }

    return uniqueItems;
  }
}
