import { bind, nullFunction } from '../../goog/goog.js';
import { getTime } from '../utils/utils.js';

export default class AnimationSequence {
  static isAnimationPaused = false;

  constructor() {
    this.startTime = 0;
    this.currentIndex = 0;
    this.intervalId = 0;
    this.steps = [];
  }

  // Checks if animation is currently running
  isPlaying() {
    return !!this.intervalId;
  }

  // Starts playback of all animation steps in sequence
  play() {
    if (AnimationSequence.isAnimationPaused) return;

    this.stop();
    this.currentIndex = 0;
    this.startTime = getTime();
    this.intervalId = setInterval(bind(this.update, this), 16); // ~60fps
    this.update();
  }

  // Stops the animation and finalizes all remaining steps
  stop() {
    if (this.intervalId) {
      let step;
      while ((step = this.steps[this.currentIndex++])) {
        if (step.update !== null) step.update(1);
      }
      clearInterval(this.intervalId);
      this.intervalId = 0;
    }
  }

  // Called every frame
  update = () => {
    const now = getTime();

    if (AnimationSequence.isAnimationPaused) return;

    let step;
    while ((step = this.steps[this.currentIndex])) {
      const elapsed = now - this.startTime;

      if (elapsed < step.duration) {
        step.update(elapsed / step.duration);
        return; // wait until next frame
      }

      if (step.update != undefined) step.update(1); // complete this step
      if (step.duration > 0) this.startTime += step.duration;

      this.currentIndex++;
    }

    this.stop(); // all done
  }

  // Add a step (duration in ms, update callback)
  addStep(callback, duration = 0) {
    this.steps.push({ duration: duration, update: callback });
  }

  addPauseStep(duration) {
    this.addStep(nullFunction, duration);
  }
}