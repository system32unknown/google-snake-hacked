export default class Iterator {
  constructor() { }

  next() { throw new Error("StopIteration"); }
  __iterator__() { return this; }
}