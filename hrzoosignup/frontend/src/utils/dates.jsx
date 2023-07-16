import { parse, format, formatISO, parseISO } from 'date-fns';

export function convertToIso8601(ddmmyyyy) {
  let formatDate = parse(ddmmyyyy, 'dd.MM.yyyy', new Date())
  return formatDate
}

export function convertToEuropean(yyyymmdd) {
  return format(parseISO(yyyymmdd), 'dd.MM.yyyy')
}

export function convertToAmerican(yyyymmdd) {
  return format(yyyymmdd, 'yyyy-MM-dd')
}

export function convertTimeToEuropean(yyyymmdd) {
  return format(parseISO(yyyymmdd), 'H:mm')
}
