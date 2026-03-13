// Utility helpers for storing currency values with exactly 2 decimal places.
// The database will store values like 18.85 (not 1885). This makes it easier to
// query and avoids storing integer encodings.

function toPaisa(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100) / 100;
}

function fromPaisa(value) {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.round(num * 100) / 100;
}

module.exports = {
  toPaisa,
  fromPaisa,
};
