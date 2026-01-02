export function getLastDateofYearRange(range) {
  const years = range.split("-").map(y => parseInt(y.trim(), 10));
  const secondYear = years[1]; // 2024
  const lastDate = new Date(secondYear, 6, 31); // july 31
  return `${String(lastDate.getDate()).padStart(2, '0')}-${String(lastDate.getMonth() + 1).padStart(2, '0')}-${lastDate.getFullYear()}`;
}

export function convertSlashesToDashes(dateStr) {
  return dateStr.replace(/\//g, '-');
}