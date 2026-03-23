import type { RawCatalogItem } from '../domain/models/RawCatalogItem';

export const wearableExtensionItems: RawCatalogItem[] = [
  {
    id: 'wearable-1',
    name: 'FitPro Watch X',
    category: 'wearables',
    price: 12999,
    description: 'Розумний годинник з пульсометром та GPS',
    stock: 12,
  },
  {
    id: 'wearable-2',
    name: 'SoundBand Lite',
    category: 'wearables',
    price: 3499,
    description: 'Фітнес-браслет для щоденного трекінгу активності',
    stock: 30,
  },
];
