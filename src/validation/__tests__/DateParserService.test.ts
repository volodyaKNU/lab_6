import { describe, expect, it } from 'vitest';
import { DateParserService } from '../services/DateParserService';

describe('DateParserService', () => {
  const service = new DateParserService();

  it('parses a valid ISO date', () => {
    const parsedDate = service.parseIsoDate('2026-03-19');

    expect(parsedDate).not.toBeNull();
    expect(parsedDate?.toISOString()).toContain('2026-03-19');
  });

  it('returns null for invalid format', () => {
    expect(service.parseIsoDate('19.03.2026')).toBeNull();
  });

  it('returns null for impossible calendar date', () => {
    expect(service.parseIsoDate('2026-02-31')).toBeNull();
  });
});
