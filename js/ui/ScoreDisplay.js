import Sprite from '../objects/Sprite.js';
import { TIMER_DIGITS, SCORE_EFFECT_DIGITS } from '../data/data.js';
import Disposable from '../../goog/Disposable.js';
import { playSwapAnim } from '../utils/AnimUtils.js';

function createBackgroundTile(parent, x, y) {
  var tile = new Sprite(TIMER_DIGITS[0]);
  tile.show(false);               // hidden initially
  tile.setZIndex(-2);             // render behind everything
  Sprite.setPosition(tile, x, y); // place at coordinates
  parent.appendChild(tile.getElement());
  return tile;
}

/**
 * Creates an array of digit sprites representing a number.
 * 
 * @param {number} number - The number to convert into sprite digits.
 * @param {Array} spriteSet - Optional array of sprites for digits (default = `td`).
 * @param {number} length - Number of digits to generate (default = 3).
 * @returns {Array} Array of sprite references for each digit.
 */
export function createDigitSprites(number, spriteSet = TIMER_DIGITS, length = 3) {
  const digits = [spriteSet[0]];

  for (let i = 0; i < length; i++) {
    if (number !== 0) {
      const digit = number % 10;
      number = Math.floor(number / 10);
      digits[i] = spriteSet[digit];
    } else if (i > 0) digits[i] = null; // Hide leading zeros
  }

  return digits;
}

export class ScoreDisplay extends Disposable {
  constructor(position, root) {
    super();
    this.digitPositions = []; // Nb
    this.currentScore = 0; // z
    this.digitSprites = []; // M
    for (let i = 0; i < 3; i++) {
      this.digitPositions[i] = position[i];
      this.digitSprites.push(createBackgroundTile(root, position[i].x, position[i].y));
    }
    this.backgroundSprite = createBackgroundTile(root, position[0].x, position[0].y); // A
    this.effectSprites = []; // P
    this.animation = null; // Ga
    this.pendingScoreDiffs = []; // Mb
    this.lastEffectTime = null; // Ob
    this.hasTwoDigitEffect = false; // pd

    for (let i = 0; i < 2; i++) {
      const p = createBackgroundTile(root, position[i + 4].x, position[i + 4].y);
      p.element.style.opacity = 0;
      p.show(true);
      this.effectSprites[i] = p;
    }
  }

  reset() {
    for (let key in this.digitSprites) Sprite.setFrame(this.digitSprites[key], TIMER_DIGITS[0]);
    this.currentScore = 0;
    this.digitSprites[0].show(true);
    this.effectSprites[0].element.style.opacity = 0;
    this.effectSprites[1].element.style.opacity = 0;
    this.effectSprites[0].show(true);
    this.effectSprites[1].show(true);
    this.pendingScoreDiffs = [];
  }

  update(newScore) {
    if (newScore > 999 || newScore === this.currentScore) return;

    const diff = newScore - this.currentScore;
    this.currentScore = newScore;

    const digits = createDigitSprites(newScore);

    for (let i in digits) {
      const sprite = this.digitSprites[i];
      const frame = digits[i];
      const pos = this.digitPositions[i];

      if (frame != null) {
        sprite.show(true);
        if (sprite.getFrameId() !== frame) playSwapAnim(this, pos, sprite, frame);
      } else sprite.show(false);
    }

    // queue the numeric difference for the small pop effect
    this.pendingScoreDiffs.push(diff);
  }

  /**
   * Process any queued score-diff popup effects.
   * Call inside your frame/tick loop with a current timestamp (ms).
   *
   * @param {number} timeNow - ms timestamp (getTime()).
   */
  processPendingEffects(timeNow) {
    if (this.pendingScoreDiffs.length) {
      const diff = this.pendingScoreDiffs.shift();
      const effectFrames = createDigitSprites(diff, SCORE_EFFECT_DIGITS, 2);

      for (let i in effectFrames) {
        stopAllAnimations(this.effectSprites[i]);
        const frame = effectFrames[i];
        if (frame != null) {
          Sprite.setFrame(this.effectSprites[i], frame);
          Sprite.animateOpacity(this.effectSprites[i], 300, 0, 1);
        } else this.effectSprites[i].element.style.opacity = 0;
      }

      this.lastEffectTime = timeNow;
      this.hasTwoDigitEffect = effectFrames[1] != null;
    }

    if (this.lastEffectTime && timeNow - this.lastEffectTime > 1000) {
      Sprite.fadeOut(this.effectSprites[0]);
      if (this.hasTwoDigitEffect) Sprite.fadeOut(this.effectSprites[1]);
      this.lastEffectTime = null;
    }
  }

  disposeInternal() {
    this.digitSprites.forEach(s => s.disposeInternal());
    super.disposeInternal();
  }
}
