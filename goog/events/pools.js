import Listener from './Listener.js';
import BrowserEvent from './BrowserEvent.js';
import { nullFunction } from '../js';

export default class Pools {
  static #proxyCallback = null;

  static setProxyCallbackFunction(callback) {
    Pools.#proxyCallback = callback;
  }

  static getObject() {
    return { count_: 0, remaining_: 0 };
  }

  static getArray() {
    return [];
  }

  static getProxy() {
    const proxy = (event) => Pools.#proxyCallback.call(proxy.src, proxy.key, event);
    return proxy;
  }

  static getListener() {
    return new Listener();
  }

  static getEvent() {
    return new BrowserEvent();
  }

  static releaseObject = nullFunction;
  static releaseArray = nullFunction;
  static releaseProxy = nullFunction;
  static releaseListener = nullFunction;
  static releaseEvent = nullFunction;
}