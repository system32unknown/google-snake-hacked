export default class StringBuffer {
  constructor(a, b) {
    this.buffer_ = "";
    null != a && this.append.apply(this, arguments);
  }
  
  set(a) {
    this.clear();
    this.append(a);
  }

  append(a, b, c) {
    this.buffer_ += a;
    if (null != b) for (var d = 1; d < arguments.length; d++) this.buffer_ += arguments[d];
    return this;
  }

  clear() {
    this.buffer_ = "";
  }

  getLength() {
    return this.toString().length;
  }

  toString() {
    return this.buffer_;
  }
}