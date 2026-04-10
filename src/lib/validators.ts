const OLD_NIC_REGEX = /^\d{9}[VX]$/
const NEW_NIC_REGEX = /^\d{12}$/

export interface SriLankanNicDetails {
  dateOfBirth: string
  gender: 'male' | 'female'
}

function toIsoDate(year: number, dayOfYear: number): string {
  const utcDate = new Date(Date.UTC(year, 0, dayOfYear))
  if (utcDate.getUTCFullYear() !== year) {
    throw new Error('Invalid NIC day-of-year')
  }
  return utcDate.toISOString().slice(0, 10)
}

export function extractSriLankanNicDetails(nic: string): SriLankanNicDetails {
  const value = nic.trim().toUpperCase()

  let year: number
  let daySerial: number

  if (OLD_NIC_REGEX.test(value)) {
    year = 1900 + Number(value.slice(0, 2))
    daySerial = Number(value.slice(2, 5))
  } else if (NEW_NIC_REGEX.test(value)) {
    year = Number(value.slice(0, 4))
    daySerial = Number(value.slice(4, 7))
  } else {
    throw new Error('Invalid NIC format')
  }

  const isFemale = daySerial > 500
  const dayOfYear = isFemale ? daySerial - 500 : daySerial
  if (dayOfYear < 1 || dayOfYear > 366) {
    throw new Error('Invalid NIC day-of-year')
  }

  return {
    dateOfBirth: toIsoDate(year, dayOfYear),
    gender: isFemale ? 'female' : 'male',
  }
}

export function isValidSriLankanNic(nic: string): boolean {
  try {
    extractSriLankanNicDetails(nic)
    return true
  } catch {
    return false
  }
}

export function normalizeSriLankanPhone(phone: string): string {
  // Strip spaces, dashes, dots and parentheses.
  const compact = phone.replace(/[\s\-\.\(\)]/g, '')

  if (compact.startsWith('+94') && compact.length === 12) return compact
  if (compact.startsWith('94') && compact.length === 11) return `+${compact}`
  if (compact.startsWith('0') && compact.length === 10) return `+94${compact.slice(1)}`

  throw new Error("Invalid phone number format")
}

export function isValidSriLankanPhone(phone: string): boolean {
  try {
    normalizeSriLankanPhone(phone)
    return true
  } catch {
    return false
  }
}
