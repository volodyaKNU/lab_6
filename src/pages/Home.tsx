import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useEffect, useMemo, useState } from 'react';
import { AccessoryAction } from '../domain/actions/AccessoryAction';
import { LaptopAction } from '../domain/actions/LaptopAction';
import { SmartphoneAction } from '../domain/actions/SmartphoneAction';
import { WearableAction } from '../domain/actions/WearableAction';
import { NoDiscountPolicy } from '../domain/discounts/NoDiscountPolicy';
import { ElectronicsItemFactory } from '../domain/factories/ElectronicsItemFactory';
import { ItemFactoryRegistry } from '../domain/factories/ItemFactoryRegistry';
import { WearableItemFactory } from '../domain/factories/WearableItemFactory';
import type { CatalogItem } from '../domain/models/CatalogItem';
import { InMemoryCatalogRepository } from '../domain/repositories/InMemoryCatalogRepository';
import { CatalogService } from '../domain/services/CatalogService';
import { CheckoutService } from '../domain/services/CheckoutService';
import { CloudJsonCatalogSource } from '../domain/services/CloudJsonCatalogSource';
import { ItemActionService } from '../domain/services/ItemActionService';
import { wearableExtensionItems } from '../data/wearableExtension';
import './Home.css';

const Home: React.FC = () => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedItems, setSelectedItems] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [wearableEnabled, setWearableEnabled] = useState<boolean>(false);

  const repository = useMemo(() => new InMemoryCatalogRepository(), []);
  const factoryRegistry = useMemo(
    () => new ItemFactoryRegistry([new ElectronicsItemFactory()]),
    [],
  );
  const source = useMemo(() => new CloudJsonCatalogSource('/cloud-electronics.json'), []);
  const catalogService = useMemo(
    () => new CatalogService(source, repository, factoryRegistry),
    [source, repository, factoryRegistry],
  );
  const actionService = useMemo(
    () => new ItemActionService([new SmartphoneAction(), new LaptopAction(), new AccessoryAction()]),
    [],
  );
  const checkoutService = useMemo(() => new CheckoutService(new NoDiscountPolicy()), []);

  const categories = useMemo(() => catalogService.getCategories(), [items, catalogService]);
  const visibleItems = useMemo(
    () => (selectedCategory === 'all' ? items : items.filter((item) => item.category === selectedCategory)),
    [items, selectedCategory],
  );
  const total = checkoutService.calculateTotal(selectedItems);

  const loadCatalog = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      await catalogService.loadCatalog();
      setItems(catalogService.getItems());
    } catch (catalogError) {
      const message = catalogError instanceof Error ? catalogError.message : 'Невідома помилка';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalog();
  }, []);

  const addToSelection = (item: CatalogItem): void => {
    if (item.stock <= 0) {
      return;
    }

    setSelectedItems((current) => [...current, item]);
    setItems((current) =>
      current.map((candidate) =>
        candidate.id === item.id
          ? { ...candidate, stock: Math.max(candidate.stock - 1, 0) }
          : candidate,
      ),
    );
  };

  const enableWearableExtension = (): void => {
    if (wearableEnabled) {
      return;
    }

    catalogService.registerFactory(new WearableItemFactory());
    actionService.registerAction(new WearableAction());
    catalogService.addItems(wearableExtensionItems);
    setItems(catalogService.getItems());
    setWearableEnabled(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Lab 6: SOLID + Ionic</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => void loadCatalog()}>Оновити</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="page-wrap">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Магазин електроніки</IonCardTitle>
              <IonCardSubtitle>
                Категорії: ноутбуки, смартфони, аксесуари
              </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                Демонстрація SOLID: інтерфейси, сервіси, фабрики і розширення новим типом товару.
              </IonText>
            </IonCardContent>
          </IonCard>

          <IonButton
            expand="block"
            onClick={enableWearableExtension}
            disabled={wearableEnabled}
            color={wearableEnabled ? 'success' : 'primary'}
          >
            {wearableEnabled
              ? 'Розширення Wearables підключено'
              : 'Додати нову категорію: Wearables (OCP)'}
          </IonButton>

          {loading && (
            <div className="loading-block">
              <IonSpinner />
            </div>
          )}

          {error && <IonText color="danger">{error}</IonText>}

          {!loading && (
            <>
              <IonSegment
                value={selectedCategory}
                onIonChange={(event) => setSelectedCategory(String(event.detail.value ?? 'all'))}
              >
                <IonSegmentButton value="all">
                  <IonLabel>Усі</IonLabel>
                </IonSegmentButton>
                {categories.map((category) => (
                  <IonSegmentButton key={category} value={category}>
                    <IonLabel>{category}</IonLabel>
                  </IonSegmentButton>
                ))}
              </IonSegment>

              <IonList className="catalog-list">
                {visibleItems.map((item) => (
                  <IonItem key={item.id}>
                    <IonLabel className="ion-text-wrap">
                      <h2>{item.name}</h2>
                      <p>{item.description}</p>
                      <p>{actionService.getActionMessage(item)}</p>
                      <div className="meta-row">
                        <IonBadge color="medium">{item.category}</IonBadge>
                        <IonBadge color={item.stock > 0 ? 'success' : 'danger'}>
                          В наявності: {item.stock}
                        </IonBadge>
                      </div>
                    </IonLabel>
                    <IonButton
                      slot="end"
                      onClick={() => addToSelection(item)}
                      disabled={item.stock <= 0}
                    >
                      {item.stock > 0 ? '+ До списку' : 'Немає в наявності'}
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
            </>
          )}

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Сформований список</IonCardTitle>
              <IonCardSubtitle>Позицій: {selectedItems.length}</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              {selectedItems.length === 0 && <IonText>Список поки порожній.</IonText>}
              {selectedItems.length > 0 && (
                <IonList>
                  {selectedItems.map((item, index) => (
                    <IonItem key={`${item.id}-${index}`}>
                      <IonLabel className="ion-text-wrap">
                        {item.name}
                        <p>{item.category}</p>
                      </IonLabel>
                      <IonBadge color="primary">{item.price} грн</IonBadge>
                    </IonItem>
                  ))}
                </IonList>
              )}
              <h3>Сума: {total} грн</h3>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
