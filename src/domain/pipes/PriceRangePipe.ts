import type { CatalogItem } from '../models/CatalogItem';

export interface PriceRange {
  min?: number | null;
  max?: number | null;
}

export class PriceRangePipe {
  transform(items: CatalogItem[], range: PriceRange): CatalogItem[] {
    const min = this.toFiniteNumber(range.min);
    const max = this.toFiniteNumber(range.max);

    if (min === null && max === null) {
      return [...items];
    }

    const [lowerBound, upperBound] =
      min !== null && max !== null && min > max ? [max, min] : [min, max];

    return items.filter((item) => {
      if (lowerBound !== null && item.price < lowerBound) {
        return false;
      }

      if (upperBound !== null && item.price > upperBound) {
        return false;
      }

      return true;
    });
  }

  private toFiniteNumber(value: number | null | undefined): number | null {
    return typeof value === 'number' && Number.isFinite(value) ? value : null;
  }
}
