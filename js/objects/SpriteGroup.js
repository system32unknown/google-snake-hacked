import Sprite from "./Sprite.js";

export default class SpriteGroup extends Sprite {
  /**
   * @param {any} frameId - Frame or image identifier (passed to Sprite)
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {HTMLElement} container - Parent DOM element
   * @param {number} [zIndex] - Optional z-index
   */
  constructor(frameId, x, y, container, zIndex) {
    super(frameId);                     // Call base sprite constructor
    Sprite.setPosition(this, x, y);     // Set initial position
    if (zIndex) this.setZIndex(zIndex);  // Optional z-index
    container.appendChild(this.getElement());
    this.container = container;

    // Child sprites attached to this one
    this.children = [];
  }

  /** Add a child sprite */
  add(childSprite) {
    this.children.push(childSprite);
  }

  /** Show or hide this sprite and all its children */
  show(visible) {
    super.show(visible);
    this.children.forEach(child => child.show(visible));
  }

  /** Dispose of this sprite and its children */
  disposeInternal() {
    this.children.forEach(child => child.disposeInternal());
    super.disposeInternal();
  }
}