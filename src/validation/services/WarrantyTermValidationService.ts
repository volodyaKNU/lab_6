export class WarrantyTermValidationService {
  validate(value: number): true | string {
    if (!Number.isFinite(value)) {
      return 'Warranty term must be a number';
    }

    if (value <= 3 || value >= 12) {
      return 'Warranty term must be greater than 3 and less than 12';
    }

    if (!Number.isInteger(value)) {
      return 'Warranty term must be an integer value';
    }

    return true;
  }
}
