import Disposable from '../Disposable.js';
import { listenOnce, listen, unlistenByKey, getListener } from './events.js';
import { isArray } from '../goog.js';

const toTypeList = (type) => (isArray(type) ? type : [type]);

export default class EventHandler extends Disposable {
  #handler;
  #keys = new Set();

  constructor(handler) {
    super();
    this.#handler = handler;
  }

  #resolveHandler(handler) {
    return handler || this.#handler || this;
  }

  listen(source, type, listener, capture, handler) {
    for (const singleType of toTypeList(type)) {
      this.#keys.add(listen(source, singleType, listener || this, !!capture, this.#resolveHandler(handler)));
    }
    return this;
  }

  listenOnce(source, type, listener, capture, handler) {
    for (const singleType of toTypeList(type)) {
      this.#keys.add(listenOnce(source, singleType, listener || this, !!capture, this.#resolveHandler(handler)));
    }
    return this;
  }

  listenWithWrapper(source, wrapper, listener, capture, handler) {
    wrapper.listen(source, listener, capture, handler || this.#handler, this);
    return this;
  }

  unlisten(source, type, listener, capture, handler) {
    if (this.#keys.size === 0) return this;

    for (const singleType of toTypeList(type)) {
      const entry = getListener(source, singleType, listener || this, !!capture, this.#resolveHandler(handler));

      if (entry) {
        unlistenByKey(entry.key);
        this.#keys.delete(entry.key);
      }
    }
    return this;
  }

  unlistenWithWrapper(source, wrapper, listener, capture, handler) {
    wrapper.unlisten(source, listener, capture, handler || this.#handler, this);
    return this;
  }

  removeAll() {
    for (const key of this.#keys) unlistenByKey(key);
    this.#keys.clear();
  }

  disposeInternal() {
    super.disposeInternal();
    this.removeAll();
  }

  handleEvent() {
    throw new Error('EventHandler.handleEvent not implemented');
  }
}