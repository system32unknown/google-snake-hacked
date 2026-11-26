import Disposable from "../../goog/Disposable.js";
import EventHandler from "../../goog/events/EventHandler.js";
import { bind } from "../../goog/goog.js";
import { getTime, getVendorPropertyName } from "../utils/utils.js";

export default class VisibilityTimer extends Disposable {
  constructor(timeoutMs, onVisible, onHidden) {
    super();
    this.timeoutMs = timeoutMs;    // How long to wait (in ms)
    this.onVisible = onVisible;    // Callback when the page becomes visible
    this.onHidden = onHidden;      // Callback when the page becomes hidden

    this.hasTriggered = false;
    this.isHidden = false;
    this.startTime = getTime();
    this.hiddenProp = getVendorPropertyName("hidden");
    this.visibilityStateProp = getVendorPropertyName("visibilityState");

    // Determine the visibility change event name
    this.visibilityChangeEvent = this.visibilityStateProp ? this.visibilityStateProp.replace(/state$/i, "change").toLowerCase() : null;

    // Listen to document visibility changes
    if (this.visibilityChangeEvent) {
      var listener = new EventHandler(this);
      listener.listen(document, this.visibilityChangeEvent, bind(this.onVisibilityChange, this));
    }

    // Start initial timer
    this.scheduleCheck();
  }

  disposeInternal() {
    clearTimeout(this.timer);
    super.disposeInternal();
  }

  // Called when timer interval passes
  checkVisibility = () => {
    this.timer = null;
    // True if enough time has passed
    this.isHidden = getTime() - this.startTime >= this.timeoutMs;
    this.updateCallbacks();
  }

  // Schedule next visibility check
  scheduleCheck() {
    if (this.timer) clearTimeout(this.timer);
    const remaining = Math.max(100, this.timeoutMs - (getTime() - this.startTime));
    this.timer = setTimeout(bind(this.checkVisibility, this), remaining);
  }

  // Called when visibility changes
  onVisibilityChange() {
    const state = document[this.visibilityStateProp];
    this.isHidden = document[this.hiddenProp] || state === "hidden";
    if (this.isHidden) this.updateCallbacks();
    else this.resetTimer();
  }

  // Update which callback should fire
  updateCallbacks() {
    const condition = this.isHidden || this.hasTriggered;
    if (this.hasTriggered && !condition) {
      this.hasTriggered = false;
      this.onHidden();
      this.scheduleCheck();
    } else if (!this.hasTriggered && condition) {
      this.hasTriggered = true;
      this.onVisible();
    }
  }

  // Reset time tracking
  resetTimer() { // Mb
    this.startTime = getTime();
    this.hasTriggered = false;
    this.updateCallbacks();
  }
}