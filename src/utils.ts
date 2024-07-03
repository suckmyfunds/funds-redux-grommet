export function loadPersistent<T>(key: string, defaultValue: T): T {
  let gotData = localStorage.getItem(key)
  if (!gotData) {
    return defaultValue
  }
  try {
    let value = JSON.parse(gotData)
    return value
  } catch (_) {
    return defaultValue
  }
}

export const savePersistent = (key: string, value: any) => {
  if (!value || value === '') {
    throw new Error(`Tried to save falsy value '${value}' to under key '${key}'`)
  }
  localStorage.setItem(key, JSON.stringify(value))
}

export function assert(condition: boolean, msg: string) {
  if (!condition) {
    throw new Error(msg)
  }
}

export function median(numbers: number[]) {
  numbers.sort((a, b) => a - b) // Sort the array in ascending order
  const length = numbers.length
  const middle = Math.floor(length / 2)

  if (length % 2 === 0) {
    // If the array has an even number of elements, return the average of the two middle values
    return (numbers[middle - 1] + numbers[middle]) / 2
  } else {
    // If the array has an odd number of elements, return the middle value
    return numbers[middle]
  }
}

export type Predicate<T> = (item: T) => string | number

export function groupBy<T>(array: T[], predicate: Predicate<T>): { [key: string]: T[] } {
  return array.reduce((result: { [key: string]: T[] }, item: T) => {
    const key = String(predicate(item))
    if (!result[key]) {
      result[key] = []
    }
    result[key].push(item)
    return result
  }, {})
}

/**
 * return string formatted like DD.MM.YYYY
 * @param date date to format
 * @returns
 */
export function dateToExcelFormat(date: Date): string {
  try {
    let year = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(date)
    let month = new Intl.DateTimeFormat('en', { month: '2-digit' }).format(date)
    let day = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(date)
    return `${day}.${month}.${year}`
  } catch (e) {
    console.log(e)
    throw e
  }
}

export function dateFromExcelFormat(dateString: string): Date {
  const [day, month, year] = dateString.split('.').map(Number)
  // Months in JavaScript's Date object are 0-indexed, so we subtract 1 from the month
  return new Date(year, month - 1, day)
}

export function compareDates(a: Date, b: Date) {
  const yearComparison = a.getFullYear() - b.getFullYear()
  if (yearComparison !== 0) {
    return yearComparison
  }
  const monthComparison = a.getMonth() - b.getMonth()
  if (monthComparison !== 0) {
    return monthComparison
  }
  return a.getDate() - b.getDate()
}

export function floatToExcelString(float: number) {
  return float.toString().replace('.', ',')
}

export function floatFromExcelString(str: string) {
  return parseFloat(str.replace(',', '.'))
}
