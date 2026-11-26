import { isFunction } from "../goog.js";

export default class Listener {
  counter_ = 0;
  key = 0;
  removed = false;
  callOnce = false;

  constructor() { }

  init(a, b, c, d, e, f) {
    if (goog.isFunction(a)) this.isFunctionListener_ = true;
    else if (a && a.handleEvent && isFunction(a.handleEvent)) this.isFunctionListener_ = false;
    else throw Error("Invalid listener argument");
    this.listener = a;
    this.proxy = b;
    this.src = c;
    this.type = d;
    this.capture = !!e;
    this.handler = f;
    this.callOnce = false;
    this.key = ++this.counter_;
    this.removed = false;
  }

  handleEvent(a) {
    return this.isFunctionListener_ ? this.listener.call(this.handler || this.src, a) : this.listener.handleEvent.call(this.listener, a);
  }
}