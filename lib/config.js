/** Parse an integer environment setting with explicit bounds and a default. */
export function readBoundedInteger(value, { name, fallback, min, max }) {
  if (value === undefined || value === '') return fallback;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < min || number > max) {
    throw new RangeError(name + ' must be an integer between ' + min + ' and ' + max);
  }
  return number;
}
