import { parse, format } from 'date-fns';

export function convertToIso8601(ddmmyyyy) {
  return format(parse(ddmmyyyy, 'dd.MM.yyyy', new Date()), 'yyyy-MM-dd')
}
