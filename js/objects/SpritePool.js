import Disposable from '../../goog/Disposable.js';
import Sprite from './Sprite.js';
import { defineSingleton } from '../utils/utils.js';

export default class SpritePool extends Disposable {
  constructor() {
    super()
    this.pool = []
  }

  get() {
    return this.pool.length === 0 ? new Sprite(57) : this.pool.shift()
  }

  disposeInternal() {
    this.pool.forEach(function (spr) {
      spr.disposeInternal();
    });
    this.pool = null;
    super.disposeInternal();
  }
}
defineSingleton(SpritePool);