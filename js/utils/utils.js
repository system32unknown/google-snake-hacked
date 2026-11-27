import { GECKO, MAC, LINUX, isVersion } from '../../goog/userAgent/userAgent.js';
import { Coordinate as Point } from '../../goog/math/Coordinate.js';

const VENDOR_PREFIXES = ['', 'moz', 'ms', 'o', 'webkit'];
const NEEDS_ROUNDING_FIX = Boolean(GECKO && (MAC || LINUX) && isVersion('1.9'));

export function defineSingleton(cls) {
  cls.getInstance = () => {
    if (!Object.hasOwn(cls, '_instance')) cls._instance = new cls();
    return cls._instance;
  };
}

export function getTime() {
  return Date.now();
}

export function getVendorPropertyName(property) {
  if (typeof document === 'undefined') return null;

  const capitalized = property.charAt(0).toUpperCase() + property.slice(1);

  for (const prefix of VENDOR_PREFIXES) {
    const candidate = prefix ? prefix + capitalized : property;
    if (candidate in document) return candidate;
  }

  return null;
}

function formatPixelValue(value, shouldRound) {
  if (typeof value !== 'number') return value;
  return `${shouldRound ? Math.round(value) : value}px`;
}

export function setPosition(element, x, y) {
  const [left, top] = x instanceof Point ? [x.x, x.y] : [x, y];

  element.style.left = formatPixelValue(left, NEEDS_ROUNDING_FIX);
  element.style.top = formatPixelValue(top, NEEDS_ROUNDING_FIX);
}

export function createDiv() {
  const div = document.createElement('div');
  div.style.position = 'absolute';
  div.style.userSelect = 'none';
  div.style.webkitTapHighlightColor = 'rgba(0,0,0,0)';
  div.unselectable = 'on';
  return div;
}

export function parseSpriteSheetXML(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");
  if (xml.querySelector("parsererror")) throw new Error("Invalid spritesheet XML: could not be parsed");

  const atlas = xml.querySelector("TextureAtlas");
  if (!atlas) throw new Error("Invalid spritesheet XML: missing <TextureAtlas>");

  return Array.from(atlas.querySelectorAll("SubTexture"), (node) => {
    const frame = {};
    for (const attribute of ["x", "y", "width", "height"]) frame[attribute] = parseInt(node.getAttribute(attribute), 10);
    return frame;
  });
}

export async function fetchTextFile(file) {
  const response = await fetch(file);
  if (!response.ok) throw new Error(`Failed to load ${file}: ${response.status}`);
  return response.text();
}

export function setOpacity(el, value) {
  const s = el.style;
  if ('opacity' in s) s.opacity = value;
  else if ('MozOpacity' in s) s.MozOpacity = value;
  else if ('filter' in s) s.filter = value === "" ? "" : `alpha(opacity=${value * 100})`;
}