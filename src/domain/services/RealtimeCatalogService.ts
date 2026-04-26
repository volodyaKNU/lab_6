import {
  get,
  onValue,
  ref,
  remove,
  set,
  update,
  type Database,
} from 'firebase/database';
import { realtimeDb } from '../../firebase';
import type { ItemFactory } from '../contracts/ItemFactory';
import { ItemFactoryRegistry } from '../factories/ItemFactoryRegistry';
import type { CatalogItem } from '../models/CatalogItem';
import type { ProductMetadata } from '../models/ProductMetadata';
import type { RawCatalogItem } from '../models/RawCatalogItem';

const CATALOG_ROOT = 'catalogItems';

interface RealtimeCatalogDocument {
  id?: unknown;
  name?: unknown;
  category?: unknown;
  price?: unknown;
  description?: unknown;
  stock?: unknown;
  metadata?: unknown;
}

export class RealtimeCatalogService {
  private items: CatalogItem[] = [];

  constructor(
    private readonly factoryRegistry: ItemFactoryRegistry,
    private readonly database: Database = realtimeDb,
  ) {}

  async loadCatalog(): Promise<CatalogItem[]> {
    const snapshot = await get(ref(this.database, CATALOG_ROOT));
    const payload = snapshot.val() as Record<string, RealtimeCatalogDocument> | null;

    this.items = this.normalizeCatalogPayload(payload);
    return this.getItems();
  }

  watchCatalog(
    onItems: (items: CatalogItem[]) => void,
    onError?: (error: Error) => void,
  ): () => void {
    return onValue(
      ref(this.database, CATALOG_ROOT),
      (snapshot) => {
        const payload = snapshot.val() as Record<string, RealtimeCatalogDocument> | null;
        this.items = this.normalizeCatalogPayload(payload);
        onItems(this.getItems());
      },
      (error) => {
        onError?.(error);
      },
    );
  }

  registerFactory(factory: ItemFactory): void {
    this.factoryRegistry.register(factory);
  }

  async addItems(rawItems: RawCatalogItem[]): Promise<CatalogItem[]> {
    const mappedItems = this.factoryRegistry.createItems(rawItems);

    if (mappedItems.length === 0) {
      return [];
    }

    const updates: Record<string, CatalogItem> = {};

    for (const item of mappedItems) {
      updates[`${CATALOG_ROOT}/${item.id}`] = this.toRealtimePayload(item);
    }

    await update(ref(this.database), updates);
    this.upsertItemsInCache(mappedItems);
    return mappedItems;
  }

  async addItem(rawItem: RawCatalogItem): Promise<CatalogItem> {
    const [mappedItem] = this.factoryRegistry.createItems([rawItem]);

    if (!mappedItem) {
      throw new Error(`Unsupported category: ${rawItem.category}`);
    }

    await set(ref(this.database, `${CATALOG_ROOT}/${mappedItem.id}`), this.toRealtimePayload(mappedItem));
    this.upsertItemsInCache([mappedItem]);
    return mappedItem;
  }

  async updateItem(item: CatalogItem): Promise<CatalogItem> {
    const normalizedItem = this.normalizeCatalogItem(item);

    await set(
      ref(this.database, `${CATALOG_ROOT}/${normalizedItem.id}`),
      this.toRealtimePayload(normalizedItem),
    );
    this.upsertItemsInCache([normalizedItem]);
    return normalizedItem;
  }

  async removeItem(id: string): Promise<void> {
    await remove(ref(this.database, `${CATALOG_ROOT}/${id}`));
    this.items = this.items.filter((item) => item.id !== id);
  }

  getItems(): CatalogItem[] {
    return [...this.items];
  }

  getItemsByCategory(category: string): CatalogItem[] {
    return this.items.filter((item) => item.category === category);
  }

  getCategories(): string[] {
    return Array.from(new Set(this.items.map((item) => item.category))).sort();
  }

  private normalizeCatalogPayload(
    payload: Record<string, RealtimeCatalogDocument> | null,
  ): CatalogItem[] {
    if (!payload) {
      return [];
    }

    return Object.entries(payload).map(([id, value]) =>
      this.normalizeCatalogItem({
        id,
        ...value,
      }),
    );
  }

  private upsertItemsInCache(items: CatalogItem[]): void {
    const itemsById = new Map(this.items.map((item) => [item.id, item]));

    for (const item of items) {
      itemsById.set(item.id, this.normalizeCatalogItem(item));
    }

    this.items = Array.from(itemsById.values());
  }

  private toRealtimePayload(item: CatalogItem): CatalogItem {
    const metadata =
      item.metadata && typeof item.metadata === 'object'
        ? this.compactObject({
            manufacturedAt: item.metadata.manufacturedAt,
            warrantyMonths: item.metadata.warrantyMonths,
            highlights: item.metadata.highlights ? [...item.metadata.highlights] : undefined,
          })
        : undefined;

    if (metadata && Object.keys(metadata).length > 0) {
      return {
        ...item,
        metadata,
      };
    }

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      description: item.description,
      stock: item.stock,
    };
  }

  private normalizeCatalogItem(item: RealtimeCatalogDocument & { id: unknown }): CatalogItem {
    const metadata = this.normalizeMetadata(item.metadata);

    return {
      id: this.toStringValue(item.id),
      name: this.toStringValue(item.name),
      category: this.formatCategory(this.toStringValue(item.category)),
      price: this.toNumberValue(item.price),
      description: this.toStringValue(item.description, 'Description is not available'),
      stock: this.toNumberValue(item.stock),
      metadata,
    };
  }

  private normalizeMetadata(metadata: unknown): ProductMetadata | undefined {
    if (!metadata || typeof metadata !== 'object') {
      return undefined;
    }

    const candidate = metadata as Record<string, unknown>;
    const highlights = Array.isArray(candidate.highlights)
      ? candidate.highlights
          .filter((entry): entry is string => typeof entry === 'string')
          .map((entry) => entry.trim())
          .filter((entry) => entry.length > 0)
      : undefined;

    return this.compactObject({
      manufacturedAt:
        typeof candidate.manufacturedAt === 'string' ? candidate.manufacturedAt : undefined,
      warrantyMonths:
        candidate.warrantyMonths === undefined
          ? undefined
          : this.toNumberValue(candidate.warrantyMonths),
      highlights: highlights && highlights.length > 0 ? highlights : undefined,
    });
  }

  private compactObject<T extends object>(value: T): T {
    return Object.fromEntries(
      Object.entries(value).filter(([, entry]) => entry !== undefined),
    ) as T;
  }

  private toStringValue(value: unknown, fallback = ''): string {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed.length > 0 ? trimmed : fallback;
    }

    if (value === undefined || value === null) {
      return fallback;
    }

    return String(value);
  }

  private toNumberValue(value: unknown, fallback = 0): number {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : fallback;
  }

  private formatCategory(category: string): string {
    const trimmedCategory = category.trim();

    if (trimmedCategory.length === 0) {
      return 'Unknown';
    }

    return trimmedCategory[0].toUpperCase() + trimmedCategory.slice(1).toLowerCase();
  }
}
