import Iterator from '../iter/Iterator.js';
import { StopIteration } from '../iter/iter.js';
import { contains as collectionContains, getCount, getValues } from './structs.js';

const LOOKUP_THRESHOLD = 5;

export default class GoogSet {
  #items = new Set();
  #version = 0;

  constructor(source) {
    if (source) this.addAll(source);
  }

  getCount() {
    return this.#items.size;
  }

  add(value) {
    if (this.#items.has(value)) return;
    this.#items.add(value);
    this.#version++;
  }

  addAll(source) {
    for (const value of getValues(source)) this.add(value);
  }

  remove(value) {
    const removed = this.#items.delete(value);
    if (removed) this.#version++;
    return removed;
  }

  removeAll(source) {
    for (const value of getValues(source)) this.remove(value);
  }

  clear() {
    this.#items.clear();
    this.#version++;
  }

  isEmpty() {
    return this.#items.size === 0;
  }

  contains(value) {
    return this.#items.has(value);
  }

  containsAll(source) {
    return getValues(source).every((value) => this.contains(value));
  }

  intersection(source) {
    const result = new GoogSet();
    for (const value of getValues(source)) {
      if (this.contains(value)) result.add(value);
    }
    return result;
  }

  getValues() {
    return [...this.#items];
  }

  clone() {
    return new GoogSet(this);
  }

  equals(other) {
    return this.getCount() === getCount(other) && this.isSubsetOf(other);
  }

  isSubsetOf(other) {
    const size = getCount(other);
    if (this.getCount() > size) return false;

    const lookup = !(other instanceof GoogSet) && size > LOOKUP_THRESHOLD ? new GoogSet(other) : other;
    return this.getValues().every((value) => collectionContains(lookup, value));
  }

  __iterator__() {
    const values = this.getValues();
    const version = this.#version;
    const iterator = new Iterator();
    let index = 0;

    iterator.next = () => {
      if (version !== this.#version) {
        throw new Error('The set has changed since the iterator was created');
      }
      if (index >= values.length) throw StopIteration;
      return values[index++];
    };

    return iterator;
  }
}