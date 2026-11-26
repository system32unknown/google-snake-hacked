import { isString, isArray, isArrayLike } from './goog.js';
import { assert } from './asserts/asserts.js';

const toIndexable = (array) => (isString(array) ? array.split('') : array);

const assertArrayLike = (array) => assert(array.length != null);

export const defaultCompare = (a, b) => {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
};

export const defaultCompareEquality = (a, b) => a === b;

export const peek = (array) => array[array.length - 1];

export const indexOf = (array, value, fromIndex) => {
  if (isString(array)) {
    if (!isString(value) || value.length !== 1) return -1;
    const start = fromIndex == null ? 0 : fromIndex < 0 ? Math.max(0, array.length + fromIndex) : fromIndex;
    return array.indexOf(value, start);
  }
  return Array.prototype.indexOf.call(array, value, fromIndex ?? 0);
};

export const lastIndexOf = (array, value, fromIndex) => {
  let start = fromIndex ?? array.length - 1;
  if (start < 0) start = Math.max(0, array.length + start);

  if (isString(array)) {
    return isString(value) && value.length === 1 ? array.lastIndexOf(value, start) : -1;
  }

  for (let i = start; i >= 0; i--) {
    if (i in array && array[i] === value) return i;
  }
  return -1;
};

export const forEach = (array, fn, context) => {
  Array.prototype.forEach.call(array, fn, context);
};

export const forEachRight = (array, fn, context) => {
  const items = toIndexable(array);
  for (let i = items.length - 1; i >= 0; i--) {
    if (i in items) fn.call(context, items[i], i, array);
  }
};

export const filter = (array, fn, context) => Array.prototype.filter.call(array, fn, context);

export const map = (array, fn, context) => Array.prototype.map.call(array, fn, context);

export const reduce = (array, fn, initialValue, context) =>
  Array.prototype.reduce.call(
    array,
    (accumulator, value, index) => fn.call(context, accumulator, value, index, array),
    initialValue
  );

export const reduceRight = (array, fn, initialValue, context) =>
  Array.prototype.reduceRight.call(
    array,
    (accumulator, value, index) => fn.call(context, accumulator, value, index, array),
    initialValue
  );

export const some = (array, fn, context) => Array.prototype.some.call(array, fn, context);

export const every = (array, fn, context) => Array.prototype.every.call(array, fn, context);

export const findIndex = (array, fn, context) => {
  const items = toIndexable(array);
  for (let i = 0; i < items.length; i++) {
    if (i in items && fn.call(context, items[i], i, array)) return i;
  }
  return -1;
};

export const find = (array, fn, context) => {
  const index = findIndex(array, fn, context);
  return index < 0 ? null : array[index];
};

export const findIndexRight = (array, fn, context) => {
  const items = toIndexable(array);
  for (let i = items.length - 1; i >= 0; i--) {
    if (i in items && fn.call(context, items[i], i, array)) return i;
  }
  return -1;
};

export const findRight = (array, fn, context) => {
  const index = findIndexRight(array, fn, context);
  return index < 0 ? null : array[index];
};

export const contains = (array, value) => indexOf(array, value) >= 0;

export const isEmpty = (array) => array.length === 0;

export const clear = (array) => {
  if (!isArray(array)) {
    for (let i = array.length - 1; i >= 0; i--) delete array[i];
  }
  array.length = 0;
};

export const splice = (array, ...args) => {
  assertArrayLike(array);
  return Array.prototype.splice.call(array, ...args);
};

export const slice = (array, start, end) => {
  assertArrayLike(array);
  return Array.prototype.slice.call(array, start, end);
};

export const insert = (array, value) => {
  if (!contains(array, value)) array.push(value);
};

export const insertAt = (array, value, index) => {
  splice(array, index, 0, value);
};

export const insertArrayAt = (array, values, index) => {
  splice(array, index, 0, ...values);
};

export const insertBefore = (array, value, ...reference) => {
  const index = reference.length ? indexOf(array, reference[0]) : -1;
  if (index < 0) {
    array.push(value);
  } else {
    insertAt(array, value, index);
  }
};

export const removeAt = (array, index) => {
  assertArrayLike(array);
  return Array.prototype.splice.call(array, index, 1).length === 1;
};

export const remove = (array, value) => {
  const index = indexOf(array, value);
  const found = index >= 0;
  if (found) removeAt(array, index);
  return found;
};

