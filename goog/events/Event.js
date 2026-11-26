import Disposable from "../Disposable.js";

export default class Event extends Disposable {
  propagationStopped_ = false;
  returnValue_ = true;

  constructor(a, b) {
    super();
    this.type = a;
    this.currentTarget = this.target = b;
  }
  static stopPropagation(a) {
    a.stopPropagation();
  }
  stopPropagation() {
    this.propagationStopped_ = true
  }

  static preventDefault(a) {
    a.preventDefault();
  }
  preventDefault() {
    this.returnValue_ = false
  }

  disposeInternal() {
    delete this.type;
    delete this.target;
    delete this.currentTarget;
  }
}