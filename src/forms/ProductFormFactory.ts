import type { CatalogItem } from '../domain/models/CatalogItem';
import type { RawCatalogItem } from '../domain/models/RawCatalogItem';

export const PRODUCT_CATEGORIES = ['laptops', 'smartphones', 'accessories', 'tablets', 'wearables'] as const;
export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface ProductFormValues {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  stock: number;
  manufacturedAt: string;
  warrantyMonths?: number;
  highlights: Array<{ value: string }>;
}

const DEFAULT_HIGHLIGHT = [{ value: '' }];

export const categoryRequiresWarranty = (category: ProductCategory): boolean => category !== 'accessories';

export class ProductFormFactory {
  createEmpty(defaultCategory: ProductCategory = 'laptops'): ProductFormValues {
    return {
      id: '',
      name: '',
      category: defaultCategory,
      price: 0,
      description: '',
      stock: 0,
      manufacturedAt: '',
      warrantyMonths: undefined,
      highlights: [...DEFAULT_HIGHLIGHT],
    };
  }

  createFromItem(item: CatalogItem): ProductFormValues {
    const category = toFormCategory(item.category);

    return {
      id: item.id,
      name: item.name,
      category,
      price: item.price,
      description: item.description,
      stock: item.stock,
      manufacturedAt: item.metadata?.manufacturedAt ?? '',
      warrantyMonths: item.metadata?.warrantyMonths,
      highlights: toHighlightFields(item.metadata?.highlights),
    };
  }

  toRawItem(values: ProductFormValues): RawCatalogItem {
    const highlights = values.highlights
      .map((item) => item.value.trim())
      .filter((item) => item.length > 0);

    return {
      id: values.id.trim(),
      name: values.name.trim(),
      category: values.category,
      price: Number(values.price),
      description: values.description.trim(),
      stock: Number(values.stock),
      metadata: {
        manufacturedAt: values.manufacturedAt,
        warrantyMonths: categoryRequiresWarranty(values.category) ? Number(values.warrantyMonths) : undefined,
        highlights: highlights.length > 0 ? highlights : undefined,
      },
    };
  }
}

const toHighlightFields = (items?: string[]): Array<{ value: string }> => {
  if (!items || items.length === 0) {
    return [...DEFAULT_HIGHLIGHT];
  }

  return items.map((value) => ({ value }));
};

const toFormCategory = (category: string): ProductCategory => {
  const normalized = category.toLowerCase();
  return PRODUCT_CATEGORIES.includes(normalized as ProductCategory)
    ? (normalized as ProductCategory)
    : 'laptops';
};