export const removeIf = (array, fn, context) => {
  const index = findIndex(array, fn, context);
  if (index < 0) return false;
  removeAt(array, index);
  return true;
};

export const concat = (...arrays) => [].concat(...arrays);

export const clone = (array) => (isArray(array) ? array.slice() : Array.from(array));

export const toArray = (array) => clone(array);

export const extend = (array, ...items) => {
  for (const item of items) {
    if (isArrayLike(item)) {
      for (let i = 0; i < item.length; i++) array.push(item[i]);
    } else {
      array.push(item);
    }
  }
};

export const removeDuplicates = (array, result) => {
  const target = result || array;
  const seen = new Set();
  let writeIndex = 0;

  for (let readIndex = 0; readIndex < array.length; readIndex++) {
    const value = array[readIndex];
    if (!seen.has(value)) {
      seen.add(value);
      target[writeIndex++] = value;
    }
  }

  target.length = writeIndex;
};

const binarySearchImpl = (array, compareFn, isEvaluator, target, context) => {
  let low = 0;
  let high = array.length;
  let found = false;

  while (low < high) {
    const middle = (low + high) >> 1;
    const comparison = isEvaluator
      ? compareFn.call(context, array[middle], middle, array)
      : compareFn(target, array[middle]);

    if (comparison > 0) {
      low = middle + 1;
    } else {
      high = middle;
      found = !comparison;
    }
  }

  return found ? low : ~low;
};

export const binarySearch = (array, target, compareFn) =>
  binarySearchImpl(array, compareFn || defaultCompare, false, target);

export const binarySelect = (array, evaluator, context) =>
  binarySearchImpl(array, evaluator, true, undefined, context);

export const sort = (array, compareFn) => {
  assertArrayLike(array);
  Array.prototype.sort.call(array, compareFn || defaultCompare);
};

export const stableSort = (array, compareFn) => {
  sort(array, compareFn);
};

export const sortObjectsByKey = (array, key, compareFn = defaultCompare) => {
  sort(array, (a, b) => compareFn(a[key], b[key]));
};

export const isSorted = (array, compareFn = defaultCompare, strict = false) => {
  for (let i = 1; i < array.length; i++) {
    const comparison = compareFn(array[i - 1], array[i]);
    if (comparison > 0 || (comparison === 0 && strict)) return false;
  }
  return true;
};

export const equals = (array1, array2, equalityFn = defaultCompareEquality) => {
  if (!isArrayLike(array1) || !isArrayLike(array2) || array1.length !== array2.length) {
    return false;
  }

  for (let i = 0; i < array1.length; i++) {
    if (!equalityFn(array1[i], array2[i])) return false;
  }
  return true;
};

export const compare = (array1, array2, equalityFn) => equals(array1, array2, equalityFn);

export const binaryInsert = (array, value, compareFn) => {
  const index = binarySearch(array, value, compareFn);
  if (index >= 0) return false;
  insertAt(array, value, -(index + 1));
  return true;
};

export const binaryRemove = (array, value, compareFn) => {
  const index = binarySearch(array, value, compareFn);
  return index >= 0 ? removeAt(array, index) : false;
};

export const bucket = (array, keyFn) => {
  const buckets = {};

  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    const key = keyFn(item, i, array);
    if (key === undefined) continue;
    if (!Object.hasOwn(buckets, key)) buckets[key] = [];
    buckets[key].push(item);
  }

  return buckets;
};

export const repeat = (value, count) => Array.from({ length: count }, () => value);

export const flatten = (...items) => {
  const result = [];

  const visit = (item) => {
    if (isArray(item)) for (let i = 0; i < item.length; i++) visit(item[i]);
    else result.push(item);
  };

  items.forEach(visit);
  return result;
};

export const rotate = (array, steps) => {
  assertArrayLike(array);

  if (array.length) {
    const normalized = steps % array.length;
    if (normalized > 0) {
      Array.prototype.unshift.apply(array, Array.prototype.splice.call(array, -normalized, normalized));
    } else if (normalized < 0) {
      Array.prototype.push.apply(array, Array.prototype.splice.call(array, 0, -normalized));
    }
  }

  return array;
};

export const zip = (...arrays) => {
  if (arrays.length === 0) return [];

  const length = Math.min(...arrays.map((array) => array.length));
  return Array.from({ length }, (_, index) => arrays.map((array) => array[index]));
};

export const shuffle = (array, random = Math.random) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
};