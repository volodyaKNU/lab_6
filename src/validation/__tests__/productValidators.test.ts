import { describe, expect, it } from 'vitest';
import {
  createManufactureDateValidator,
  createWarrantyTermValidator,
} from '../productValidators';

describe('productValidators', () => {
  it('delegates manufacture date validation to service', () => {
    const validator = createManufactureDateValidator({
      validate: () => true,
    } as never);

    expect(validator('2026-01-10')).toBe(true);
  });

  it('returns true for warranty when field is disabled', () => {
    const validator = createWarrantyTermValidator({ validate: () => 'error' } as never, false);

    expect(validator(undefined)).toBe(true);
  });

  it('requires warranty when validator is enabled', () => {
    const validator = createWarrantyTermValidator({ validate: () => true } as never, true);

    expect(validator(undefined)).toBe('Warranty term is required');
  });

  it('delegates enabled warranty validation to service', () => {
    const validator = createWarrantyTermValidator(
      {
        validate: (value: number) =>
          value === 7 ? true : 'Warranty term must be greater than 3 and less than 12',
      } as never,
      true,
    );

    expect(validator(7)).toBe(true);
    expect(validator(20)).toBe('Warranty term must be greater than 3 and less than 12');
  });
});
