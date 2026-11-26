export const startsWith = function (a, b) {
  return 0 == a.lastIndexOf(b, 0)
};
export const endsWith = function (a, b) {
  var c = a.length - b.length;
  return 0 <= c && a.indexOf(b, c) == c
};
export const caseInsensitiveStartsWith = function (a, b) {
  return 0 == caseInsensitiveCompare(b, a.substr(0, b.length))
};
export const caseInsensitiveEndsWith = function (a, b) {
  return 0 == caseInsensitiveCompare(b, a.substr(a.length - b.length, b.length))
};
export const subs = function (a, b) {
  for (var c = 1; c < arguments.length; c++) var d = ("" + arguments[c]).replace(/\$/g, "$$$$"),
    a = a.replace(/\%s/, d);
  return a
};
export const collapseWhitespace = function (a) {
  return a.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "")
};
export const isEmpty = function (a) {
  return /^[\s\xa0]*$/.test(a)
};
export const isEmptySafe = function (a) {
  return isEmpty(makeSafe(a))
};
export const isBreakingWhitespace = function (a) {
  return !/[^\t\n\r ]/.test(a)
};
export const isAlpha = function (a) {
  return !/[^a-zA-Z]/.test(a)
};
export const isNumeric = function (a) {
  return !/[^0-9]/.test(a)
};
export const isAlphaNumeric = function (a) {
  return !/[^a-zA-Z0-9]/.test(a)
};
export const isSpace = function (a) {
  return " " == a
};
export const isUnicodeChar = function (a) {
  return 1 == a.length && " " <= a && "~" >= a || "\u0080" <= a && "\ufffd" >= a
};
export const stripNewlines = function (a) {
  return a.replace(/(\r\n|\r|\n)+/g, " ")
};
export const canonicalizeNewlines = function (a) {
  return a.replace(/(\r\n|\r|\n)/g, "\n")
};
export const normalizeWhitespace = function (a) {
  return a.replace(/\xa0|\s/g, " ")
};
export const normalizeSpaces = function (a) {
  return a.replace(/\xa0|[ \t]+/g, " ")
};
export const trim = function (a) {
  return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
};
export const trimLeft = function (a) {
  return a.replace(/^[\s\xa0]+/, "")
};
export const trimRight = function (a) {
  return a.replace(/[\s\xa0]+$/, "")
};
export const caseInsensitiveCompare = function (a, b) {
  var c = ("" + a).toLowerCase(),
    d = ("" + b).toLowerCase();
  return c < d ? -1 : c == d ? 0 : 1
};
export const numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
export const numerateCompare = function (a, b) {
  if (a == b) return 0;
  if (!a) return -1;
  if (!b) return 1;
  for (var c = a.toLowerCase().match(numerateCompareRegExp_), d = b.toLowerCase().match(numerateCompareRegExp_), e = Math.min(c.length, d.length), f = 0; f < e; f++) {
    var g = c[f],
      h = d[f];
    if (g != h) return c = parseInt(g, 10), !isNaN(c) && (d = parseInt(h, 10), !isNaN(d) && c - d) ? c - d : g < h ? -1 : 1
  }
  return c.length != d.length ? c.length - d.length : a < b ? -1 : 1
};
export const encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;
export const urlEncode = function (a) {
  a = "" + a;
  return !encodeUriRegExp_.test(a) ? encodeURIComponent(a) : a
};
export const urlDecode = function (a) {
  return decodeURIComponent(a.replace(/\+/g, " "))
};
export const newLineToBr = function (a, b) {
  return a.replace(/(\r\n|\r|\n)/g, b ? "<br />" : "<br>")
};
export const htmlEscape = function (a, b) {
  if (b) return a.replace(amperRe_, "&amp;").replace(ltRe_, "&lt;").replace(gtRe_, "&gt;").replace(quotRe_, "&quot;");
  if (!allRe_.test(a)) return a; - 1 != a.indexOf("&") && (a = a.replace(amperRe_, "&amp;")); - 1 != a.indexOf("<") && (a = a.replace(ltRe_, "&lt;")); - 1 != a.indexOf(">") && (a = a.replace(gtRe_, "&gt;")); - 1 != a.indexOf('"') && (a = a.replace(quotRe_, "&quot;"));
  return a
};

