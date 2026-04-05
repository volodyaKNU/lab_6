import { ManufactureDateValidationService } from './services/ManufactureDateValidationService';
import { WarrantyTermValidationService } from './services/WarrantyTermValidationService';

export const createManufactureDateValidator =
  (service: ManufactureDateValidationService) =>
  (value: string): true | string =>
    service.validate(value);

export const createWarrantyTermValidator =
  (service: WarrantyTermValidationService, enabled: boolean) =>
  (value: number | undefined): true | string => {
    if (!enabled) {
      return true;
    }

    if (value === undefined) {
      return 'Warranty term is required';
    }

    return service.validate(Number(value));
  };
