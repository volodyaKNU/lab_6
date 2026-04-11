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
import AddProductComponent from '../components/AddProductComponent';
import ProductsEditorComponent from '../components/ProductsEditorComponent';
import { wearableExtensionItems } from '../data/wearableExtension';
import { AccessoryAction } from '../domain/actions/AccessoryAction';
import { LaptopAction } from '../domain/actions/LaptopAction';
import { SmartphoneAction } from '../domain/actions/SmartphoneAction';
import { TabletAction } from '../domain/actions/TabletAction';
import { WearableAction } from '../domain/actions/WearableAction';
import { NoDiscountPolicy } from '../domain/discounts/NoDiscountPolicy';
import { ElectronicsItemFactory } from '../domain/factories/ElectronicsItemFactory';
import { ItemFactoryRegistry } from '../domain/factories/ItemFactoryRegistry';
import { WearableItemFactory } from '../domain/factories/WearableItemFactory';
import type { CatalogItem } from '../domain/models/CatalogItem';
import type { RawCatalogItem } from '../domain/models/RawCatalogItem';
import { InMemoryCatalogRepository } from '../domain/repositories/InMemoryCatalogRepository';
import { CatalogService } from '../domain/services/CatalogService';
import { CategoryFilterService } from '../domain/services/CategoryFilterService';
import { CheckoutService } from '../domain/services/CheckoutService';
import { CloudJsonCatalogSource } from '../domain/services/CloudJsonCatalogSource';
import { ItemActionService } from '../domain/services/ItemActionService';
import './Home.css';

