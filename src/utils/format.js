/**
 * Shared formatting utilities for QAPAQ FX.
 * All functions return '—' for missing/invalid values unless noted.
 */

/**
 * Format a number as currency (es-PE locale).
 * @param {number|string} n          - The value to format.
 * @param {number}        [decimals=2] - Number of decimal places.
 * @returns {string} Formatted number (e.g. "1,234.50") or '—'.
 */
export function fmtMoney(n, decimals = 2) {
  if (n === null || n === undefined || n === '') return '—'
  const num = parseFloat(String(n).replace(/,/g, ''))
  if (isNaN(num)) return '—'
  return num.toLocaleString('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

/**
 * Parse a locale-formatted money string back to a number.
 * @param {string} s - e.g. "1,234.50"
 * @returns {number} Parsed number, or NaN if input is empty/invalid.
 */
export function parseMoney(s) {
  if (s === null || s === undefined || s === '') return NaN
  return parseFloat(String(s).replace(/,/g, ''))
}

/**
 * Format an ISO date string (YYYY-MM-DD) to DD/MM/YYYY.
 * @param {string} iso - ISO date string.
 * @returns {string} e.g. "23/04/2026" or '—'.
 */
export function fmtDate(iso) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

/**
 * Format a numeric exchange rate to 3 decimal places.
 * @param {number} n - Exchange rate value.
 * @returns {string} e.g. "3.738" or '—'.
 */
export function fmtTC(n) {
  if (n === null || n === undefined || isNaN(n)) return '—'
  return n.toFixed(3)
}

/**
 * Format an ISO datetime string to a localized es-PE date + time.
 * If no argument is given, returns the current date and time.
 * @param {string} [iso] - ISO datetime string.
 * @returns {string} e.g. "23/4/2026 14:30".
 */
export function fmtDateTime(iso) {
  const d = iso ? new Date(iso) : new Date()
  return (
    d.toLocaleDateString('es-PE') +
    ' ' +
    d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
  )
}
