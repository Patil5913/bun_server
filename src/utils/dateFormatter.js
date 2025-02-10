/**
 * Formats the current date and time in a consistent format
 * @returns {string} Formatted date string in "YYYY-MM-DD HH:mm:ss" format
 */
export const formatDateTime = () => {
  const now = new Date();
  return now.toISOString()
    .replace('T', ' ')
    .replace(/\.\d+Z$/, '');
}; 