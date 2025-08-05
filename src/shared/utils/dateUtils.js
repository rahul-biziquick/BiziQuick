const { DateTime } = require("luxon");

/**
 * Formats a date to a locale-specific date string.
 */
function formatDate(date, options = {}, locale = "en") {
  return DateTime.fromJSDate(new Date(date))
    .setLocale(locale)
    .toLocaleString({ ...DateTime.DATE_SHORT, ...options });
}

/**
 * Formats a date to a locale-specific date and time string.
 */
function formatDateTime(date, options = {}, locale = "en") {
  return DateTime.fromJSDate(new Date(date))
    .setLocale(locale)
    .toLocaleString({ ...DateTime.DATETIME_SHORT, ...options });
}

/**
 * Returns the difference in days between two dates.
 */
function diffDays(start, end) {
  const startDate = DateTime.fromJSDate(new Date(start)).startOf("day");
  const endDate = DateTime.fromJSDate(new Date(end)).startOf("day");
  return Math.floor(endDate.diff(startDate, "days").days);
}

/**
 * Adds days to a date and returns a new Date object.
 */
function addDays(date, days) {
  return DateTime.fromJSDate(new Date(date)).plus({ days }).toJSDate();
}

/**
 * Returns a human-readable relative time string.
 */
function getRelativeTime(date, locale = "en") {
  const dt = DateTime.fromJSDate(new Date(date)).setLocale(locale);
  return dt.toRelative();
}

/**
 * Detects server’s timezone.
 */
function getUserTimeZone() {
  return DateTime.local().zoneName;
}

/**
 * Converts a user input datetime to UTC (to save in DB).
 * Example: "2025-06-25 14:30" in "Asia/Kolkata" becomes a UTC `Date` object
 */
function toUtc(dateStr, timeZone, format = "yyyy-MM-dd HH:mm") {
  return DateTime.fromFormat(dateStr, format, { zone: timeZone })
    .toUTC()
    .toJSDate();
}

function formatTimestampsToUTC(arr = [], key = "timestamp") {
  return arr.map((item) => ({
    ...item,
    [key]: item[key]?.toISOString?.() || item[key],
  }));
}

module.exports = {
  formatDate,
  formatDateTime,
  diffDays,
  addDays,
  getRelativeTime,
  getUserTimeZone,
  toUtc,
  formatTimestampsToUTC,
};
