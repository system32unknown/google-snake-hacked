export default class Disposable {
  constructor() { this.disposed_ = false; }

  isDisposed() { return this.disposed_ };
  getDisposed() { return isDisposed(); }
  dispose() { this.disposed_ || (this.disposed_ = true, this.disposeInternal()) };
  disposeInternal() { };
};