/**
 * Shared Local Date Utilities (IST / Local calendar friendly)
 * NEVER uses toISOString() for calendar date strings.
 */

export const getLocalDateString = (d = new Date()) => {
  if (typeof d === 'string') {
    // If already in YYYY-MM-DD format, return it
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    d = new Date(d);
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return new Date();
  const parts = dateStr.split('-').map(Number);
  if (parts.length < 3 || isNaN(parts[0])) return new Date();
  return new Date(parts[0], parts[1] - 1, parts[2]);
};

/**
 * Returns Monday's date string (YYYY-MM-DD) for the week containing the given date.
 * Weeks strictly start on Monday.
 */
export const getMondayOfWeek = (dateInput = new Date()) => {
  const d = parseLocalDate(typeof dateInput === 'string' ? dateInput : getLocalDateString(dateInput));
  const dayOfWeek = d.getDay(); // 0 is Sunday, 1 is Monday... 6 is Saturday
  const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(d.getFullYear(), d.getMonth(), diff);
  return getLocalDateString(monday);
};

/**
 * Returns array of 7 local date strings [Mon, Tue, Wed, Thu, Fri, Sat, Sun]
 */
export const getWeekDates = (mondayStr) => {
  const monday = parseLocalDate(mondayStr);
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i);
    dates.push(getLocalDateString(nextDay));
  }
  return dates;
};

export const getPreviousMonday = (mondayStr) => {
  const monday = parseLocalDate(mondayStr);
  monday.setDate(monday.getDate() - 7);
  return getLocalDateString(monday);
};

export const getNextMonday = (mondayStr) => {
  const monday = parseLocalDate(mondayStr);
  monday.setDate(monday.getDate() + 7);
  return getLocalDateString(monday);
};

export const formatDisplayDate = (dateStr, options = { month: 'short', day: 'numeric' }) => {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', options);
};

export const getDayOfWeekKey = (dateStr) => {
  const d = parseLocalDate(dateStr);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[d.getDay()];
};
