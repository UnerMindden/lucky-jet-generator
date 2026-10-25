export const MIN_CENTS = 110;
export const MAX_CENTS = 10000;
export const DURATION_MS = 3000;

// Uniform random values to two decimal places; unrelated to any game round.
export function randomCoefficient(randomSource = globalThis.crypto) {
  const range = MAX_CENTS - MIN_CENTS + 1;
  const limit = Math.floor(0x100000000 / range) * range;
  const buffer = new Uint32Array(1);
  let value;
  do {
    if (randomSource && typeof randomSource.getRandomValues === 'function') {
      randomSource.getRandomValues(buffer);
      value = buffer[0];
    } else {
      value = Math.floor(Math.random() * 0x100000000);
    }
  } while (value >= limit);
  return ((MIN_CENTS + value % range) / 100).toFixed(2);
}
