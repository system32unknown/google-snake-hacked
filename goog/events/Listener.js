import { isFunction } from '../goog.js';

let keyCounter = 0;

export default class Listener {
  key = 0;
  removed = false;
  callOnce = false;
  listener = null;
  proxy = null;
  src = null;
  type = null;
  capture = false;
  handler = null;
  isFunctionListener_ = false;

  init(listener, proxy, src, type, capture, handler) {
    if (isFunction(listener)) {
      this.isFunctionListener_ = true;
    } else if (listener && isFunction(listener.handleEvent)) {
      this.isFunctionListener_ = false;
    } else {
      throw new Error('Invalid listener argument');
    }

    this.listener = listener;
    this.proxy = proxy;
    this.src = src;
    this.type = type;
    this.capture = !!capture;
    this.handler = handler;
    this.callOnce = false;
    this.key = ++keyCounter;
    this.removed = false;
  }

  handleEvent(event) {
    return this.isFunctionListener_ ? this.listener.call(this.handler || this.src, event) : this.listener.handleEvent.call(this.listener, event);
  }
}