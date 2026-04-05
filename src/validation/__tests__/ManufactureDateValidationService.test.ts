import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ManufactureDateValidationService } from '../services/ManufactureDateValidationService';

describe('ManufactureDateValidationService', () => {
  const service = new ManufactureDateValidationService();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-04-05T09:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('fails when value is empty', () => {
    expect(service.validate('')).toBe('Manufacture date is required');
  });

  it('fails for invalid date format', () => {
    expect(service.validate('05.04.2026')).toBe('Use date format YYYY-MM-DD');
  });

  it('fails when date is in the future', () => {
    expect(service.validate('2026-04-06')).toBe('Manufacture date cannot be in the future');
  });

  it('passes for today or past date', () => {
    expect(service.validate('2026-04-05')).toBe(true);
    expect(service.validate('2024-11-20')).toBe(true);
  });
});
