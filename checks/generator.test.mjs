import test from 'node:test';
import assert from 'node:assert/strict';
import { randomCoefficient, MIN_CENTS, MAX_CENTS } from '../generator.mjs';
const source = function (values) { let i = 0; return { getRandomValues(buffer) { buffer[0] = values[i++]; return buffer; } }; };
test('the full inclusive range is attainable to two decimal places', function () {
  assert.equal(randomCoefficient(source([0])), '1.10');
  assert.equal(randomCoefficient(source([MAX_CENTS - MIN_CENTS])), '100.00');
});
test('rejection sampling discards values that would introduce modulo bias', function () {
  assert.equal(randomCoefficient(source([0xffffffff, 0])), '1.10');
});
test('generated values stay in range and preserve two decimal places', function () {
  for (let i = 0; i < 5000; i++) {
    const value = randomCoefficient();
    assert.match(value, /^\d{1,3}\.\d{2}$/);
    assert.ok(Number(value) >= 1.10 && Number(value) <= 100.00);
  }
});
