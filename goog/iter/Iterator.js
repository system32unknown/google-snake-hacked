export default class Iterator {
  constructor() { }

  next() { throw Error("StopIteration"); }
  __iterator__() { return this; }
}