import { parse, format, formatISO, parseISO } from 'date-fns';

export function convertToIso8601(ddmmyyyy) {
  return formatISO(parse(ddmmyyyy, 'dd.MM.yyyy', new Date()))
}

export function convertToEuropean(yyyymmdd) {
  return format(parseISO(yyyymmdd), 'dd.MM.yyyy')
}
