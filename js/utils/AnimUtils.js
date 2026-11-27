import AnimationSequence from '../backend/AnimationSequence.js';
import Sprite from '../objects/Sprite.js';
import { ScoreDisplay } from '../ui/ScoreDisplay.js';
import { Coordinate as Point } from '../../goog/math/Coordinate.js';

/**
 * Plays a swap/transition animation between two sprites.
 * @param {ScoreDisplay} ctx - The context containing sprite `A` and its animation state.
 * @param {Point} startPos - Object with `{x, y}` representing the base position.
 * @param {Sprite} targetSprite - The sprite to animate towards.
 * @param {number} frameIndex - Frame index to display during animation.
 */
export function playSwapAnim(ctx, startPos, targetSprite, frameIndex) {
  const mainSprite = ctx.backgroundSprite;

  if (ctx.animation) ctx.animation.stop(); // Stop any ongoing animation
  ctx.animation = new AnimationSequence(); // Create a new animation sequence

  // Setup initial display state
  mainSprite.show(true);
  Sprite.setFrame(mainSprite, frameIndex);
  Sprite.setPosition(mainSprite, startPos.x, startPos.y - 25);

  // Define animation step
  ctx.animation.addStep(progress => {
    if (progress === 1) {
      // End of animation: show final sprite
      Sprite.setPosition(targetSprite, startPos.x, startPos.y);
      Sprite.setFrame(targetSprite, frameIndex);
      mainSprite.show(false);
    } else {
      // During animation: move sprites in opposite vertical directions
      Sprite.setPosition(mainSprite, startPos.x, startPos.y - 25 * (1 - progress));
      Sprite.setPosition(targetSprite, startPos.x, startPos.y + 25 * progress);
    }
  }, 400);

  // Play the sequence
  ctx.animation.play();
}

export function stopAllAnimations(target) {
  if (target.animation) {
    target.animation.stop();
    target.isLooping = false;
    target.timeouts.forEach(handle => clearTimeout(handle));
  }

  if (target.animation) target.animation.stop();
}