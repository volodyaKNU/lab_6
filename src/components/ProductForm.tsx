import { IonButton, IonText } from '@ionic/react';
import { useEffect, useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import {
  categoryRequiresWarranty,
  PRODUCT_CATEGORIES,
  type ProductFormValues,
} from '../forms/ProductFormFactory';
import {
  createManufactureDateValidator,
  createWarrantyTermValidator,
} from '../validation/productValidators';
import { ManufactureDateValidationService } from '../validation/services/ManufactureDateValidationService';
import { WarrantyTermValidationService } from '../validation/services/WarrantyTermValidationService';

interface ProductFormProps {
  title: string;
  submitLabel: string;
  initialValues: ProductFormValues;
  disableId?: boolean;
  onSubmit: (values: ProductFormValues) => void;
  onCancel?: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({
  title,
  submitLabel,
  initialValues,
  disableId = false,
  onSubmit,
  onCancel,
}) => {
  const manufactureDateValidationService = useMemo(
    () => new ManufactureDateValidationService(),
    [],
  );
  const warrantyValidationService = useMemo(
    () => new WarrantyTermValidationService(),
    [],
  );
  const manufactureDateValidator = useMemo(
    () => createManufactureDateValidator(manufactureDateValidationService),
    [manufactureDateValidationService],
  );

  const {
    register,
    control,
    watch,
    handleSubmit,
    setValue,
    clearErrors,
    reset,
    formState: { errors, isValid },
  } = useForm<ProductFormValues>({
    defaultValues: initialValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'highlights',
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const selectedCategory = watch('category');
  const requiresWarranty = categoryRequiresWarranty(selectedCategory);

  useEffect(() => {
    if (!requiresWarranty) {
      setValue('warrantyMonths', undefined);
      clearErrors('warrantyMonths');
    }
  }, [clearErrors, requiresWarranty, setValue]);

  const submitHandler = handleSubmit((values) => onSubmit(values));

  return (
    <form className="product-form" onSubmit={submitHandler}>
      <h3>{title}</h3>

      <label className="form-label">
        Product id
        <input
          type="text"
          disabled={disableId}
          {...register('id', {
            required: 'Product id is required',
            pattern: {
              value: /^[a-z0-9-]+$/i,
              message: 'Use letters, digits and hyphens only',
            },
          })}
        />
      </label>
      {errors.id && <IonText color="danger">{errors.id.message}</IonText>}

      <label className="form-label">
        Name
        <input
          type="text"
          {...register('name', {
            required: 'Name is required',
            minLength: {
              value: 2,
              message: 'At least 2 characters are required',
            },
          })}
        />
      </label>
      {errors.name && <IonText color="danger">{errors.name.message}</IonText>}

      <label className="form-label">
        Category
        <select {...register('category', { required: true })}>
          {PRODUCT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </label>

      <label className="form-label">
        Price
        <input
          type="number"
          min={1}
          step={1}
          {...register('price', {
            required: 'Price is required',
            valueAsNumber: true,
            min: { value: 100, message: 'Price must be greater than 100' },
          })}
        />
      </label>
      {errors.price && <IonText color="danger">{errors.price.message}</IonText>}

      <label className="form-label">
        Stock
        <input
          type="number"
          min={0}
          step={1}
          {...register('stock', {
            required: 'Stock is required',
            valueAsNumber: true,
            min: { value: 200, message: 'must be greater then 200' },
          })}
        />
      </label>
      {errors.stock && <IonText color="danger">{errors.stock.message}</IonText>}

      <label className="form-label">
        Description
        <textarea
          rows={3}
          {...register('description', {
            required: 'Description is required',
            minLength: {
              value: 5,
              message: 'At least 5 characters are required',
            },
          })}
        />
      </label>
      {errors.description && <IonText color="danger">{errors.description.message}</IonText>}

      <label className="form-label">
        Manufacture date
        <input
          type="date"
          {...register('manufacturedAt', {
            validate: manufactureDateValidator,
          })}
        />
      </label>
      {errors.manufacturedAt && <IonText color="danger">{errors.manufacturedAt.message}</IonText>}

      {requiresWarranty && (
        <>
          <label className="form-label">
            Warranty term (months)
            <input
              type="number"
              min={4}
              max={11}
              step={1}
              {...register('warrantyMonths', {
                valueAsNumber: true,
                validate: createWarrantyTermValidator(
                  warrantyValidationService,
                  true,
                ),
              })}
            />
          </label>
          {errors.warrantyMonths && <IonText color="danger">{errors.warrantyMonths.message}</IonText>}
        </>
      )}

      <div className="highlights-head">
        <strong>Highlights (dynamic fields)</strong>
        <IonButton
          type="button"
          size="small"
          fill="outline"
          onClick={() => append({ value: '' })}
        >
          Add field
        </IonButton>
      </div>
      {fields.map((field, index) => (
        <div key={field.id} className="highlight-row">
          <input
            type="text"
            placeholder="Feature"
            {...register(`highlights.${index}.value`, {
              maxLength: { value: 40, message: 'Maximum 40 characters' },
            })}
          />
          <IonButton
            type="button"
            size="small"
            fill="clear"
            color="danger"
            disabled={fields.length <= 1}
            onClick={() => remove(index)}
          >
            Remove
          </IonButton>
        </div>
      ))}

      <div className="form-actions">
        {onCancel && (
          <IonButton type="button" fill="outline" color="medium" onClick={onCancel}>
            Cancel
          </IonButton>
        )}
        <IonButton type="submit" disabled={!isValid}>
          {submitLabel}
        </IonButton>
      </div>
    </form>
  );
};

export default ProductForm;
