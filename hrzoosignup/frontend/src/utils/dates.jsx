import { parse, format, formatISO, parseISO } from 'date-fns';

export function convertToIso8601(ddmmyyyy) {
  let formatDate = parse(ddmmyyyy, 'dd.MM.yyyy', new Date())
  formatDate.setHours(23)
  formatDate.setMinutes(59)
  formatDate.setSeconds(59)
  return formatISO(formatDate)
}

export function convertToEuropean(yyyymmdd) {
  return format(parseISO(yyyymmdd), 'dd.MM.yyyy')
}

export function convertTimeToEuropean(yyyymmdd) {
  return format(parseISO(yyyymmdd), 'H:mm')
}
