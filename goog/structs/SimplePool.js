import Disposable from "../Disposable.js";
import { isFunction, isObject } from '../goog.js';

export default class SimplePool extends Disposable {
  createObjectFn_ = null;
  disposeObjectFn_ = null;

  constructor(a, b) {
    super();
    this.maxCount_ = b;
    this.freeQueue_ = [];
    this.createInitial_(a);
  }

  setCreateObjectFn(a) {
    this.createObjectFn_ = a;
  }
  setDisposeObjectFn(a) {
    this.disposeObjectFn_ = a;
  }

  getObject() {
    return this.freeQueue_.length ? this.freeQueue_.pop() : this.createObject();
  }
  releaseObject(a) {
    this.freeQueue_.length < this.maxCount_ ? this.freeQueue_.push(a) : this.disposeObject(a);
  }

  createInitial_(a) {
    if (a > this.maxCount_) throw Error("[goog.structs.SimplePool] Initial cannot be greater than max");
    for (var b = 0; b < a; b++) this.freeQueue_.push(this.createObject());
  }
  createObject() {
    return this.createObjectFn_ ? this.createObjectFn_() : {};
  }

  disposeObject(a) {
    if (this.disposeObjectFn_) this.disposeObjectFn_(a);
    else if (isObject(a))
      if (isFunction(a.dispose)) a.dispose();
      else for (var b in a) delete a[b];
  }

  disposeInternal() {
    super.disposeInternal();
    for (var a = this.freeQueue_; a.length;) this.disposeObject(a.pop());
    delete this.freeQueue_;
  }
}