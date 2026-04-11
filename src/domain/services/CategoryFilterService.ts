import { BehaviorSubject, combineLatest, distinctUntilChanged, map, type Observable } from 'rxjs';
import type { CatalogItem } from '../models/CatalogItem';

const areStringArraysEqual = (left: string[], right: string[]): boolean =>
  left.length === right.length && left.every((value, index) => value === right[index]);

export class CategoryFilterService {
  private readonly itemsSubject = new BehaviorSubject<CatalogItem[]>([]);
  private readonly selectedCategorySubject = new BehaviorSubject<string | null>(null);

  readonly categories$: Observable<string[]> = this.itemsSubject.pipe(
    map((items) => this.extractCategories(items)),
    distinctUntilChanged(areStringArraysEqual),
  );

  readonly selectedCategory$: Observable<string | null> = this.selectedCategorySubject.asObservable();

  readonly visibleItems$: Observable<CatalogItem[]> = combineLatest([
    this.itemsSubject,
    this.selectedCategorySubject,
  ]).pipe(
    map(([items, category]) => {
      if (!category) {
        return [];
      }

      return items.filter((item) => item.category === category);
    }),
  );

  setItems(items: CatalogItem[]): void {
    const nextItems = [...items];
    const categories = this.extractCategories(nextItems);
    const selectedCategory = this.selectedCategorySubject.getValue();

    this.itemsSubject.next(nextItems);

    if (categories.length === 0) {
      this.selectedCategorySubject.next(null);
      return;
    }

    if (!selectedCategory || !categories.includes(selectedCategory)) {
      this.selectedCategorySubject.next(categories[0]);
    }
  }

  setCategory(category: string): void {
    const categories = this.extractCategories(this.itemsSubject.getValue());

    if (categories.includes(category)) {
      this.selectedCategorySubject.next(category);
    }
  }

  getSelectedCategory(): string | null {
    return this.selectedCategorySubject.getValue();
  }

  private extractCategories(items: CatalogItem[]): string[] {
    return Array.from(new Set(items.map((item) => item.category))).sort();
  }
}
