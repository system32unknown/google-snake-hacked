import Disposable from "../Disposable.js";
import { listen, unlisten, dispatchEvent, removeAll } from "./events.js";

export default class EventTarget extends Disposable {
  parentEventTarget_ = null;
  customEvent_ = true;

  constructor() {
    super();
  }
  getParentEventTarget() {
    return this.parentEventTarget_;
  }
  setParentEventTarget(a) {
    this.parentEventTarget_ = a;
  }
  addEventListener(a, b, c, d) {
    listen(this, a, b, c, d);
  }
  removeEventListener(a, b, c, d) {
    unlisten(this, a, b, c, d);
  }
  dispatchEvent(a) {
    return dispatchEvent(this, a);
  }
  disposeInternal() {
    super.disposeInternal();
    removeAll(this);
    this.parentEventTarget_ = null;
  }
}