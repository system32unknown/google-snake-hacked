import Sprite from '../objects/Sprite.js';
import { TIMER_DIGITS } from '../data/data.js';
import Disposable from '../../goog/Disposable.js';

export default class TimerDisplay extends Disposable {
  /**
   * Creates a 4-digit timer (e.g. MM:SS) using sprite digits.
   * @param {number} x - Starting x-position on the screen.
   * @param {number} y - Y-position on the screen.
   * @param {HTMLElement} parent - The DOM or container to attach the digits to.
   */
  constructor(x, y, parent) {
    super();

    this.digits = []; // Array of 4 digit sprites (M1, colon?, S1, S2)
    this.lastValue = null; // Used to avoid redundant updates

    // Create 4 sprite digits spaced horizontally
    for (let i = 0; i < 4; i++) {
      const digitSprite = new Sprite(TIMER_DIGITS[0]);
      Sprite.setPosition(digitSprite, x + 10 * i, y);
      parent.appendChild(digitSprite.getElement());
      this.digits.push(digitSprite);
    }

    // Optionally set colon or middle separator sprite
    Sprite.setFrame(this.digits[1], 49);
  }

  /**
   * Update the timer display to match the current time (in seconds).
   * @param {number} time - Time in seconds.
   */
  update(time) {
    if (time === this.lastValue) return;

    const minutes = Math.floor(time / 60) % 10;
    const seconds = Math.floor(time % 60);

    if (minutes >= 0 && seconds >= 0) {
      Sprite.setFrame(this.digits[0], TIMER_DIGITS[minutes]);
      Sprite.setFrame(this.digits[2], TIMER_DIGITS[Math.floor(seconds / 10)]);
      Sprite.setFrame(this.digits[3], TIMER_DIGITS[seconds % 10]);
      this.lastValue = time;
    }
  }

  /**
   * Show or hide all timer digits.
   * @param {boolean} visible - Whether to show the digits.
   */
  show(visible) {
    this.digits.forEach(digit => digit.show(visible));
  }

  /**
   * Cleanup sprite resources when disposed.
   */
  disposeInternal() {
    this.digits.forEach(digit => digit.disposeInternal());
    super.disposeInternal();
  }
}