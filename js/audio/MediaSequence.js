import Disposable from "../../goog/Disposable.js";

export default class MediaSequence extends Disposable {
  constructor() {
    super();

    this.items = [];            // pb
    this.index = 0;             // ua
    this.isLoaded = false;      // qb
    this.isPlaying = false;     // ia
  }

  disposeInternal() {
    this.items = [];
    this.index = 0;
    this.isLoaded = false;
    this.isPlaying = false;

    super.disposeInternal();
  }

  /**
   * Returns whether the item is currently playing.
   */
  isActive() {
    return this.isPlaying;
  }

  /**
   * Move to next item in sequence.
   */
  next(loop, onLoad, onEnd) {
    this.index++;
    if (this.index >= this.items.length) {
      this.index = loop ? 0 : this.items.length - 1;
    }
    this.load(loop, onLoad, onEnd);
  }
}