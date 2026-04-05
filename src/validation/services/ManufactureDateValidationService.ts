import { DateParserService } from './DateParserService';

export class ManufactureDateValidationService {
  constructor(private readonly parser: DateParserService = new DateParserService()) {}

  validate(value: string): true | string {
    if (!value.trim()) {
      return 'Manufacture date is required';
    }

    const parsedDate = this.parser.parseIsoDate(value);

    if (!parsedDate) {
      return 'Use date format YYYY-MM-DD';
    }

    const today = new Date();
    const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));

    if (parsedDate > utcToday) {
      return 'Manufacture date cannot be in the future';
    }

    return true;
  }
}
