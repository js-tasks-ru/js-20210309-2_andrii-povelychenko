/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
  const LOCALES = ['ru', 'en'];
  const OPTIONS = {
    caseFirst: 'upper',
  };

  return arr.slice().sort((a, b) => {
    if (param === 'asc') {
      return a.localeCompare(b, LOCALES, OPTIONS);
    } else {
      return b.localeCompare(a, LOCALES, OPTIONS);
    }
  });
}
