import EventTarget from '../../goog/events/EventTarget.js';
import EventHandler from '../../goog/events/EventHandler.js';
import { DirectionEvent } from '../events.js';
import { IE } from '../../goog/userAgent/userAgent.js';

const KeyToDirection = {
  37: 3, // ARROWLEFT
  38: 1, // ARROWUP
  39: 4, // ARROWRIGHT
  40: 2, // ARROWDOWN
  87: 1, // W
  83: 2, // S
  65: 3, // A
  68: 4 // D
};

export default class InputController extends EventTarget {
  constructor(preventDefault = false) {
    super();
    this.handler = new EventHandler(this);
    this.preventDefault = preventDefault;

    this.handler.listen(document, "keydown", this.onKeyDown);

    if (!IE) {
      window.addEventListener("deviceorientation", this.onMotion, true);
      window.addEventListener("MozOrientation", this.onMotion, true);
      window.addEventListener("devicemotion", this.onMotion, true);
    }

    this.orientation = 0;
    this.avgX = 0;
    this.avgY = 0;
    this.calibrationFrames = 10;
  }

  onMotion(event) {
    let orientation = screen.orientation;
    if (this.orientation !== orientation) {
      this.orientation = orientation;
      this.calibrationFrames = 10;
      this.avgX = this.avgY = 0;
    }

    let accel = event.accelerationIncludingGravity;
    if (accel) {
      let x = accel.x;
      let y = accel.y;

      switch (orientation) {
        case 90:
          x = -accel.y;
          y = accel.y;
          break;
        case -90:
          x = accel.y;
          y = accel.y;
          break;
        case 180:
          x = -accel.x;
          y = accel.y;
          break;
      }

      let gamma = event.gamma || 57 * event.x || 2 * x;
      let beta = event.beta || 57 * event.y || 2 * y;

      if (this.calibrationFrames) {
        this.avgX += gamma;
        this.avgY += beta;
        this.calibrationFrames--;
        if (this.calibrationFrames === 0) {
          this.avgX /= 10;
          this.avgY /= 10;
        }
      } else {
        let deltaX = gamma - this.avgX;
        let deltaY = beta - this.avgY;

        let direction = 0;
        let intensity = 0;

        if (deltaX > 5) { // right
          intensity = (deltaX - 5) / 10;
          direction = 4;
        } else if (deltaX < -5) { // left
          intensity = (-deltaX - 5) / 10;
          direction = 3;
        }

        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          if (deltaY > 5) { // down
            intensity = (deltaY - 5) / 10;
            direction = 2;
          } else if (deltaY < -5) { // up
            intensity = (-deltaY - 5) / 10;
            direction = 1;
          } 
        }

        if (intensity > 0 && direction) this.dispatchEvent(new DirectionEvent(direction));
      }
    }
  }

  onKeyDown(e) {
    let direction = KeyToDirection[e.keyCode];
    if (direction) {
      this.dispatchEvent(new DirectionEvent(direction));
      if (this.preventDefault && e.preventDefault) e.preventDefault();
    }
  }

  disposeInternal() {
    super.disposeInternal();
    this.handler.disposeInternal();
    this.handler = null;

    if (!IE) {
      window.removeEventListener("deviceorientation", this.onMotion, true);
      window.removeEventListener("MozOrientation", this.onMotion, true);
      window.removeEventListener("devicemotion", this.onMotion, true);
    }
  }
}