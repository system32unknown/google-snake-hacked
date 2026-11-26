import { GECKO, MAC, LINUX, isVersion } from '../../goog/userAgent/userAgent.js';
import { Coordinate as Point } from '../../goog/math/Coordinate.js';

export function defineSingleton(cls) {
  cls.getInstance = () => {
    return cls._instance ? cls._instance : (cls._instance = new cls);
  };
}

export function getTime() {
  return new Date().getTime();
}


// Vendor prefixes commonly used by browsers
const vendorPrefixesLower = ["", "moz", "ms", "o", "webkit"];

/**
 * Finds the correct vendor-prefixed property name supported by the browser.
 * Example: Ab("hidden") → "hidden" or "webkitHidden"
 * @param {string} property
 * @returns {?string}
 */
export function getVendorPropertyName(property) {
  const doc = document;
  if (!doc) return null;

  for (let i = 0; i < vendorPrefixesLower.length; i++) {
    let prefix = vendorPrefixesLower[i];
    let candidate = property;

    if (prefix.length > 0)  candidate = prefix + property.charAt(0).toUpperCase() + property.slice(1); // Capitalize first letter for camelCase vendor properties
    if (typeof doc[candidate] !== undefined) return candidate; // Return the first supported property name
  }

  return null;
}

/**
 * Sets the position (left, top) of a DOM element.
 *
 * @param {HTMLElement} element
 * @param {K|number} x      // Either a K object with .x/.y or a number
 * @param {number} [y]      // Only used if x is a number
 */
export function setPosition(element, x, y) {
  let posX, posY;

  var needsRoundingFix = GECKO && (MAC || LINUX) && isVersion("1.9");
  if (x instanceof Point) {
    posX = x.x;
    posY = x.y;
  } else {
    posX = x;
    posY = y;
  }

  element.style.left = formatPixelValue(posX, needsRoundingFix);
  element.style.top = formatPixelValue(posY, needsRoundingFix);
}

/**
 * Converts a numeric position value into a CSS pixel string.
 *
 * @param {number|string} value     // A number or an already-formatted CSS value
 * @param {boolean} shouldRound     // Whether to round the value (browser-quirk flag)
 * @return {string}                 // Returns a pixel string like "20px" or original string
 */
function formatPixelValue(value, shouldRound) {
  if (typeof value == "number") {
    value = (shouldRound ? Math.round(value) : value) + "px";
  }
  return value;
}

export function createDiv() {
  var div = document.createElement("div");
  div.style.position = "absolute";
  div.style.userSelect = "none";
  div.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
  div.unselectable = "on";
  return div
};

const FRAME_ATTRIBUTES = ["x", "y", "width", "height"];

export function parseSpriteSheetXML(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, "application/xml");

  if (xml.querySelector("parsererror")) {
    throw new Error("Invalid spritesheet XML: could not be parsed");
  }

  const atlas = xml.querySelector("TextureAtlas");
  if (!atlas) throw new Error("Invalid spritesheet XML: missing <TextureAtlas>");

  return Array.from(atlas.querySelectorAll("SubTexture"), (node) => {
    const frame = {};
    for (const attribute of FRAME_ATTRIBUTES) {
      frame[attribute] = parseInt(node.getAttribute(attribute), 10);
    }
    return frame;
  });
}

export function readTextFile(file) {
  const request = new XMLHttpRequest();
  request.open("GET", file, false);
  request.send();

  const ok = request.status === 200 || request.status === 0;
  return ok ? request.responseText : "";
}

export async function fetchTextFile(file) {
  const response = await fetch(file);
  if (!response.ok) throw new Error(`Failed to load ${file}: ${response.status}`);
  return response.text();
}