const amperRe_ = /&/g;
const ltRe_ = /</g;
const gtRe_ = />/g;
const quotRe_ = /\"/g;
const allRe_ = /[&<>\"]/;

export const unescapeEntities = function (a) {
  return contains(a, "&") ? "document" in document && !contains(a, "<") ? unescapeEntitiesUsingDom_(a) : unescapePureXmlEntities_(a) : a
};

export const unescapeEntitiesUsingDom_ = function (a) {
  var b = document.createElement("div");
  b.innerHTML = "<pre>x" + a + "</pre>";
  if (b.firstChild[NORMALIZE_FN_]) b.firstChild[NORMALIZE_FN_]();
  a = b.firstChild.firstChild.nodeValue.slice(1);
  b.innerHTML = "";
  return canonicalizeNewlines(a)
};

export const unescapePureXmlEntities_ = function (a) {
  return a.replace(/&([^;]+);/g, function (a, c) {
    switch (c) {
      case "amp":
        return "&";
      case "lt":
        return "<";
      case "gt":
        return ">";
      case "quot":
        return '"';
      default:
        if ("#" == c.charAt(0)) {
          var d = Number("0" + c.substr(1));
          if (!isNaN(d)) return String.fromCharCode(d)
        }
        return a
    }
  })
};

export const NORMALIZE_FN_ = "normalize";
export const whitespaceEscape = function (a, b) {
  return newLineToBr(a.replace(/  /g, " &#160;"), b)
};
export const stripQuotes = function (a, b) {
  for (var c = b.length, d = 0; d < c; d++) {
    var e = 1 == c ? b : b.charAt(d);
    if (a.charAt(0) == e && a.charAt(a.length - 1) == e) return a.substring(1, a.length - 1)
  }
  return a
};
export const truncate = function (a, b, c) {
  c && (a = unescapeEntities(a));
  a.length > b && (a = a.substring(0, b - 3) + "...");
  c && (a = htmlEscape(a));
  return a
};
export const truncateMiddle = function (a, b, c) {
  c && (a = unescapeEntities(a));
  if (a.length > b) var d = Math.floor(b / 2),
    e = a.length - d, a = a.substring(0, d + b % 2) + "..." + a.substring(e);
  c && (a = htmlEscape(a));
  return a
};

const specialEscapeChars_ = {
  "\x00": "\\0",
  "\u0008": "\\b",
  "\u000c": "\\f",
  "\n": "\\n",
  "\r": "\\r",
  "\t": "\\t",
  "\x0B": "\\x0B",
  '"': '\\"',
  "\\": "\\\\"
};
const jsEscapeCache_ = { "'": "\\'" };

export const quote = function (a) {
  a = "" + a;
  if (a.quote) return a.quote();
  for (var b = ['"'], c = 0; c < a.length; c++) {
    var d = a.charAt(c),
      e = d.charCodeAt(0);
    b[c + 1] = specialEscapeChars_[d] || (31 < e && 127 > e ? d : escapeChar(d))
  }
  b.push('"');
  return b.join("")
};
export const escapeString = function (a) {
  for (var b = [], c = 0; c < a.length; c++) b[c] = escapeChar(a.charAt(c));
  return b.join("")
};
export const escapeChar = function (a) {
  if (a in jsEscapeCache_) return jsEscapeCache_[a];
  if (a in specialEscapeChars_) return jsEscapeCache_[a] = specialEscapeChars_[a];
  var b = a,
    c = a.charCodeAt(0);
  if (31 < c && 127 > c) b = a;
  else {
    if (256 > c) {
      if (b = "\\x", 16 > c || 256 < c) b += "0"
    } else b = "\\u", 4096 > c && (b += "0");
    b += c.toString(16).toUpperCase()
  }
  return jsEscapeCache_[a] = b
};
export const toMap = function (a) {
  for (var b = {}, c = 0; c < a.length; c++) b[a.charAt(c)] = true;
  return b
};
export const contains = function (a, b) {
  return -1 != a.indexOf(b)
};
export const removeAt = function (a, b, c) {
  var d = a;
  0 <= b && (b < a.length && 0 < c) && (d = a.substr(0, b) + a.substr(b + c, a.length - b - c));
  return d
};
export const remove = function (a, b) {
  var c = RegExp(regExpEscape(b), "");
  return a.replace(c, "")
};
export const removeAll = function (a, b) {
  var c = RegExp(regExpEscape(b), "g");
  return a.replace(c, "")
};
export const regExpEscape = function (a) {
  return ("" + a).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
};
export const repeat = function (a, b) {
  return Array(b + 1).join(a)
};
export const padNumber = function (a, b, c) {
  a = goog.isDef(c) ? a.toFixed(c) : "" + a;
  c = a.indexOf("."); - 1 == c && (c = a.length);
  return repeat("0", Math.max(0, b - c)) + a
};
export const makeSafe = function (a) {
  return null == a ? "" : "" + a
};
export const buildString = function (a) {
  return Array.prototype.join.call(arguments, "")
};
export const getRandomString = function () {
  return Math.floor(2147483648 * Math.random()).toString(36) + (Math.floor(2147483648 * Math.random()) ^ goog.now()).toString(36)
};
export const compareVersions = function (a, b) {
  for (var c = 0, d = trim("" + a).split("."), e = trim("" + b).split("."), f = Math.max(d.length, e.length), g = 0; 0 == c && g < f; g++) {
    var h = d[g] || "",
      j = e[g] || "",
      k = RegExp("(\\d*)(\\D*)", "g"),
      l = RegExp("(\\d*)(\\D*)", "g");
    do {
      var n = k.exec(h) || ["", "", ""],
        m = l.exec(j) || ["", "", ""];
      if (0 == n[0].length && 0 == m[0].length) break;
      var c = 0 == n[1].length ? 0 : parseInt(n[1], 10),
        p = 0 == m[1].length ? 0 : parseInt(m[1], 10),
        c = compareElements_(c, p) || compareElements_(0 ==
          n[2].length, 0 == m[2].length) || compareElements_(n[2], m[2])
    } while (0 == c)
  }
  return c
};
export const compareElements_ = function (a, b) {
  return a < b ? -1 : a > b ? 1 : 0
};

const HASHCODE_MAX_ = 4294967296;
export const hashCode = function (a) {
  for (var b = 0, c = 0; c < a.length; ++c) b = 31 * b + a.charCodeAt(c), b %= HASHCODE_MAX_;
  return b
};

const uniqueStringCounter_ = 2147483648 * Math.random() | 0;
export const createUniqueString = function () {
  return "goog_" + uniqueStringCounter_++
};

export const toNumber = function (a) {
  var b = Number(a);
  return 0 == b && isEmpty(a) ? NaN : b
};