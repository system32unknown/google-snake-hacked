import { isArray } from "../goog.js";

export const forEach = (object, fn, context) => {
  for (const key in object) fn.call(context, object[key], key, object);
};

export const filter = (object, fn, context) => {
  const result = {};
  for (const key in object) {
    if (fn.call(context, object[key], key, object)) result[key] = object[key];
  }
  return result;
};

export const map = (object, fn, context) => {
  const result = {};
  for (const key in object) result[key] = fn.call(context, object[key], key, object);
  return result;
};

export const some = (object, fn, context) => {
  for (const key in object) {
    if (fn.call(context, object[key], key, object)) return true;
  }
  return false;
};

export const every = (object, fn, context) => {
  for (const key in object) {
    if (!fn.call(context, object[key], key, object)) return false;
  }
  return true;
};

export const getCount = (object) => {
  let count = 0;
  for (const key in object) count++;
  return count;
};

export const getAnyKey = (object) => {
  for (const key in object) return key;
  return undefined;
};

export const getAnyValue = (object) => {
  for (const key in object) return object[key];
  return undefined;
};

export const getKeys = (object) => {
  const keys = [];
  for (const key in object) keys.push(key);
  return keys;
};

export const getValues = (object) => {
  const values = [];
  for (const key in object) values.push(object[key]);
  return values;
};

export const containsKey = (object, key) => key in object;

export const containsValue = (object, value) => {
  for (const key in object) {
    if (object[key] === value) return true;
  }
  return false;
};

export const contains = containsValue;

export const findKey = (object, fn, context) => {
  for (const key in object) {
    if (fn.call(context, object[key], key, object)) return key;
  }
  return undefined;
};

export const findValue = (object, fn, context) => {
  const key = findKey(object, fn, context);
  return key === undefined ? undefined : object[key];
};

export const isEmpty = (object) => {
  for (const key in object) {
    if (Object.hasOwn(object, key)) return false;
  }
  return true;
};

export const remove = (object, key) => {
  const exists = key in object;
  if (exists) delete object[key];
  return exists;
};

export const clear = (object) => {
  for (const key of getKeys(object)) remove(object, key);
};

export const set = (object, key, value) => {
  object[key] = value;
};

export const add = (object, key, value) => {
  if (key in object) throw new Error(`The object already contains the key "${key}"`);
  set(object, key, value);
};

export const get = (object, key, defaultValue) => (key in object ? object[key] : defaultValue);

export const setIfUndefined = (object, key, value) => key in object ? object[key] : (object[key] = value);

export const clone = (object) => {
  const result = {};
  for (const key in object) result[key] = object[key];
  return result;
};

export const transpose = (object) => {
  const result = {};
  for (const key in object) result[object[key]] = key;
  return result;
};

export const extend = (target, ...sources) => {
  for (const source of sources) {
    for (const key in source) target[key] = source[key];
  }
};

export const create = (...args) => {
  if (args.length === 1 && isArray(args[0])) return create(...args[0]);
  if (args.length % 2) throw new Error('Uneven number of arguments');

  const result = {};
  for (let i = 0; i < args.length; i += 2) result[args[i]] = args[i + 1];
  return result;
};

export const createSet = (...args) => {
  if (args.length === 1 && isArray(args[0])) return createSet(...args[0]);

  const result = {};
  for (const key of args) result[key] = true;
  return result;
};