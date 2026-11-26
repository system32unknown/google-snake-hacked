import { getValues, getKeys } from '../object/object.js';
import Iterator from '../iter/Iterator.js';
import { StopIteration } from '../iter/iter.js';

export default class GoogMap {
  #entries = new Map();
  #version = 0;

  constructor(...args) {
    if (args.length > 1) {
      if (args.length % 2) throw new Error('Uneven number of arguments');
      for (let i = 0; i < args.length; i += 2) this.set(args[i], args[i + 1]);
    } else if (args[0]) this.addAll(args[0]);
  }

  static defaultEquals(a, b) {
    return a === b;
  }

  getCount() {
    return this.#entries.size;
  }

  getValues() {
    return [...this.#entries.values()];
  }

  getKeys() {
    return [...this.#entries.keys()];
  }

  containsKey(key) {
    return this.#entries.has(String(key));
  }

  containsValue(value) {
    for (const current of this.#entries.values()) {
      if (current === value) return true;
    }
    return false;
  }

  equals(other, equalityFn = GoogMap.defaultEquals) {
    if (this === other) return true;
    if (this.getCount() !== other.getCount()) return false;

    for (const key of this.#entries.keys()) {
      if (!equalityFn(this.get(key), other.get(key))) return false;
    }
    return true;
  }

  isEmpty() {
    return this.#entries.size === 0;
  }

  clear() {
    this.#entries.clear();
    this.#version++;
  }

  remove(key) {
    const removed = this.#entries.delete(String(key));
    if (removed) this.#version++;
    return removed;
  }

  get(key, defaultValue) {
    const normalized = String(key);
    return this.#entries.has(normalized) ? this.#entries.get(normalized) : defaultValue;
  }

  set(key, value) {
    const normalized = String(key);
    if (!this.#entries.has(normalized)) this.#version++;
    this.#entries.set(normalized, value);
  }

  addAll(source) {
    const isMap = source instanceof GoogMap;
    const keys = isMap ? source.getKeys() : getKeys(source);
    const values = isMap ? source.getValues() : getValues(source);

    keys.forEach((key, index) => this.set(key, values[index]));
  }

  clone() {
    return new GoogMap(this);
  }

  transpose() {
    const result = new GoogMap();
    for (const [key, value] of this.#entries) result.set(value, key);
    return result;
  }

  toObject() {
    return Object.fromEntries(this.#entries);
  }

  getKeyIterator() {
    return this.__iterator__(true);
  }

  getValueIterator() {
    return this.__iterator__(false);
  }

  __iterator__(keysOnly) {
    const keys = this.getKeys();
    const version = this.#version;
    const iterator = new Iterator();
    let index = 0;

    iterator.next = () => {
      if (version !== this.#version) throw new Error('The map has changed since the iterator was created');
      if (index >= keys.length) throw StopIteration;

      const key = keys[index++];
      return keysOnly ? key : this.#entries.get(key);
    };

    return iterator;
  }
}