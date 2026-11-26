export const lock = (fn) =>
  function () {
    return fn.call(this);
  };

export const compose = (...fns) =>
  function (...args) {
    if (fns.length === 0) return undefined;

    let result = fns[fns.length - 1].apply(this, args);
    for (let i = fns.length - 2; i >= 0; i--) {
      result = fns[i].call(this, result);
    }
    return result;
  };

export const sequence = (...fns) =>
  function (...args) {
    let result;
    for (const fn of fns) {
      result = fn.apply(this, args);
    }
    return result;
  };

export const and = (...fns) =>
  function (...args) {
    return fns.every((fn) => fn.apply(this, args));
  };

export const or = (...fns) =>
  function (...args) {
    return fns.some((fn) => fn.apply(this, args));
  };

export const create = (Constructor, ...args) => {
  const instance = Object.create(Constructor.prototype);
  Constructor.apply(instance, args);
  return instance;
};