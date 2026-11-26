import Event from './Event.js';
import { GECKO, MAC } from '../userAgent/userAgent.js';
import { BrowserFeature } from './events.js';
import { EventType } from './EventType.js';

const KEYPRESS = 'keypress';
const FUNCTION_KEY_MIN = 112;
const FUNCTION_KEY_MAX = 123;

const readNodeName = (node) => {
  try {
    void node.nodeName;
    return node;
  } catch {
    return null;
  }
};

const resolveRelatedTarget = (nativeEvent, type) => {
  const { relatedTarget } = nativeEvent;

  if (relatedTarget) {
    return GECKO ? readNodeName(relatedTarget) : relatedTarget;
  }
  if (type === EventType.MOUSEOVER) return nativeEvent.fromElement;
  if (type === EventType.MOUSEOUT) return nativeEvent.toElement;
  return relatedTarget;
};

export default class BrowserEvent extends Event {
  static IEButtonMap = Object.freeze([1, 4, 2]);
  static MouseButton = Object.freeze({ LEFT: 0, MIDDLE: 1, RIGHT: 2 });

  target = null;
  relatedTarget = null;
  offsetX = 0;
  offsetY = 0;
  clientX = 0;
  clientY = 0;
  screenX = 0;
  screenY = 0;
  button = 0;
  keyCode = 0;
  charCode = 0;
  ctrlKey = false;
  altKey = false;
  shiftKey = false;
  metaKey = false;
  platformModifierKey = false;
  state = undefined;
  event_ = null;

  constructor(nativeEvent, currentTarget) {
    super(nativeEvent, currentTarget);
    if (nativeEvent) this.init(nativeEvent, currentTarget);
  }

  init(nativeEvent, currentTarget) {
    const { type } = nativeEvent;

    this.type = type;
    this.target = nativeEvent.target || nativeEvent.srcElement;
    this.currentTarget = currentTarget;
    this.relatedTarget = resolveRelatedTarget(nativeEvent, type);

    this.offsetX = nativeEvent.offsetX ?? nativeEvent.layerX;
    this.offsetY = nativeEvent.offsetY ?? nativeEvent.layerY;
    this.clientX = nativeEvent.clientX ?? nativeEvent.pageX;
    this.clientY = nativeEvent.clientY ?? nativeEvent.pageY;
    this.screenX = nativeEvent.screenX || 0;
    this.screenY = nativeEvent.screenY || 0;

    this.button = nativeEvent.button;
    this.keyCode = nativeEvent.keyCode || 0;
    this.charCode = nativeEvent.charCode || (type === KEYPRESS ? nativeEvent.keyCode : 0);

    this.ctrlKey = nativeEvent.ctrlKey;
    this.altKey = nativeEvent.altKey;
    this.shiftKey = nativeEvent.shiftKey;
    this.metaKey = nativeEvent.metaKey;
    this.platformModifierKey = MAC ? nativeEvent.metaKey : nativeEvent.ctrlKey;

    this.state = nativeEvent.state;
    this.event_ = nativeEvent;

    delete this.returnValue_;
    delete this.propagationStopped_;
  }

  stopPropagation() {
    super.stopPropagation();

    if (typeof this.event_.stopPropagation === 'function') {
      this.event_.stopPropagation();
    } else {
      this.event_.cancelBubble = true;
    }
  }

  preventDefault() {
    super.preventDefault();

    const nativeEvent = this.event_;

    if (typeof nativeEvent.preventDefault === 'function') {
      nativeEvent.preventDefault();
      return;
    }

    nativeEvent.returnValue = false;

    if (!BrowserFeature.SET_KEY_CODE_TO_PREVENT_DEFAULT) return;

    try {
      const isFunctionKey = nativeEvent.keyCode >= FUNCTION_KEY_MIN && nativeEvent.keyCode <= FUNCTION_KEY_MAX;
      if (nativeEvent.ctrlKey || isFunctionKey) nativeEvent.keyCode = -1;
    } catch { }
  }

  getBrowserEvent() {
    return this.event_;
  }

  disposeInternal() {
    super.disposeInternal();
    this.relatedTarget = null;
    this.currentTarget = null;
    this.target = null;
    this.event_ = null;
  }
}