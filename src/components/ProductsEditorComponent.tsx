import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonText,
} from '@ionic/react';
import { useMemo, useState } from 'react';
import type { CatalogItem } from '../domain/models/CatalogItem';
import type { RawCatalogItem } from '../domain/models/RawCatalogItem';
import { ProductFormFactory } from '../forms/ProductFormFactory';
import ProductForm from './ProductForm';

interface ProductsEditorComponentProps {
  items: CatalogItem[];
  onUpdate: (item: RawCatalogItem) => void;
  onDelete: (id: string) => void;
}

const ProductsEditorComponent: React.FC<ProductsEditorComponentProps> = ({
  items,
  onUpdate,
  onDelete,
}) => {
  const formFactory = useMemo(() => new ProductFormFactory(), []);
  const [editingProduct, setEditingProduct] = useState<CatalogItem | null>(null);
  const [error, setError] = useState<string>('');

  const submitUpdate = (values: ReturnType<ProductFormFactory['createEmpty']>): void => {
    try {
      onUpdate(formFactory.toRawItem(values));
      setError('');
      setEditingProduct(null);
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Unable to update product';
      setError(message);
    }
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>All Entered Products</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {error && <IonText color="danger">{error}</IonText>}
        {items.length === 0 && <IonText>No products yet.</IonText>}
        {items.length > 0 && (
          <IonList>
            {items.map((item) => (
              <IonItem key={item.id}>
                <IonLabel className="ion-text-wrap">
                  <h2>{item.name}</h2>
                  <p>{item.description}</p>
                  <div className="meta-row">
                    <IonBadge color="medium">{item.category}</IonBadge>
                    <IonBadge color="tertiary">Stock: {item.stock}</IonBadge>
                    <IonBadge color="primary">{item.price} UAH</IonBadge>
                  </div>
                </IonLabel>
                <IonButton
                  slot="end"
                  size="small"
                  fill="outline"
                  onClick={() => setEditingProduct(item)}
                >
                  Edit
                </IonButton>
                <IonButton
                  slot="end"
                  size="small"
                  color="danger"
                  fill="clear"
                  onClick={() => onDelete(item.id)}
                >
                  Delete
                </IonButton>
              </IonItem>
            ))}
          </IonList>
        )}
      </IonCardContent>

      <IonModal isOpen={editingProduct !== null} onDidDismiss={() => setEditingProduct(null)}>
        <div className="modal-content">
          {editingProduct && (
            <ProductForm
              title={`Edit product: ${editingProduct.name}`}
              submitLabel="Save changes"
              disableId
              initialValues={formFactory.createFromItem(editingProduct)}
              onSubmit={submitUpdate}
              onCancel={() => setEditingProduct(null)}
            />
          )}
        </div>
      </IonModal>
    </IonCard>
  );
};

export default ProductsEditorComponent;
