import type { ResourceRepository } from '../contracts/ResourceRepository';
import type { CatalogItem } from '../models/CatalogItem';

export class InMemoryCatalogRepository implements ResourceRepository<CatalogItem> {
  private items: CatalogItem[] = [];

  setAll(items: CatalogItem[]): void {
    this.items = [...items];
  }

  getAll(): CatalogItem[] {
    return [...this.items];
  }

  addMany(items: CatalogItem[]): void {
    const mapById = new Map(this.items.map((item) => [item.id, item]));

    for (const item of items) {
      mapById.set(item.id, item);
    }

    this.items = Array.from(mapById.values());
  }

  upsert(item: CatalogItem): void {
    const mapById = new Map(this.items.map((candidate) => [candidate.id, candidate]));
    mapById.set(item.id, item);
    this.items = Array.from(mapById.values());
  }

  removeById(id: string): void {
    this.items = this.items.filter((item) => item.id !== id);
  }
}
