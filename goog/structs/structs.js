import { isArrayLike, isString } from '../goog.js';

const hasMethod = (collection, name) => typeof collection[name] === 'function';

const isListLike = (collection) => isArrayLike(collection) || isString(collection);

export const getCount = (collection) => {
  if (hasMethod(collection, 'getCount')) return collection.getCount();
  return isListLike(collection) ? collection.length : Object.keys(collection).length;
};

export const getValues = (collection) => {
  if (hasMethod(collection, 'getValues')) return collection.getValues();
  if (isString(collection)) return collection.split('');
  if (isArrayLike(collection)) return Array.from(collection);
  return Object.values(collection);
};

export const getKeys = (collection) => {
  if (hasMethod(collection, 'getKeys')) return collection.getKeys();
  if (hasMethod(collection, 'getValues')) return undefined;
  if (isListLike(collection)) return Array.from({ length: collection.length }, (_, index) => index);
  return Object.keys(collection);
};

export const contains = (collection, value) => {
  if (hasMethod(collection, 'contains')) return collection.contains(value);
  if (hasMethod(collection, 'containsValue')) return collection.containsValue(value);
  if (isListLike(collection)) return Array.prototype.includes.call(collection, value);
  return Object.values(collection).includes(value);
};

export const isEmpty = (collection) => {
  if (hasMethod(collection, 'isEmpty')) return collection.isEmpty();
  return isListLike(collection) ? collection.length === 0 : Object.keys(collection).length === 0;
};

export const clear = (collection) => {
  if (hasMethod(collection, 'clear')) {
    collection.clear();
  } else if (isArrayLike(collection)) {
    Array.prototype.splice.call(collection, 0, collection.length);
  } else {
    for (const key of Object.keys(collection)) delete collection[key];
  }
};

export const forEach = (collection, fn, context) => {
  if (hasMethod(collection, 'forEach')) return collection.forEach(fn, context);
  if (isListLike(collection)) return Array.prototype.forEach.call(collection, fn, context);

  const keys = getKeys(collection);
  getValues(collection).forEach((value, index) => {
    fn.call(context, value, keys?.[index], collection);
  });
};

export const filter = (collection, fn, context) => {
  if (hasMethod(collection, 'filter')) return collection.filter(fn, context);
  if (isListLike(collection)) return Array.prototype.filter.call(collection, fn, context);

  const keys = getKeys(collection);
  const values = getValues(collection);

  if (!keys) return values.filter((value) => fn.call(context, value, undefined, collection));

  const result = {};
  values.forEach((value, index) => {
    if (fn.call(context, value, keys[index], collection)) result[keys[index]] = value;
  });
  return result;
};

export const map = (collection, fn, context) => {
  if (hasMethod(collection, 'map')) return collection.map(fn, context);
  if (isListLike(collection)) return Array.prototype.map.call(collection, fn, context);

  const keys = getKeys(collection);
  const values = getValues(collection);

  if (!keys) return values.map((value) => fn.call(context, value, undefined, collection));

  const result = {};
  values.forEach((value, index) => {
    result[keys[index]] = fn.call(context, value, keys[index], collection);
  });
  return result;
};

export const some = (collection, fn, context) => {
  if (hasMethod(collection, 'some')) return collection.some(fn, context);
  if (isListLike(collection)) return Array.prototype.some.call(collection, fn, context);

  const keys = getKeys(collection);
  return getValues(collection).some((value, index) =>
    fn.call(context, value, keys?.[index], collection)
  );
};

export const every = (collection, fn, context) => {
  if (hasMethod(collection, 'every')) return collection.every(fn, context);
  if (isListLike(collection)) return Array.prototype.every.call(collection, fn, context);

  const keys = getKeys(collection);
  return getValues(collection).every((value, index) =>
    fn.call(context, value, keys?.[index], collection)
  );
};