import { GECKO, MAC, LINUX, isVersion } from '../../goog/userAgent/userAgent.js';

export function defineSingleton(cls) {
  cls.getInstance = () => {
    return cls._instance ? cls._instance : (cls._instance = new cls);
  };
}

export function getTime() {
  return new Date().getTime();
}


// Vendor prefixes commonly used by browsers
const vendorPrefixes = ["Moz", "ms", "O", "webkit"];
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