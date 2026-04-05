export interface ResourceRepository<T> {
  setAll(items: T[]): void;
  getAll(): T[];
  addMany(items: T[]): void;
  upsert(item: T): void;
  removeById(id: string): void;
}
