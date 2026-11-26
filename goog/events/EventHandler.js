import Disposable from "../Disposable.js";
import SimplePool from "../structs/SimplePool.js";
import { remove } from "../object/object.js";
import { listenOnce, listen, unlistenByKey, getListener } from "./events.js";

export default class EventHandler extends Disposable {
  KEY_POOL_INITIAL_COUNT = 0;
  KEY_POOL_MAX_COUNT = 100;
  keyPool_ = new SimplePool(this.KEY_POOL_INITIAL_COUNT, this.KEY_POOL_MAX_COUNT);

  constructor(a) {
    super();
    this.handler_ = a;
    this.key_ = null;
    this.keys_ = null;

    this.typeArray_ = [];
  }

  listen(a, b, c, d, e) {
    goog.isArray(b) || (this.typeArray_[0] = b, b = typeArray_);
    for (var f = 0; f < b.length; f++) this.recordListenerKey_(listen(a, b[f], c || this, d || false, e || this.handler_ || this));
    return this;
  }
  listenOnce(a, b, c, d, e) {
    if (goog.isArray(b))
      for (var f = 0; f < b.length; f++) this.listenOnce(a, b[f], c, d, e);
    else this.recordListenerKey_(listenOnce(a, b, c || this, d || false, e || this.handler_ || this));
    return this;
  }
  listenWithWrapper(a, b, c, d, e) {
    b.listen(a, c, d, e || this.handler_, this);
    return this;
  }

  recordListenerKey_(a) {
    this.keys_ ? this.keys_[a] = true : this.key_ ? (this.keys_ = this.keyPool_.getObject(), this.keys_[this.key_] = true, this.key_ = null, this.keys_[a] = true) : this.key_ = a;
  }

  unlisten(a, b, c, d, e) {
    if (this.key_ || this.keys_)
      if (goog.isArray(b))
        for (var f = 0; f < b.length; f++) this.unlisten(a, b[f], c, d, e);
      else if (a = getListener(a, b, c || this, d || false, e || this.handler_ || this)) a = a.key, unlistenByKey(a), this.keys_ ? remove(this.keys_, a) : this.key_ == a && (this.key_ = null);
    return this;
  }

  unlistenWithWrapper(a, b, c, d, e) {
    b.unlisten(a, c, d, e || this.handler_, this);
    return this;
  }

  removeAll() {
    if (this.keys_) {
      for (var a in this.keys_) unlistenByKey(a), delete this.keys_[a];
      this.keyPool_.releaseObject(this.keys_);
      this.keys_ = null;
    } else this.key_ && unlistenByKey(this.key_);
  }

  disposeInternal() {
    super.disposeInternal();
    this.removeAll();
  }

  handleEvent() {
    throw Error("EventHandler.handleEvent not implemented");
  }
};