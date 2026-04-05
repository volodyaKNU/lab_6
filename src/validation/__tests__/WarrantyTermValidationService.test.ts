import { describe, expect, it } from 'vitest';
import { WarrantyTermValidationService } from '../services/WarrantyTermValidationService';

describe('WarrantyTermValidationService', () => {
  const service = new WarrantyTermValidationService();

  it('passes for integer value in range (4..11)', () => {
    expect(service.validate(4)).toBe(true);
    expect(service.validate(11)).toBe(true);
  });

  it('fails when value is outside of range', () => {
    expect(service.validate(3)).toBe('Warranty term must be greater than 3 and less than 12');
    expect(service.validate(12)).toBe('Warranty term must be greater than 3 and less than 12');
  });

  it('fails for non-integer values', () => {
    expect(service.validate(4.5)).toBe('Warranty term must be an integer value');
  });

  it('fails when value is not a number', () => {
    expect(service.validate(Number.NaN)).toBe('Warranty term must be a number');
  });
});
