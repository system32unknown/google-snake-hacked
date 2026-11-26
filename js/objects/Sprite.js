import EventTarget from "../../goog/events/EventTarget.js";
import AnimationSequence from "../backend/AnimationSequence.js";
import SpriteSheet from "../backend/SpriteSheet.js";
import { setPosition } from "../utils/utils.js";

const SpriteManager = await SpriteSheet.create("spritesheet");

const NORMAL_BODY = [111, 114, 112, 113];
const pc = [107, 110, 108, 109];

const CELL_SIZE = 20;
const FADE_DURATION = 300;
const VENDOR_PREFIXES = ["Moz", "ms", "O", "webkit"];

export default class Sprite extends EventTarget {
  constructor(frameId, o) {
    super();

    this.frameId = frameId;
    this.rotation = 0;

    const source = this._getFrameSource();
    this.element = SpriteManager.createFrame(source);

    this.gridX = 0;
    this.gridY = 0;
    this.pixelX = 0;
    this.pixelY = 0;

    this.isFlipped = false;
    this.visible = true;

    this.width = SpriteManager.getWidth(source);
    this.height = SpriteManager.getHeight(source);

    this.animation = null;
    this.transition = null;

    this.isTransitioning = false;
    this.isLooping = false;

    this.timeouts = [];
  }

  getElement() {
    return this.element;
  }

  getWidth() {
    return SpriteManager.getWidth(this._getFrameSource());
  }

  getHeight() {
    return SpriteManager.getHeight(this._getFrameSource());
  }

  getFrameId() {
    return this.frameId;
  }

  getRotation() {
    return this.rotation;
  }

  _getFrameSource(sourceOverride = this.frameId) {
    return Array.isArray(sourceOverride) ? sourceOverride[Math.floor(this.rotation / 90)] : sourceOverride;
  }

  static setPosition(sprite, x, y) {
    if (!sprite.element) return;

    sprite.pixelX = Math.floor(x);
    sprite.pixelY = Math.floor(y);
    setPosition(sprite.element, sprite.pixelX, sprite.pixelY);
  }

  static moveToGrid(sprite, gridX, gridY) {
    if (!sprite.element) return;

    const { frameId, rotation } = sprite;

    sprite.gridX = gridX;
    sprite.gridY = gridY;
    sprite.pixelX = Math.floor(CELL_SIZE * gridX);
    sprite.pixelY = Math.floor(CELL_SIZE * gridY);

    if (frameId === NORMAL_BODY) {
      if (rotation === 0 || rotation === 180) sprite.pixelX--;
      else sprite.pixelY--;
    } else if (frameId === pc) {
      sprite.pixelX--;
      sprite.pixelY--;
    } else {
      const flagB = rc.get(frameId);
      let flagC = sc.get(frameId);

      const widthOffset = sprite.width - CELL_SIZE;
      const heightOffset = sprite.height - CELL_SIZE;

      switch (rotation) {
        case 0:
          if (flagB) sprite.pixelY -= widthOffset;
          if (flagC) sprite.pixelX -= heightOffset;
          break;
        case 90:
          if (!flagC) sprite.pixelY -= widthOffset;
          if (flagB) sprite.pixelX -= heightOffset;
          break;
        case 180:
          if (sprite.isFlipped) flagC = !flagC;
          if (!flagB) sprite.pixelY -= widthOffset;
          if (!flagC) sprite.pixelX -= heightOffset;
          break;
        case 270:
          if (flagC) sprite.pixelY -= widthOffset;
          if (!flagB) sprite.pixelX -= heightOffset;
          break;
      }

      if (tc[0].includes(frameId) || tc[1].includes(frameId)) {
        if (rotation === 0) sprite.pixelX--;
        else if (rotation === 180) sprite.pixelX++;
        else if (rotation === 90) sprite.pixelY--;
        else if (rotation === 270) sprite.pixelY++;
      }
    }

    Sprite.setPosition(sprite, sprite.pixelX, sprite.pixelY);
  }

  setZIndex(z) {
    this.element.style.zIndex = z;
  }

  static setFrame(sprite, frameId) {
    if (!sprite.element) return;

    Sprite._updateSize(sprite, frameId);
    if (sprite.frameId === frameId) return;

    sprite.frameId = frameId;
    Sprite._updateBackground(sprite);
  }

  static _updateBackground(sprite) {
    const frame = SpriteManager.frames[sprite._getFrameSource()];
    sprite.element.style.backgroundPosition = frame ? `-${frame.x}px -${frame.y}px` : "";

    if (sprite.isLooping) Sprite.moveToGrid(sprite, sprite.gridX, sprite.gridY);
  }

  static _updateSize(sprite, frameId) {
    const source = sprite._getFrameSource(frameId);
    sprite.setWidth(SpriteManager.getWidth(source));
    sprite.setHeight(SpriteManager.getHeight(source));
  }

  disposeInternal() {
    this.timeouts.forEach(clearTimeout);
    this.timeouts.length = 0;

    this.element?.parentNode?.removeChild(this.element);
    this.element = null;

    super.disposeInternal();
  }

  rotate(angle) {
    if (this.rotation === angle && !this.isFlipped) return;

    this.rotation = angle;
    this.isFlipped = false;
    this._refresh();
  }

  flip() {
    if (this.isFlipped) return;

    this.rotation = 180;
    this.isFlipped = true;
    this._refresh();
  }

  _refresh() {
    Sprite._updateSize(this, this.frameId);
    Sprite._updateBackground(this);
  }

  scale(scaleX, scaleY) {
    let transform = "";
    if (scaleX !== undefined) transform += ` scaleX(${scaleX})`;
    if (scaleY !== undefined) transform += ` scaleY(${scaleY})`;

    for (const prefix of VENDOR_PREFIXES) {
      this.element.style[`${prefix}Transform`] = transform;
    }
  }

  show(visible) {
    if (this.visible === visible) return;

    this.visible = visible;
    this.element.style.display = visible ? "" : "none";
  }

  static fadeOut(sprite) {
    Sprite.animateOpacity(sprite, FADE_DURATION, 1, 0);
  }

  static animateOpacity(sprite, duration, from, to) {
    sprite.animation?.stop?.();

    sprite.animation = new AnimationSequence();
    sprite.animation.addStep(createOpacityAnimator(sprite.element, from, to), duration);
    sprite.animation.play();
  }

  playFrameSequence(frames, delay, repeatDelay, repeatCount = 1, looping = false) {
    if (repeatDelay) {
      this.timeouts.push(setTimeout(() => this.playFrameSequence(frames, delay, 0, repeatCount, looping), repeatDelay));
      return;
    }

    if (this.transition?.isPlaying()) {
      if (this.isTransitioning) return;
      this.transition.stop();
    }

    this.transition = new AnimationSequence();

    for (let i = 0; i < repeatCount; i++) {
      for (const frame of frames) {
        this.transition.addStep(() => Sprite.setFrame(this, frame));
        this.transition.addPauseStep(delay);
      }
    }

    this.transition.play();
    this.isTransitioning = looping;
  }

  setWidth(value) {
    if (this.width === value || !this.element) return;

    this.width = value;
    this.element.style.width = `${value + 1}px`;
  }

  setHeight(value) {
    if (this.height === value || !this.element) return;

    this.height = value;
    this.element.style.height = `${value + 1}px`;
  }
}