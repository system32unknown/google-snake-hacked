const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
const HTML_ESCAPE_PATTERN = /[&<>"]/g;

const XML_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"' };

const SPECIAL_ESCAPES = {
  '\x00': '\\0',
  '\b': '\\b',
  '\f': '\\f',
  '\n': '\\n',
  '\r': '\\r',
  '\t': '\\t',
  '\x0B': '\\x0B',
  '"': '\\"',
  '\\': '\\\\'
};

const escapeCache = new Map([["'", "\\'"]]);

const HASHCODE_MAX = 4294967296;

let uniqueStringCounter = (2147483648 * Math.random()) | 0;

export const encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;
export const numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;

export const contains = (string, substring) => string.includes(substring);

export const makeSafe = (value) => (value == null ? '' : String(value));

export const startsWith = (string, prefix) => string.startsWith(prefix);

export const endsWith = (string, suffix) => string.endsWith(suffix);

export const caseInsensitiveCompare = (a, b) => {
  const left = String(a).toLowerCase();
  const right = String(b).toLowerCase();
  if (left < right) return -1;
  return left === right ? 0 : 1;
};

export const caseInsensitiveStartsWith = (string, prefix) => caseInsensitiveCompare(prefix, string.slice(0, prefix.length)) === 0;

export const caseInsensitiveEndsWith = (string, suffix) => string.length >= suffix.length && caseInsensitiveCompare(suffix, string.slice(string.length - suffix.length)) === 0;

export const subs = (template, ...values) => values.reduce((result, value) => result.replace(/%s/, () => String(value)), template);

export const trim = (string) => string.trim();

export const trimLeft = (string) => string.trimStart();

export const trimRight = (string) => string.trimEnd();

export const collapseWhitespace = (string) => string.replace(/\s+/g, ' ').trim();

export const isEmpty = (string) => /^\s*$/.test(string);

export const isEmptySafe = (value) => isEmpty(makeSafe(value));

export const isBreakingWhitespace = (string) => !/[^\t\n\r ]/.test(string);

export const isAlpha = (string) => !/[^a-zA-Z]/.test(string);

export const isNumeric = (string) => !/[^0-9]/.test(string);

export const isAlphaNumeric = (string) => !/[^a-zA-Z0-9]/.test(string);

export const isSpace = (character) => character === ' ';

export const isUnicodeChar = (character) => (character.length === 1 && character >= ' ' && character <= '~') || (character >= '\u0080' && character <= '\ufffd');

export const stripNewlines = (string) => string.replace(/(\r\n|\r|\n)+/g, ' ');

export const canonicalizeNewlines = (string) => string.replace(/(\r\n|\r|\n)/g, '\n');

export const normalizeWhitespace = (string) => string.replace(/\s/g, ' ');

export const normalizeSpaces = (string) => string.replace(/\xa0|[ \t]+/g, ' ');

export const numerateCompare = (a, b) => {
  if (a === b) return 0;
  if (!a) return -1;
  if (!b) return 1;

  const aTokens = a.toLowerCase().match(numerateCompareRegExp_);
  const bTokens = b.toLowerCase().match(numerateCompareRegExp_);
  const length = Math.min(aTokens.length, bTokens.length);

  for (let i = 0; i < length; i++) {
    const left = aTokens[i];
    const right = bTokens[i];

    if (left !== right) {
      const leftNumber = parseInt(left, 10);
      if (!Number.isNaN(leftNumber)) {
        const rightNumber = parseInt(right, 10);
        if (!Number.isNaN(rightNumber) && leftNumber - rightNumber) return leftNumber - rightNumber;
      }
      return left < right ? -1 : 1;
    }
  }

  if (aTokens.length !== bTokens.length) return aTokens.length - bTokens.length;
  return a < b ? -1 : 1;
};

export const urlEncode = (value) => {
  const string = String(value);
  return encodeUriRegExp_.test(string) ? string : encodeURIComponent(string);
};

export const urlDecode = (string) => decodeURIComponent(string.replace(/\+/g, ' '));

export const newLineToBr = (string, useXhtml) =>
  string.replace(/(\r\n|\r|\n)/g, useXhtml ? '<br />' : '<br>');

export const htmlEscape = (string) => string.replace(HTML_ESCAPE_PATTERN, (char) => HTML_ESCAPES[char]);

export const unescapeEntitiesUsingDom_ = (string) => {
  const container = document.createElement('div');
  container.innerHTML = `<pre>x${string}</pre>`;
  container.firstChild.normalize?.();

  const text = container.firstChild.firstChild.nodeValue.slice(1);
  container.innerHTML = '';

  return canonicalizeNewlines(text);
};

export const unescapePureXmlEntities_ = (string) =>
  string.replace(/&([^;]+);/g, (match, entity) => {
    if (Object.hasOwn(XML_ENTITIES, entity)) return XML_ENTITIES[entity];

    if (entity.startsWith('#')) {
      const code = Number(`0${entity.slice(1)}`);
      if (!Number.isNaN(code)) return String.fromCharCode(code);
    }

    return match;
  });

export const unescapeEntities = (string) => {
  if (!contains(string, '&')) return string;
  return typeof document !== 'undefined' && !contains(string, '<') ? unescapeEntitiesUsingDom_(string) : unescapePureXmlEntities_(string);
};

export const whitespaceEscape = (string, useXhtml) =>
  newLineToBr(string.replace(/ {2}/g, ' &#160;'), useXhtml);

export const stripQuotes = (string, quoteChars) => {
  for (const quoteChar of quoteChars) {
    if (string.charAt(0) === quoteChar && string.charAt(string.length - 1) === quoteChar) {
      return string.substring(1, string.length - 1);
    }
  }
  return string;
};

export const truncate = (string, maxLength, unescapeFirst) => {
  let result = unescapeFirst ? unescapeEntities(string) : string;
  if (result.length > maxLength) result = `${result.substring(0, maxLength - 3)}...`;
  return unescapeFirst ? htmlEscape(result) : result;
};

export const truncateMiddle = (string, maxLength, unescapeFirst) => {
  let result = unescapeFirst ? unescapeEntities(string) : string;

  if (result.length > maxLength) {
    const half = Math.floor(maxLength / 2);
    const tailStart = result.length - half;
    result = `${result.substring(0, half + (maxLength % 2))}...${result.substring(tailStart)}`;
  }

  return unescapeFirst ? htmlEscape(result) : result;
};

export const escapeChar = (char) => {
  if (escapeCache.has(char)) return escapeCache.get(char);

  let escaped;

  if (char in SPECIAL_ESCAPES) {
    escaped = SPECIAL_ESCAPES[char];
  } else {
    const code = char.charCodeAt(0);

    if (code > 31 && code < 127) {
      escaped = char;
    } else if (code < 256) {
      escaped = `\\x${code.toString(16).toUpperCase().padStart(2, '0')}`;
    } else {
      escaped = `\\u${code.toString(16).toUpperCase().padStart(4, '0')}`;
    }
  }

  escapeCache.set(char, escaped);
  return escaped;
};

export const escapeString = (string) => string.split('').map(escapeChar).join('');

export const quote = (value) => {
  const body = String(value)
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);
      return SPECIAL_ESCAPES[char] || (code > 31 && code < 127 ? char : escapeChar(char));
    })
    .join('');

  return `"${body}"`;
};

