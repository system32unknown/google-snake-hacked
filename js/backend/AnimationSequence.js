import { nullFunction } from '../../goog/goog.js';
import { getTime } from '../utils/utils.js';

const TICK_INTERVAL_MS = 16;

export default class AnimationSequence {
  static isAnimationPaused = false;

  steps = [];
  startTime = 0;
  currentIndex = 0;
  intervalId = 0;
  pausedAt = null;

  isPlaying() {
    return Boolean(this.intervalId);
  }

  play() {
    if (AnimationSequence.isAnimationPaused) return;

    this.stop();
    this.currentIndex = 0;
    this.pausedAt = null;
    this.startTime = getTime();
    this.intervalId = setInterval(this.update, TICK_INTERVAL_MS);
    this.update();
  }

  stop() {
    if (!this.intervalId) return;

    clearInterval(this.intervalId);
    this.intervalId = 0;
    this.pausedAt = null;

    const remaining = this.steps.slice(this.currentIndex);
    this.currentIndex = this.steps.length;

    for (const step of remaining) step.update?.(1);
  }

  update = () => {
    const now = getTime();

    if (AnimationSequence.isAnimationPaused) {
      this.pausedAt ??= now;
      return;
    }

    if (this.pausedAt !== null) {
      this.startTime += now - this.pausedAt;
      this.pausedAt = null;
    }

    for (let step = this.steps[this.currentIndex]; step; step = this.steps[this.currentIndex]) {
      const elapsed = now - this.startTime;

      if (elapsed < step.duration) {
        step.update?.(elapsed / step.duration);
        return;
      }

      step.update?.(1);
      if (step.duration > 0) this.startTime += step.duration;
      this.currentIndex++;
    }

    this.stop();
  };

  addStep(callback, duration = 0) {
    this.steps.push({ duration, update: callback });
    return this;
  }

  addPauseStep(duration) {
    return this.addStep(nullFunction, duration);
  }
}