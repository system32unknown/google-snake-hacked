import AssertionError from './AssertionError.js';
import { isNumber, isBoolean, isString, isObject, isArray, typeOf } from '../goog.js';

export function doAssertFailure_(a, b, c, d) {
  var e = "Assertion failed";
  if (c) var e = e + (": " + c), f = d;
  else a && (e += ": " + a, f = b);
  throw new AssertionError("" + e, f || []);
};
export function assert(a, b, c) {
  !a && doAssertFailure_("", null, b, Array.prototype.slice.call(arguments, 2));
  return a
};
export function fail(a, b) {
  throw new AssertionError("Failure" + (a ? ": " + a : ""), Array.prototype.slice.call(arguments, 1));
};
export function assertNumber(a, b, c) {
  !isNumber(a) && doAssertFailure_("Expected number but got %s: %s.", [typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a
};
export function assertString(a, b, c) {
  !isString(a) && doAssertFailure_("Expected string but got %s: %s.", [typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a
};
export function assertFunction(a, b, c) {
  !isFunction(a) && doAssertFailure_("Expected function but got %s: %s.", [typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a
};
export function assertObject(a, b, c) {
  !isObject(a) && doAssertFailure_("Expected object but got %s: %s.", [typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a
};
export function assertArray(a, b, c) {
  !isArray(a) && doAssertFailure_("Expected array but got %s: %s.", [typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a
};
export function assertBoolean(a, b, c) {
  !isBoolean(a) && doAssertFailure_("Expected boolean but got %s: %s.", [typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
  return a
};
export function assertInstanceof (a, b, c, d) {
  !(a instanceof b) && doAssertFailure_("instanceof check failed.", null, c, Array.prototype.slice.call(arguments, 3))
};