export const toMap = (string) => Object.fromEntries(string.split('').map((char) => [char, true]));

export const removeAt = (string, index, count) => {
  if (index >= 0 && index < string.length && count > 0) {
    return string.slice(0, index) + string.slice(index + count);
  }
  return string;
};

export const regExpEscape = (value) => String(value).replace(/([-()[\]{}+?*.$^|,:#<!\\])/g, '\\$1').replace(/\x08/g, '\\x08');

export const remove = (string, substring) => string.replace(String(substring), '');

export const removeAll = (string, substring) => string.replaceAll(String(substring), '');

export const repeat = (string, count) => String(string).repeat(Math.max(0, count));

export const padNumber = (number, length, precision) => {
  const text = precision !== undefined ? number.toFixed(precision) : String(number);
  const decimalIndex = text.indexOf('.');
  const integerLength = decimalIndex === -1 ? text.length : decimalIndex;

  return repeat('0', Math.max(0, length - integerLength)) + text;
};

export const buildString = (...parts) => parts.join('');

export const getRandomString = () =>
  Math.floor(2147483648 * Math.random()).toString(36) +
  (Math.floor(2147483648 * Math.random()) ^ Date.now()).toString(36);

export const compareElements_ = (a, b) => {
  if (a < b) return -1;
  return a > b ? 1 : 0;
};

const compareVersionParts = (left, right) => {
  const leftPattern = /(\d*)(\D*)/g;
  const rightPattern = /(\d*)(\D*)/g;

  for (;;) {
    const leftMatch = leftPattern.exec(left) || ['', '', ''];
    const rightMatch = rightPattern.exec(right) || ['', '', ''];

    if (leftMatch[0].length === 0 && rightMatch[0].length === 0) return 0;

    const leftNumber = leftMatch[1].length === 0 ? 0 : parseInt(leftMatch[1], 10);
    const rightNumber = rightMatch[1].length === 0 ? 0 : parseInt(rightMatch[1], 10);

    const result =
      compareElements_(leftNumber, rightNumber) ||
      compareElements_(leftMatch[2].length === 0, rightMatch[2].length === 0) ||
      compareElements_(leftMatch[2], rightMatch[2]);

    if (result !== 0) return result;
  }
};

export const compareVersions = (version1, version2) => {
  const left = String(version1).trim().split('.');
  const right = String(version2).trim().split('.');
  const length = Math.max(left.length, right.length);

  for (let i = 0; i < length; i++) {
    const result = compareVersionParts(left[i] || '', right[i] || '');
    if (result !== 0) return result;
  }

  return 0;
};

export const hashCode = (string) => {
  let hash = 0;
  for (let i = 0; i < string.length; ++i) {
    hash = (31 * hash + string.charCodeAt(i)) % HASHCODE_MAX;
  }
  return hash;
};

export const createUniqueString = () => `goog_${uniqueStringCounter++}`;

export const toNumber = (string) => {
  const number = Number(string);
  return number === 0 && isEmpty(string) ? NaN : number;
};