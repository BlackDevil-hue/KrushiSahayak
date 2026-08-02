/**
 * Genuine Assertion Library for KrishiSahayak E2E Testing Suite
 *
 * Strictly enforces real assertions with zero hardcoded passing flags.
 */

const assert = require('assert');

class AssertionError extends Error {
  constructor(message, actual, expected) {
    super(message);
    this.name = 'AssertionError';
    this.actual = actual;
    this.expected = expected;
  }
}

/**
 * Asserts strict equality between actual and expected values.
 */
function strictEqual(actual, expected, message) {
  if (actual !== expected) {
    const msg = message || `Expected ${JSON.stringify(expected)}, but got ${JSON.stringify(actual)}`;
    throw new AssertionError(msg, actual, expected);
  }
}

/**
 * Asserts truthiness of condition.
 */
function ok(condition, message) {
  if (!condition) {
    throw new AssertionError(message || `Expected truthy condition, got ${condition}`, condition, true);
  }
}

/**
 * Asserts deep equality between actual and expected objects/arrays.
 */
function deepStrictEqual(actual, expected, message) {
  try {
    assert.deepStrictEqual(actual, expected);
  } catch (err) {
    throw new AssertionError(message || `Deep strict equality failed: ${err.message}`, actual, expected);
  }
}

/**
 * Asserts HTTP status code matches expected status.
 */
function assertStatusCode(res, expectedStatus, testName) {
  if (!res) {
    throw new AssertionError(`[${testName || 'HTTP Test'}] Response object is null or undefined`, null, expectedStatus);
  }
  if (res.status !== expectedStatus) {
    const errorBody = res.body ? JSON.stringify(res.body) : res.text || '';
    throw new AssertionError(
      `[${testName || 'HTTP Test'}] Expected HTTP status ${expectedStatus}, got ${res.status}. Response body: ${errorBody}`,
      res.status,
      expectedStatus
    );
  }
}

/**
 * Asserts response object contains specific required properties.
 */
function assertHasProperties(obj, properties, messagePrefix) {
  ok(obj && typeof obj === 'object', `${messagePrefix || 'Object'}: Expected valid object, got ${typeof obj}`);
  for (const prop of properties) {
    ok(Object.prototype.hasOwnProperty.call(obj, prop) && obj[prop] !== undefined, 
      `${messagePrefix || 'Object'}: Missing required property '${prop}'`);
  }
}

/**
 * Asserts that a number falls within inclusive range [min, max].
 */
function inRange(value, min, max, message) {
  ok(typeof value === 'number' && !isNaN(value), `${message || 'Value'}: Expected number, got ${typeof value}`);
  ok(value >= min && value <= max, message || `Expected value ${value} to be between ${min} and ${max}`);
}

/**
 * Asserts that a string matches a regular expression.
 */
function match(string, regex, message) {
  ok(typeof string === 'string', `Expected string input to match regex, got ${typeof string}`);
  ok(regex.test(string), message || `Expected string "${string}" to match pattern ${regex}`);
}

/**
 * Asserts an asynchronous action rejects or throws an error matching condition.
 */
async function rejects(asyncFn, errorMatcher, message) {
  let threw = false;
  let caughtError = null;
  try {
    await asyncFn();
  } catch (err) {
    threw = true;
    caughtError = err;
  }
  if (!threw) {
    throw new AssertionError(message || 'Expected async function to reject, but it resolved successfully.', null, 'Error');
  }
  if (typeof errorMatcher === 'function') {
    ok(errorMatcher(caughtError), message || `Error ${caughtError} did not pass custom matcher`);
  } else if (errorMatcher instanceof RegExp) {
    match(caughtError.message || String(caughtError), errorMatcher, message);
  }
}

module.exports = {
  AssertionError,
  strictEqual,
  ok,
  deepStrictEqual,
  assertStatusCode,
  assertHasProperties,
  inRange,
  match,
  rejects
};
