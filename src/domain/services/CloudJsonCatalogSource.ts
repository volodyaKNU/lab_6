import type { CatalogSource } from '../contracts/CatalogSource';
import type { RawCatalogItem } from '../models/RawCatalogItem';

type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;

interface CatalogPayload {
  items?: RawCatalogItem[];
}

export class CloudJsonCatalogSource implements CatalogSource {
  constructor(
    private readonly endpoint: string,
    private readonly fetchFn: FetchLike = (input, init) => globalThis.fetch(input, init),
  ) {}

  async loadItems(): Promise<RawCatalogItem[]> {
    const fetchRequest = this.fetchFn;
    const response = await fetchRequest(this.endpoint);

    if (!response.ok) {
      throw new Error(`Не вдалося завантажити JSON (${response.status})`);
    }

    const payload: RawCatalogItem[] | CatalogPayload = await response.json();

    if (Array.isArray(payload)) {
      return payload;
    }

    return payload.items ?? [];
  }
}
