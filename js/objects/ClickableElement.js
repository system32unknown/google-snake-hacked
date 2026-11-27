import EventHandler from '../../goog/events/EventHandler.js';
import SpriteGroup from './SpriteGroup.js';

// Clickable UI Element Class
export default class ClickableElement extends SpriteGroup {
  constructor(id, width, height, parent, zIndex) {
    super(id, width, height, parent, zIndex);

    this.eventHandler = new EventHandler(this);

    // Attach mouse event listeners
    this.eventHandler.listen(this.element, "click", this.handleClick);
    this.eventHandler.listen(this.element, "mousedown", this.handleMouseDown);
    this.eventHandler.listen(this.element, "mouseover", this.handleMouseOver);
    this.eventHandler.listen(this.element, "mouseout", this.handleMouseOut);

    // Indicate interactivity
    this.element.style.cursor = "pointer";
  }

  // Cleanup
  disposeInternal() {
    this.eventHandler.disposeInternal();
    this.eventHandler = null;
    super.disposeInternal();
  }

  // Event Handlers
  handleClick() {
    this.dispatchEvent("click");
  }

  handleMouseDown() {
    this.dispatchEvent("mousedown");
  }

  handleMouseOver() {
    this.dispatchEvent("mouseover");
  }

  handleMouseOut() {
    this.dispatchEvent("mouseout");
  }
}
