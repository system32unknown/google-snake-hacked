import Iterator from './Iterator.js';
import { isArrayLike } from '../goog.js';
import { forEach as forEachInArray, toArray as arrayLikeToArray } from '../array.js';

export const StopIteration = new Error('StopIteration');

const step = (iterator) => {
  try {
    return { value: iterator.next(), done: false };
  } catch (error) {
    if (error !== StopIteration) throw error;
    return { value: undefined, done: true };
  }
};

export const toIterator = (iterable) => {
  if (iterable instanceof Iterator) return iterable;
  if (typeof iterable.__iterator__ === 'function') return iterable.__iterator__(false);

  if (isArrayLike(iterable)) {
    let index = 0;
    const iterator = new Iterator();

    iterator.next = () => {
      while (index < iterable.length) {
        if (index in iterable) return iterable[index++];
        index++;
      }
      throw StopIteration;
    };

    return iterator;
  }

  throw new Error('Not implemented');
};

export const forEach = (iterable, fn, context) => {
  try {
    if (isArrayLike(iterable)) {
      forEachInArray(iterable, fn, context);
      return;
    }

    const iterator = toIterator(iterable);
    for (;;) fn.call(context, iterator.next(), undefined, iterator);
  } catch (error) {
    if (error !== StopIteration) throw error;
  }
};

export const filter = (iterable, fn, context) => {
  const source = toIterator(iterable);
  const iterator = new Iterator();

  iterator.next = () => {
    for (;;) {
      const value = source.next();
      if (fn.call(context, value, undefined, source)) return value;
    }
  };

  return iterator;
};

export const range = (...args) => {
  const [start, stop] = args.length > 1 ? args : [0, args[0]];
  const stepSize = args[2] ?? 1;

  if (stepSize === 0) throw new Error('Range step argument must not be zero');

  let current = start;
  const iterator = new Iterator();

  iterator.next = () => {
    if ((stepSize > 0 && current >= stop) || (stepSize < 0 && current <= stop)) {
      throw StopIteration;
    }
    const value = current;
    current += stepSize;
    return value;
  };

  return iterator;
};

export const toArray = (iterable) => {
  if (isArrayLike(iterable)) return arrayLikeToArray(iterable);

  const result = [];
  forEach(toIterator(iterable), (value) => {
    result.push(value);
  });
  return result;
};

export const join = (iterable, separator) => toArray(iterable).join(separator);

export const map = (iterable, fn, context) => {
  const source = toIterator(iterable);
  const iterator = new Iterator();

  iterator.next = () => fn.call(context, source.next(), undefined, source);

  return iterator;
};

export const reduce = (iterable, fn, initialValue, context) => {
  let accumulator = initialValue;
  forEach(iterable, (value) => {
    accumulator = fn.call(context, accumulator, value);
  });
  return accumulator;
};

export const some = (iterable, fn, context) => {
  const iterator = toIterator(iterable);

  try {
    for (;;) {
      if (fn.call(context, iterator.next(), undefined, iterator)) return true;
    }
  } catch (error) {
    if (error !== StopIteration) throw error;
  }

  return false;
};

export const every = (iterable, fn, context) => {
  const iterator = toIterator(iterable);

  try {
    for (;;) {
      if (!fn.call(context, iterator.next(), undefined, iterator)) return false;
    }
  } catch (error) {
    if (error !== StopIteration) throw error;
  }

  return true;
};

export const chain = (...iterables) => {
  const iterator = new Iterator();
  let index = 0;
  let current = null;

  iterator.next = () => {
    while (index < iterables.length) {
      current ??= toIterator(iterables[index]);

      try {
        return current.next();
      } catch (error) {
        if (error !== StopIteration) throw error;
        current = null;
        index++;
      }
    }
    throw StopIteration;
  };

  return iterator;
};

export const dropWhile = (iterable, fn, context) => {
  const source = toIterator(iterable);
  const iterator = new Iterator();
  let dropping = true;

  iterator.next = () => {
    for (;;) {
      const value = source.next();
      if (!dropping || !fn.call(context, value, undefined, source)) {
        dropping = false;
        return value;
      }
    }
  };

  return iterator;
};

export const takeWhile = (iterable, fn, context) => {
  const source = toIterator(iterable);
  const iterator = new Iterator();
  let taking = true;

  iterator.next = () => {
    if (!taking) throw StopIteration;

    const value = source.next();
    if (fn.call(context, value, undefined, source)) return value;

    taking = false;
    throw StopIteration;
  };

  return iterator;
};

export const equals = (iterable1, iterable2) => {
  const first = toIterator(iterable1);
  const second = toIterator(iterable2);

  for (;;) {
    const a = step(first);
    const b = step(second);

    if (a.done || b.done) return a.done && b.done;
    if (a.value !== b.value) return false;
  }
};

export const nextOrValue = (iterable, defaultValue) => {
  const { value, done } = step(toIterator(iterable));
  return done ? defaultValue : value;
};

export const product = (...arrays) => {
  const iterator = new Iterator();

  if (arrays.length === 0 || arrays.some((array) => !array.length)) return iterator;

  let indices = arrays.map(() => 0);

  iterator.next = () => {
    if (!indices) throw StopIteration;

    const result = indices.map((valueIndex, position) => arrays[position][valueIndex]);

    for (let position = indices.length - 1; position >= 0; position--) {
      if (indices[position] < arrays[position].length - 1) {
        indices[position]++;
        break;
      }
      if (position === 0) {
        indices = null;
        break;
      }
      indices[position] = 0;
    }

    return result;
  };

  return iterator;
};