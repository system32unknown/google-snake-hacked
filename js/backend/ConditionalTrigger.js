import { getTime } from "../utils/utils.js";

/**
 * ConditionalTrigger executes a callback when a condition becomes true.
 * It supports optional delay and one-time trigger modes.
 */
export default class ConditionalTrigger {
  /**
   * @param {Function} conditionFn - Function that returns true when the condition is met.
   * @param {Function} onTriggerFn - Function to call when triggered.
   * @param {boolean} [singleUse=false] - If true, trigger only once.
   * @param {number} [cooldown=0] - Minimum time (ms) between triggers if not single-use.
   */
  constructor(conditionFn, onTriggerFn, singleUse = false, cooldown = 0) {
    this.conditionFn = conditionFn;   // Function to check
    this.onTriggerFn = onTriggerFn;   // Callback to fire
    this.triggered = false;           // Has been triggered already
    this.singleUse = singleUse;       // True = one-time trigger
    this.cooldown = cooldown;         // Delay between triggers
    this.lastTriggerTime = 0;         // Timestamp of last trigger
  }

  /**
   * Checks the condition and fires the callback if appropriate.
   */
  update() {
    const now = getTime();

    const readyToTrigger = !(this.singleUse && this.triggered) && (this.singleUse || now - this.lastTriggerTime > this.cooldown);

    if (readyToTrigger && this.conditionFn()) {
      this.onTriggerFn();
      this.triggered = true;
      this.lastTriggerTime = now;
    }
  }
}