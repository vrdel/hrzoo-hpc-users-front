import { parse, format, parseISO } from 'date-fns';

export function convertToIso8601(ddmmyyyy) {
  let formatDate = parse(ddmmyyyy, 'dd.MM.yyyy', new Date())
  return formatDate
}

export function convertToEuropean(yyyymmdd) {
  return format(parseISO(yyyymmdd), 'dd.MM.yyyy')
}

export function convertToAmerican(ddmmyyyy) {
  return format(ddmmyyyy, 'yyyy-MM-dd')
}

export function convertTimeToEuropean(yyyymmdd) {
  return format(parseISO(yyyymmdd), 'H:mm')
}

export function addGraceMonths(endDate, numMonths) {
  let dateEnd = new Date(endDate)
  let monthsOffset = new Date(dateEnd.setMonth(dateEnd.getMonth() + numMonths))
  return monthsOffset
}

export function addOneDayOffset(endDate) {
  let dateEnd = new Date(endDate)
  let oneDayOffset = new Date(dateEnd.setDate(dateEnd.getDate() + 1))
  return oneDayOffset
}