const Home: React.FC = () => {
  const [items, setItems] = useState<CatalogItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [visibleItems, setVisibleItems] = useState<CatalogItem[]>([]);
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
    () =>
      new ItemActionService([
        new SmartphoneAction(),
        new LaptopAction(),
        new AccessoryAction(),
        new TabletAction(),
      ]),
    [],
  );
  const checkoutService = useMemo(() => new CheckoutService(new NoDiscountPolicy()), []);
  const categoryFilterService = useMemo(() => new CategoryFilterService(), []);

  const total = checkoutService.calculateTotal(selectedItems);

  const syncItemsFromCatalog = (): void => {
    const catalogItems = catalogService.getItems();
    setItems(catalogItems);
    categoryFilterService.setItems(catalogItems);
  };

  const loadCatalog = async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      await catalogService.loadCatalog();
      syncItemsFromCatalog();
    } catch (catalogError) {
      const message = catalogError instanceof Error ? catalogError.message : 'Unknown loading error';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCatalog();
  }, []);

  useEffect(() => {
    const categoriesSubscription = categoryFilterService.categories$.subscribe(setCategories);
    const selectedCategorySubscription = categoryFilterService.selectedCategory$.subscribe((category) => {
      setSelectedCategory(category ?? '');
    });
    const visibleItemsSubscription = categoryFilterService.visibleItems$.subscribe(setVisibleItems);

    return () => {
      categoriesSubscription.unsubscribe();
      selectedCategorySubscription.unsubscribe();
      visibleItemsSubscription.unsubscribe();
    };
  }, [categoryFilterService]);

  const addToSelection = (item: CatalogItem): void => {
    if (item.stock <= 0) {
      return;
    }

    const updatedItem = {
      ...item,
      stock: Math.max(item.stock - 1, 0),
    };

    catalogService.updateItem(updatedItem);
    syncItemsFromCatalog();
    setSelectedItems((current) => [...current, item]);
  };

  const handleAddProduct = (rawItem: RawCatalogItem): void => {
    if (rawItem.category === 'wearables' && !wearableEnabled) {
      catalogService.registerFactory(new WearableItemFactory());
      actionService.registerAction(new WearableAction());
      setWearableEnabled(true);
    }

    const createdItem = catalogService.addItem(rawItem);
    syncItemsFromCatalog();
    setSelectedItems((current) =>
      current.map((item) => (item.id === createdItem.id ? createdItem : item)),
    );
  };

  const handleUpdateProduct = (rawItem: RawCatalogItem): void => {
    if (rawItem.category === 'wearables' && !wearableEnabled) {
      catalogService.registerFactory(new WearableItemFactory());
      actionService.registerAction(new WearableAction());
      setWearableEnabled(true);
    }

    const updatedItem = catalogService.addItem(rawItem);
    syncItemsFromCatalog();
    setSelectedItems((current) =>
      current.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    );
  };

  const handleDeleteProduct = (id: string): void => {
    catalogService.removeItem(id);
    syncItemsFromCatalog();
    setSelectedItems((current) => current.filter((item) => item.id !== id));
  };

  const enableWearableExtension = (): void => {
    if (wearableEnabled) {
      return;
    }

    catalogService.registerFactory(new WearableItemFactory());
    actionService.registerAction(new WearableAction());
    catalogService.addItems(wearableExtensionItems);
    syncItemsFromCatalog();
    setWearableEnabled(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Lab 8: RxJS Category Filtering</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => void loadCatalog()}>Reload</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="page-wrap">
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Electronics Store</IonCardTitle>
              <IonCardSubtitle>
                RxJS BehaviorSubject filtering + dynamic forms + add/edit/delete products
              </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <IonText>
                The app now tracks active category through RxJS and displays items
                from one selected category only.
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
              ? 'Wearables extension is enabled'
              : 'Enable Wearables category (OCP extension)'}
          </IonButton>

          <AddProductComponent onAdd={handleAddProduct} />
          <ProductsEditorComponent
            items={items}
            onUpdate={handleUpdateProduct}
            onDelete={handleDeleteProduct}
          />

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
                onIonChange={(event) =>
                  categoryFilterService.setCategory(String(event.detail.value ?? ''))
                }
              >
                {categories.map((category) => (
                  <IonSegmentButton key={category} value={category}>
                    <IonLabel>{category}</IonLabel>
                  </IonSegmentButton>
                ))}
              </IonSegment>
              {categories.length === 0 && <IonText>No categories are available.</IonText>}

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
                          In stock: {item.stock}
                        </IonBadge>
                        {item.metadata?.manufacturedAt && (
                          <IonBadge color="tertiary">Date: {item.metadata.manufacturedAt}</IonBadge>
                        )}
                        {item.metadata?.warrantyMonths && (
                          <IonBadge color="warning">
                            Warranty: {item.metadata.warrantyMonths} months
                          </IonBadge>
                        )}
                      </div>
                      {item.metadata?.highlights && item.metadata.highlights.length > 0 && (
                        <p>Highlights: {item.metadata.highlights.join(', ')}</p>
                      )}
                    </IonLabel>
                    <IonButton
                      slot="end"
                      onClick={() => addToSelection(item)}
                      disabled={item.stock <= 0}
                    >
                      {item.stock > 0 ? '+ Add to cart' : 'Out of stock'}
                    </IonButton>
                  </IonItem>
                ))}
              </IonList>
              {visibleItems.length === 0 && categories.length > 0 && (
                <IonText>No products found in selected category.</IonText>
              )}
            </>
          )}

          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Selection</IonCardTitle>
              <IonCardSubtitle>Items: {selectedItems.length}</IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              {selectedItems.length === 0 && <IonText>The list is empty.</IonText>}
              {selectedItems.length > 0 && (
                <IonList>
                  {selectedItems.map((item, index) => (
                    <IonItem key={`${item.id}-${index}`}>
                      <IonLabel className="ion-text-wrap">
                        {item.name}
                        <p>{item.category}</p>
                      </IonLabel>
                      <IonBadge color="primary">{item.price} UAH</IonBadge>
                    </IonItem>
                  ))}
                </IonList>
              )}
              <h3>Total: {total} UAH</h3>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
