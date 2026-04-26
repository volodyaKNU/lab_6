import { IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonText } from '@ionic/react';
import { useMemo, useState } from 'react';
import type { RawCatalogItem } from '../domain/models/RawCatalogItem';
import { ProductFormFactory } from '../forms/ProductFormFactory';
import ProductForm from './ProductForm';

interface AddProductComponentProps {
  onAdd: (item: RawCatalogItem) => Promise<void> | void;
}

const AddProductComponent: React.FC<AddProductComponentProps> = ({ onAdd }) => {
  const [version, setVersion] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const formFactory = useMemo(() => new ProductFormFactory(), []);

  const submitProduct = async (values: ReturnType<ProductFormFactory['createEmpty']>): Promise<void> => {
    try {
      const rawItem = formFactory.toRawItem(values);
      await onAdd(rawItem);
      setError('');
      setVersion((current) => current + 1);
    } catch (submissionError) {
      const message = submissionError instanceof Error ? submissionError.message : 'Unable to add product';
      setError(message);
    }
  };

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>Add Product (react-hook-form)</IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {error && <IonText color="danger">{error}</IonText>}
        <ProductForm
          key={version}
          title="New product"
          submitLabel="Add product"
          initialValues={formFactory.createEmpty()}
          onSubmit={submitProduct}
        />
      </IonCardContent>
    </IonCard>
  );
};

export default AddProductComponent;
