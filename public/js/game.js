var spawnItem = null;
var createItem = null;
var find2x2Block = null;
var gridClass = null;
var boostFunction = null;
var snakeClass = null;

var minutes = 6E4;

function defineSingleton(cls) {
    cls.getInstance = function () {
        if (!cls._instance) {
            cls._instance = new cls();
        }
        return cls._instance;
    };
}


/** ---------------------------
 * Array Utilities
 * --------------------------- */
const ArrayUtils = {
    indexOf(array, value, start = 0) {
        goog.asserts.assert(array != null);
        if (Array.prototype.indexOf) {
            return Array.prototype.indexOf.call(array, value, start);
        }
        if (typeof array === "string") {
            return array.indexOf(value, start);
        }
        for (let i = start; i < array.length; i++) {
            if (i in array && array[i] === value) return i;
        }
        return -1;
    },
    forEach(array, callback, thisArg) {
        goog.asserts.assert(array != null);
        if (Array.prototype.forEach) {
            Array.prototype.forEach.call(array, callback, thisArg);
        } else {
            for (let i = 0; i < array.length; i++) {
                if (i in array) callback.call(thisArg, array[i], i, array);
            }
        }
    },
    forEachReverse(array, callback) {
        const copy = typeof array === "string" ? array.split("") : array;
        for (let i = copy.length - 1; i >= 0; i--) {
            if (i in copy) callback(copy[i], i, array);
        }
    },
    every(array, callback, thisArg) {
        goog.asserts.assert(array != null);
        if (Array.prototype.every) {
            return Array.prototype.every.call(array, callback, thisArg);
        }
        for (let i = 0; i < array.length; i++) {
            if (i in array && !callback.call(thisArg, array[i], i, array)) {
                return false;
            }
        }
        return true;
    },
    slice(array, start, end) {
        goog.asserts.assert(array != null);
        return Array.prototype.slice.call(array, start, end);
    }
};
/**
 * Returns an array of all keys in an object.
 * @param {Object} obj - The object to extract keys from.
 * @returns {Array} Array of object keys.
 */
function getObjectKeys(obj) {
    const keys = [];
    for (const key in obj) {
        keys.push(key);
    }
    return keys;
}
function forEachObject(a, b, c) {
    for (var d in a) b.call(c, a[d], d, a)
}

var goog = goog || {};
goog.typeOf = function (a) {
    var b = typeof a;
    if (b == "object")
        if (a) {
            if (a instanceof Array || !(a instanceof Object) && Object.prototype.toString.call(a) == "[object Array]" || typeof a.length == "number" && typeof a.splice != "undefined" && typeof a.propertyIsEnumerable != "undefined" && !a.propertyIsEnumerable("splice")) return "array";
            if (!(a instanceof Object) && (Object.prototype.toString.call(a) == "[object Function]" || typeof a.call != "undefined" && typeof a.propertyIsEnumerable != "undefined" && !a.propertyIsEnumerable("call"))) return "function"
        } else return "null";
    else if (b == "function" && typeof a.call == "undefined") return "object";
    return b
};

goog.isDef = function (a) {
    return a !== undefined
};

goog.isArray = function (a) {
    return goog.typeOf(a) == "array"
};
goog.isArrayLike = function (a) {
    var b = goog.typeOf(a);
    return b == "array" || b == "object" && typeof a.length == "number"
};
goog.isDateLike = function (a) {
    return goog.isObject(a) && typeof a.getFullYear == "function"
};
goog.isString = function (a) {
    return typeof a == "string"
};
goog.isBoolean = function (a) {
    return typeof a == "boolean"
};
goog.isNumber = function (a) {
    return typeof a == "number"
};
goog.isFunction = function (a) {
    return goog.typeOf(a) == "function"
};
goog.isObject = function (a) {
    a = goog.typeOf(a);
    return a == "object" || a == "array" || a == "function"
};
goog.getUid = function (a) {
    return a[goog.UID_PROPERTY_] || (a[goog.UID_PROPERTY_] = ++goog.uidCounter_)
};
goog.removeUid = function (a) {
    "removeAttribute" in a && a.removeAttribute(goog.UID_PROPERTY_);
    try {
        delete a[goog.UID_PROPERTY_]
    } catch (b) { }
};
goog.UID_PROPERTY_ = "closure_uid_" + Math.floor(2147483648 * Math.random()).toString(36);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;

goog.string = {};
goog.string.Unicode = {
    NBSP: "\u00a0"
};
goog.string.startsWith = function (a, b) {
    return 0 == a.lastIndexOf(b, 0)
};
goog.string.endsWith = function (a, b) {
    var c = a.length - b.length;
    return 0 <= c && a.indexOf(b, c) == c
};
goog.string.caseInsensitiveStartsWith = function (a, b) {
    return 0 == goog.string.caseInsensitiveCompare(b, a.substr(0, b.length))
};
goog.string.caseInsensitiveEndsWith = function (a, b) {
    return 0 == goog.string.caseInsensitiveCompare(b, a.substr(a.length - b.length, b.length))
};
goog.string.subs = function (a, b) {
    for (var c = 1; c < arguments.length; c++) var d = ("" + arguments[c]).replace(/\$/g, "$$$$"),
        a = a.replace(/\%s/, d);
    return a
};
goog.string.collapseWhitespace = function (a) {
    return a.replace(/[\s\xa0]+/g, " ").replace(/^\s+|\s+$/g, "")
};
goog.string.isEmpty = function (a) {
    return /^[\s\xa0]*$/.test(a)
};
goog.string.isEmptySafe = function (a) {
    return goog.string.isEmpty(goog.string.makeSafe(a))
};
goog.string.isBreakingWhitespace = function (a) {
    return !/[^\t\n\r ]/.test(a)
};
goog.string.isAlpha = function (a) {
    return !/[^a-zA-Z]/.test(a)
};
goog.string.isNumeric = function (a) {
    return !/[^0-9]/.test(a)
};
goog.string.isAlphaNumeric = function (a) {
    return !/[^a-zA-Z0-9]/.test(a)
};
goog.string.isSpace = function (a) {
    return " " == a
};
goog.string.isUnicodeChar = function (a) {
    return 1 == a.length && " " <= a && "~" >= a || "\u0080" <= a && "\ufffd" >= a
};
goog.string.stripNewlines = function (a) {
    return a.replace(/(\r\n|\r|\n)+/g, " ")
};
goog.string.canonicalizeNewlines = function (a) {
    return a.replace(/(\r\n|\r|\n)/g, "\n")
};
goog.string.normalizeWhitespace = function (a) {
    return a.replace(/\xa0|\s/g, " ")
};
goog.string.normalizeSpaces = function (a) {
    return a.replace(/\xa0|[ \t]+/g, " ")
};
goog.string.trim = function (a) {
    return a.replace(/^[\s\xa0]+|[\s\xa0]+$/g, "")
};
goog.string.trimLeft = function (a) {
    return a.replace(/^[\s\xa0]+/, "")
};
goog.string.trimRight = function (a) {
    return a.replace(/[\s\xa0]+$/, "")
};
goog.string.caseInsensitiveCompare = function (a, b) {
    var c = ("" + a).toLowerCase(),
        d = ("" + b).toLowerCase();
    return c < d ? -1 : c == d ? 0 : 1
};
goog.string.numerateCompareRegExp_ = /(\.\d+)|(\d+)|(\D+)/g;
goog.string.numerateCompare = function (a, b) {
    if (a == b) return 0;
    if (!a) return -1;
    if (!b) return 1;
    for (var c = a.toLowerCase().match(goog.string.numerateCompareRegExp_), d = b.toLowerCase().match(goog.string.numerateCompareRegExp_), e = Math.min(c.length, d.length), f = 0; f < e; f++) {
        var g = c[f],
            h = d[f];
        if (g != h) return c = parseInt(g, 10), !isNaN(c) && (d = parseInt(h, 10), !isNaN(d) && c - d) ? c - d : g < h ? -1 : 1
    }
    return c.length != d.length ? c.length - d.length : a < b ? -1 : 1
};
goog.string.encodeUriRegExp_ = /^[a-zA-Z0-9\-_.!~*'()]*$/;
goog.string.urlEncode = function (a) {
    a = "" + a;
    return !goog.string.encodeUriRegExp_.test(a) ? encodeURIComponent(a) : a
};
goog.string.urlDecode = function (a) {
    return decodeURIComponent(a.replace(/\+/g, " "))
};
goog.string.newLineToBr = function (a, b) {
    return a.replace(/(\r\n|\r|\n)/g, b ? "<br />" : "<br>")
};
goog.string.htmlEscape = function (a, b) {
    if (b) return a.replace(goog.string.amperRe_, "&amp;").replace(goog.string.ltRe_, "&lt;").replace(goog.string.gtRe_, "&gt;").replace(goog.string.quotRe_, "&quot;");
    if (!goog.string.allRe_.test(a)) return a; - 1 != a.indexOf("&") && (a = a.replace(goog.string.amperRe_, "&amp;")); - 1 != a.indexOf("<") && (a = a.replace(goog.string.ltRe_, "&lt;")); - 1 != a.indexOf(">") && (a = a.replace(goog.string.gtRe_, "&gt;")); - 1 != a.indexOf('"') && (a = a.replace(goog.string.quotRe_, "&quot;"));
    return a
};
goog.string.amperRe_ = /&/g;
goog.string.ltRe_ = /</g;
goog.string.gtRe_ = />/g;
goog.string.quotRe_ = /\"/g;
goog.string.allRe_ = /[&<>\"]/;
goog.string.unescapeEntities = function (a) {
    return goog.string.contains(a, "&") ? "document" in document && !goog.string.contains(a, "<") ? goog.string.unescapeEntitiesUsingDom_(a) : goog.string.unescapePureXmlEntities_(a) : a
};
goog.string.unescapeEntitiesUsingDom_ = function (a) {
    var b = document.createElement("div");
    b.innerHTML = "<pre>x" + a + "</pre>";
    if (b.firstChild[goog.string.NORMALIZE_FN_]) b.firstChild[goog.string.NORMALIZE_FN_]();
    a = b.firstChild.firstChild.nodeValue.slice(1);
    b.innerHTML = "";
    return goog.string.canonicalizeNewlines(a)
};
goog.string.unescapePureXmlEntities_ = function (a) {
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
goog.string.NORMALIZE_FN_ = "normalize";
goog.string.whitespaceEscape = function (a, b) {
    return goog.string.newLineToBr(a.replace(/  /g, " &#160;"), b)
};
goog.string.stripQuotes = function (a, b) {
    for (var c = b.length, d = 0; d < c; d++) {
        var e = 1 == c ? b : b.charAt(d);
        if (a.charAt(0) == e && a.charAt(a.length - 1) == e) return a.substring(1, a.length - 1)
    }
    return a
};
goog.string.truncate = function (a, b, c) {
    c && (a = goog.string.unescapeEntities(a));
    a.length > b && (a = a.substring(0, b - 3) + "...");
    c && (a = goog.string.htmlEscape(a));
    return a
};
goog.string.truncateMiddle = function (a, b, c) {
    c && (a = goog.string.unescapeEntities(a));
    if (a.length > b) var d = Math.floor(b / 2),
        e = a.length - d, a = a.substring(0, d + b % 2) + "..." + a.substring(e);
    c && (a = goog.string.htmlEscape(a));
    return a
};
goog.string.specialEscapeChars_ = {
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
goog.string.jsEscapeCache_ = {
    "'": "\\'"
};
goog.string.quote = function (a) {
    a = "" + a;
    if (a.quote) return a.quote();
    for (var b = ['"'], c = 0; c < a.length; c++) {
        var d = a.charAt(c),
            e = d.charCodeAt(0);
        b[c + 1] = goog.string.specialEscapeChars_[d] || (31 < e && 127 > e ? d : goog.string.escapeChar(d))
    }
    b.push('"');
    return b.join("")
};
goog.string.escapeString = function (a) {
    for (var b = [], c = 0; c < a.length; c++) b[c] = goog.string.escapeChar(a.charAt(c));
    return b.join("")
};
goog.string.escapeChar = function (a) {
    if (a in goog.string.jsEscapeCache_) return goog.string.jsEscapeCache_[a];
    if (a in goog.string.specialEscapeChars_) return goog.string.jsEscapeCache_[a] = goog.string.specialEscapeChars_[a];
    var b = a,
        c = a.charCodeAt(0);
    if (31 < c && 127 > c) b = a;
    else {
        if (256 > c) {
            if (b = "\\x", 16 > c || 256 < c) b += "0"
        } else b = "\\u", 4096 > c && (b += "0");
        b += c.toString(16).toUpperCase()
    }
    return goog.string.jsEscapeCache_[a] = b
};
goog.string.toMap = function (a) {
    for (var b = {}, c = 0; c < a.length; c++) b[a.charAt(c)] = true;
    return b
};
goog.string.contains = function (a, b) {
    return -1 != a.indexOf(b)
};
goog.string.removeAt = function (a, b, c) {
    var d = a;
    0 <= b && (b < a.length && 0 < c) && (d = a.substr(0, b) + a.substr(b + c, a.length - b - c));
    return d
};
goog.string.remove = function (a, b) {
    var c = RegExp(goog.string.regExpEscape(b), "");
    return a.replace(c, "")
};
goog.string.removeAll = function (a, b) {
    var c = RegExp(goog.string.regExpEscape(b), "g");
    return a.replace(c, "")
};
goog.string.regExpEscape = function (a) {
    return ("" + a).replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
};
goog.string.repeat = function (a, b) {
    return Array(b + 1).join(a)
};
goog.string.padNumber = function (a, b, c) {
    a = goog.isDef(c) ? a.toFixed(c) : "" + a;
    c = a.indexOf("."); - 1 == c && (c = a.length);
    return goog.string.repeat("0", Math.max(0, b - c)) + a
};
goog.string.makeSafe = function (a) {
    return null == a ? "" : "" + a
};
goog.string.buildString = function (a) {
    return Array.prototype.join.call(arguments, "")
};
goog.string.getRandomString = function () {
    return Math.floor(2147483648 * Math.random()).toString(36) + (Math.floor(2147483648 * Math.random()) ^ goog.now()).toString(36)
};
goog.string.compareVersions = function (a, b) {
    for (var c = 0, d = goog.string.trim("" + a).split("."), e = goog.string.trim("" + b).split("."), f = Math.max(d.length, e.length), g = 0; 0 == c && g < f; g++) {
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
                c = goog.string.compareElements_(c, p) || goog.string.compareElements_(0 ==
                    n[2].length, 0 == m[2].length) || goog.string.compareElements_(n[2], m[2])
        } while (0 == c)
    }
    return c
};
goog.string.compareElements_ = function (a, b) {
    return a < b ? -1 : a > b ? 1 : 0
};
goog.string.HASHCODE_MAX_ = 4294967296;
goog.string.hashCode = function (a) {
    for (var b = 0, c = 0; c < a.length; ++c) b = 31 * b + a.charCodeAt(c), b %= goog.string.HASHCODE_MAX_;
    return b
};
goog.string.uniqueStringCounter_ = 2147483648 * Math.random() | 0;
goog.string.createUniqueString = function () {
    return "goog_" + goog.string.uniqueStringCounter_++
};
goog.string.toNumber = function (a) {
    var b = Number(a);
    return 0 == b && goog.string.isEmpty(a) ? NaN : b
};

goog.userAgent = {};
goog.userAgent.ASSUME_IE = false;
goog.userAgent.ASSUME_GECKO = false;
goog.userAgent.ASSUME_WEBKIT = false;
goog.userAgent.ASSUME_MOBILE_WEBKIT = false;
goog.userAgent.ASSUME_OPERA = false;
goog.userAgent.BROWSER_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_GECKO || goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_OPERA;
goog.userAgent.getUserAgentString = function () {
    return window.navigator ? window.navigator.userAgent : null
};
goog.userAgent.getNavigator = function () {
    return window.navigator
};
goog.userAgent.init_ = function () {
    goog.userAgent.detectedOpera_ = false;
    goog.userAgent.detectedIe_ = false;
    goog.userAgent.detectedWebkit_ = false;
    goog.userAgent.detectedMobile_ = false;
    goog.userAgent.detectedGecko_ = false;
    var a;
    if (!goog.userAgent.BROWSER_KNOWN_ && (a = goog.userAgent.getUserAgentString())) {
        var b = goog.userAgent.getNavigator();
        goog.userAgent.detectedOpera_ = 0 == a.indexOf("Opera");
        goog.userAgent.detectedIe_ = !goog.userAgent.detectedOpera_ && -1 != a.indexOf("MSIE");
        goog.userAgent.detectedWebkit_ = !goog.userAgent.detectedOpera_ && -1 != a.indexOf("WebKit");
        goog.userAgent.detectedMobile_ = goog.userAgent.detectedWebkit_ && -1 != a.indexOf("Mobile");
        goog.userAgent.detectedGecko_ = !goog.userAgent.detectedOpera_ && !goog.userAgent.detectedWebkit_ && "Gecko" == b.product
    }
};
goog.userAgent.BROWSER_KNOWN_ || goog.userAgent.init_();
goog.userAgent.OPERA = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_OPERA : goog.userAgent.detectedOpera_;
goog.userAgent.IE = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_IE : goog.userAgent.detectedIe_;
goog.userAgent.GECKO = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_GECKO : goog.userAgent.detectedGecko_;
goog.userAgent.WEBKIT = goog.userAgent.BROWSER_KNOWN_ ? goog.userAgent.ASSUME_WEBKIT || goog.userAgent.ASSUME_MOBILE_WEBKIT : goog.userAgent.detectedWebkit_;
goog.userAgent.MOBILE = goog.userAgent.ASSUME_MOBILE_WEBKIT || goog.userAgent.detectedMobile_;
goog.userAgent.SAFARI = goog.userAgent.WEBKIT;
goog.userAgent.determinePlatform_ = function () {
    var a = goog.userAgent.getNavigator();
    return a && a.platform || ""
};
goog.userAgent.PLATFORM = goog.userAgent.determinePlatform_();
goog.userAgent.ASSUME_MAC = false;
goog.userAgent.ASSUME_WINDOWS = false;
goog.userAgent.ASSUME_LINUX = false;
goog.userAgent.ASSUME_X11 = false;
goog.userAgent.PLATFORM_KNOWN_ = goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_WINDOWS || goog.userAgent.ASSUME_LINUX || goog.userAgent.ASSUME_X11;
goog.userAgent.initPlatform_ = function () {
    goog.userAgent.detectedMac_ = goog.string.contains(goog.userAgent.PLATFORM, "Mac");
    goog.userAgent.detectedWindows_ = goog.string.contains(goog.userAgent.PLATFORM, "Win");
    goog.userAgent.detectedLinux_ = goog.string.contains(goog.userAgent.PLATFORM, "Linux");
    goog.userAgent.detectedX11_ = !!goog.userAgent.getNavigator() && goog.string.contains(goog.userAgent.getNavigator().appVersion || "", "X11")
};
goog.userAgent.PLATFORM_KNOWN_ || goog.userAgent.initPlatform_();
goog.userAgent.MAC = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_MAC : goog.userAgent.detectedMac_;
goog.userAgent.WINDOWS = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_WINDOWS : goog.userAgent.detectedWindows_;
goog.userAgent.LINUX = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_LINUX : goog.userAgent.detectedLinux_;
goog.userAgent.X11 = goog.userAgent.PLATFORM_KNOWN_ ? goog.userAgent.ASSUME_X11 : goog.userAgent.detectedX11_;
goog.userAgent.determineVersion_ = function () {
    var a = "",
        b;
        
    goog.userAgent.OPERA && document.opera ? (a = document.opera.version, a = "function" == typeof a ? a() : a) : (goog.userAgent.GECKO ? b = /rv\:([^\);]+)(\)|;)/ : goog.userAgent.IE ? b = /MSIE\s+([^\);]+)(\)|;)/ : goog.userAgent.WEBKIT && (b = /WebKit\/(\S+)/), b && (a = (a = b.exec(goog.userAgent.getUserAgentString())) ? a[1] : ""));
    return goog.userAgent.IE && (b = goog.userAgent.getDocumentMode_(), b > parseFloat(a)) ? "" + b : a
};
goog.userAgent.getDocumentMode_ = function () {
    var a = window.document;
    return a ? a.documentMode : undefined
};
goog.userAgent.VERSION = goog.userAgent.determineVersion_();
goog.userAgent.compare = function (a, b) {
    return goog.string.compareVersions(a, b)
};
goog.userAgent.isVersionCache_ = {};
goog.userAgent.isVersion = function (a) {
    return goog.userAgent.isVersionCache_[a] || (goog.userAgent.isVersionCache_[a] = 0 <= goog.string.compareVersions(goog.userAgent.VERSION, a))
};

goog.object = {};
goog.object.forEach = function (a, b, c) {
    for (var d in a) b.call(c, a[d], d, a)
};
goog.object.filter = function (a, b, c) {
    var d = {}, e;
    for (e in a) b.call(c, a[e], e, a) && (d[e] = a[e]);
    return d
};
goog.object.map = function (a, b, c) {
    var d = {}, e;
    for (e in a) d[e] = b.call(c, a[e], e, a);
    return d
};
goog.object.some = function (a, b, c) {
    for (var d in a)
        if (b.call(c, a[d], d, a)) return true;
    return false
};
goog.object.every = function (a, b, c) {
    for (var d in a)
        if (!b.call(c, a[d], d, a)) return false;
    return true
};
goog.object.getCount = function (a) {
    var b = 0,
        c;
    for (c in a) b++;
    return b
};
goog.object.getAnyKey = function (a) {
    for (var b in a) return b
};
goog.object.getAnyValue = function (a) {
    for (var b in a) return a[b]
};
goog.object.contains = function (a, b) {
    return goog.object.containsValue(a, b)
};
goog.object.getValues = function (a) {
    var b = [],
        c = 0,
        d;
    for (d in a) b[c++] = a[d];
    return b
};
goog.object.getKeys = function (a) {
    var b = [],
        c = 0,
        d;
    for (d in a) b[c++] = d;
    return b
};
goog.object.containsKey = function (a, b) {
    return b in a
};
goog.object.containsValue = function (a, b) {
    for (var c in a)
        if (a[c] == b) return true;
    return false
};
goog.object.findKey = function (a, b, c) {
    for (var d in a)
        if (b.call(c, a[d], d, a)) return d
};
goog.object.findValue = function (a, b, c) {
    return (b = goog.object.findKey(a, b, c)) && a[b]
};
goog.object.isEmpty = function (a) {
    for (var b in a) return false;
    return true
};
goog.object.clear = function (a) {
    for (var b = goog.object.getKeys(a), c = b.length - 1; 0 <= c; c--) goog.object.remove(a, b[c])
};
goog.object.remove = function (a, b) {
    var c;
    (c = b in a) && delete a[b];
    return c
};
goog.object.add = function (a, b, c) {
    if (b in a) throw Error('The object already contains the key "' + b + '"');
    goog.object.set(a, b, c)
};
goog.object.get = function (a, b, c) {
    return b in a ? a[b] : c
};
goog.object.set = function (a, b, c) {
    a[b] = c
};
goog.object.setIfUndefined = function (a, b, c) {
    return b in a ? a[b] : a[b] = c
};
goog.object.clone = function (a) {
    var b = {}, c;
    for (c in a) b[c] = a[c];
    return b
};
goog.object.transpose = function (a) {
    var b = {}, c;
    for (c in a) b[a[c]] = c;
    return b
};
goog.object.PROTOTYPE_FIELDS_ = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
goog.object.extend = function (a, b) {
    for (var c, d, e = 1; e < arguments.length; e++) {
        d = arguments[e];
        for (c in d) a[c] = d[c];
        for (var f = 0; f < goog.object.PROTOTYPE_FIELDS_.length; f++) c = goog.object.PROTOTYPE_FIELDS_[f], Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c])
    }
};
goog.object.create = function (a) {
    var b = arguments.length;
    if (1 == b && goog.isArray(arguments[0])) return goog.object.create.apply(null, arguments[0]);
    if (b % 2) throw Error("Uneven number of arguments");
    for (var c = {}, d = 0; d < b; d += 2) c[arguments[d]] = arguments[d + 1];
    return c
};
goog.object.createSet = function (a) {
    var b = arguments.length;
    if (1 == b && goog.isArray(arguments[0])) return goog.object.createSet.apply(null, arguments[0]);
    for (var c = {}, d = 0; d < b; d++) c[arguments[d]] = true;
    return c
};

goog.debug = {};
goog.debug.Error = class extends Error {
    constructor(a) {
        this.stack = Error().stack || "";
        a && (this.message = "" + a);
    }
};
goog.debug.Error.prototype.name = "CustomError";

goog.asserts = {};
goog.asserts.AssertionError = class extends goog.debug.Error {
    constructor(a, b) {
        b.unshift(a);
        goog.debug.Error.call(this, goog.string.subs.apply(null, b));
        b.shift();
        this.messagePattern = a;
    }
};
goog.asserts.AssertionError.prototype.name = "AssertionError";
goog.asserts.doAssertFailure_ = function (a, b, c, d) {
    var e = "Assertion failed";
    if (c) var e = e + (": " + c),
        f = d;
    else a && (e += ": " + a, f = b);
    throw new goog.asserts.AssertionError("" + e, f || []);
};
goog.asserts.assert = function (a, b, c) {
    !a && goog.asserts.doAssertFailure_("", null, b, Array.prototype.slice.call(arguments, 2));
    return a
};
goog.asserts.fail = function (a, b) {
    throw new goog.asserts.AssertionError("Failure" + (a ? ": " + a : ""), Array.prototype.slice.call(arguments, 1));
};
goog.asserts.assertNumber = function (a, b, c) {
    !goog.isNumber(a) && goog.asserts.doAssertFailure_("Expected number but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
    return a
};
goog.asserts.assertString = function (a, b, c) {
    !goog.isString(a) && goog.asserts.doAssertFailure_("Expected string but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
    return a
};
goog.asserts.assertFunction = function (a, b, c) {
    !goog.isFunction(a) && goog.asserts.doAssertFailure_("Expected function but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
    return a
};
goog.asserts.assertObject = function (a, b, c) {
    !goog.isObject(a) && goog.asserts.doAssertFailure_("Expected object but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
    return a
};
goog.asserts.assertArray = function (a, b, c) {
    !goog.isArray(a) && goog.asserts.doAssertFailure_("Expected array but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
    return a
};
goog.asserts.assertBoolean = function (a, b, c) {
    !goog.isBoolean(a) && goog.asserts.doAssertFailure_("Expected boolean but got %s: %s.", [goog.typeOf(a), a], b, Array.prototype.slice.call(arguments, 2));
    return a
};
goog.asserts.assertInstanceof = function (a, b, c, d) {
    !(a instanceof b) && goog.asserts.doAssertFailure_("instanceof check failed.", null, c, Array.prototype.slice.call(arguments, 3))
};

goog.array = {};
goog.array.peek = function (a) {
    return a[a.length - 1]
};
goog.array.ARRAY_PROTOTYPE_ = Array.prototype;
goog.array.indexOf = goog.array.ARRAY_PROTOTYPE_.indexOf ? function (a, b, c) {
    goog.asserts.assert(null != a.length);
    return goog.array.ARRAY_PROTOTYPE_.indexOf.call(a, b, c)
} : function (a, b, c) {
    c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
    if (goog.isString(a)) return !goog.isString(b) || 1 != b.length ? -1 : a.indexOf(b, c);
    for (; c < a.length; c++)
        if (c in a && a[c] === b) return c;
    return -1
};
goog.array.lastIndexOf = goog.array.ARRAY_PROTOTYPE_.lastIndexOf ? function (a, b, c) {
    goog.asserts.assert(null != a.length);
    return goog.array.ARRAY_PROTOTYPE_.lastIndexOf.call(a, b, null == c ? a.length - 1 : c)
} : function (a, b, c) {
    c = null == c ? a.length - 1 : c;
    0 > c && (c = Math.max(0, a.length + c));
    if (goog.isString(a)) return !goog.isString(b) || 1 != b.length ? -1 : a.lastIndexOf(b, c);
    for (; 0 <= c; c--)
        if (c in a && a[c] === b) return c;
    return -1
};
goog.array.forEach = goog.array.ARRAY_PROTOTYPE_.forEach ? function (a, b, c) {
    goog.asserts.assert(null != a.length);
    goog.array.ARRAY_PROTOTYPE_.forEach.call(a, b, c)
} : function (a, b, c) {
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++) f in e && b.call(c, e[f], f, a)
};
goog.array.forEachRight = function (a, b, c) {
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, d = d - 1; 0 <= d; --d) d in e && b.call(c, e[d], d, a)
};
goog.array.filter = goog.array.ARRAY_PROTOTYPE_.filter ? function (a, b, c) {
    goog.asserts.assert(null != a.length);
    return goog.array.ARRAY_PROTOTYPE_.filter.call(a, b, c)
} : function (a, b, c) {
    for (var d = a.length, e = [], f = 0, g = goog.isString(a) ? a.split("") : a, h = 0; h < d; h++)
        if (h in g) {
            var j = g[h];
            b.call(c, j, h, a) && (e[f++] = j)
        }
    return e
};
goog.array.map = goog.array.ARRAY_PROTOTYPE_.map ? function (a, b, c) {
    goog.asserts.assert(null != a.length);
    return goog.array.ARRAY_PROTOTYPE_.map.call(a, b, c)
} : function (a, b, c) {
    for (var d = a.length, e = Array(d), f = goog.isString(a) ? a.split("") : a, g = 0; g < d; g++) g in f && (e[g] = b.call(c, f[g], g, a));
    return e
};
goog.array.reduce = function (a, b, c, d) {
    if (a.reduce) return d ? a.reduce(goog.bind(b, d), c) : a.reduce(b, c);
    var e = c;
    goog.array.forEach(a, function (c, g) {
        e = b.call(d, e, c, g, a)
    });
    return e
};
goog.array.reduceRight = function (a, b, c, d) {
    if (a.reduceRight) return d ? a.reduceRight(goog.bind(b, d), c) : a.reduceRight(b, c);
    var e = c;
    goog.array.forEachRight(a, function (c, g) {
        e = b.call(d, e, c, g, a)
    });
    return e
};
goog.array.some = goog.array.ARRAY_PROTOTYPE_.some ? function (a, b, c) {
    goog.asserts.assert(null != a.length);
    return goog.array.ARRAY_PROTOTYPE_.some.call(a, b, c)
} : function (a, b, c) {
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++)
        if (f in e && b.call(c, e[f], f, a)) return true;
    return false
};
goog.array.every = goog.array.ARRAY_PROTOTYPE_.every ? function (a, b, c) {
    goog.asserts.assert(null != a.length);
    return goog.array.ARRAY_PROTOTYPE_.every.call(a, b, c)
} : function (a, b, c) {
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++)
        if (f in e && !b.call(c, e[f], f, a)) return false;
    return true
};
goog.array.find = function (a, b, c) {
    b = goog.array.findIndex(a, b, c);
    return 0 > b ? null : goog.isString(a) ? a.charAt(b) : a[b]
};
goog.array.findIndex = function (a, b, c) {
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++)
        if (f in e && b.call(c, e[f], f, a)) return f;
    return -1
};
goog.array.findRight = function (a, b, c) {
    b = goog.array.findIndexRight(a, b, c);
    return 0 > b ? null : goog.isString(a) ? a.charAt(b) : a[b]
};
goog.array.findIndexRight = function (a, b, c) {
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, d = d - 1; 0 <= d; d--)
        if (d in e && b.call(c, e[d], d, a)) return d;
    return -1
};
goog.array.contains = function (a, b) {
    return 0 <= goog.array.indexOf(a, b)
};
goog.array.isEmpty = function (a) {
    return 0 == a.length
};
goog.array.clear = function (a) {
    if (!goog.isArray(a))
        for (var b = a.length - 1; 0 <= b; b--) delete a[b];
    a.length = 0
};
goog.array.insert = function (a, b) {
    goog.array.contains(a, b) || a.push(b)
};
goog.array.insertAt = function (a, b, c) {
    goog.array.splice(a, c, 0, b)
};
goog.array.insertArrayAt = function (a, b, c) {
    goog.partial(goog.array.splice, a, c, 0).apply(null, b)
};
goog.array.insertBefore = function (a, b, c) {
    var d;
    2 == arguments.length || 0 > (d = goog.array.indexOf(a, c)) ? a.push(b) : goog.array.insertAt(a, b, d)
};
goog.array.remove = function (a, b) {
    var c = goog.array.indexOf(a, b),
        d;
    (d = 0 <= c) && goog.array.removeAt(a, c);
    return d
};
goog.array.removeAt = function (a, b) {
    goog.asserts.assert(null != a.length);
    return 1 == goog.array.ARRAY_PROTOTYPE_.splice.call(a, b, 1).length
};
goog.array.removeIf = function (a, b, c) {
    b = goog.array.findIndex(a, b, c);
    return 0 <= b ? (goog.array.removeAt(a, b), true) : false
};
goog.array.concat = function (a) {
    return goog.array.ARRAY_PROTOTYPE_.concat.apply(goog.array.ARRAY_PROTOTYPE_, arguments)
};
goog.array.clone = function (a) {
    if (goog.isArray(a)) return goog.array.concat(a);
    for (var b = [], c = 0, d = a.length; c < d; c++) b[c] = a[c];
    return b
};
goog.array.toArray = function (a) {
    return goog.isArray(a) ? goog.array.concat(a) : goog.array.clone(a)
};
goog.array.extend = function (a, b) {
    for (var c = 1; c < arguments.length; c++) {
        var d = arguments[c],
            e;
        if (goog.isArray(d) || (e = goog.isArrayLike(d)) && d.hasOwnProperty("callee")) a.push.apply(a, d);
        else if (e)
            for (var f = a.length, g = d.length, h = 0; h < g; h++) a[f + h] = d[h];
        else a.push(d)
    }
};
goog.array.splice = function (a, b, c, d) {
    goog.asserts.assert(null != a.length);
    return goog.array.ARRAY_PROTOTYPE_.splice.apply(a, goog.array.slice(arguments, 1))
};
goog.array.slice = function (a, b, c) {
    goog.asserts.assert(null != a.length);
    return 2 >= arguments.length ? goog.array.ARRAY_PROTOTYPE_.slice.call(a, b) : goog.array.ARRAY_PROTOTYPE_.slice.call(a, b, c)
};
goog.array.removeDuplicates = function (a, b) {
    for (var c = b || a, d = {}, e = 0, f = 0; f < a.length;) {
        var g = a[f++],
            h = goog.isObject(g) ? goog.getUid(g) : g;
        Object.prototype.hasOwnProperty.call(d, h) || (d[h] = true, c[e++] = g)
    }
    c.length = e
};
goog.array.binarySearch = function (a, b, c) {
    return goog.array.binarySearch_(a, c || goog.array.defaultCompare, false, b)
};
goog.array.binarySelect = function (a, b, c) {
    return goog.array.binarySearch_(a, b, true, undefined, c)
};
goog.array.binarySearch_ = function (a, b, c, d, e) {
    for (var f = 0, g = a.length, h; f < g;) {
        var j = f + g >> 1,
            k;
        k = c ? b.call(e, a[j], j, a) : b(d, a[j]);
        0 < k ? f = j + 1 : (g = j, h = !k)
    }
    return h ? f : ~f
};
goog.array.sort = function (a, b) {
    goog.asserts.assert(null != a.length);
    goog.array.ARRAY_PROTOTYPE_.sort.call(a, b || goog.array.defaultCompare)
};
goog.array.stableSort = function (a, b) {
    for (var c = 0; c < a.length; c++) a[c] = {
        index: c,
        value: a[c]
    };
    var d = b || goog.array.defaultCompare;
    goog.array.sort(a, function (a, b) {
        return d(a.value, b.value) || a.index - b.index
    });
    for (c = 0; c < a.length; c++) a[c] = a[c].value
};
goog.array.sortObjectsByKey = function (a, b, c) {
    var d = c || goog.array.defaultCompare;
    goog.array.sort(a, function (a, c) {
        return d(a[b], c[b])
    })
};
goog.array.isSorted = function (a, b, c) {
    for (var b = b || goog.array.defaultCompare, d = 1; d < a.length; d++) {
        var e = b(a[d - 1], a[d]);
        if (0 < e || 0 == e && c) return false
    }
    return true
};
goog.array.equals = function (a, b, c) {
    if (!goog.isArrayLike(a) || !goog.isArrayLike(b) || a.length != b.length) return false;
    for (var d = a.length, c = c || goog.array.defaultCompareEquality, e = 0; e < d; e++)
        if (!c(a[e], b[e])) return false;
    return true
};
goog.array.compare = function (a, b, c) {
    return goog.array.equals(a, b, c)
};
goog.array.defaultCompare = function (a, b) {
    return a > b ? 1 : a < b ? -1 : 0
};
goog.array.defaultCompareEquality = function (a, b) {
    return a === b
};
goog.array.binaryInsert = function (a, b, c) {
    c = goog.array.binarySearch(a, b, c);
    return 0 > c ? (goog.array.insertAt(a, b, -(c + 1)), true) : false
};
goog.array.binaryRemove = function (a, b, c) {
    b = goog.array.binarySearch(a, b, c);
    return 0 <= b ? goog.array.removeAt(a, b) : false
};
goog.array.bucket = function (a, b) {
    for (var c = {}, d = 0; d < a.length; d++) {
        var e = a[d],
            f = b(e, d, a);
        goog.isDef(f) && (c[f] || (c[f] = [])).push(e)
    }
    return c
};
goog.array.repeat = function (a, b) {
    for (var c = [], d = 0; d < b; d++) c[d] = a;
    return c
};
goog.array.flatten = function (a) {
    for (var b = [], c = 0; c < arguments.length; c++) {
        var d = arguments[c];
        goog.isArray(d) ? b.push.apply(b, goog.array.flatten.apply(null, d)) : b.push(d)
    }
    return b
};
goog.array.rotate = function (a, b) {
    goog.asserts.assert(null != a.length);
    a.length && (b %= a.length, 0 < b ? goog.array.ARRAY_PROTOTYPE_.unshift.apply(a, a.splice(-b, b)) : 0 > b && goog.array.ARRAY_PROTOTYPE_.push.apply(a, a.splice(0, -b)));
    return a
};
goog.array.zip = function (a) {
    if (!arguments.length) return [];
    for (var b = [], c = 0; ; c++) {
        for (var d = [], e = 0; e < arguments.length; e++) {
            var f = arguments[e];
            if (c >= f.length) return b;
            d.push(f[c])
        }
        b.push(d)
    }
};
goog.array.shuffle = function (a, b) {
    for (var c = b || Math.random, d = a.length - 1; 0 < d; d--) {
        var e = Math.floor(c() * (d + 1)),
            f = a[d];
        a[d] = a[e];
        a[e] = f
    }
};

goog.events = {};
goog.events.EventType = {
    CLICK: "click",
    DBLCLICK: "dblclick",
    MOUSEDOWN: "mousedown",
    MOUSEUP: "mouseup",
    MOUSEOVER: "mouseover",
    MOUSEOUT: "mouseout",
    MOUSEMOVE: "mousemove",
    SELECTSTART: "selectstart",
    KEYPRESS: "keypress",
    KEYDOWN: "keydown",
    KEYUP: "keyup",
    BLUR: "blur",
    FOCUS: "focus",
    DEACTIVATE: "deactivate",
    FOCUSIN: goog.userAgent.IE ? "focusin" : "DOMFocusIn",
    FOCUSOUT: goog.userAgent.IE ? "focusout" : "DOMFocusOut",
    CHANGE: "change",
    SELECT: "select",
    SUBMIT: "submit",
    INPUT: "input",
    PROPERTYCHANGE: "propertychange",
    DRAGSTART: "dragstart",
    DRAGENTER: "dragenter",
    DRAGOVER: "dragover",
    DRAGLEAVE: "dragleave",
    DROP: "drop",
    TOUCHSTART: "touchstart",
    TOUCHMOVE: "touchmove",
    TOUCHEND: "touchend",
    TOUCHCANCEL: "touchcancel",
    CONTEXTMENU: "contextmenu",
    ERROR: "error",
    HELP: "help",
    LOAD: "load",
    LOSECAPTURE: "losecapture",
    READYSTATECHANGE: "readystatechange",
    RESIZE: "resize",
    SCROLL: "scroll",
    UNLOAD: "unload",
    HASHCHANGE: "hashchange",
    PAGEHIDE: "pagehide",
    PAGESHOW: "pageshow",
    POPSTATE: "popstate",
    COPY: "copy",
    PASTE: "paste",
    CUT: "cut"
};

goog.userAgent.product = {};
goog.userAgent.product.ASSUME_FIREFOX = false;
goog.userAgent.product.ASSUME_CAMINO = false;
goog.userAgent.product.ASSUME_IPHONE = false;
goog.userAgent.product.ASSUME_IPAD = false;
goog.userAgent.product.ASSUME_ANDROID = false;
goog.userAgent.product.ASSUME_CHROME = false;
goog.userAgent.product.ASSUME_SAFARI = false;
goog.userAgent.product.PRODUCT_KNOWN_ = goog.userAgent.ASSUME_IE || goog.userAgent.ASSUME_OPERA || goog.userAgent.product.ASSUME_FIREFOX || goog.userAgent.product.ASSUME_CAMINO || goog.userAgent.product.ASSUME_IPHONE || goog.userAgent.product.ASSUME_IPAD || goog.userAgent.product.ASSUME_ANDROID || goog.userAgent.product.ASSUME_CHROME || goog.userAgent.product.ASSUME_SAFARI;
goog.userAgent.product.init_ = function () {
    goog.userAgent.product.detectedFirefox_ = false;
    goog.userAgent.product.detectedCamino_ = false;
    goog.userAgent.product.detectedIphone_ = false;
    goog.userAgent.product.detectedIpad_ = false;
    goog.userAgent.product.detectedAndroid_ = false;
    goog.userAgent.product.detectedChrome_ = false;
    goog.userAgent.product.detectedSafari_ = false;
    var a = goog.userAgent.getUserAgentString();
    a && (-1 != a.indexOf("Firefox") ? goog.userAgent.product.detectedFirefox_ = true : -1 != a.indexOf("Camino") ? goog.userAgent.product.detectedCamino_ = true : -1 != a.indexOf("iPhone") || -1 != a.indexOf("iPod") ? goog.userAgent.product.detectedIphone_ = true : -1 != a.indexOf("iPad") ? goog.userAgent.product.detectedIpad_ = true : -1 != a.indexOf("Android") ? goog.userAgent.product.detectedAndroid_ = true : -1 != a.indexOf("Chrome") ? goog.userAgent.product.detectedChrome_ = true : -1 != a.indexOf("Safari") && (goog.userAgent.product.detectedSafari_ = true))
};
goog.userAgent.product.PRODUCT_KNOWN_ || goog.userAgent.product.init_();
goog.userAgent.product.OPERA = goog.userAgent.OPERA;
goog.userAgent.product.IE = goog.userAgent.IE;
goog.userAgent.product.FIREFOX = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_FIREFOX : goog.userAgent.product.detectedFirefox_;
goog.userAgent.product.CAMINO = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_CAMINO : goog.userAgent.product.detectedCamino_;
goog.userAgent.product.IPHONE = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPHONE : goog.userAgent.product.detectedIphone_;
goog.userAgent.product.IPAD = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_IPAD : goog.userAgent.product.detectedIpad_;
goog.userAgent.product.ANDROID = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_ANDROID : goog.userAgent.product.detectedAndroid_;
goog.userAgent.product.CHROME = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_CHROME : goog.userAgent.product.detectedChrome_;
goog.userAgent.product.SAFARI = goog.userAgent.product.PRODUCT_KNOWN_ ? goog.userAgent.product.ASSUME_SAFARI : goog.userAgent.product.detectedSafari_;
goog.userAgent.product.determineVersion_ = function () {
    var a = "",
        b, c;
    if (goog.userAgent.product.FIREFOX) b = /Firefox\/([0-9.]+)/;
    else {
        if (goog.userAgent.product.IE || goog.userAgent.product.OPERA) return goog.userAgent.VERSION;
        goog.userAgent.product.CHROME ? b = /Chrome\/([0-9.]+)/ : goog.userAgent.product.SAFARI ? b = /Safari\/([0-9.]+)/ : goog.userAgent.product.IPHONE || goog.userAgent.product.IPAD ? (b = /Version\/(\S+).*Mobile\/(\S+)/, c = true) : goog.userAgent.product.ANDROID ? b = /Android\s+([0-9.]+)(?:.*Version\/([0-9.]+))?/ : goog.userAgent.product.CAMINO &&
            (b = /Camino\/([0-9.]+)/)
    }
    b && (a = (a = b.exec(goog.userAgent.getUserAgentString())) ? c ? a[1] + "." + a[2] : a[2] || a[1] : "");
    return a
};
goog.userAgent.product.VERSION = goog.userAgent.product.determineVersion_();
goog.userAgent.product.isVersion = function (a) {
    return 0 <= goog.string.compareVersions(goog.userAgent.product.VERSION, a)
};

goog.structs = {};
goog.structs.getCount = function (a) {
    return "function" == typeof a.getCount ? a.getCount() : goog.isArrayLike(a) || goog.isString(a) ? a.length : goog.object.getCount(a)
};
goog.structs.getValues = function (a) {
    if ("function" == typeof a.getValues) return a.getValues();
    if (goog.isString(a)) return a.split("");
    if (goog.isArrayLike(a)) {
        for (var b = [], c = a.length, d = 0; d < c; d++) b.push(a[d]);
        return b
    }
    return goog.object.getValues(a)
};
goog.structs.getKeys = function (a) {
    if ("function" == typeof a.getKeys) return a.getKeys();
    if ("function" != typeof a.getValues) {
        if (goog.isArrayLike(a) || goog.isString(a)) {
            for (var b = [], a = a.length, c = 0; c < a; c++) b.push(c);
            return b
        }
        return goog.object.getKeys(a)
    }
};
goog.structs.contains = function (a, b) {
    return "function" == typeof a.contains ? a.contains(b) : "function" == typeof a.containsValue ? a.containsValue(b) : goog.isArrayLike(a) || goog.isString(a) ? goog.array.contains(a, b) : goog.object.containsValue(a, b)
};
goog.structs.isEmpty = function (a) {
    return "function" == typeof a.isEmpty ? a.isEmpty() : goog.isArrayLike(a) || goog.isString(a) ? goog.array.isEmpty(a) : goog.object.isEmpty(a)
};
goog.structs.clear = function (a) {
    "function" == typeof a.clear ? a.clear() : goog.isArrayLike(a) ? goog.array.clear(a) : goog.object.clear(a)
};
goog.structs.forEach = function (a, b, c) {
    if ("function" == typeof a.forEach) a.forEach(b, c);
    else if (goog.isArrayLike(a) || goog.isString(a)) goog.array.forEach(a, b, c);
    else
        for (var d = goog.structs.getKeys(a), e = goog.structs.getValues(a), f = e.length, g = 0; g < f; g++) b.call(c, e[g], d && d[g], a)
};
goog.structs.filter = function (a, b, c) {
    if ("function" == typeof a.filter) return a.filter(b, c);
    if (goog.isArrayLike(a) || goog.isString(a)) return goog.array.filter(a, b, c);
    var d, e = goog.structs.getKeys(a),
        f = goog.structs.getValues(a),
        g = f.length;
    if (e) {
        d = {};
        for (var h = 0; h < g; h++) b.call(c, f[h], e[h], a) && (d[e[h]] = f[h])
    } else {
        d = [];
        for (h = 0; h < g; h++) b.call(c, f[h], undefined, a) && d.push(f[h])
    }
    return d
};
goog.structs.map = function (a, b, c) {
    if ("function" == typeof a.map) return a.map(b, c);
    if (goog.isArrayLike(a) || goog.isString(a)) return goog.array.map(a, b, c);
    var d, e = goog.structs.getKeys(a),
        f = goog.structs.getValues(a),
        g = f.length;
    if (e) {
        d = {};
        for (var h = 0; h < g; h++) d[e[h]] = b.call(c, f[h], e[h], a)
    } else {
        d = [];
        for (h = 0; h < g; h++) d[h] = b.call(c, f[h], undefined, a)
    }
    return d
};
goog.structs.some = function (a, b, c) {
    if ("function" == typeof a.some) return a.some(b, c);
    if (goog.isArrayLike(a) || goog.isString(a)) return goog.array.some(a, b, c);
    for (var d = goog.structs.getKeys(a), e = goog.structs.getValues(a), f = e.length, g = 0; g < f; g++)
        if (b.call(c, e[g], d && d[g], a)) return true;
    return false
};
goog.structs.every = function (a, b, c) {
    if ("function" == typeof a.every) return a.every(b, c);
    if (goog.isArrayLike(a) || goog.isString(a)) return goog.array.every(a, b, c);
    for (var d = goog.structs.getKeys(a), e = goog.structs.getValues(a), f = e.length, g = 0; g < f; g++)
        if (!b.call(c, e[g], d && d[g], a)) return false;
    return true
};
goog.structs.Map = function (a, b) {
    this.map_ = {};
    this.keys_ = [];
    var c = arguments.length;
    if (1 < c) {
        if (c % 2) throw Error("Uneven number of arguments");
        for (var d = 0; d < c; d += 2) this.set(arguments[d], arguments[d + 1])
    } else a && this.addAll(a)
};
goog.structs.Map.prototype.count_ = 0;
goog.structs.Map.prototype.version_ = 0;
goog.structs.Map.prototype.getCount = function () {
    return this.count_
};
goog.structs.Map.prototype.getValues = function () {
    this.cleanupKeysArray_();
    for (var a = [], b = 0; b < this.keys_.length; b++) a.push(this.map_[this.keys_[b]]);
    return a
};
goog.structs.Map.prototype.getKeys = function () {
    this.cleanupKeysArray_();
    return this.keys_.concat()
};
goog.structs.Map.prototype.containsKey = function (a) {
    return goog.structs.Map.hasKey_(this.map_, a)
};
goog.structs.Map.prototype.containsValue = function (a) {
    for (var b = 0; b < this.keys_.length; b++) {
        var c = this.keys_[b];
        if (goog.structs.Map.hasKey_(this.map_, c) && this.map_[c] == a) return true
    }
    return false
};
goog.structs.Map.prototype.equals = function (a, b) {
    if (this === a) return true;
    if (this.count_ != a.getCount()) return false;
    var c = b || goog.structs.Map.defaultEquals;
    this.cleanupKeysArray_();
    for (var d, e = 0; d = this.keys_[e]; e++)
        if (!c(this.get(d), a.get(d))) return false;
    return true
};
goog.structs.Map.defaultEquals = function (a, b) {
    return a === b
};
goog.structs.Map.prototype.isEmpty = function () {
    return 0 == this.count_
};
goog.structs.Map.prototype.clear = function () {
    this.map_ = {};
    this.version_ = this.count_ = this.keys_.length = 0
};
goog.structs.Map.prototype.remove = function (a) {
    return goog.structs.Map.hasKey_(this.map_, a) ? (delete this.map_[a], this.count_--, this.version_++, this.keys_.length > 2 * this.count_ && this.cleanupKeysArray_(), true) : false
};
goog.structs.Map.prototype.cleanupKeysArray_ = function () {
    if (this.count_ != this.keys_.length) {
        for (var a = 0, b = 0; a < this.keys_.length;) {
            var c = this.keys_[a];
            goog.structs.Map.hasKey_(this.map_, c) && (this.keys_[b++] = c);
            a++
        }
        this.keys_.length = b
    }
    if (this.count_ != this.keys_.length) {
        for (var d = {}, b = a = 0; a < this.keys_.length;) c = this.keys_[a], goog.structs.Map.hasKey_(d, c) || (this.keys_[b++] = c, d[c] = 1), a++;
        this.keys_.length = b
    }
};
goog.structs.Map.prototype.get = function (a, b) {
    return goog.structs.Map.hasKey_(this.map_, a) ? this.map_[a] : b
};
goog.structs.Map.prototype.set = function (a, b) {
    goog.structs.Map.hasKey_(this.map_, a) || (this.count_++, this.keys_.push(a), this.version_++);
    this.map_[a] = b
};
goog.structs.Map.prototype.addAll = function (a) {
    var b;
    a instanceof goog.structs.Map ? (b = a.getKeys(), a = a.getValues()) : (b = goog.object.getKeys(a), a = goog.object.getValues(a));
    for (var c = 0; c < b.length; c++) this.set(b[c], a[c])
};
goog.structs.Map.prototype.clone = function () {
    return new goog.structs.Map(this)
};
goog.structs.Map.prototype.transpose = function () {
    for (var a = new goog.structs.Map, b = 0; b < this.keys_.length; b++) {
        var c = this.keys_[b];
        a.set(this.map_[c], c)
    }
    return a
};
goog.structs.Map.prototype.toObject = function () {
    this.cleanupKeysArray_();
    for (var a = {}, b = 0; b < this.keys_.length; b++) {
        var c = this.keys_[b];
        a[c] = this.map_[c]
    }
    return a
};
goog.structs.Map.prototype.getKeyIterator = function () {
    return this.__iterator__(true)
};
goog.structs.Map.prototype.getValueIterator = function () {
    return this.__iterator__(false)
};
goog.structs.Map.prototype.__iterator__ = function (a) {
    this.cleanupKeysArray_();
    var b = 0,
        c = this.keys_,
        d = this.map_,
        e = this.version_,
        f = this,
        g = new goog.iter.Iterator;
    g.next = function () {
        for (; ;) {
            if (e != f.version_) throw Error("The map has changed since the iterator was created");
            if (b >= c.length) throw goog.iter.StopIteration;
            var g = c[b++];
            return a ? g : d[g]
        }
    };
    return g
};
goog.structs.Map.hasKey_ = function (a, b) {
    return Object.prototype.hasOwnProperty.call(a, b)
};
goog.structs.Set = function (a) {
    this.map_ = new goog.structs.Map;
    a && this.addAll(a)
};
goog.structs.Set.getKey_ = function (a) {
    var b = typeof a;
    return "object" == b && a || "function" == b ? "o" + goog.getUid(a) : b.substr(0, 1) + a
};
goog.structs.Set.prototype.getCount = function () {
    return this.map_.getCount()
};
goog.structs.Set.prototype.add = function (a) {
    this.map_.set(goog.structs.Set.getKey_(a), a)
};
goog.structs.Set.prototype.addAll = function (a) {
    for (var a = goog.structs.getValues(a), b = a.length, c = 0; c < b; c++) this.add(a[c])
};
goog.structs.Set.prototype.removeAll = function (a) {
    for (var a = goog.structs.getValues(a), b = a.length, c = 0; c < b; c++) this.remove(a[c])
};
goog.structs.Set.prototype.remove = function (a) {
    return this.map_.remove(goog.structs.Set.getKey_(a))
};
goog.structs.Set.prototype.clear = function () {
    this.map_.clear()
};
goog.structs.Set.prototype.isEmpty = function () {
    return this.map_.isEmpty()
};
goog.structs.Set.prototype.contains = function (a) {
    return this.map_.containsKey(goog.structs.Set.getKey_(a))
};
goog.structs.Set.prototype.containsAll = function (a) {
    return goog.structs.every(a, this.contains, this)
};
goog.structs.Set.prototype.intersection = function (a) {
    for (var b = new goog.structs.Set, a = goog.structs.getValues(a), c = 0; c < a.length; c++) {
        var d = a[c];
        this.contains(d) && b.add(d)
    }
    return b
};
goog.structs.Set.prototype.getValues = function () {
    return this.map_.getValues()
};
goog.structs.Set.prototype.clone = function () {
    return new goog.structs.Set(this)
};
goog.structs.Set.prototype.equals = function (a) {
    return this.getCount() == goog.structs.getCount(a) && this.isSubsetOf(a)
};
goog.structs.Set.prototype.isSubsetOf = function (a) {
    var b = goog.structs.getCount(a);
    if (this.getCount() > b) return false;
    !(a instanceof goog.structs.Set) && 5 < b && (a = new goog.structs.Set(a));
    return goog.structs.every(this, function (b) {
        return goog.structs.contains(a, b)
    })
};
goog.structs.Set.prototype.__iterator__ = function () {
    return this.map_.__iterator__(false)
};
goog.debug.catchErrors = function (a, b, c) {
    var c = c || document,
        d = c.onerror;
    c.onerror = function (c, f, g) {
        d && d(c, f, g);
        a({
            message: c,
            fileName: f,
            line: g
        });
        return Boolean(b)
    }
};
goog.debug.expose = function (a, b) {
    if ("undefined" == typeof a) return "undefined";
    if (null == a) return "NULL";
    var c = [],
        d;
    for (d in a)
        if (b || !goog.isFunction(a[d])) {
            var e = d + " = ";
            try {
                e += a[d]
            } catch (f) {
                e += "*** " + f + " ***"
            }
            c.push(e)
        }
    return c.join("\n")
};
goog.debug.deepExpose = function (a, b) {
    var c = new goog.structs.Set,
        d = [],
        e = function (a, g) {
            var h = g + "  ";
            try {
                if (goog.isDef(a))
                    if (a === null) d.push("NULL");
                    else if (goog.isString(a)) d.push('"' + a.replace(/\n/g, "\n" + g) + '"');
                    else if (goog.isFunction(a)) d.push(("" + a).replace(/\n/g, "\n" + g));
                    else if (goog.isObject(a))
                        if (c.contains(a)) d.push("*** reference loop detected ***");
                        else {
                            c.add(a);
                            d.push("{");
                            for (var j in a)
                                if (b || !goog.isFunction(a[j])) d.push("\n"), d.push(h), d.push(j + " = "), e(a[j], h);
                            d.push("\n" + g + "}")
                        } else d.push(a);
                else d.push("undefined")
            } catch (k) {
                d.push("*** " + k + " ***")
            }
        };
    e(a, "");
    return d.join("")
};
goog.debug.exposeArray = function (a) {
    for (var b = [], c = 0; c < a.length; c++) goog.isArray(a[c]) ? b.push(goog.debug.exposeArray(a[c])) : b.push(a[c]);
    return "[ " + b.join(", ") + " ]"
};
goog.debug.exposeException = function (a, b) {
    try {
        var c = goog.debug.normalizeErrorObject(a);
        return "Message: " + goog.string.htmlEscape(c.message) + '\nUrl: <a href="view-source:' + c.fileName + '" target="_new">' + c.fileName + "</a>\nLine: " + c.lineNumber + "\n\nBrowser stack:\n" + goog.string.htmlEscape(c.stack + "-> ") + "[end]\n\nJS stack traversal:\n" + goog.string.htmlEscape(goog.debug.getStacktrace(b) + "-> ")
    } catch (d) {
        return "Exception trying to expose exception! You win, we lose. " + d
    }
};
goog.debug.normalizeErrorObject = function (a) {
    var b = goog.getObjectByName("window.location.href");
    return "string" == typeof a ? {
        message: a,
        name: "Unknown error",
        lineNumber: "Not available",
        fileName: b,
        stack: "Not available"
    } : !a.lineNumber || !a.fileName || !a.stack ? {
        message: a.message,
        name: a.name,
        lineNumber: a.lineNumber || a.line || "Not available",
        fileName: a.fileName || a.filename || a.sourceURL || b,
        stack: a.stack || "Not available"
    } : a
};
goog.debug.enhanceError = function (a, b) {
    var c = "string" == typeof a ? Error(a) : a;
    c.stack || (c.stack = goog.debug.getStacktrace(arguments.callee.caller));
    if (b) {
        for (var d = 0; c["message" + d];)++d;
        c["message" + d] = "" + b
    }
    return c
};
goog.debug.getStacktraceSimple = function (a) {
    for (var b = [], c = arguments.callee.caller, d = 0; c && (!a || d < a);) {
        b.push(goog.debug.getFunctionName(c));
        b.push("()\n");
        try {
            c = c.caller
        } catch (e) {
            b.push("[exception trying to get caller]\n");
            break
        }
        d++;
        if (d >= goog.debug.MAX_STACK_DEPTH) {
            b.push("[...long stack...]");
            break
        }
    }
    a && d >= a ? b.push("[...reached max depth limit...]") : b.push("[end]");
    return b.join("")
};
goog.debug.MAX_STACK_DEPTH = 50;
goog.debug.getStacktrace = function (a) {
    return goog.debug.getStacktraceHelper_(a || arguments.callee.caller, [])
};
goog.debug.getStacktraceHelper_ = function (a, b) {
    var c = [];
    if (goog.array.contains(b, a)) c.push("[...circular reference...]");
    else if (a && b.length < goog.debug.MAX_STACK_DEPTH) {
        c.push(goog.debug.getFunctionName(a) + "(");
        for (var d = a.arguments, e = 0; e < d.length; e++) {
            0 < e && c.push(", ");
            var f;
            f = d[e];
            switch (typeof f) {
                case "object":
                    f = f ? "object" : "null";
                    break;
                case "string":
                    break;
                case "number":
                    f = "" + f;
                    break;
                case "boolean":
                    f = f ? "true" : "false";
                    break;
                case "function":
                    f = (f = goog.debug.getFunctionName(f)) ? f : "[fn]";
                    break;
                default:
                    f =
                        typeof f
            }
            40 < f.length && (f = f.substr(0, 40) + "...");
            c.push(f)
        }
        b.push(a);
        c.push(")\n");
        try {
            c.push(goog.debug.getStacktraceHelper_(a.caller, b))
        } catch (g) {
            c.push("[exception trying to get caller]\n")
        }
    } else a ? c.push("[...long stack...]") : c.push("[end]");
    return c.join("")
};
goog.debug.getFunctionName = function (a) {
    a = "" + a;
    if (!goog.debug.fnNameCache_[a]) {
        var b = /function ([^\(]+)/.exec(a);
        goog.debug.fnNameCache_[a] = b ? b[1] : "[Anonymous]"
    }
    return goog.debug.fnNameCache_[a]
};
goog.debug.makeWhitespaceVisible = function (a) {
    return a.replace(/ /g, "[_]").replace(/\f/g, "[f]").replace(/\n/g, "[n]\n").replace(/\r/g, "[r]").replace(/\t/g, "[t]")
};
goog.debug.fnNameCache_ = {};

goog.Disposable = class {
    constructor() {
        this.disposed_ = false;
    }

    isDisposed() {
        return this.disposed_
    };
    getDisposed() {
        return isDisposed();
    }
    dispose() {
        this.disposed_ || (this.disposed_ = true, this.disposeInternal())
    };
    disposeInternal() { };
};

goog.dispose = function (a) {
    a && "function" == typeof a.dispose && a.dispose()
};

goog.string.StringBuffer = function (a, b) {
    this.buffer_ = "";
    null != a && this.append.apply(this, arguments)
};
goog.string.StringBuffer.prototype.set = function (a) {
    this.clear();
    this.append(a)
};

goog.string.StringBuffer.prototype.append = function (a, b, c) {
    this.buffer_ += a;
    if (null != b)
        for (var d = 1; d < arguments.length; d++) this.buffer_ += arguments[d];
    return this
};
goog.string.StringBuffer.prototype.clear = function () {
    this.buffer_ = ""
};
goog.string.StringBuffer.prototype.getLength = function () {
    return this.toString().length
};
goog.string.StringBuffer.prototype.toString = function () {
    return this.buffer_
};

goog.reflect = {};
goog.reflect.object = function (a, b) {
    return b
};
goog.reflect.sinkValue = new Function("a", "return a");
goog.functions = {};
goog.functions.constant = function (a) {
    return function () {
        return a
    }
};
goog.functions.FALSE = goog.functions.constant(false);
goog.functions.TRUE = goog.functions.constant(true);
goog.functions.NULL = goog.functions.constant(null);
goog.functions.identity = function (a) {
    return a
};
goog.functions.error = function (a) {
    return function () {
        throw Error(a);
    }
};
goog.functions.lock = function (a) {
    return function () {
        return a.call(this)
    }
};
goog.functions.compose = function (a) {
    var b = arguments,
        c = b.length;
    return function () {
        var a;
        c && (a = b[c - 1].apply(this, arguments));
        for (var e = c - 2; 0 <= e; e--) a = b[e].call(this, a);
        return a
    }
};
goog.functions.sequence = function (a) {
    var b = arguments,
        c = b.length;
    return function () {
        for (var a, e = 0; e < c; e++) a = b[e].apply(this, arguments);
        return a
    }
};
goog.functions.and = function (a) {
    var b = arguments,
        c = b.length;
    return function () {
        for (var a = 0; a < c; a++)
            if (!b[a].apply(this, arguments)) return false;
        return true
    }
};
goog.functions.or = function (a) {
    var b = arguments,
        c = b.length;
    return function () {
        for (var a = 0; a < c; a++)
            if (b[a].apply(this, arguments)) return true;
        return false
    }
};
goog.functions.create = function (a, b) {
    var c = function () { };
    c.prototype = a.prototype;
    c = new c;
    a.apply(c, Array.prototype.slice.call(arguments, 1));
    return c
};

goog.debug.errorHandlerWeakDep = {
    protectEntryPoint: function (a) {
        return a
    }
};
goog.debug.entryPointRegistry = {};
goog.debug.EntryPointMonitor = function () { };
goog.debug.entryPointRegistry.refList_ = [];
goog.debug.entryPointRegistry.register = function (a) {
    goog.debug.entryPointRegistry.refList_[goog.debug.entryPointRegistry.refList_.length] = a
};
goog.debug.entryPointRegistry.monitorAll = function (a) {
    for (var a = goog.bind(a.wrap, a), b = 0; b < goog.debug.entryPointRegistry.refList_.length; b++) goog.debug.entryPointRegistry.refList_[b](a)
};
goog.debug.entryPointRegistry.unmonitorAllIfPossible = function (a) {
    for (var a = goog.bind(a.unwrap, a), b = 0; b < goog.debug.entryPointRegistry.refList_.length; b++) goog.debug.entryPointRegistry.refList_[b](a)
};

goog.events.EventWrapper = class {
    constructor() { }
    listen() { }
    unlisten() { }
};

goog.events.BrowserFeature = {
    HAS_W3C_BUTTON: !goog.userAgent.IE || goog.userAgent.isVersion("9"),
    SET_KEY_CODE_TO_PREVENT_DEFAULT: goog.userAgent.IE && !goog.userAgent.isVersion("8")
};

goog.events.Event = class extends goog.Disposable {
    constructor(a, b) {
        super();
        this.type = a;
        this.currentTarget = this.target = b;
    }
    static stopPropagation(a) {
        a.stopPropagation();
    }
    static preventDefault(a) {
        a.preventDefault();
    }
    disposeInternal() {
        delete this.type;
        delete this.target;
        delete this.currentTarget;
    }
};
goog.events.Event.prototype.propagationStopped_ = false;
goog.events.Event.prototype.returnValue_ = true;
goog.events.Event.prototype.stopPropagation = function () {
    this.propagationStopped_ = true
};
goog.events.Event.prototype.preventDefault = function () {
    this.returnValue_ = false
};

goog.events.BrowserEvent = class extends goog.events.Event {
    constructor(a, b) {
        super(a, b);
        a && this.init(a, b);
    }
    init(a, b) {
        var c = this.type = a.type;
        this.target = a.target || a.srcElement;
        this.currentTarget = b;
        var d = a.relatedTarget;
        if (d) {
            if (goog.userAgent.GECKO) try {
                goog.reflect.sinkValue(d.nodeName);
            } catch (e) {
                d = null;
            }
        } else c == goog.events.EventType.MOUSEOVER ? d = a.fromElement : c == goog.events.EventType.MOUSEOUT && (d = a.toElement);
        this.relatedTarget = d;
        this.offsetX = undefined !== a.offsetX ? a.offsetX : a.layerX;
        this.offsetY = undefined !== a.offsetY ? a.offsetY : a.layerY;
        this.clientX = undefined !== a.clientX ?
            a.clientX : a.pageX;
        this.clientY = undefined !== a.clientY ? a.clientY : a.pageY;
        this.screenX = a.screenX || 0;
        this.screenY = a.screenY || 0;
        this.button = a.button;
        this.keyCode = a.keyCode || 0;
        this.charCode = a.charCode || ("keypress" == c ? a.keyCode : 0);
        this.ctrlKey = a.ctrlKey;
        this.altKey = a.altKey;
        this.shiftKey = a.shiftKey;
        this.metaKey = a.metaKey;
        this.platformModifierKey = goog.userAgent.MAC ? a.metaKey : a.ctrlKey;
        this.state = a.state;
        this.event_ = a;
        delete this.returnValue_;
        delete this.propagationStopped_;
    }
    stopPropagation() {
        super.stopPropagation();
        this.event_.stopPropagation ? this.event_.stopPropagation() : this.event_.cancelBubble = true;
    }
    preventDefault() {
        super.preventDefault();
        var a = this.event_;
        if (a.preventDefault) a.preventDefault();
        else if (a.returnValue = false, goog.events.BrowserFeature.SET_KEY_CODE_TO_PREVENT_DEFAULT) try {
            if (a.ctrlKey || 112 <= a.keyCode && 123 >= a.keyCode) a.keyCode = -1;
        } catch (b) { }
    }
    getBrowserEvent() {
        return this.event_;
    }
    disposeInternal() {
        super.disposeInternal();
        this.relatedTarget = this.currentTarget = this.target = this.event_ = null;
    }
};

goog.events.BrowserEvent.MouseButton = {
    LEFT: 0,
    MIDDLE: 1,
    RIGHT: 2
};
goog.events.BrowserEvent.IEButtonMap = [1, 4, 2];
goog.events.BrowserEvent.prototype.target = null;
goog.events.BrowserEvent.prototype.relatedTarget = null;
goog.events.BrowserEvent.prototype.offsetX = 0;
goog.events.BrowserEvent.prototype.offsetY = 0;
goog.events.BrowserEvent.prototype.clientX = 0;
goog.events.BrowserEvent.prototype.clientY = 0;
goog.events.BrowserEvent.prototype.screenX = 0;
goog.events.BrowserEvent.prototype.screenY = 0;
goog.events.BrowserEvent.prototype.button = 0;
goog.events.BrowserEvent.prototype.keyCode = 0;
goog.events.BrowserEvent.prototype.charCode = 0;
goog.events.BrowserEvent.prototype.ctrlKey = false;
goog.events.BrowserEvent.prototype.altKey = false;
goog.events.BrowserEvent.prototype.shiftKey = false;
goog.events.BrowserEvent.prototype.metaKey = false;
goog.events.BrowserEvent.prototype.platformModifierKey = false;
goog.events.BrowserEvent.prototype.event_ = null;

goog.events.Listener = class {
    constructor() { }
    init(a, b, c, d, e, f) {
        if (goog.isFunction(a)) this.isFunctionListener_ = true;
        else if (a && a.handleEvent && goog.isFunction(a.handleEvent)) this.isFunctionListener_ = false;
        else throw Error("Invalid listener argument");
        this.listener = a;
        this.proxy = b;
        this.src = c;
        this.type = d;
        this.capture = !!e;
        this.handler = f;
        this.callOnce = false;
        this.key = ++goog.events.Listener.counter_;
        this.removed = false;
    }
    handleEvent(a) {
        return this.isFunctionListener_ ? this.listener.call(this.handler || this.src, a) : this.listener.handleEvent.call(this.listener, a);
    }
};

goog.events.Listener.counter_ = 0;
goog.events.Listener.prototype.key = 0;
goog.events.Listener.prototype.removed = false;
goog.events.Listener.prototype.callOnce = false;

goog.structs.SimplePool = class extends goog.Disposable {
    constructor(a, b) {
        super();
        this.maxCount_ = b;
        this.freeQueue_ = [];
        this.createInitial_(a);
    }
    setCreateObjectFn(a) {
        this.createObjectFn_ = a;
    }
    setDisposeObjectFn(a) {
        this.disposeObjectFn_ = a;
    }
    getObject() {
        return this.freeQueue_.length ? this.freeQueue_.pop() : this.createObject();
    }
    releaseObject(a) {
        this.freeQueue_.length < this.maxCount_ ? this.freeQueue_.push(a) : this.disposeObject(a);
    }
    createInitial_(a) {
        if (a > this.maxCount_) throw Error("[goog.structs.SimplePool] Initial cannot be greater than max");
        for (var b = 0; b < a; b++) this.freeQueue_.push(this.createObject());
    }
    createObject() {
        return this.createObjectFn_ ? this.createObjectFn_() : {};
    }
    disposeObject(a) {
        if (this.disposeObjectFn_) this.disposeObjectFn_(a);
        else if (goog.isObject(a))
            if (goog.isFunction(a.dispose)) a.dispose();
            else for (var b in a) delete a[b];
    }
    disposeInternal() {
        super.disposeInternal();
        for (var a = this.freeQueue_; a.length;) this.disposeObject(a.pop());
        delete this.freeQueue_;
    }
};
goog.structs.SimplePool.prototype.createObjectFn_ = null;
goog.structs.SimplePool.prototype.disposeObjectFn_ = null;

goog.events.pools = {};
(function () {
    var g;
    goog.events.pools.setProxyCallbackFunction = function (a) {
        g = a
    };

    goog.events.pools.getObject = function() {
        return {
            count_: 0,
            remaining_: 0
        }
    }
    goog.events.pools.releaseObject = goog.nullFunction;
    goog.events.pools.getArray = function () {
        return []
    }
    goog.events.pools.releaseArray = goog.nullFunction;
    goog.events.pools.getProxy = function() {
        var a = function (b) {
            return g.call(a.src, a.key, b)
        };
        return a
    }
    goog.events.pools.releaseProxy = goog.nullFunction;
    goog.events.pools.getListener =  function () {
        return new goog.events.Listener
    };
    goog.events.pools.releaseListener = goog.nullFunction;
    goog.events.pools.getEvent = function () {
        return new goog.events.BrowserEvent
    };
    goog.events.pools.releaseEvent = goog.nullFunction;
})();
goog.events.listeners_ = {};
goog.events.listenerTree_ = {};
goog.events.sources_ = {};
goog.events.onString_ = "on";
goog.events.onStringMap_ = {};
goog.events.keySeparator_ = "_";
goog.events.listen = function (a, b, c, d, e) {
    if (b) {
        if (goog.isArray(b)) {
            for (var f = 0; f < b.length; f++) goog.events.listen(a, b[f], c, d, e);
            return null
        }
        var d = !!d,
            g = goog.events.listenerTree_;
        b in g || (g[b] = goog.events.pools.getObject());
        g = g[b];
        d in g || (g[d] = goog.events.pools.getObject(), g.count_++);
        var g = g[d],
            h = goog.getUid(a),
            j;
        g.remaining_++;
        if (g[h]) {
            j = g[h];
            for (f = 0; f < j.length; f++)
                if (g = j[f], g.listener == c && g.handler == e) {
                    if (g.removed) break;
                    return j[f].key
                }
        } else j = g[h] = goog.events.pools.getArray(), g.count_++;
        f = goog.events.pools.getProxy();
        f.src = a;
        g = goog.events.pools.getListener();
        g.init(c, f, a, b, d, e);
        c = g.key;
        f.key = c;
        j.push(g);
        goog.events.listeners_[c] = g;
        goog.events.sources_[h] || (goog.events.sources_[h] = goog.events.pools.getArray());
        goog.events.sources_[h].push(g);
        a.addEventListener ? (a == document || !a.customEvent_) && a.addEventListener(b, f, d) : a.attachEvent(goog.events.getOnString_(b), f);
        return c
    }
    throw Error("Invalid event type");
};
goog.events.listenOnce = function (a, b, c, d, e) {
    if (goog.isArray(b)) {
        for (var f = 0; f < b.length; f++) goog.events.listenOnce(a, b[f], c, d, e);
        return null
    }
    a = goog.events.listen(a, b, c, d, e);
    goog.events.listeners_[a].callOnce = true;
    return a
};
goog.events.listenWithWrapper = function (a, b, c, d, e) {
    b.listen(a, c, d, e)
};
goog.events.unlisten = function (a, b, c, d, e) {
    if (goog.isArray(b)) {
        for (var f = 0; f < b.length; f++) goog.events.unlisten(a, b[f], c, d, e);
        return null
    }
    d = !!d;
    a = goog.events.getListeners_(a, b, d);
    if (!a) return false;
    for (f = 0; f < a.length; f++)
        if (a[f].listener == c && a[f].capture == d && a[f].handler == e) return goog.events.unlistenByKey(a[f].key);
    return false
};
goog.events.unlistenByKey = function (a) {
    if (!goog.events.listeners_[a]) return false;
    var b = goog.events.listeners_[a];
    if (b.removed) return false;
    var c = b.src,
        d = b.type,
        e = b.proxy,
        f = b.capture;
    c.removeEventListener ? (c == document || !c.customEvent_) && c.removeEventListener(d, e, f) : c.detachEvent && c.detachEvent(goog.events.getOnString_(d), e);
    c = goog.getUid(c);
    e = goog.events.listenerTree_[d][f][c];
    if (goog.events.sources_[c]) {
        var g = goog.events.sources_[c];
        goog.array.remove(g, b);
        0 == g.length && delete goog.events.sources_[c]
    }
    b.removed = true;
    e.needsCleanup_ = true;
    goog.events.cleanUp_(d, f, c, e);
    delete goog.events.listeners_[a];
    return true
};
goog.events.unlistenWithWrapper = function (a, b, c, d, e) {
    b.unlisten(a, c, d, e)
};
goog.events.cleanUp_ = function (a, b, c, d) {
    if (!d.locked_ && d.needsCleanup_) {
        for (var e = 0, f = 0; e < d.length; e++)
            if (d[e].removed) {
                var g = d[e].proxy;
                g.src = null;
                goog.events.pools.releaseProxy(g);
                goog.events.pools.releaseListener(d[e])
            } else e != f && (d[f] = d[e]), f++;
        d.length = f;
        d.needsCleanup_ = false;
        if (0 == f && (goog.events.pools.releaseArray(d), delete goog.events.listenerTree_[a][b][c], goog.events.listenerTree_[a][b].count_--, 0 == goog.events.listenerTree_[a][b].count_ && (goog.events.pools.releaseObject(goog.events.listenerTree_[a][b]),
            delete goog.events.listenerTree_[a][b], goog.events.listenerTree_[a].count_--), 0 == goog.events.listenerTree_[a].count_)) goog.events.pools.releaseObject(goog.events.listenerTree_[a]), delete goog.events.listenerTree_[a]
    }
};
goog.events.removeAll = function (a, b, c) {
    var d = 0,
        e = null == b,
        f = null == c,
        c = !!c;
    if (null == a) goog.object.forEach(goog.events.sources_, function (a) {
        for (var g = a.length - 1; 0 <= g; g--) {
            var h = a[g];
            if ((e || b == h.type) && (f || c == h.capture)) goog.events.unlistenByKey(h.key), d++
        }
    });
    else if (a = goog.getUid(a), goog.events.sources_[a])
        for (var a = goog.events.sources_[a], g = a.length - 1; 0 <= g; g--) {
            var h = a[g];
            if ((e || b == h.type) && (f || c == h.capture)) goog.events.unlistenByKey(h.key), d++
        }
    return d
};
goog.events.getListeners = function (a, b, c) {
    return goog.events.getListeners_(a, b, c) || []
};
goog.events.getListeners_ = function (a, b, c) {
    var d = goog.events.listenerTree_;
    return b in d && (d = d[b], c in d && (d = d[c], a = goog.getUid(a), d[a])) ? d[a] : null
};
goog.events.getListener = function (a, b, c, d, e) {
    d = !!d;
    if (a = goog.events.getListeners_(a, b, d))
        for (b = 0; b < a.length; b++)
            if (a[b].listener == c && a[b].capture == d && a[b].handler == e) return a[b];
    return null
};
goog.events.hasListener = function (a, b, c) {
    var a = goog.getUid(a),
        d = goog.events.sources_[a];
    if (d) {
        var e = goog.isDef(b),
            f = goog.isDef(c);
        return e && f ? (d = goog.events.listenerTree_[b], !!d && !!d[c] && a in d[c]) : !e && !f ? true : goog.array.some(d, function (a) {
            return e && a.type == b || f && a.capture == c
        })
    }
    return false
};
goog.events.expose = function (a) {
    var b = [],
        c;
    for (c in a) a[c] && a[c].id ? b.push(c + " = " + a[c] + " (" + a[c].id + ")") : b.push(c + " = " + a[c]);
    return b.join("\n")
};
goog.events.getOnString_ = function (a) {
    return a in goog.events.onStringMap_ ? goog.events.onStringMap_[a] : goog.events.onStringMap_[a] = goog.events.onString_ + a
};
goog.events.fireListeners = function (a, b, c, d) {
    var e = goog.events.listenerTree_;
    return b in e && (e = e[b], c in e) ? goog.events.fireListeners_(e[c], a, b, c, d) : true
};
goog.events.fireListeners_ = function (a, b, c, d, e) {
    var f = 1,
        b = goog.getUid(b);
    if (a[b]) {
        a.remaining_--;
        a = a[b];
        a.locked_ ? a.locked_++ : a.locked_ = 1;
        try {
            for (var g = a.length, h = 0; h < g; h++) {
                var j = a[h];
                j && !j.removed && (f &= false !== goog.events.fireListener(j, e))
            }
        } finally {
            a.locked_--, goog.events.cleanUp_(c, d, b, a)
        }
    }
    return Boolean(f)
};
goog.events.fireListener = function (a, b) {
    var c = a.handleEvent(b);
    a.callOnce && goog.events.unlistenByKey(a.key);
    return c
};
goog.events.getTotalListenerCount = function () {
    return goog.object.getCount(goog.events.listeners_)
};
goog.events.dispatchEvent = function (a, b) {
    if (goog.isString(b)) b = new goog.events.Event(b, a);
    else if (b instanceof goog.events.Event) b.target = b.target || a;
    else {
        var c = b,
            b = new goog.events.Event(b.type, a);
        goog.object.extend(b, c)
    }
    var c = 1,
        d, e = b.type,
        f = goog.events.listenerTree_;
    if (!(e in f)) return true;
    var f = f[e],
        e = true in f,
        g;
    if (e) {
        d = [];
        for (g = a; g; g = g.getParentEventTarget()) d.push(g);
        g = f[true];
        g.remaining_ = g.count_;
        for (var h = d.length - 1; !b.propagationStopped_ && 0 <= h && g.remaining_; h--) b.currentTarget = d[h], c &= goog.events.fireListeners_(g,
            d[h], b.type, true, b) && false != b.returnValue_
    }
    if (false in f)
        if (g = f[false], g.remaining_ = g.count_, e)
            for (h = 0; !b.propagationStopped_ && h < d.length && g.remaining_; h++) b.currentTarget = d[h], c &= goog.events.fireListeners_(g, d[h], b.type, false, b) && false != b.returnValue_;
        else
            for (d = a; !b.propagationStopped_ && d && g.remaining_; d = d.getParentEventTarget()) b.currentTarget = d, c &= goog.events.fireListeners_(g, d, b.type, false, b) && false != b.returnValue_;
    return Boolean(c)
};
goog.events.protectBrowserEventEntryPoint = function (a) {
    goog.events.handleBrowserEvent_ = a.protectEntryPoint(goog.events.handleBrowserEvent_);
    goog.events.pools.setProxyCallbackFunction(goog.events.handleBrowserEvent_)
};
goog.events.handleBrowserEvent_ = function (a, b) {
    if (!goog.events.listeners_[a]) return true;
    var c = goog.events.listeners_[a],
        d = c.type,
        e = goog.events.listenerTree_;
    if (!(d in e)) return true;
    var e = e[d],
        f, g;
    if (goog.events.synthesizeEventPropagation_()) {
        f = b || goog.getObjectByName("window.event");
        var h = true in e,
            j = false in e;
        if (h) {
            if (goog.events.isMarkedIeEvent_(f)) return true;
            goog.events.markIeEvent_(f)
        }
        var k = goog.events.pools.getEvent();
        k.init(f, this);
        f = true;
        try {
            if (h) {
                for (var l = goog.events.pools.getArray(), n = k.currentTarget; n; n =
                    n.parentNode) l.push(n);
                g = e[true];
                g.remaining_ = g.count_;
                for (var m = l.length - 1; !k.propagationStopped_ && 0 <= m && g.remaining_; m--) k.currentTarget = l[m], f &= goog.events.fireListeners_(g, l[m], d, true, k);
                if (j) {
                    g = e[false];
                    g.remaining_ = g.count_;
                    for (m = 0; !k.propagationStopped_ && m < l.length && g.remaining_; m++) k.currentTarget = l[m], f &= goog.events.fireListeners_(g, l[m], d, false, k)
                }
            } else f = goog.events.fireListener(c, k)
        } finally {
            l && (l.length = 0, goog.events.pools.releaseArray(l)), k.dispose(), goog.events.pools.releaseEvent(k)
        }
        return f
    }
    d = new goog.events.BrowserEvent(b, this);
    try {
        f = goog.events.fireListener(c, d)
    } finally {
        d.dispose()
    }
    return f
};
goog.events.pools.setProxyCallbackFunction(goog.events.handleBrowserEvent_);
goog.events.markIeEvent_ = function (a) {
    var b = false;
    if (0 == a.keyCode) try {
        a.keyCode = -1;
        return
    } catch (c) {
        b = true
    }
    if (b || undefined == a.returnValue) a.returnValue = true
};
goog.events.isMarkedIeEvent_ = function (a) {
    return 0 > a.keyCode || undefined != a.returnValue
};
goog.events.uniqueIdCounter_ = 0;
goog.events.getUniqueId = function (a) {
    return a + "_" + goog.events.uniqueIdCounter_++
};
goog.events.synthesizeEventPropagation_ = function () {
    undefined === goog.events.requiresSyntheticEventPropagation_ && (goog.events.requiresSyntheticEventPropagation_ = goog.userAgent.IE && !document.addEventListener);
    return goog.events.requiresSyntheticEventPropagation_
};

goog.events.EventTarget = class extends goog.Disposable {
    constructor() {
        super();
    }
    getParentEventTarget() {
        return this.parentEventTarget_;
    }
    setParentEventTarget(a) {
        this.parentEventTarget_ = a;
    }
    addEventListener(a, b, c, d) {
        goog.events.listen(this, a, b, c, d);
    }
    removeEventListener(a, b, c, d) {
        goog.events.unlisten(this, a, b, c, d);
    }
    dispatchEvent(a) {
        return goog.events.dispatchEvent(this, a);
    }
    disposeInternal() {
        super.disposeInternal();
        goog.events.removeAll(this);
        this.parentEventTarget_ = null;
    }
};
goog.events.EventTarget.prototype.customEvent_ = true;
goog.events.EventTarget.prototype.parentEventTarget_ = null;

goog.events.EventHandler = class extends goog.Disposable {
    constructor(a) {
        super();
        this.handler_ = a;
    }
    listen(a, b, c, d, e) {
        goog.isArray(b) || (goog.events.EventHandler.typeArray_[0] = b, b = goog.events.EventHandler.typeArray_);
        for (var f = 0; f < b.length; f++) this.recordListenerKey_(goog.events.listen(a, b[f], c || this, d || false, e || this.handler_ || this));
        return this;
    }
    listenOnce(a, b, c, d, e) {
        if (goog.isArray(b))
            for (var f = 0; f < b.length; f++) this.listenOnce(a, b[f], c, d, e);
        else this.recordListenerKey_(goog.events.listenOnce(a, b, c || this, d || false, e || this.handler_ || this));
        return this;
    }
    listenWithWrapper(a, b, c, d, e) {
        b.listen(a, c, d, e || this.handler_, this);
        return this;
    }
    recordListenerKey_(a) {
        this.keys_ ? this.keys_[a] = true : this.key_ ? (this.keys_ = goog.events.EventHandler.keyPool_.getObject(), this.keys_[this.key_] = true, this.key_ = null, this.keys_[a] = true) : this.key_ = a;
    }
    unlisten(a, b, c, d, e) {
        if (this.key_ || this.keys_)
            if (goog.isArray(b))
                for (var f = 0; f < b.length; f++) this.unlisten(a, b[f], c, d, e);
            else if (a = goog.events.getListener(a, b, c || this, d || false, e || this.handler_ || this)) a = a.key, goog.events.unlistenByKey(a), this.keys_ ? goog.object.remove(this.keys_, a) : this.key_ == a && (this.key_ = null);
        return this;
    }
    unlistenWithWrapper(a, b, c, d, e) {
        b.unlisten(a, c, d, e || this.handler_, this);
        return this;
    }
    removeAll() {
        if (this.keys_) {
            for (var a in this.keys_) goog.events.unlistenByKey(a), delete this.keys_[a];
            goog.events.EventHandler.keyPool_.releaseObject(this.keys_);
            this.keys_ = null;
        } else this.key_ && goog.events.unlistenByKey(this.key_);
    }
    disposeInternal() {
        super.disposeInternal();
        this.removeAll();
    }
    handleEvent() {
        throw Error("EventHandler.handleEvent not implemented");
    }
};
goog.events.EventHandler.KEY_POOL_INITIAL_COUNT = 0;
goog.events.EventHandler.KEY_POOL_MAX_COUNT = 100;
goog.events.EventHandler.keyPool_ = new goog.structs.SimplePool(goog.events.EventHandler.KEY_POOL_INITIAL_COUNT, goog.events.EventHandler.KEY_POOL_MAX_COUNT);
goog.events.EventHandler.keys_ = null;
goog.events.EventHandler.key_ = null;
goog.events.EventHandler.typeArray_ = [];

(function () {
    class InputController extends goog.events.EventTarget {
        constructor(preventDefault = false) {
            super();
            this.handler = new goog.events.EventHandler(this);
            this.preventDefault = preventDefault;

            this.handler.listen(document, "keydown", this.onKeyDown);

            if (!goog.userAgent.ASSUME_IE) {
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
                    case 90: x = -accel.y; y = accel.y; break;
                    case -90: x = accel.y;  y = accel.y; break;
                    case 180: x = -accel.x; y = accel.y; break;
                }

                let gamma = event.gamma || 57 * event.x || 2 * x;
                let beta  = event.beta  || 57 * event.y || 2 * y;

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

                    if (deltaX > 5)       { intensity = (deltaX - 5) / 10; direction = 4; } // right
                    else if (deltaX < -5) { intensity = (-deltaX - 5) / 10; direction = 3; } // left

                    if (Math.abs(deltaY) > Math.abs(deltaX)) {
                        if (deltaY > 5)       { intensity = (deltaY - 5) / 10; direction = 2; } // down
                        else if (deltaY < -5) { intensity = (-deltaY - 5) / 10; direction = 1; } // up
                    }

                    if (intensity > 0 && direction) {
                        this.dispatchEvent(new DirectionEvent(direction));
                    }
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

        dispose() {
            super.dispose();
            this.handler.dispose();
            this.handler = null;

            if (!goog.userAgent.ASSUME_IE) {
                window.removeEventListener("deviceorientation", this.onMotion, true);
                window.removeEventListener("MozOrientation", this.onMotion, true);
                window.removeEventListener("devicemotion", this.onMotion, true);
            }
        }
    }

    var KeyToDirection = {
        ArrowLeft: 3,
        ArrowUp: 1,
        ArrowRight: 4,
        ArrowDown: 2,
        W: 1,
        S: 2,
        A: 3,
        D: 4
    };

    class DirectionEvent extends goog.events.Event {
        constructor(direction) {
            super("input");
            this.direction = direction; // 1=up, 2=down, 3=left, 4=right
        }
    }

    var xb = function (a) {
        switch (a) {
            case 1:
                return 2;
            case 2:
                return 1;
            case 3:
                return 4;
            case 4:
                return 3
        }
    };

    // Vendor prefixes commonly used by browsers
    const vendorPrefixes = ["Moz", "ms", "O", "webkit"];
    const vendorPrefixesLower = ["", "moz", "ms", "o", "webkit"];

    /**
     * Finds the correct vendor-prefixed property name supported by the browser.
     * Example: Ab("hidden") → "hidden" or "webkitHidden"
     */
    function getVendorPropertyName(property) {
        const doc = document;
        if (!doc) return null;

        for (let i = 0; i < vendorPrefixesLower.length; i++) {
            let prefix = vendorPrefixesLower[i];
            let candidate = property;

            if (prefix.length > 0) {
                // Capitalize first letter for camelCase vendor properties
                candidate = prefix + property.charAt(0).toUpperCase() + property.slice(1);
            }

            // Return the first supported property name
            if (typeof doc[candidate] !== undefined) return candidate;
        }

        return null;
    }

    /**
     * Finds the correct `requestAnimationFrame` implementation (with vendor prefixes),
     * or falls back to `setTimeout` at ~60 FPS if unavailable.
     */
    function getRequestAnimationFrame() {
        const names = [
            "requestAnimationFrame",
            "mozRequestAnimationFrame",
            "msRequestAnimationFrame",
            "oRequestAnimationFrame",
            "webkitRequestAnimationFrame"
        ];

        for (let i = 0; i < names.length; i++) {
            const raf = window[names[i]];
            if (raf) return raf.bind(window);
        }

        // Fallback: emulate ~60fps (1000ms / 60 ≈ 16.7ms)
        return function(callback) {
            window.setTimeout(callback, 17);
        };
    }

    /**
     * Cross-browser animation frame wrapper.
     * Once the first call determines the correct implementation, it replaces itself for speed.
     */
    function requestAnimFrame(callback) {
        requestAnimFrame = getRequestAnimationFrame();
        return requestAnimFrame(callback);
    }

    function getTime() {
        return new Date().getTime()
    }

    /**
     * ConditionalTrigger executes a callback when a condition becomes true.
     * It supports optional delay and one-time trigger modes.
     */
    class ConditionalTrigger {
        /**
         * @param {Function} conditionFn - Function that returns true when the condition is met.
         * @param {Function} onTriggerFn - Function to call when triggered.
         * @param {boolean} [singleUse=false] - If true, trigger only once.
         * @param {number} [cooldown=0] - Minimum time (ms) between triggers if not single-use.
         */
        constructor(conditionFn, onTriggerFn, singleUse = false, cooldown = 0) {
            this.conditionFn = conditionFn;   // Function to check
            this.onTriggerFn = onTriggerFn;   // Callback to fire
            this.triggered = false;           // Has been triggered already
            this.singleUse = singleUse;       // True = one-time trigger
            this.cooldown = cooldown;         // Delay between triggers
            this.lastTriggerTime = 0;         // Timestamp of last trigger
        }

        /**
         * Checks the condition and fires the callback if appropriate.
         */
        update() {
            const now = getTime();

            const readyToTrigger =
                // If single-use, only if not already triggered
                !(this.singleUse && this.triggered)
                // If repeating, only after cooldown has passed
                && (this.singleUse || now - this.lastTriggerTime > this.cooldown);

            if (readyToTrigger && this.conditionFn()) {
                this.onTriggerFn();
                this.triggered = true;
                this.lastTriggerTime = now;
            }
        }
    }

    class AnimationSequence {
        constructor() {
            this.startTime = 0;
            this.currentIndex = 0;
            this.intervalId = 0;
            this.steps = [];
        }

        // Checks if animation is currently running
        isPlaying() {
            return !!this.intervalId;
        }

        // Starts playback of all animation steps in sequence
        play() {
            if (window.isAnimationPaused) return;

            this.stop();
            this.currentIndex = 0;
            this.startTime = getTime();
            this.intervalId = window.setInterval(this.update, 16); // ~60fps
            this.update();
        }

        // Stops the animation and finalizes all remaining steps
        stop() {
            if (this.intervalId) {
                let step;
                while ((step = this.steps[this.currentIndex++])) {
                    step.update(1);
                }
                window.clearInterval(this.intervalId);
                this.intervalId = 0;
            }
        }

        // Called every frame
        update() {
            const now = getTime();

            if (window.isAnimationPaused) return;

            let step;
            while ((step = this.steps[this.currentIndex])) {
                const elapsed = now - this.startTime;

                if (elapsed < step.duration) {
                    step.update(elapsed / step.duration);
                    return; // wait until next frame
                }

                step.update(1); // complete this step
                if (step.duration > 0) this.startTime += step.duration;

                this.currentIndex++;
            }

            this.stop(); // all done
        }

        // Add a step (duration in ms, update callback)
        addStep(callback, duration = 0) {
            this.steps.push({ duration, update: callback });
        }

        addPauseStep(duration) {
            this.addStep(() => {}, duration);
        }
    }

    /**
     * Creates an opacity animator function.
     * @param {HTMLElement} element - Target element.
     * @param {number} start - Starting opacity (0–1).
     * @param {number} end - Ending opacity (0–1).
     * @returns {Function} - Function(progress) that updates opacity.
     */
    function createOpacityAnimator(element, start, end) {
        const ease = (progress) => progress;
        element.style.opacity = String(start);

        const shouldRound = Math.abs(end - start) > 1;
        return function updateOpacity(progress) {
            let value = start + ease(progress) * (end - start);
            if (shouldRound) value = Math.ceil(value);
            element.style.opacity = String(value);
            return value;
        };
    }

    class VisibilityTimer extends goog.Disposable {
        constructor(timeoutMs, onVisible, onHidden) {
            super();
            this.timeoutMs = timeoutMs;    // How long to wait (in ms)
            this.onVisible = onVisible;    // Callback when the page becomes visible
            this.onHidden = onHidden;      // Callback when the page becomes hidden

            this.hasTriggered = false;
            this.isHidden = false;
            this.startTime = getTime();
            this.hiddenProp = getVendorPropertyName("hidden");
            this.visibilityStateProp = getVendorPropertyName("visibilityState");

            // Determine the visibility change event name
            this.visibilityChangeEvent = this.visibilityStateProp
                ? this.visibilityStateProp.replace(/state$/i, "change").toLowerCase()
                : null;

            // Listen to document visibility changes
            if (this.visibilityChangeEvent) {
                var listener = new goog.events.EventHandler(this);
                listener.listen(document, this.visibilityChangeEvent);
            }

            // Start initial timer
            this.scheduleCheck();
        }

        dispose() {
            window.clearTimeout(this.timer);
            super.dispose();
        }

        // Called when timer interval passes
        checkVisibility() {
            this.timer = null;
            // True if enough time has passed
            this.isHidden = getTime() - this.startTime >= this.timeoutMs;
            this.updateCallbacks();
        }

        // Schedule next visibility check
        scheduleCheck() {
            if (this.timer) window.clearTimeout(this.timer);
            const remaining = Math.max(100, this.timeoutMs - (getTime() - this.startTime));
            this.timer = window.setTimeout(this.checkVisibility, remaining);
        }

        // Called when visibility changes
        onVisibilityChange() {
            const state = document[this.visibilityStateProp];
            this.isHidden = document[this.hiddenProp] || state === "hidden";
            if (this.isHidden) {
                this.updateCallbacks();
            } else {
                this.resetTimer();
            }
        }

        // Update which callback should fire
        updateCallbacks() {
            const condition = this.isHidden || this.hasTriggered;
            if (this.hasTriggered && !condition) {
                this.hasTriggered = false;
                this.onHidden();
                this.scheduleCheck();
            } else if (!this.hasTriggered && condition) {
                this.hasTriggered = true;
                this.onVisible();
            }
        }

        // Reset time tracking
        resetTimer() { // Mb
            this.startTime = getTime();
            this.hasTriggered = false;
            this.updateCallbacks();
        }
    }

    function random(a) {
        return Math.floor(Math.random() * a)
    }

    class Point {
        constructor(x, y) {
            // `g` likely means undefined or null in the original code.
            // So if x or y are not provided, default to 0.
            this.x = (typeof x !== undefined) ? x : 0;
            this.y = (typeof y !== undefined) ? y : 0;
        }

        /** Returns a clone (copy) of this point. */
        clone() {
            return new Point(this.x, this.y);
        }

        /** Returns a string like "(x, y)". */
        toString() {
            return `(${this.x}, ${this.y})`;
        }

        /** Rounds x and y upward to the next integer. */
        ceil() {
            this.x = Math.ceil(this.x);
            this.y = Math.ceil(this.y);
            return this;
        }

        /** Rounds x and y downward to the previous integer. */
        floor() {
            this.x = Math.floor(this.x);
            this.y = Math.floor(this.y);
            return this;
        }

        /** Rounds x and y to the nearest integer. */
        round() {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            return this;
        }

        /**
         * Scales x and y by given factors.
         * If only one argument is provided, scales both coordinates equally.
         * @param {number} scaleX
         * @param {number} [scaleY]
         */
        scale(scaleX, scaleY) {
            this.x *= scaleX;
            this.y *= (typeof scaleY === "number") ? scaleY : scaleX;
            return this;
        }
    }

    // Utility: Add class(es)
    function addClass(el, ...classes) {
        const existing = (el.className.match(/\S+/g) || []);
        for (const cls of classes) {
            if (!existing.includes(cls)) existing.push(cls);
        }
        el.className = existing.join(" ");
    }

    // Utility: Set position
    function setPosition(el, x, y) {
        el.style.left = `${Math.round(x)}px`;
        el.style.top = `${Math.round(y)}px`;
    }

    // Utility: Set opacity cross-browser
    function setOpacity(el, value) {
        const s = el.style;
        if ('opacity' in s) s.opacity = value;
        else if ('MozOpacity' in s) s.MozOpacity = value;
        else if ('filter' in s) s.filter = value === "" ? "" : `alpha(opacity=${value * 100})`;
    }

    // Playlist base class
    class Playlist {
        constructor() {
            this.tracks = [];
            this.index = 0;
            this.ready = false;
            this.playing = false;
        }

        reset() {
            this.tracks = [];
            this.index = 0;
            this.ready = this.playing = false;
        }

        next(loop = false) {
            this.index++;
            if (this.index >= this.tracks.length) this.index = loop ? 0 : this.tracks.length - 1;
            this.load();
        }
    }

    // HTML5 audio player subclass
    class AudioPlayer extends Playlist {
        constructor(tracks) {
            super();
            this.tracks = tracks;
            this.container = document.body;
            this.audio = null;
            this.onReady = null;
            this.onEnd = null;
        }

        load(onReady, onEnd) {
            this.onReady = onReady;
            this.onEnd = onEnd;

            if (this.audio) this.container.removeChild(this.audio);

            const audio = document.createElement("audio");
            audio.preload = "auto";
            audio.controls = false;
            audio.style.display = "none";

            const track = this.tracks[this.index];
            for (const { vd, type } of [
                { vd: ".mp3", type: "audio/mpeg" },
                { vd: ".ogg", type: "audio/ogg" }
            ]) {
                const source = document.createElement("source");
                source.src = track + vd;
                source.type = type;
                audio.appendChild(source);
            }

            goog.events.listen(audio, "canplay", () => {
                this.ready = true;
                if (this.onReady) this.onReady();
            }, false, this);

            goog.events.listen(audio, "ended", () => {
                this.playing = false;
                if (this.onEnd) this.onEnd();
            });

            this.container.appendChild(audio);
            this.audio = audio;
        }

        play() {
            if (this.ready && !this.playing) {
                this.audio.play();
                this.playing = true;
            }
        }

        pause() {
            if (this.playing) {
                this.audio.pause();
                this.playing = false;
            }
        }

        currentTime() {
            return this.playing ? this.audio.currentTime : 0;
        }
    }

    /**
     * ImageLoader class — loads an image and notifies listeners when ready.
     * @param {string} src - The image URL to load.
     */
    class ImageLoader {
        constructor(src) {
            this.src = src;       // Image source path
            this.loaded = false;  // Whether the image is loaded
            this.callbacks = [];  // Functions to call when image is loaded
            this.image = new Image();
        }

        /**
         * Start loading the image (if not already started).
         * When loaded, runs all registered callbacks.
         */
        load() {
            // Only run if image hasn't been loaded yet
            if (!this.image.src) {
                const onLoad = (() => {
                    if (!this.loaded) {
                        this.loaded = true;
                        // Call all queued callbacks
                        for (const callback of this.callbacks) {
                            callback();
                        }
                    }
                });

                this.image.onload = onLoad;
                this.image.src = this.src;

                // Handle cases where image was cached
                if (this.image.complete || document.readyState === "complete") {
                    onLoad();
                }
            }
        }
    }

    function onImageLoaded(loader, callback) {
        loader.loaded ? callback() : loader.callbacks.push(callback)
    };

    class SpriteSheet {
        constructor(imageUrl, frames, extraData = null) {
            this.imageUrl = imageUrl;
            this.frames = frames;
            this.extraData = extraData;
            this.imageLoader = new ImageLoader(imageUrl);
            this.isReady = false;

            onImageLoaded(this.imageLoader, () => {
                this.isReady = true;
            });
        }

        getWidth(index) {
            return this.frames[index][2];
        }

        getHeight(index) {
            return this.frames[index][3];
        }

        load(callback) {
            if (callback) onImageLoaded(this.imageLoader, callback);
            this.imageLoader.load();
        }

        createFrame(index) {
            const div = createDiv();
            const frame = this.frames[index];
            div.style.width = frame[2] + "px";
            div.style.height = frame[3] + "px";
            div.style.background = `url(${this.imageUrl}) -${frame[0]}px -${frame[1]}px no-repeat`;
            return div;
        }
    }

    function createDiv() {
        var div = document.createElement("div");
        div.style.position = "absolute";
        div.style.Ih = "none";
        div.style.userSelect = "none";
        div.style.webkitTapHighlightColor = "rgba(0,0,0,0)";
        div.unselectable = "on";
        return div
    };

    /**
     * Returns a list of valid grid cell indices.
     * 
     * @param {boolean} excludeBlocked - If true, excludes blocked cell indices listed in `blockedCells`.
     * @returns {number[]} Array of valid cell indices (0–206).
     */
    function getAllGridCells(excludeBlocked = false) {
        const cells = [];
        for (let i = 0; i < 207; i++) {
            if (!excludeBlocked || !blockedCells.includes(i)) {
                cells.push(i);
            }
        }
        return cells;
    }
    const blockedCells = [0, 22, 184, 206];

    function forEachItem(collection, callback, context) {
        if (collection == null) return;
        if (typeof collection.forEach === "function") {
            collection.forEach(callback, context);
        } else if (typeof collection === "string" || Array.isArray(collection)) {
            Array.from(collection).forEach(callback, context);
        } else if (typeof collection === "object") {
            Object.entries(collection).forEach(([key, value]) => callback.call(context, value, key, collection));
        }
    }

    class MapEx {
        constructor(...args) {
            this._map = {};
            this._keys = [];
            this._count = 0;
            this._modCount = 0;

            if (args.length > 1) {
                if (args.length % 2 !== 0) throw new Error("Uneven number of arguments");
                for (let i = 0; i < args.length; i += 2) {
                    this.set(args[i], args[i + 1]);
                }
            } else if (args[0]) {
                this.merge(args[0]);
            }
        }

        get size() { return this._count; }

        getKeys() {
            this._clean();
            return this._keys.slice();
        }

        getValues() {
            this._clean();
            return this._keys.map(k => this._map[k]);
        }

        get(key, defaultValue) {
            return Object.prototype.hasOwnProperty.call(this._map, key) ? this._map[key] : defaultValue;
        }

        set(key, value) {
            if (!Object.prototype.hasOwnProperty.call(this._map, key)) {
                this._count++;
                this._keys.push(key);
                this._modCount++;
            }
            this._map[key] = value;
        }

        hasValue(value) {
            return this._keys.some(k => this._map[k] === value);
        }

        equals(other, compareFn = (a, b) => a === b) {
            if (this === other) return true;
            if (this.size !== other.size) return false;
            for (const key of this._keys)
                if (!compareFn(this.get(key), other.get(key))) return false;
            return true;
        }

        isEmpty() { return this.size === 0; }

        remove(key) {
            if (Object.prototype.hasOwnProperty.call(this._map, key)) {
                delete this._map[key];
                this._count--;
                this._modCount++;
                if (this._keys.length > 2 * this._count) this._clean();
                return true;
            }
            return false;
        }

        clear() {
            this._map = {};
            this._keys = [];
            this._count = 0;
            this._modCount = 0;
        }

        merge(source) {
            if (source instanceof MapEx) {
                const keys = source.getKeys();
                const values = source.getValues();
                for (let i = 0; i < keys.length; i++) this.set(keys[i], values[i]);
            } else if (typeof source === "object") {
                for (const key in source)
                    if (Object.prototype.hasOwnProperty.call(source, key))
                        this.set(key, source[key]);
            }
        }

        clone() {
            return new MapEx(this);
        }

        _clean() {
            // Remove deleted or duplicate keys
            const seen = {};
            this._keys = this._keys.filter(k => Object.prototype.hasOwnProperty.call(this._map, k) && !(k in seen) && (seen[k] = true));
        }
    }

    var lc = [
        [734, 138, 14, 23],
        [0, 255, 6, 23],
        [501, 559, 14, 23],
        [1001, 438, 14, 23],
        [1074, 485, 14, 23],
        [565, 552, 14, 23],
        [904, 193, 14, 23],
        [345, 651, 14, 23],
        [647, 23, 14, 23],
        [58, 492, 14, 23],
        [0, 557, 6, 14],
        [994, 516, 38, 22],
        [62, 33, 61, 65],
        [362, 529, 61, 65],
        [239, 507, 61, 65],
        [647, 115, 61, 65],
        [834, 639, 61, 65],
        [252, 615, 61, 65],
        [86, 615, 61, 65],
        [413, 255, 488, 208],
        [565, 508, 9, 15],
        [468, 748, 9, 15],
        [752, 40, 9, 15],
        [149, 139, 9, 15],
        [1018, 438, 9, 15],
        [520, 33, 9, 15],
        [575, 33, 9, 15],
        [428, 33, 9, 15],
        [664, 23, 9, 15],
        [501, 466, 9, 15],
        [35, 525, 9, 15],
        [940, 0, 168, 128],
        [565, 466, 12, 14],
        [77, 466, 12, 14],
        [525, 0, 12, 14],
        [518, 559, 12, 14],
        [150, 615, 99, 128],
        [178, 33, 56, 30],
        [647, 183, 56, 30],
        [380, 33, 9, 15],
        [764, 198, 9, 15],
        [940, 415, 9, 15],
        [1030, 438, 9, 15],
        [1023, 720, 9, 15],
        [1035, 720, 9, 15],
        [416, 33, 9, 15],
        [620, 466, 9, 15],
        [404, 33, 9, 15],
        [392, 33, 9, 15],
        [790, 0, 9, 15],
        [149, 56, 26, 26],
        [994, 485, 26, 28],
        [834, 466, 26, 28],
        [963, 284, 99, 128],
        [1043, 160, 26, 26],
        [536, 508, 26, 28],
        [149, 85, 26, 28],
        [126, 0, 19, 11],
        [1018, 456, 26, 26],
        [431, 676, 26, 28],
        [940, 216, 26, 28],
        [58, 306, 352, 152],
        [1072, 160, 20, 14],
        [206, 489, 30, 24],
        [480, 748, 16, 16],
        [501, 726, 20, 19],
        [685, 466, 32, 39],
        [501, 585, 40, 43],
        [177, 255, 32, 39],
        [1024, 160, 16, 28],
        [513, 466, 32, 39],
        [513, 541, 20, 15],
        [550, 700, 18, 23],
        [35, 543, 16, 28],
        [91, 255, 32, 39],
        [35, 719, 18, 23],
        [27, 33, 32, 39],
        [756, 574, 18, 23],
        [904, 151, 32, 39],
        [940, 526, 18, 23],
        [790, 156, 32, 39],
        [468, 572, 30, 29],
        [468, 664, 18, 21],
        [627, 489, 32, 39],
        [0, 515, 32, 39],
        [1064, 656, 18, 20],
        [1043, 219, 32, 39],
        [904, 252, 20, 16],
        [178, 66, 466, 186],
        [51, 158, 48, 48],
        [126, 255, 48, 48],
        [597, 543, 133, 60],
        [971, 541, 133, 60],
        [316, 466, 133, 60],
        [597, 638, 212, 132],
        [316, 622, 26, 29],
        [904, 0, 27, 29],
        [693, 83, 27, 29],
        [995, 160, 26, 29],
        [723, 40, 26, 28],
        [597, 489, 27, 28],
        [834, 608, 27, 28],
        [100, 483, 26, 28],
        [1035, 630, 26, 27],
        [133, 514, 27, 27],
        [612, 0, 27, 27],
        [904, 354, 26, 26],
        [565, 483, 22, 22],
        [830, 0, 22, 22],
        [0, 440, 22, 22],
        [316, 597, 22, 22],
        [309, 33, 22, 20],
        [587, 33, 22, 20],
        [28, 158, 20, 22],
        [461, 0, 20, 22],
        [149, 33, 20, 20],
        [35, 255, 20, 20],
        [940, 476, 20, 20],
        [126, 683, 20, 20],
        [971, 485, 20, 20],
        [811, 546, 20, 20],
        [904, 58, 20, 20],
        [1047, 693, 20, 20],
        [796, 489, 20, 20],
        [206, 466, 20, 20],
        [355, 0, 20, 20],
        [0, 135, 20, 20],
        [904, 383, 30, 20],
        [597, 615, 30, 20],
        [0, 0, 20, 30],
        [77, 567, 20, 30],
        [23, 112, 30, 20],
        [258, 0, 30, 20],
        [995, 660, 20, 30],
        [35, 492, 20, 30],
        [0, 281, 30, 20],
        [468, 549, 30, 20],
        [543, 667, 20, 30],
        [664, 64, 20, 30],
        [316, 750, 30, 20],
        [100, 567, 30, 20],
        [513, 508, 20, 30],
        [1070, 693, 20, 30],
        [133, 544, 20, 20],
        [54, 525, 20, 20],
        [711, 115, 20, 20],
        [845, 86, 20, 20],
        [1014, 415, 20, 20],
        [0, 346, 20, 20],
        [904, 406, 20, 20],
        [0, 75, 20, 20],
        [693, 60, 20, 20],
        [468, 604, 20, 20],
        [235, 0, 20, 20],
        [734, 115, 20, 20],
        [0, 465, 20, 20],
        [670, 0, 20, 20],
        [647, 225, 20, 20],
        [408, 677, 20, 20],
        [291, 0, 20, 20],
        [612, 33, 20, 20],
        [149, 116, 20, 20],
        [971, 516, 20, 20],
        [1043, 261, 20, 20],
        [345, 622, 20, 20],
        [35, 615, 20, 20],
        [597, 520, 20, 20],
        [401, 0, 20, 20],
        [527, 700, 20, 20],
        [35, 306, 20, 20],
        [940, 193, 20, 20],
        [533, 559, 20, 20],
        [23, 135, 20, 20],
        [339, 569, 20, 20],
        [0, 98, 20, 20],
        [357, 33, 20, 20],
        [940, 131, 20, 20],
        [342, 677, 40, 20],
        [971, 415, 40, 20],
        [35, 329, 20, 40],
        [940, 433, 20, 40],
        [477, 33, 40, 20],
        [192, 0, 40, 20],
        [733, 546, 20, 40],
        [904, 108, 20, 40],
        [163, 514, 40, 20],
        [35, 745, 40, 20],
        [126, 14, 20, 40],
        [834, 565, 20, 40],
        [532, 33, 40, 20],
        [266, 33, 40, 20],
        [385, 677, 20, 40],
        [733, 489, 20, 40],
        [149, 0, 40, 20],
        [163, 537, 40, 20],
        [863, 466, 20, 40],
        [1047, 438, 20, 40],
        [1004, 693, 40, 20],
        [569, 0, 40, 20],
        [0, 369, 20, 40],
        [734, 164, 20, 40],
        [662, 466, 20, 20],
        [378, 0, 20, 20],
        [544, 585, 20, 20],
        [647, 0, 20, 20],
        [597, 466, 20, 20],
        [1E3, 720, 20, 20],
        [316, 569, 20, 20],
        [940, 284, 20, 20],
        [664, 41, 20, 20],
        [1023, 485, 20, 20],
        [733, 466, 20, 20],
        [693, 0, 20, 20],
        [77, 483, 20, 20],
        [35, 696, 20, 20],
        [334, 33, 20, 20],
        [904, 331, 20, 20],
        [35, 466, 39, 23],
        [501, 667, 39, 23],
        [0, 304, 23, 39],
        [1072, 177, 23, 39],
        [995, 604, 39, 23],
        [35, 670, 39, 23],
        [706, 183, 23, 39],
        [468, 507, 23, 39],
        [995, 630, 37, 26],
        [35, 641, 37, 26],
        [723, 0, 26, 37],
        [816, 86, 26, 37],
        [756, 489, 37, 26],
        [86, 683, 37, 26],
        [239, 575, 26, 37],
        [316, 529, 26, 37],
        [790, 126, 34, 27],
        [834, 535, 34, 27],
        [23, 75, 27, 34],
        [567, 585, 27, 34],
        [385, 720, 34, 27],
        [424, 0, 34, 27],
        [971, 438, 27, 34],
        [693, 23, 27, 34],
        [963, 131, 30, 26],
        [940, 693, 30, 26],
        [237, 33, 26, 30],
        [540, 0, 26, 30],
        [904, 302, 30, 26],
        [58, 255, 30, 26],
        [830, 25, 26, 30],
        [904, 219, 26, 30],
        [342, 700, 25, 23],
        [58, 615, 25, 23],
        [790, 86, 23, 25],
        [830, 58, 23, 25],
        [133, 567, 25, 23],
        [796, 512, 25, 23],
        [662, 508, 23, 25],
        [785, 546, 23, 25],
        [764, 0, 23, 23],
        [316, 677, 23, 23],
        [565, 526, 23, 23],
        [969, 604, 23, 23],
        [904, 32, 23, 23],
        [969, 216, 23, 23],
        [501, 700, 23, 23],
        [1064, 630, 23, 23],
        [940, 552, 24, 26],
        [368, 622, 24, 26],
        [940, 604, 26, 24],
        [0, 488, 26, 24],
        [1046, 485, 25, 26],
        [802, 0, 25, 26],
        [756, 546, 26, 25],
        [756, 518, 26, 25],
        [904, 271, 24, 28],
        [0, 33, 24, 28],
        [973, 693, 28, 24],
        [940, 499, 28, 24],
        [940, 160, 25, 30],
        [0, 199, 25, 30],
        [0, 412, 30, 25],
        [100, 514, 30, 25],
        [501, 631, 24, 33],
        [149, 157, 24, 33],
        [904, 81, 33, 24],
        [431, 622, 33, 24],
        [973, 720, 24, 34],
        [468, 627, 24, 34],
        [440, 33, 34, 24],
        [431, 649, 34, 24],
        [0, 158, 23, 38],
        [777, 574, 23, 38],
        [35, 574, 38, 23],
        [484, 0, 38, 23],
        [468, 466, 23, 38],
        [239, 466, 23, 38],
        [834, 509, 38, 23],
        [314, 0, 38, 23]
    ];

    class Sprite extends goog.events.EventTarget {
        constructor(frameId) {
            super();

            // Current frame identifier (like image or tile type)
            this.frameId = frameId; // Q

            // Rotation (0, 90, 180, 270 degrees)
            this.rotation = 0; // T

            // DOM element (the sprite's visual)
            this.element = SpriteManager.createFrame(this._getFrameSource()); // s

            // Position and movement state
            this.gridX = 0;
            this.gridY = 0;
            this.pixelX = 0;
            this.pixelY = 0;

            // Flip / mirror state
            this.isFlipped = false;

            // Visible flag
            this.visible = true;

            // Cached dimensions
            this.height = SpriteManager.getHeight(this._getFrameSource());
            this.width = SpriteManager.getWidth(this._getFrameSource());

            // Active animation and effect references
            this.animation = null;
            this.transition = null;

            // Flags
            this.isTransitioning = false;
            this.isLooping = false;

            // Timers for queued animations
            this.timeouts = [];
        }

        // Returns DOM element of the sprite
        getElement() { // aa
            return this.element;
        }

        // Get width / height from manager
        getWidth() {
            return SpriteManager.getWidth(this._getFrameSource());
        }
        getHeight() {
            return SpriteManager.getHeight(this._getFrameSource());
        }

        // Private: frame source (can change by rotation or animation)
        _getFrameSource(sourceOverride) {
            const src = sourceOverride === undefined ? this.frameId : sourceOverride;
            return Array.isArray(src) ? src[Math.floor(this.rotation / 90)] : src;
        }

        // Returns frameId
        getFrameId() { // Ua
            return this.frameId;
        }

        // Returns current rotation
        getRotation() { // Na
            return this.rotation;
        }

        // Update position (absolute)
        static setPosition(sprite, x, y) {
            if (sprite.element) {
                sprite.pixelX = Math.floor(x);
                sprite.pixelY = Math.floor(y);
                setPosition(sprite.element, sprite.pixelX, sprite.pixelY);
            }
        }

        // Move to grid coordinates (translates grid→pixel position)
        static moveToGrid(sprite, gridX, gridY) {
            if (!sprite.element) return;

            sprite.gridX = gridX;
            sprite.gridY = gridY;

            sprite.pixelX = Math.floor(20 * gridX);
            sprite.pixelY = Math.floor(20 * gridY);

            if (sprite.frameId === qc || sprite.frameId === pc) {
                if (sprite.frameId === qc) {
                    if (sprite.rotation === 180 || sprite.rotation === 0) sprite.pixelY--;
                    else sprite.pixelX--;
                } else {
                    sprite.pixelY--;
                    sprite.pixelX--;
                }
            } else {
                var b = rc.get(sprite.frameId);
                var c = sc.get(sprite.frameId);

                var widthOffset = sprite.width - 20;
                var heightOffset = sprite.height - 20;

                switch (sprite.rotation) {
                    case 0: 
                        sprite.pixelY -= b ? widthOffset : 0;
                        sprite.pixelX -= c ? heightOffset : 0;
                        break;
                    case 90:
                        sprite.pixelY -= c ? 0 : widthOffset;
                        sprite.pixelX -= b ? heightOffset : 0;
                        break;
                    case 180:
                        if (sprite.isFlipped) c = !c;
                        sprite.pixelY -= b ? 0 : widthOffset;
                        sprite.pixelX -= c ? 0 : heightOffset;
                        break;
                    case 270:
                        sprite.pixelY -= c ? widthOffset : 0;
                        sprite.pixelX -= b ? 0 : heightOffset;
                }
                if (-1 < tc[0].indexOf(sprite.frameId) || -1 < tc[1].indexOf(sprite.frameId))
                    sprite.pixelY += 180 == sprite.rotation ? 1 : 0 == sprite.rotation ? -1 : 0,
                    sprite.pixelX += 270 == sprite.rotation ? 1 : 90 == sprite.rotation ? -1 : 0
            }

            Sprite.setPosition(sprite, sprite.pixelX, sprite.pixelY);
        }

        // Change z-isndex
        setZIndex(z) {
            this.element.style.zIndex = z;
        }

        // Change frame
        setFrame(frameId) {
            if (this.element) {
                Sprite._updateSize(this, frameId);
                if (this.frameId !== frameId) {
                    this.frameId = frameId;
                    Sprite._updateBackground(this);
                }
            }
        }

        // Private: refresh background position for current frame
        static _updateBackground(sprite) {
            const frame = SpriteManager.frames[sprite._getFrameSource(sprite.frameId)];
            const pos = frame ? `-${frame[0]}px -${frame[1]}px` : undefined;
            sprite.element.style.backgroundPosition = pos;
            if (sprite.isLooping) Sprite.moveToGrid(sprite, sprite.gridX, sprite.gridY);
        }

        // Cleanup
        dispose() {
            if (this.element && this.element.parentNode) {
                this.element.parentNode.removeChild(this.element);
            }
            this.element = null;
            super.dispose();
        }

        // Rotation logic
        rotate(angle) {
            if (this.rotation !== angle || this.isFlipped) {
                this.rotation = angle;
                this.isFlipped = false;
                Sprite._updateSize(this, this.frameId);
                Sprite._updateBackground(this);
            }
        }

        // Flip vertically
        flip() {
            if (!this.isFlipped) {
                this.rotation = 180;
                this.isFlipped = true;
                Sprite._updateSize(this, this.frameId);
                Sprite._updateBackground(this);
            }
        }

        // Apply scale transform
        scale(scaleX, scaleY) {
            let transform = "";
            if (scaleX !== undefined) transform += ` scaleX(${scaleX})`;
            if (scaleY !== undefined) transform += ` scaleY(${scaleY})`;

            for (const prefix of vendorPrefixes) {
                this.element.style[`${prefix}Transform`] = transform;
            }
        }

        // Show / hide sprite
        show(visible) {
            if (this.visible !== visible) {
                this.visible = visible;
                this.element.style.display = visible ? "" : "none";
            }
        }

        // Fade out
        static fadeOut(sprite) {
            Sprite.animateOpacity(sprite, 300, 1, 0);
        }

        // Fade animation helper
        static animateOpacity(sprite, duration, from, to) {
            if (sprite.animation && sprite.animation.stop) sprite.animation.stop();
            sprite.animation = new AnimationSequence();
            sprite.animation.addStep(createOpacityAnimator(sprite.element, from, to), duration);
            sprite.animation.play();
        }

        // Play frame animation sequence (K)
        playFrameSequence(frames, delay, repeatDelay, repeatCount = 1, looping = false) {
            if (repeatDelay) {
                this.timeouts.push(setTimeout(() => {
                    this.playFrameSequence(frames, delay, 0, repeatCount, looping);
                }, repeatDelay));
                return;
            }

            if (this.transition && this.transition.isPlaying()) {
                if (this.isTransitioning) return;
                this.transition.stop();
            }

            this.transition = new AnimationSequence();

            for (let i = 0; i < repeatCount; i++) {
                frames.forEach(frame => {
                    this.transition.addStep(() => this.setFrame(frame));
                    this.transition.addPauseStep(delay);
                });
            }

            this.transition.play();
            this.isTransitioning = looping;
        }

        // Internal helper to update size when frame changes
        static _updateSize(sprite, frameId) {
            const frameSource = sprite._getFrameSource(frameId);
            const w = SpriteManager.getWidth(frameSource);
            const h = SpriteManager.getHeight(frameSource);
            sprite.width = w;
            sprite.height = true;
            sprite.element.style.width = `${w + 1}px`;
            sprite.element.style.height = `${h + 1}px`;
        }
    }
    let SpriteManager = null;

    function stopAllAnimations(target) {
        if (target.animation) {
            target.animation.stop();
            target.isLooping = false;
            target.timeouts.forEach(handle => clearTimeout(handle));
        }

        if (target.ra) {
            target.ra.stop();
        }
    }

    var qc = [111, 114, 112, 113],
        Bc = [173, 176, 174, 175],
        Cc = [159, 162, 160, 161],
        Dc = [155, 158, 156, 157],
        Ec = [163, 166, 164, 165],
        pc = [107, 110, 108, 109],
        Fc = [123, 126, 124, 125],
        Gc = [119, 122, 120, 121],
        Hc = [115, 118, 116, 117],
        Ic = [139, 142, 140, 141],
        Jc = [135, 138, 136, 137],
        Kc = [131, 134, 132, 133],
        Lc = [127, 130, 128, 129],
        Mc = [197, 200, 198, 199],
        Nc = [193, 196, 194, 195],
        Oc = [189, 192, 190, 191],
        Pc = [185, 188, 186, 187],
        Qc = [181, 184, 182, 183],
        Rc = [177, 180, 178, 179],
        Sc = [151, 154, 152, 153],
        Tc = [147, 150, 148, 149],
        Uc = [143, 146, 144, 145],
        Vc = [201, 204, 202, 203],
        Wc = [209, 212, 210, 211],
        Xc = [205, 208, 206, 207],
        Yc = [213, 216, 214, 215],
        Zc = [261, 264, 262, 263],
        $c = [269, 272, 270, 271],
        ad = [277, 280, 278, 279],
        bd = [285, 288, 286, 287],
        cd = [293, 296, 294, 295],
        dd = [257, 260, 258, 259],
        ed = [265, 268, 266, 267],
        fd = [273, 276, 274, 275],
        gd = [281, 284, 282, 283],
        hd = [289, 292, 290, 291],
        id = [217, 220, 218, 219],
        jd = [225, 228, 226, 227],
        kd = [233, 236, 234, 235],
        ld = [241, 244, 242, 243],
        md = [249, 252, 250, 251],
        nd = [221, 224, 222, 223],
        od = [229, 232, 230, 231],
        pd = [237, 240, 238, 239],
        qd = [245, 248, 246, 247],
        rd = [253, 256, 254, 255],
        R = {
            Lg: 57,
            kf: 11,
            pe: 86,
            Gf: 84,
            Hf: 83,
            If: 80,
            Jf: 78,
            Kf: 76,
            Lf: 74,
            Mf: 70,
            Nf: 68,
            Ff: 66,
            ne: 65,
            oe: 62,
            ha: 64,
            Ea: 71,
            we: 69,
            xe: 73,
            Fa: 87,
            mb: 85,
            le: 82,
            qe: 81,
            se: 72,
            ve: 75,
            ue: 77,
            re: 79,
            mg: 33,
            og: 35,
            ng: 34,
            lg: 32,
            ob: 67,
            Va: 63,
            of: qc,
            Ug: Bc,
            bg: Cc,
            cg: Dc,
            dg: Ec,
            Bf: pc,
            Cf: Fc,
            Df: Gc,
            Ef: Hc,
            Vg: Ic,
            Wg: Jc,
            Xg: Kc,
            Yg: Lc,
            eg: Mc,
            fg: Nc,
            gg: Oc,
            hg: Pc,
            ig: Qc,
            jg: Rc,
            lf: Sc,
            mf: Tc,
            nf: Uc,
            ag: Vc,
            Hg: Wc,
            pg: Xc,
            Pg: Yc,
            oh: Zc,
            qh: $c,
            rh: ad,
            sh: bd,
            uh: cd,
            Zg: dd,
            $g: ed,
            ah: fd,
            bh: gd,
            dh: hd,
            eh: id,
            fh: jd,
            gh: kd,
            hh: ld,
            ih: md,
            jh: nd,
            kh: od,
            lh: pd,
            mh: qd,
            nh: rd,
            rf: 53,
            qf: 36,
            Tg: 38,
            Sg: 37,
            vh: 94,
            Bh: 96,
            Eh: 97,
            yh: 95,
            Hh: 98,
            Ah: 100,
            Dh: 101,
            xh: 99,
            Gh: 102,
            zh: 104,
            Ch: 105,
            wh: 103,
            Fh: 106,
            Of: 19,
            $f: 88,
            Af: 49,
            qg: 39,
            rg: 40,
            sg: 41,
            tg: 42,
            ug: 43,
            vg: 44,
            wg: 45,
            xg: 46,
            yg: 47,
            zg: 48,
            jf: 10,
            Ye: 0,
            Ze: 1,
            $e: 2,
            af: 3,
            bf: 4,
            df: 5,
            ef: 6,
            ff: 7,
            gf: 8,
            hf: 9,
            Zf: 30,
            Pf: 20,
            Qf: 21,
            Rf: 22,
            Sf: 23,
            Tf: 24,
            Uf: 25,
            Vf: 26,
            Wf: 27,
            Xf: 28,
            Yf: 29,
            Dg: 61,
            Ag: 50,
            Bg: 51,
            Cg: 52,
            Ig: 54,
            Jg: 55,
            Kg: 56,
            Mg: 58,
            Ng: 59,
            Og: 60,
            Eg: 91,
            Fg: 92,
            Gg: 93,
            kg: 31,
            tf: 12,
            uf: 13,
            vf: 14,
            wf: 15,
            xf: 16,
            yf: 17,
            zf: 18,
            Qg: 89,
            Rg: 90
        },
        sd = {
            G: 33,
            O: 35,
            L: 34,
            E: 32
        },
        td = [39, 40, 41, 42, 43, 44, 45, 46, 47, 48],
        ud = [20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
        vd = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
        tc = [
            [Zc, $c, ad, bd, cd],
            [dd, ed, fd, gd, hd],
            [nd, od, pd, qd, rd],
            [id, jd, kd, ld, md]
        ]

    var rc = null;
    var sc = null;

    class ScoreDisplay extends goog.Disposable {
        constructor(a, b) {
            super();
            this.Nb = [];
            this.z = 0;
            this.M = [];
            for (var d = 0; 3 > d; d++) {
                this.Nb[d] = a[d];
                this.M.push(createBackgroundTile(b, this.Nb[d].x, this.Nb[d].y));
            }
            this.A = createBackgroundTile(b, a[0].x, a[0].y);
            this.Ga = null;
            this.P = [];
            for (d = 0; 2 > d; d++) {
                this.P[d] = createBackgroundTile(b, a[d + 4].x, a[d + 4].y);
                console.log(this.P[d]);
                this.P[d].element.style.opacity = 0;
                this.P[d].show(true);
            }
            this.Mb = [];
            this.Ob = null;
            this.pd = false;
        }
        reset() {
            for (var a in this.M) this.M[a].setFrame(td[0]);
            this.z = 0;
            this.M[0].show(true);
            this.P[0].s.style.opacity = 0;
            this.P[1].s.style.opacity = 0;
            this.P[0].show(true);
            this.P[1].show(true);
            this.Mb = [];
        }
        update(a) {
            if (!(999 < a || a == this.z)) {
                var b = a - this.z;
                this.z = a;
                a = createDigitSprites(a);
                for (var c in a) {
                    var d = this.M[c];
                    var e = a[c];
                    var f = this.Nb[c];
                    if (e != null) {
                        d.show(true)
                        if (d.getFrameId() != e) playSwapAnimation(this, f, d, e)
                    } else d.show(false);
                }
                this.Mb.push(b);
            }
        }
        jb(a) {
            if (this.Mb.length) {
                var b = this.Mb.shift()
                var b = createDigitSprites(b, ud, 2);
                for (c in b) {
                    stopAllAnimations(this.P[c])
                    if (b[c] != null) {
                        this.P[c].setFrame(b[c]);
                        Sprite.animateOpacity(this.P[c], 300, 0, 1);
                    } else this.P[c].s.style.opacity = 0;
                }
                this.Ob = a;
                this.pd = b[1] != null;
            }
            if (this.Ob && 1E3 < a - this.Ob) {
                Sprite.fadeOut(this.P[0]);
                if (this.pd) Sprite.fadeOut(this.P[1]);
                this.Ob = null;
            }
        }
        dispose() {
            this.M.forEach(function (a) {
                a.C();
            });
            super.dispose();
        }
    }

    /**
     * Creates an array of digit sprites representing a number.
     * 
     * @param {number} number - The number to convert into sprite digits.
     * @param {Array} spriteSet - Optional array of sprites for digits (default = `td`).
     * @param {number} length - Number of digits to generate (default = 3).
     * @returns {Array} Array of sprite references for each digit.
     */
    function createDigitSprites(number, spriteSet = td, length = 3) {
        const digits = [spriteSet[0]];

        for (let i = 0; i < length; i++) {
            if (number !== 0) {
                const digit = number % 10;
                number = Math.floor(number / 10);
                digits[i] = spriteSet[digit];
            } else if (i > 0) {
                digits[i] = null; // Hide leading zeros
            }
        }

        return digits;
    }

    /**
     * Hides and resets visual elements of a display object.
     * 
     * @param {Object} obj - The target object containing display elements.
     * Expected structure:
     *   obj.M : map of sprites
     *   obj.Ga : animation instance (optional)
     *   obj.A : main sprite
     *   obj.P : array of sprites (e.g., [left, right])
     */
    function resetDisplay(obj) {
        // Hide all mapped elements
        for (const key in obj.M) {
            obj.M[key].show(false);
        }

        // Stop active animation
        if (obj.Ga) obj.Ga.stop();

        // Hide main and side elements
        obj.A.show(false);
        obj.P[0].show(false);
        obj.P[1].show(false);
    }

    function createBackgroundTile(parent, x, y) {
        var tile = new Sprite(td[0]);
        tile.show(false);               // hidden initially
        tile.setZIndex(-2);             // render behind everything
        Sprite.setPosition(tile, x, y); // place at coordinates
        parent.appendChild(tile.getElement());
        return tile;
    }

    /**
     * Plays a swap/transition animation between two sprites.
     * @param {Object} ctx - The context containing sprite `A` and its animation state.
     * @param {Object} startPos - Object with `{x, y}` representing the base position.
     * @param {Sprite} targetSprite - The sprite to animate towards.
     * @param {number} frameIndex - Frame index to display during animation.
     */
    function playSwapAnimation(ctx, startPos, targetSprite, frameIndex) {
        const mainSprite = ctx.A;

        // Stop any ongoing animation
        if (ctx.Ga) ctx.Ga.stop();

        // Create a new animation sequence
        ctx.Ga = new AnimationSequence();

        // Setup initial display state
        mainSprite.show(true);
        mainSprite.setFrame(frameIndex);
        Sprite.setPosition(mainSprite, startPos.x, startPos.y - 25);

        // Define animation step
        ctx.Ga.addStep(progress => {
            if (progress === 1) {
                // End of animation: show final sprite
                Sprite.setPosition(targetSprite, startPos.x, startPos.y);
                targetSprite.setFrame(frameIndex);
                mainSprite.show(false);
            } else {
                // During animation: move sprites in opposite vertical directions
                Sprite.setPosition(mainSprite, startPos.x, startPos.y - 25 * (1 - progress));
                Sprite.setPosition(targetSprite, startPos.x, startPos.y + 25 * progress);
            }
        }, 400);

        // Play the sequence
        ctx.Ga.play();
    }

    class TimerDisplay extends goog.Disposable {
        /**
         * Creates a 4-digit timer (e.g. MM:SS) using sprite digits.
         * @param {number} x - Starting x-position on the screen.
         * @param {number} y - Y-position on the screen.
         * @param {HTMLElement} parent - The DOM or container to attach the digits to.
         */
        constructor(x, y, parent) {
            super();

            this.digits = []; // Array of 4 digit sprites (M1, colon?, S1, S2)
            this.lastValue = null; // Used to avoid redundant updates

            // Create 4 sprite digits spaced horizontally
            for (let i = 0; i < 4; i++) {
                const digitSprite = new Sprite(td[0]);
                Sprite.setPosition(digitSprite, x + 10 * i, y);
                parent.appendChild(digitSprite.getElement());
                this.digits.push(digitSprite);
            }

            // Optionally set colon or middle separator sprite
            this.digits[1].setFrame(49);
        }

        /**
         * Update the timer display to match the current time (in seconds).
         * @param {number} time - Time in seconds.
         */
        update(time) {
            if (time === this.lastValue) return;

            const minutes = Math.floor(time / 60) % 10;
            const seconds = Math.floor(time % 60);

            if (minutes >= 0 && seconds >= 0) {
                this.digits[0].setFrame(td[minutes]);
                this.digits[2].setFrame(td[Math.floor(seconds / 10)]);
                this.digits[3].setFrame(td[seconds % 10]);
                this.lastValue = time;
            }
        }

        /**
         * Show or hide all timer digits.
         * @param {boolean} visible - Whether to show the digits.
         */
        show(visible) {
            this.digits.forEach(digit => digit.show(visible));
        }

        /**
         * Cleanup sprite resources when disposed.
         */
        dispose() {
            this.digits.forEach(digit => digit.dispose());
            super.dispose();
        }
    }

    class SpriteGroup extends Sprite {
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
        dispose() {
            this.children.forEach(child => child.dispose());
            super.dispose();
        }
    }

    // Clickable UI Element Class
    class ClickableElement extends SpriteGroup {
        constructor(id, width, height, parent, style) {
            super(id, width, height, parent, style);

            this.eventHandler = new goog.events.EventHandler(this);

            // Attach mouse event listeners
            this.eventHandler.listen(this.element, "click", this.handleClick);
            this.eventHandler.listen(this.element, "mousedown", this.handleMouseDown);
            this.eventHandler.listen(this.element, "mouseover", this.handleMouseOver);
            this.eventHandler.listen(this.element, "mouseout", this.handleMouseOut);

            // Indicate interactivity
            this.element.style.cursor = "pointer";
        }

        // Cleanup
        destroy() {
            this.eventHandler.dispose();
            this.eventHandler = null;
            super.destroy();
        }

        // Event Handlers
        handleClick() {
            dispatchEvent("click");
        }

        handleMouseDown() {
            dispatchEvent("mousedown");
        }

        handleMouseOver() {
            dispatchEvent("mouseover");
        }

        handleMouseOut() {
            dispatchEvent("mouseout");
        }
    }

    class SpritePool extends goog.Disposable {
        constructor() {
            this.pool = []
        }

        get() {
            return this.pool.length === 0 ? new Sprite(57) : this.pool.shift()
        }
        dispose() {
            this.pool.forEach(function(spr) {
                spr.dispose();
            });
            this.pool = null;
            super.dispose();
        }
    }
    defineSingleton(SpritePool);

    var T = function(params) {
        
    }

    class GridEntity extends goog.Disposable {
        constructor(config) {
            super();

            // Grid configuration
            this.grid = config.grid;
            this.spritePool = SpritePool.getInstance();

            // --- Main sprite setup ---
            this.mainSprite = this.spritePool.get();
            this.mainSprite.setFrame(this.grid[0]);
            this.mainSprite.setZIndex(17);
            this.mainSprite.show(false);

            // --- Shadow sprite setup ---
            this.shadowSprite = this.spritePool.get();
            this.shadowSprite.setFrame(57);
            Sprite.animateOpacity(this.shadowSprite, 300, 0, 1);
            this.shadowSprite.setZIndex(0);
            this.shadowSprite.scale(0.7, 0.7);
            this.shadowSprite.show(true);

            // --- Core properties ---
            this.tileIndex = 0;
            this.lastTime = getTime();
            this.phase = 0;
            this.state = 0;

            // Config metadata
            this.name = config.name;
            this.texture = config.texture;
            this.extra = config.extra;
            this.data = config.data;

            // Sprite positions
            this.cc = this.jd = 40;
            this.nc = this.ib = this.hb = 0;

            // Motion parameters
            this.targetY = 1400;
            this.randomMove = false;
            this.direction = 1;

            // Behavior triggers
            this.behaviors = [
                new ConditionalTrigger(this.onReady, this.onDisappear, true),
                new ConditionalTrigger(this.onActive, this.onFinish, false, 400)
            ];
        }

        dispose() {
            const pool = this.spritePool;
            [this.mainSprite, this.shadowSprite].forEach(sprite => {
                sprite.show(false);
                stopAllAnimations(sprite);
                sprite.Eb = false;
                pool.pool.push(sprite);
            });
            this.behaviors = null;
            super.dispose();
        }

        update(now) {
            this.stateTime = now - this.lastTime;

            if (this.state === 0) {
                if (now > this.targetY) {
                    this.shadowSprite.show(false);
                    this.mainSprite.setZIndex(1);
                    this.state = 1;
                    applyMovement(this, 0, 0);
                } else if (this.randomMove) {
                    handleParallaxScroll(this, now);
                } else {
                    handleVerticalScroll(this, now);
                }
            } else if (this.state === 1 && now > this.texture + this.targetY) {
                this.state = 3; // finished / expired
            }

            this.behaviors?.forEach(b => b.update());
        }

        renderPosition() {
            const x = 20 * (Math.floor(this.tileIndex % 23) + 0.5);
            const y = 20 * (Math.floor(this.tileIndex / 23) + 0.5);

            this.posX = x - this.mainSprite.getWidth() / 2;
            this.posY = y - this.mainSprite.getHeight() / 2;
            Sprite.setPosition(this.mainSprite, this.posX, this.posY);

            const shadowX = x - this.shadowSprite.getWidth() / 2;
            const shadowY = y + this.mainSprite.getHeight() / 2 - this.shadowSprite.getHeight() + this.tileOffset;
            Sprite.setPosition(this.shadowSprite, shadowX, shadowY);
        }

        getCellIndex() { return this.tileIndex; }
        getRow() { return Math.floor(this.tileIndex / 23); }
        getColumn() { return this.tileIndex % 23; }

        cycleFrame() {
            let index = this.grid.indexOf(this.mainSprite.getFrame());
            index = (index + 1) % this.grid.length;
            this.mainSprite.setFrame(this.grid[index]);
        }

        isEndingSoon() {
            return this.state === 1 && this.stateTime > this.texture + this.targetY - 300;
        }

        fadeOut() {
            Sprite.fadeOut(this.mainSprite);
        }

        hasData() {
            return this.state === 1 && this.data;
        }
    }

    /**
     * Handles vertical movement and fade-in scaling effect.
     * @param {Object} obj - The scene or sprite object with position and sprite info.
     * @param {number} scrollY - The current scroll position.
     */
    function handleVerticalScroll(obj, scrollY) {
        let movementY = 40;

        if (scrollY > 800) {
            // Fade out after 800px, with a parabolic easing curve
            movementY = 10 * (1 - Math.pow((scrollY - 1100) / 300, 2));
        } else if (scrollY > 200) {
            // Fade in between 200–800px
            if (obj.sprite.style.display === "none") {
                obj.sprite.show(true);
                Sprite.animateOpacity(obj.sprite, 300, 0, 1);
            }
            movementY = 40 * (1 - Math.pow((scrollY - 200) / 600, 2));
        }

        applyMovement(obj, 0, Math.floor(movementY));
    }

    /**
     * Handles horizontal parallax and scaling.
     * @param {Object} obj - The scene or sprite object with velocity and scaling data.
     * @param {number} scrollY - The current scroll position.
     */
    function handleParallaxScroll(obj, scrollY) {
        let movementY = 40;
        let offsetX = 0;
        const relativeScroll = scrollY - 200;

        const SCROLL_LEVELS = [450, 900, 1350];
        const [low, mid, high] = SCROLL_LEVELS;

        if (scrollY > 200) {
            if (obj.sprite.style.display === "none") {
                obj.sprite.show(true);
                Sprite.animateOpacity(obj.sprite, 300, 0, 1);
            }

            movementY = 40 * (1 - Math.pow(relativeScroll / 1800, 2));
            offsetX = 1;

            if (relativeScroll < mid) {
                // Move left
                offsetX = Math.floor(1000 * (1 - Math.pow((relativeScroll - low) / low, 2))) / 1000;
                offsetX *= -15 * obj.direction;
            } else {
                // Move right
                offsetX = Math.floor(1000 * (1 - Math.pow((relativeScroll - high) / low, 2))) / 1000;
                offsetX *= 15 * obj.direction;
            }
        }

        applyMovement(obj, Math.floor(offsetX), Math.floor(movementY));
    }

    /**
     * Applies movement and scaling to a sprite.
     * @param {Object} obj - The target object containing sprite and transform data.
     * @param {number} deltaX - X offset.
     * @param {number} deltaY - Y offset.
     */
    function applyMovement(obj, deltaX, deltaY) {
        if ((obj.lastY === deltaY && obj.lastX === deltaX) || Math.abs(deltaX) > 15) return;

        obj.lastX = deltaX;
        obj.lastY = deltaY;

        // Move sprite
        setPosition(obj.sprite, obj.baseX - deltaX, obj.baseY - deltaY);

        // Scale smoothly with vertical movement
        const scale = 1 - (1 - 0.7) * deltaY / 40;
        obj.transform.scale(scale, scale);

        // Move based on parallax
        if (deltaX) {
            setPosition(obj.transform, obj.centerX - deltaX, obj.centerY);
        }
    }

    function initMotion(a) {
        a.enabled = true;
        a.speed = this.enabled ? 2000 : 1400;
        a.direction = Math.random() < 0.5 ? 1 : -1;
    }
    function attachSpritesToContainer(entity, container) {
        container.appendChild(entity.mainSprite.getElement());
        container.appendChild(entity.shadowSprite.getElement());
    }
    function setController(entity, controller) {
        entity.controller = controller;
        entity.refreshState();
    }
    
    class AnimatedFallingEntity extends GridEntity {
        constructor(config) {
            super(config);
            this.sprite.playFrameSequence(Ld, 700, this.targetY);
            this.sprite.playFrameSequence(Md, 80, this.targetY + 700 * Ld.length);
            this.speed = -5;
        }

        onImpact() {
            this.sprite.playFrameSequence(Md, 400);
            setTimeout(() => { this.state = 2; }, 500);
        }
    }

    var Ld = [86, 84, 83, 80, 78, 76]
    var Md = [74, 70, 68, 66]

    class StaticVariantEntity extends GridEntity {
        constructor(config) {
            super(config);
            if (random(2)) this.sprite.setFrame(this.grid[1]);
        }
    }

    class ShadowedEntity extends GridEntity {
        constructor(config) {
            super(config);
            this.shadow.setFrame(11);
        }

        updatePosition() {
            const idx = this.Qa;
            const x = 20 * (Math.floor(idx % 23) + 0.5);
            const y = 20 * (Math.floor(idx / 23) + 0.5);

            this.hb = x - this.sprite.getWidth() / 4;
            this.ib = y - this.sprite.getHeight() / 4;
            Sprite.setPosition(this.sprite, this.hb, this.ib);
            Sprite.setPosition(this.shadow, x - this.shadow.getWidth() / 4, y + 5 - this.shadow.getHeight());
        }
    }

    class MovingEntity extends GridEntity {
        constructor(config) {
            super(config);
            initMotion(this);
        }
    }

    class RandomMovingEntity extends GridEntity {
        constructor(config) {
            super(config);
            if (random(2)) this.sprite.setFrame(this.grid[1]);
            initMotion(this);
        }
    }

    class LanternEntity extends GridEntity {
        constructor(config) {
            super(config);
            const variant = random(4);
            if (variant) this.sprite.setFrame(this.grid[variant]);
            this.variantKey = "GOLE"[variant];
            initMotion(this);
        }
    }

    var Td = []
    var U = true

    class ObjectPoolManager {
        constructor() {
            this.objects = {};
            this.count = 0;
        }
    }
    defineSingleton(ObjectPoolManager);

    // Registry of base item data
    var ItemDefinitions = {};

    // Registry mapping item names to their constructors
    var ItemClasses = null; // example: { coin: CoinItem, gem: GemItem }

    // Item factory
    function createItem(name) {
        if (!(name in ItemDefinitions) || !(name in ItemClasses))
            return new T(ItemDefinitions.coin);
        return new ItemClasses[name](ItemDefinitions[name]);
    }

    // Weighted random loot generator
    function generateRandomItem(pool) {
        const roll = random(pool.count);
        let cumulative = 0;
        let chosenKey = "coin";

        for (const key in LootTable) {
            const weight = pool.objects[LootTable[key]] || 0;
            cumulative += weight;
            if (roll < cumulative) {
                chosenKey = LootTable[key];
                break;
            }
        }

        return createItem(chosenKey);
    }

    createItem = createItem;

    class Item {
        constructor(grid, name, texture, score = 0, data = null) {
            this.grid = grid;        // Reference to grid or item container
            this.name = name;        // Name/type of the item
            this.texture = texture;  // Resource or sprite handle
            this.score = score;      // Optional numeric field
            this.data = data;        // Optional linked object or metadata
        }
    }

    function initializeObjectCounter(target, typeId) {
        target.count = 0;
        target.objects = (typeId in ObjectRegistry)
            ? ObjectRegistry[typeId].data
            : ObjectRegistry[1].data;

        forEachObject(target.objects, function (value) {
            this.count += value;
        }, target);
    }

    var LootTable = {
        firecraker: "firecraker",
        dumpling: "dumpling",
        steamer: "steamer",
        coin: "coin",
        Ea: "ingot",
        Kb: "tea",
        Fa: "medicine",
        mb: "mushroom",
        nb: "papercut",
        envelope: "envelope",
        lantern: "lantern"
    };

    var LetterShapes = {
        G: [new Point(2, 3), new Point(3, 3), new Point(3, 4), new Point(3, 5), new Point(2, 5), new Point(1, 5), new Point(0, 5), new Point(0, 4), new Point(0, 3), new Point(0, 2), new Point(0, 1), new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0)],
        G1: [new Point(0, 4), new Point(1, 4), new Point(2, 4), new Point(3, 4), new Point(3, 3), new Point(3, 2), new Point(3, 1), new Point(3, 0), new Point(2, 0), new Point(1, 0), new Point(0, 0), new Point(0, 1), new Point(0, 2), new Point(1, 2), new Point(2, 2)],
        O: [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0), new Point(3, 1), new Point(3, 2), new Point(3, 3), new Point(3, 4), new Point(2, 4), new Point(1, 4), new Point(0, 4), new Point(0, 3), new Point(0, 2), new Point(0, 1)],
        O2: [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0), new Point(3, 1), new Point(3, 2), new Point(3, 3), new Point(2, 3), new Point(1, 3), new Point(0, 3), new Point(0, 2), new Point(0, 1)],
        L: [new Point(3, 4), new Point(2, 4), new Point(1, 4), new Point(0, 4), new Point(0, 3), new Point(0, 2), new Point(0, 1), new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0), new Point(3, 1), new Point(3, 2), new Point(2, 2), new Point(1, 2)],
        E: [new Point(3, 4), new Point(2, 4), new Point(1, 4), new Point(0, 4), new Point(0, 3), new Point(0, 2), new Point(0, 1), new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(1, 2), new Point(1, 3), new Point(2, 3), new Point(3, 3)]
    };

    var he, ObjectRegistry = {};
    class SetEx {
        constructor(values) {
            this._map = new MapEx();
            if (values) this.addAll(values);
        }

        get size() { return this._map.size; }

        _keyFor(value) {
            const type = typeof value;
            if (type === "object" && value || type === "function") {
                return "o" + getUniqueId(value); // ga(a)
            }
            return type[0] + String(value);
        }

        add(value) {
            this._map.set(this._keyFor(value), value);
        }

        addAll(iterable) {
            for (const v of Array.from(iterable)) this.add(v);
        }

        remove(value) {
            return this._map.remove(this._keyFor(value));
        }

        removeAll(iterable) {
            for (const v of Array.from(iterable)) this.remove(v);
        }

        clear() {
            this._map.clear();
        }

        has(value) {
            return Object.prototype.hasOwnProperty.call(this._map._map, this._keyFor(value));
        }

        values() {
            return this._map.getValues();
        }

        clone() {
            return new SetEx(this.values());
        }

        equals(other) {
            if (this.size !== getCount(other)) return false;
            return isSubset(this, other);
        }

        isEmpty() {
            return this._map.isEmpty();
        }

        *[Symbol.iterator]() {
            yield* this._map.getValues();
        }
    }

    // Helper: subset/equality
    function isSubset(a, b) {
        const bCount = getCount(b);
        if (a.size > bCount) return false;

        if (!(b instanceof SetEx) && bCount > 5) b = new SetEx(b);

        for (const value of a.values()) {
            let exists = false;
            if (typeof b.contains === "function") exists = b.contains(value);
            else if (Array.isArray(b)) exists = b.includes(value);
            else if (b instanceof Set) exists = b.has(value);
            else {
                for (const key in b) if (b[key] === value) { exists = true; break; }
            }
            if (!exists) return false;
        }
        return true;
    }
    class GridPatternManager {
        constructor() {
            this.cellMap = null;  // Map of cell -> usage counters (g)
            this.availableCells = null; // Set of free cells (wa)
            this.activeCells = null; // Set of active/special cells (Xa)

            this.patterns = {}; // Predefined shape patterns (Kc)
        }
        init() {
            this.cellMap = new MapEx();
            getAllGridCells().forEach(function(a) {
                this.cellMap.set(a, {
                    usedCount: 0,
                    specialCount: 0,
                    totalCount: 0
                })
            }, this);

            this.availableCells = new SetEx;
            this.availableCells.addAll(getAllGridCells(true));
            this.activeCells = new SetEx;
            forEachObject(LetterShapes, function (a, b) {
                var c = new SetEx;
                ArrayUtils.forEach(a, function (a) {
                    c.add(23 * a.y + a.x);
                });
                this.patterns[b] = c;
            }, this);
        }
        markCell(cellIndex, isSpecial) {
            this.availableCells.remove(cellIndex);
            const info = this.cellMap.get(cellIndex);
            info.totalCount++;

            if (isSpecial) {
                info.specialCount++;
                this.activeCells.add(cellIndex);
            } else {
                info.usedCount++;
            }
        }
        match() {
            var a = new SetEx
            var b = getLowestActiveCellIndex(this);
            forEachItem(this.activeCells, function (c) {
                a.add(c - b);
            }, this);
            var c = "";
            forEachObject(this.patterns, function (b, e) {
                b.equals(a) && (c = e);
            });
            return c;
        }
    }
    defineSingleton(GridPatternManager);

    /**
     * Finds a 2x2 block of available cells in the grid.
     * @param {Object} gridManager - Object containing availableCells (with getValues method)
     * @returns {Array|number} - Array of 4 cell indices or -1 if none found
     */
    function find2x2Block(gridManager) {
        // Get all available cell indices
        const cells = gridManager.availableCells.getValues();

        // Filter cells that can form a valid 2x2 block
        const validCells = cells.filter(index => {
            // Check right and bottom neighbors exist
            const right = cells.includes(index + 1);
            const bottom = cells.includes(index + 23);
            const bottomRight = cells.includes(index + 23 + 1);

            // Prevent wrapping to next row
            const notLastColumn = index % 23 !== 22;
            return notLastColumn && right && bottom && bottomRight;
        });

        if (validCells.length === 0) return -1;

        // Pick a random starting cell
        const start = validCells[Math.floor(Math.random() * validCells.length)];

        // Return the 4 indices forming the 2x2 block
        return [start, start + 1, start + 23, start + 23 + 1];
    }
    find2x2Block = find2x2Block;

    /**
     * Selects a random available cell index from the grid.
     * 
     * @param {Object} grid - The grid or cell manager.
     * @returns {number} The selected cell index, or -1 if none available.
     */
    function selectRandomAvailableCell(grid) {
        if (grid.availableCells.isEmpty()) return -1;

        const available = grid.availableCells.getValues();
        return available[random(available.length)];
    }

    /**
     * Updates a specific cell's usage counters after an operation.
     * 
     * @param {Object} grid - The grid or cell manager.
     * @param {number} cellIndex - The target cell index.
     * @param {boolean} isActive - Whether the operation was active (true) or passive (false).
     */
    function updateCellUsage(grid, cellIndex, isActive) {
        const cell = grid.cellMap.get(cellIndex);

        // Decrease reference counters
        cell.Jc--;

        // If cell is now unused and not blocked, mark it as available
        if (cell.Jc === 0 && blockedCells.indexOf(cellIndex) === -1) {
            grid.availableCells.add(cellIndex);
        }

        // Adjust active/passive counts
        if (isActive) {
            cell.Ic--;
            if (cell.Ic === 0) grid.activeCells.remove(cellIndex);
        } else {
            cell.Gc--;
        }
    }

    /**
     * Returns a list of currently active cells that still have active links.
     * 
     * @param {Object} grid - The grid or cell manager.
     * @returns {Array<number>} Active cell indices.
     */
    function getActiveLinkedCells(grid) {
        const result = new SetEx();

        forEachItem(grid.activeCells, function (cellIndex) {
            if (this.g.get(cellIndex).Gc > 0) result.add(cellIndex);
        }, grid);

        return result.values();
    }

    /**
     * Finds the smallest (earliest) active cell index.
     * 
     * @param {Object} grid - The grid or cell manager.
     * @returns {number} Minimum active cell index.
     */
    function getLowestActiveCellIndex(grid) {
        let min = Infinity;

        forEachItem(grid.activeCells, function (cellIndex) {
            if (cellIndex < min) min = cellIndex;
        });

        return min;
    }

    /**
     * Generates a pattern-based cell sequence starting from a random available cell.
     * 
     * @param {Object} grid - The grid or cell manager.
     * @param {string|number} patternId - The ID of the pattern to use.
     * @returns {Array<number>} Array of valid target cell indices.
     */
    function generatePatternedCellSequence(grid, patternId) {
        const startCell = selectRandomAvailableCell(grid);
        const result = [];

        forEachItem(grid.patterns[patternId], function (offset) {
            let target = (offset + startCell) % 207;
            if (this.availableCells.contains(target)) {
                result.push(target);
            }
        }, grid);

        return result;
    }

    class TileSpawner extends goog.Disposable {
        constructor() {
            super();
            this.Ca = this.Ra = this.v = null;
            this.g = GridPatternManager.getInstance();
            this.bb = ObjectPoolManager.getInstance();
            this.Ec = null;
            this.vc = 1;
            this.ld  = null;
        }
        init(a) {
            this.v = a;
            this.Ra = new MapEx;
            this.Ca = new SetEx;
            this.Ec = getTime();
            this.spawnRate = 1;
            this.spawnArea = new SpriteGroup(88, -3, -3, this.v);
        }
        jb(a) {
            updateItems(this, a);
            a = getTime();
            var b = 8 - this.Ca.va();
            if (2500 < a - this.Ec && 0 < b) {
                for (var b = random(b) + 1, c = 0; c < b; c++) {
                    var d = generateRandomItem(this.itemSource);
                    e = -1;
                    e = "steamer" == d.getName() ? find2x2Block(this.gridManager) : selectRandomAvailableCell(this.gridManager);
                    if (-1 != e) spawnItem(this, d, e);
                }
                this.Ec = a;
            }
        }
        getItem(a) {
            return this.Ra.get(a, null);
        }
        dispose() {
            forEachItem(this.Ca, function (a) {
                a.C();
            });
            this.Ca.clear();
            this.Ra.clear();
            this.spawnArea.C();
            super.dispose();
        }
    }
    defineSingleton(TileSpawner);

    // Update items and remove inactive ones
    function updateItems(obj, currentTime) {
        if (currentTime - obj.lastUpdateTime <= 40) return;

        // Update each item in Ca
        forEachItem(obj.Ca, function(item) {
            item.update(currentTime);

            // Remove items that are not in states 0 or 1
            if (item.i !== 0 && item.i !== 1) {
                this.Ca.remove(item);
                item.C();
            }
        }, obj);

        // Update Ra cells
        forEachItem(obj.Ra, function(cell, key) {
            if (cell.Bc) {
                updateCellUsage(this.g, key);
                this.Ra.remove(key);
            }
        }, obj);

        obj.lastUpdateTime = currentTime;
    }

    // Generate items for a grid based on a pattern
    function fillGridWithItems(obj, patternCount) {
        const sequence = generatePatternedCellSequence(obj.g, patternCount);
        initializeObjectCounter(obj.objectPool, patternCount);

        sequence.forEach(function(cell) {
            const randomItem = generateRandomItem(this.objectPool);
            spawnItem(this, randomItem, cell);
        }, obj);

        initializeObjectCounter(obj.objectPool, he);
    }

    /**
     * Spawns an item into the grid at specified positions.
     * 
     * @param {Object} tileSpawner - The TileSpawner instance managing the grid.
     * @param {Object} item - The item object to spawn.
     * @param {Point|Point[]} positions - Single position or array of positions to place the item.
     */
    function spawnItem(tileSpawner, item, positions) {
        const addItemToGrid = (it, pos) => {
            tileSpawner.Ra.set(pos, it);   // Map grid position → item
            tileSpawner.Ca.add(it);        // Track active items
            tileSpawner.g.markCell(pos);   // Mark cell as occupied
        };

        if (Array.isArray(positions)) {
            positions.forEach(pos => addItemToGrid.call(tileSpawner, item, pos));
            setController(item, positions[0]);
        } else {
            addItemToGrid.call(tileSpawner, item, positions);
            setController(item, positions);
        }

        attachSpritesToContainer(item, tileSpawner.v);
        item.zb *= tileSpawner.spawnRate; // Apply spawn rate multiplier
    }
    spawnItem = spawnItem

    // Rename globals
    let snakeStepIndex = 0;   // was: we
    let snakeBodyVisible = 0; // was: xe

    const tutorialSteps = [   // was: ye
        { point: [3, 7], dir: 1 },
        { point: [2, 6], dir: 4 },
        { point: [4, 5], dir: 2 },
        { point: [5, 6], dir: 3 },
        { point: [3, 7], dir: 1 },
        { point: [2, 3], dir: 4 },
        { point: [4, 2], dir: 4 }
    ];

    // Rename function De → runTutorialStep
    function runTutorialStep(snake) {
        const step = tutorialSteps[snakeStepIndex];
        console.log(step);
        const point = step.point;

        // snake.Ta() = snake.y , snake.Sa() = snake.x
        if (snake.getRow() === point[1] && snake.getColumn() === point[0]) {
            // ze(a, dir) → moveSnakeInDirection
            moveSnakeInDirection(snake, step.dir);

            snakeStepIndex++;

            // If reached end of tutorial steps
            if (snakeStepIndex === tutorialSteps.length) {
                boostFunction(snake, getTime(), Infinity);
                snake.d[0].playFrameSequence(Be, 80);
            }
        }

        // Move forward and update animation
        snake.forward();
        updateSnakeGraphics(snake); // was: Ce(a)

        // Gradually show more segments (max 15)
        if (snakeBodyVisible < 15) {
            for (let i = 0; i < 15; i++) {
                snake.d[i].mainSprite.show(i <= snakeBodyVisible + 1);
            }
        }

        snakeBodyVisible++;
    };

    var Ge = [Uc, Tc, Sc, Tc, Uc];
    var Be = [Uc, Tc, Sc],
        He = [Ic, Jc, Kc, Lc],
        Ie = [Fc, Gc, Hc],
        Je = [Mc, Nc, Oc, Pc, Qc, Rc],
        Ke = [Oc, Pc, Qc, Rc],
        Le = [Dc],
        Me = [Ec],
        Ne = [Dc, Ec, Dc, Ec],
        Oe = tc[0],
        Pe = tc[1],
        Qe = tc[2],
        Re = tc[3],
        Ee = Cc;

    function createSprite(spriteType, zIndex, parentElement) {
        const sprite = new Sprite(spriteType);
        sprite.show(true);
        sprite.setZIndex(zIndex);
        sprite.isLooping = true; // 'Eb = h' looks like a boolean property
        parentElement.appendChild(sprite.getElement()); // 'aa()' returns DOM element
        return sprite;
    }

    var Xe = function (a, b) {
        var c = Math.min(b - a.jc, 100);
        a.Z += c / a.Ab;
        a.Z = Math.min(a.Z, 1);
        c = Math.floor(20 * a.Z);
        c = c % 2 ? c + 1 : c;
        if (a.ed != c) {
            var d = function (a, b, c, d, e, f) {
                d = f ? d : 20 - d;
                c = f ? c : (c + 180) % 360;
                180 == c ? a += 20 - d : 270 == c && (b += 20 - d);
                f && e.rotate(c);
                180 == c || 0 == c ? (nc(e, d + 1), a -= 180 == c ? 2 : 0) : (oc(e, d + 1), b -= 270 == c ? 2 : 0);
                Sprite.setPosition(e, a, b)
            };
            if (a.d[0].F == a.d[1].F) {
                var e = a.d[0].qa().Na();
                a.A.show(true);
                var f = 20 * a.Sa(),
                    n = 20 * a.Ta();
                d(f, n, e, c, a.A, true);
                a.d[0].move(a.Z)
            } else a.A.show(false), animateSegmentTurn(a.d[0], a.Z);
            e = a.d.length - 1;
            if (isSpecialFrame(a.d[e - 1])) a.d[e].qa().show(false),
                animateSegmentTurn(a.d[e - 1], a.Z);
            else {
                a.d[e].move(a.Z);
                var q = a.d[e - 1].qa(),
                    f = 20 * a.d[e - 1].Sa(),
                    n = 20 * a.d[e - 1].Ta(),
                    e = q.Na();
                d(f, n, e, c, q, false)
            }
            a.ed = c
        }
    },
    We = function (a, b) {
        var c = getActiveLinkedCells(a.g);
        c.length ? (ArrayUtils.forEach(c, function (a) {
            this.d[0].getCellIndex() == a && this.d[0].K(Ie, 80);
            dispatchEvent(new CatchItemEvent(a, b))
        }, a), a.oc = b) : 5E3 < b - a.oc && (a.oc = b, a.d[0].K(He, 80))
    },
    Ue = function (a, b) {
        a.ba = Ee;
        a.d[0].K(Ne, 80, 100);
        a.Ab = a.Fb;
        a.Gb = 1;
        a.jc = b;
        a.Ib = null
    },
    ze = function (a, b) {
        a.Hb != null && (b = xb(b));
        if (2 > a.ma.length) {
            var c = a.d[0].F;
            0 < a.ma.length && (c = a.ma[a.ma.length - 1]);
            if ((1 == c || 2 == c) && (3 == b || 4 == b) || (1 == b || 2 == b) && (3 == c || 4 == c)) {
                a.ma.push(b);
                c = 3 == DirectionManager.getInstance().transformMap.get([c, b]) ? Le : Me;
                a.d[0].K(c, 80);
            }
        }
    },
    Ce = function (a) {
        var b = a.d.length - 1;
        a.d[b].getElement().show(true);
        for (var c = a.d[b - 1].qa(), d = b - 1; 1 < d; d--) {
            a.d[d].mainSprite = a.d[d - 1].a;
            a.d[d].mainSprite.setZIndex(16 - d);
        }
        a.d[1].mainSprite = c;
        a.d[1].mainSprite.setZIndex(15);
        updateSegmentSprite(a.d[0], a.ba);
        updateSegmentSprite(a.d[1]);
        updateSegmentSprite(a.d[b])
    },
    boostFunction = function(a, b, c) {
        console.log("obj: " + a + " | secs: " + b + " | speed: " + c);
        a.Ib = b;
        a.Gb = c;
        a.Ab = a.Fb * a.Gb
    }


    /**
     * SnakeController
     * - Manages the chain of segments (this.segments)
     * - Advances the snake forward, handles movement interpolation, catches items, and pattern-matching.
     * - Dispatches events: "catch item" and "match pattern" (use earlier CustomEvent classes).
     */
    class SnakeController extends goog.events.EventTarget {
        constructor(containerElement) {
            super();

            // segments array (head is segments[0])
            this.segments = [];

            // visual "head" alternate sprite used when head matches next segment
            this.headSprite = null;

            // queued direction inputs (ma in original)
            this.directionQueue = [];

            // current audio/visual frame (ba)
            this.ba = Ee; // default frame constant from original

            this.container = containerElement;
            this.lastUpdateTime = getTime();

            // timing helpers & state
            this.lastMatchTime = null;       // qc
            this.lastCatchTime = null;       // oc
            this.moveProgress = 0;           // Z (0..1)
            this.moveDuration = ObjectRegistry[1].V; // Ab (base duration from registry)
            this.baseDuration = ObjectRegistry[1].V;  // Fb (base)
            this.speedMultiplier = 1;        // Gb
            this.stepPixel = 20;             // used for pixel computations
            this.currentStepFrame = 0;       // ed cached step frame
            this.patternManager = GridPatternManager.getInstance();

            // helpers for certain display/cache
            this.cachedLastActive = null;
        }

        /**
         * Initialize the snake segments and head sprite.
         * Builds 15 segments arranged on the right side as in original.
         */
        init() {
            // starting column index in original code was 22, and they fill 15 segments
            let col = 22;
            let previous = null;

            for (let i = 0; i < 15; i++) {
                // construction: new Te(direction, orientation?, col, row, index, prevSegment, container)
                // original used (3, 0==c ? 0 : 14==c ? 2 : 1, a, 7, c, b, this.v)
                const orientation = (i === 0) ? 0 : (i === 14 ? 2 : 1);
                const seg = new SnakeSegment(3, orientation, col, 7, i, previous, this.container);
                seg.mainSprite.show(false);                 // mirror: hide initially
                this.segments.push(seg);
                this.patternManager.markCell(161 + col, true); // original marking
                previous = seg;

                // increment column wrapping at 23
                col++;
                if (col >= 23) col -= 23;
            }

            // create the alternate head sprite used for special display
            this.headSprite = createSprite(qc, 15, this.container);
        }

        /**
         * Advance the snake forward one logical step:
         * - Move each segment to its predecessor's position (or compute new position for head)
         * - Mark the newly occupied cell and update cell usage bookkeeping
         */
        forward() {
            // index of last cell before the step (for releasing)
            const releasingIndex = this.segments[this.segments.length - 1].getCellIndex();

            // move segments backwards
            ArrayUtils.forEachReverse(this.segments, seg => {
                if (seg.parent) {
                    // if a link to previous exists, follow it
                    seg.k = seg.parent.k;
                    seg.o = seg.parent.o;
                } else if (seg.W === 0) {
                    // default movement by orientation F
                    seg.k += (seg.F === 3 ? -1 : seg.F === 4 ? 1 : 0);
                    seg.o += (seg.F === 1 ? -1 : seg.F === 2 ? 1 : 0);
                    seg.k = (seg.k + 23) % 23;
                    seg.o = (seg.o + 9) % 9;
                }
            });

            // mark the newly occupied cell of head
            this.patternManager.markCell(this.segments[0].getCellIndex(), true);

            // update cell usage for the releasing cell (original 'oe')
            updateCellUsage(this.patternManager, releasingIndex, true);

            // pop a queued direction if present and apply to segments
            let queued = null;
            if (this.directionQueue.length) queued = this.directionQueue.shift();

            ArrayUtils.forEachReverse(this.segments, seg => {
                const d = queued;
                seg.oa = seg.F; // store old facing
                // choose new F based on segment type
                seg.F = (seg.W === 0) ? (d ? d : seg.F) : (seg.W === 2 ? seg.parent.parent.F : seg.parent.F);
            });
        }

        /**
         * Top-level move method called every frame/tick.
         * @param {number} now    - current timestamp in ms
         */
        move(now) {
            // auto-reset speed if idle too long
            if (this.lastCatchTime && (now - this.lastCatchTime) > 5000) {
                this.resetSpeed(now);
            }

            // if an input or forced forward occurred, process forward step
            if (this.moveProgress >= 1) {
                this.forward();

                // attempt pattern match periodically (every ~5s)
                if ((this.lastMatchTime ? now - this.lastMatchTime : 5000) >= 5000) {
                    const pattern = this.patternManager.match();
                    if (pattern !== "") {
                        // dispatch match event (Ve)
                        this.dispatchEvent(new MatchPatternEvent(pattern, now));
                        this.lastMatchTime = now;
                        // head K animation (originally Ge)
                        this.segments[0].K(Ge, 80, 500);
                    }
                }

                // handle catches and other per-step checks
                this.handleCatchAndItems(now);
                this.updateVisualsAfterStep();
                this.moveProgress = 0;
            }

            // interpolate rendering and movement between steps
            this.updateInterpolation(now);

            // remember last timestamp
            this.lastUpdateTime = now;
        }

        /**
         * updateInterpolation — equivalent to original Xe
         * Interpolates movement progress into a small integer frame (ed),
         * updates head or trailing segment positions and rotations.
         */
        updateInterpolation(now) {
            // cap delta to 100ms like original
            const delta = Math.min(now - this.lastUpdateTime, 100);
            this.moveProgress += delta / this.moveDuration;
            this.moveProgress = Math.min(this.moveProgress, 1);

            // compute an integer animation frame used to index some sprite map:
            let frame = Math.floor(this.stepPixel * this.moveProgress); // 20 * Z
            frame = (frame % 2) ? frame + 1 : frame; // ensure it's odd/even pattern as original

            if (this.currentStepFrame !== frame) {
                // helper for positioning/rotation used by head and tail rendering
                const placeSprite = (x, y, angle, frameVal, sprite, flip) => {
                    // Original logic did transform of rotation and setPosition depending on flip
                    // We replicate the same math but express clearly:
                    const d = flip ? frameVal : (20 - frameVal);
                    const rot = flip ? angle : (angle + 180) % 360;
                    // If rotated, adjust anchor offsets differently:
                    if (rot === 180) x += 20 - d;
                    if (rot === 270) y += 20 - d;

                    if (flip) sprite.rotate(rot);
                    if (rot === 180 || rot === 0) {
                        // setWidth/Height adjustments (nc/oc logic converted)
                        nc(sprite, d + 1);
                        if (rot === 180) x -= 2;
                    } else {
                        oc(sprite, d + 1);
                        if (rot === 270) y -= 2;
                    }

                    Sprite.setPosition(sprite, x, y);
                };

                // If head and its follower face same direction, use special head sprite
                if (this.segments[0].F === this.segments[1].F) {
                    const headAngle = this.segments[0].qa().Na(); // Na() returned rotation in original
                    this.headSprite.show(true);
                    const headPixelX = 20 * this.getColumn();
                    const headPixelY = 20 * this.getRow();
                    placeSprite(headPixelX, headPixelY, headAngle, frame, this.headSprite, true);
                    this.segments[0].move(this.moveProgress);
                } else {
                    // hide alternate head and animate default head
                    this.headSprite.show(false);
                    Ye(this.segments[0], this.moveProgress);
                }

                // tail handling (depending on Ze checks)
                const lastIndex = this.segments.length - 1;
                if (isSpecialFrame(this.segments[lastIndex - 1])) {
                    // special tail case: hide last sprite, animate previous
                    this.segments[lastIndex].qa().show(false);
                    Ye(this.segments[lastIndex - 1], this.moveProgress);
                } else {
                    // normal tail interpolation
                    this.segments[lastIndex].move(this.moveProgress);
                    const prevSprite = this.segments[lastIndex - 1].qa();
                    const px = 20 * this.segments[lastIndex - 1].Sa();
                    const py = 20 * this.segments[lastIndex - 1].Ta();
                    const rot = prevSprite.Na();
                    placeSprite(px, py, rot, frame, prevSprite, false);
                }

                this.currentStepFrame = frame;
            }
        }

        /**
         * handleCatchAndItems - equivalent to original We
         * Checks active linked cells and emits catch events, or triggers head animation if none.
         */
        handleCatchAndItems(now) {
            const activeLinked = getActiveLinkedCells(this.patternManager);
            if (activeLinked.length) {
                ArrayUtils.forEach(activeLinked, idx => {
                    // if head occupies same cell, trigger short animation
                    if (this.segments[0].getCellIndex() === idx) {
                        this.segments[0].K(Ie, 80);
                    }
                    // dispatch catch event (custom $e)
                    this.dispatchEvent(new CatchItemEvent(idx, now));
                }, this);

                this.lastCatchTime = now;
            } else {
                // if no active linked cells for >5s, nudge head (original He)
                if ((now - (this.lastCatchTime || 0)) > 5000) {
                    this.lastCatchTime = now;
                    this.segments[0].K(He, 80);
                }
            }
        }

        /**
         * resetSpeed — equivalent to original Ue
         * Resets to default phase, speed and timing.
         */
        resetSpeed(now) {
            this.ba = Ee; // reset frame
            this.segments[0].K(Ne, 80, 100);
            this.moveDuration = this.baseDuration;
            this.speedMultiplier = 1;
            this.lastUpdateTime = now;
            this.lastMatchTime = null;
        }

        /**
         * enqueueDirection — original ze
         * Adds a direction into the direction queue if valid and triggers animation on head.
         * Keeps at most two queued directions.
         */
        enqueueDirection(directionInput, externalFlag) {
            // original called xb(b) in some cases; allow mapping if required
            if (this.Hb != null) directionInput = xb(directionInput);

            if (this.directionQueue.length < 2) {
                let currentFacing = this.segments[0].F;
                if (this.directionQueue.length) currentFacing = this.directionQueue[this.directionQueue.length - 1];

                // only allow orthogonal turns (1/2 vs 3/4 cross)
                if (((currentFacing === 1 || currentFacing === 2) && (directionInput === 3 || directionInput === 4)) || ((directionInput === 1 || directionInput === 2) && (currentFacing === 3 || currentFacing === 4))) {
                    this.directionQueue.push(directionInput);
                    // choose a quick animation depending on transform map result
                    const transform = DirectionManager.getInstance().transformMap.get([currentFacing, directionInput]);
                    const anim = (transform === 3) ? Le : Me;
                    this.segments[0].K(anim, 80);
                }
            }
        }

        /**
         * updateVisualsAfterStep — equivalent to original Ce
         * Reassigns sprite frames down the chain and ensures correct z-index and visuals.
         */
        updateVisualsAfterStep() {
            const lastIndex = this.segments.length - 1;

            // ensure last segment element visible
            this.segments[lastIndex].getElement().show(true);

            // cascade frame references from head to tail (preserving ordering)
            for (let i = lastIndex - 1; i > 1; i--) {
                this.segments[i].mainSprite = this.segments[i - 1].a;
                this.segments[i].mainSprite.setZIndex(16 - i);
            }

            // second element uses previous sprite instance
            this.segments[1].mainSprite = this.segments[lastIndex - 1].qa();
            this.segments[1].mainSprite.setZIndex(15);

            // refresh visuals for head, second, tail
            cf(this.segments[0], this.ba);
            cf(this.segments[1]);
            cf(this.segments[lastIndex]);
        }

        /**
         * setSpeedParameters — equivalent to original Ae
         * For debugging, sets IB (some timer), speed multiplier Gb and derived duration Ab.
         */
        setSpeedParameters(secs, speed) {
            console.log(`obj: ${this} | secs: ${secs} | speed: ${speed}`);
            this.lastCatchTime = secs;
            this.speedMultiplier = speed;
            this.moveDuration = this.baseDuration * this.speedMultiplier;
        }

        // shorthand helpers to expose head coordinates like Sa / Ta
        getX() { return this.segments[0].getX(); }
        getY() { return this.segments[0].getY(); }

        // cleanup
        dispose() {
            ArrayUtils.forEach(this.segments, seg => seg.dispose());
            this.directionQueue = null;
            this.headSprite.dispose();
            super.dispose();
        }

        // convenience getters used in original code
        getRow() { return this.getY(); }
        getColumn() { return this.getX(); }
    }

    class CatchItemEvent extends goog.events.Event {
        constructor(a, b) {
            super("catch item");
            this.item = a;
            this.gb = b;
        }
    }
    class MatchPatternEvent extends goog.events.Event {
        constructor(a, b) {
            super("match pattern");
            this.pattern = a;
            this.gb = b;
        }
    }

    // Sprite frame sets for each segment type
    const SegmentFrames = {
        0: Cc,  // Head
        1: qc,  // Body
        2: Bc   // Tail
    };

    /**
     * SnakeSegment class
     * Represents a single segment of the snake.
     */
    class SnakeSegment extends goog.events.Event {
        /**
         * @param {number} direction - Current facing direction (1–4).
         * @param {number} type - Segment type (0=head, 1=body, 2=tail).
         * @param {number} gridX - X position on grid.
         * @param {number} gridY - Y position on grid.
         * @param {number} index - Segment index (used for frame offset).
         * @param {SnakeSegment|null} parentSegment - Previous segment in chain.
         * @param {HTMLElement} container - The sprite layer/container.
         */
        constructor(direction, type, gridX, gridY, index, parentSegment, container) {
            super();

            // Movement and direction
            this.baseDirection = this.currentDirection = direction; // current + previous direction (oa, F)
            this.entityType = type;                                 // 0=head, 1=body, 2=tail (W)
            this.gridX = gridX;                                     // grid X (k)
            this.gridY = gridY;                                     // grid Y (o)
            this.parent = parentSegment;                            // previous segment (Pa)

            // Sprite for this segment
            this.mainSprite = createSprite(qc, 16 - index, container); // base sprite (a)
            this.mainSprite.show(true);

            // Secondary sprite (for head/tail overlays)
            this.shadowSprite = null; // A
            if (this.entityType === 0 || this.entityType === 2) {
                this.shadowSprite = createSprite(SegmentFrames[this.entityType], 16 - index, container);
            }

            // Initial frame setup
            updateSegmentSprite(this);
        }

        /**
         * Move this segment by interpolating along its direction.
         * @param {number} progress - 0 to 1 progress within the current move step.
         */
        move(progress) {
            let x = this.gridX + (this.baseDirection === 3 ? -1 : this.baseDirection === 4 ? 1 : 0) * progress;
            let y = this.gridY + (this.baseDirection === 1 ? -1 : this.baseDirection === 2 ? 1 : 0) * progress;

            // Handle wrap-around on grid edges
            if ((x > 22 || x < 0 || y > 8 || y < 0) && this.shadowSprite) {
                const wrappedX = x > 22 ? x - 23 : x < 0 ? x + 23 : x;
                const wrappedY = y > 8 ? y - 9 : y < 0 ? y + 9 : y;
                const rotation = this.mainSprite.Na();

                if (rotation === 180) this.shadowSprite.flip();
                else this.shadowSprite.rotate(rotation);

                Sprite.moveToGrid(this.shadowSprite, wrappedX, wrappedY);
                this.shadowSprite.show(true);
            }

            Sprite.moveToGrid(this.mainSprite, x, y);
        }

        /**
         * Play an animation on the segment.
         */
        playAnimation(anim, duration, delay, loop, callback) {
            if (!isSpecialFrame(this) || anim == null) {
                duration = Math.min(duration, 500);
                this.mainSprite.K(anim, duration, delay, loop, callback);
                if (this.shadowSprite) this.shadowSprite.K(anim, duration, delay, loop, callback);
            }
        }

        /**
         * Cleanup sprite resources.
         */
        dispose() {
            this.mainSprite.dispose();
            if (this.shadowSprite) this.shadowSprite.dispose();
            super.dispose();
        }

        /** @returns {Sprite} The main sprite object. */
        getSprite() { return this.mainSprite; }

        /** @returns {number} Grid X coordinate. */
        getX() { return this.gridX; }

        /** @returns {number} Grid Y coordinate. */
        getY() { return this.gridY; }

        /** @returns {number} Flattened cell index (Y * 23 + X). */
        getCellIndex() { return 23 * this.gridY + this.gridX; }
    }

    /**
     * Determines if a segment’s current frame is special (turn/corner).
     */
    function isSpecialFrame(segment) {
        const frameId = segment.mainSprite.getFrameId();
        const isTurnA = Oe.includes(frameId) || Pe.includes(frameId);
        const isTurnB = Qe.includes(frameId) || Re.includes(frameId);
        return frameId === pc || isTurnA || isTurnB;
    }

    /**
     * Sets the correct frame, rotation, and position for a segment.
     */
    function updateSegmentSprite(segment, overrideFrame) {
        let frameSet = SegmentFrames[segment.entityType];
        if (segment.entityType === 0) frameSet = overrideFrame || frameSet;

        const directionMgr = DirectionManager.getInstance();
        let angle = directionMgr.getBaseAngle(segment.baseDirection);

        if (segment.entityType === 1 && segment.baseDirection && segment.currentDirection !== segment.baseDirection) {
            frameSet = pc;
            angle = directionMgr.rotationMap.get([segment.currentDirection, segment.baseDirection]);
        }

        if (!segment.mainSprite.animation || !segment.mainSprite.animation.isPlaying()) {
            segment.mainSprite.setFrame(frameSet);
            if (segment.shadowSprite) segment.shadowSprite.setFrame(frameSet);
        }

        if (segment.entityType === 0 && angle === 180) segment.mainSprite.flip();
        else segment.mainSprite.rotate(angle);

        if (segment.shadowSprite) segment.shadowSprite.show(false);
        Sprite.moveToGrid(segment.mainSprite, segment.gridX, segment.gridY);
    }

    /**
     * Updates transition frames for turning animation.
     */
    function animateSegmentTurn(segment, progress) {
        const frameId = segment.mainSprite.getFrameId();
        if (Je.includes(frameId) || Ke.includes(frameId)) return;

        const frameIndex = Math.min(Math.floor(5 * progress), 4);
        const directionMgr = DirectionManager.getInstance();
        let frameSet;

        if (segment.W === 0) {
            const mapType = directionMgr.alternateTransform.get([segment.baseDirection, segment.currentDirection]);
            frameSet = mapType === 3 ? Oe : Pe;
        } else {
            const mapType = directionMgr.transformMap.get([segment.baseDirection, segment.currentDirection]);
            frameSet = mapType === 3 ? Qe : Re;
            segment.mainSprite.rotate(directionMgr.getBaseAngle(segment.baseDirection));
        }

        stopAllAnimations(segment.mainSprite);
        segment.mainSprite.setFrame(frameSet[frameIndex]);
    }

    /**
     * DirectionManager handles rotation and direction mapping between entities.
     * It defines angle relationships and direction transforms.
     */
    class DirectionManager {
        constructor() {
            // Rotation angles between directional pairs [from, to]
            this.rotationMap = new MapEx(); //ga
            this.rotationMap.set([1, 3], 180);
            this.rotationMap.set([1, 4], 90);
            this.rotationMap.set([2, 3], 270);
            this.rotationMap.set([2, 4], 0);
            this.rotationMap.set([3, 1], 0);
            this.rotationMap.set([3, 2], 90);
            this.rotationMap.set([4, 1], 270);
            this.rotationMap.set([4, 2], 180);

            // Base facing direction angles
            this.baseDirection = new MapEx(); //g
            this.baseDirection.set(1, 270);
            this.baseDirection.set(2, 90);
            this.baseDirection.set(3, 180);
            this.baseDirection.set(4, 0);

            // Directional transformation table
            this.transformMap = new MapEx(); //$
            this.transformMap.set([3, 1], 4);
            this.transformMap.set([3, 2], 3);
            this.transformMap.set([4, 1], 3);
            this.transformMap.set([4, 2], 4);
            this.transformMap.set([2, 3], 4);
            this.transformMap.set([2, 4], 3);
            this.transformMap.set([1, 3], 3);
            this.transformMap.set([1, 4], 4);

            // Alternate transformation variant (a clone with small overrides)
            this.alternateTransform = this.transformMap.clone(); //wc
            this.alternateTransform.set([3, 1], 3);
            this.alternateTransform.set([3, 2], 4);
        }

        /**
         * Get base direction angle.
         * @param {number} dir - Direction index (1–4)
         * @returns {number} - Angle in degrees
         */
        getBaseAngle(dir) { //Na
            return this.baseDirection.get(dir);
        }
    }
    defineSingleton(DirectionManager);

    class GameController extends goog.Disposable {
        lastUpdateTime = 0;
        constructor(rootElement) {
            super();
            this.root = rootElement;

            this.gridContainer = createDiv();
            addClass(this.gridContainer, "grids");
            this.root.appendChild(this.gridContainer);
            setPosition(this.gridContainer, START_POS.x, START_POS.y);

            this.state = "unstarted"; //i
            this.startTime = getTime(); //Vd
            this.remainingTime = minutes; //ea

            this.score = 0; // score (z)
            this.comboData = {}; // $b
            this.hc = this.Aa = null;
            this.Ma = [];
            this.TileSpawner = TileSpawner.getInstance();
            gridClass = this.TileSpawner;
            this.TileSpawner.init(this.gridContainer);
            this.snake = new SnakeController(this.gridContainer);
            snakeClass = this.snake;

            this.input = new InputController();
            this.eventHandler = new goog.events.EventHandler(this);
            this.objectPool = ObjectPoolManager.getInstance();

            this.playButton = new ClickableElement(12, START_BUTTON.x, START_BUTTON.y, this.root, 101);
            this.playButton.show(false);

            this.soundButton = new ClickableElement(90, SOUND_BUTTON.x, SOUND_BUTTON.y, this.root, 100);
            this.soundButton.show(false);

            this.music = new AudioPlayer(["./resources/snake"]);

            this.mainSprite = new SpriteGroup(31, MAIN_SPR_POS.x, MAIN_SPR_POS.y, this.root, 100);
            this.mainSprite.show(false);

            this.fb = null;
            this.eb = [];

            this.uiSeq = null;
            this.tutSeq = null;
            this.introSeq = null;

            this.gc = 0;

            this.visibilityTimer = new VisibilityTimer(3E4, this.onVisibilityLost, this.onVisibilityReturn);
            window.isAnimationPaused = false;

            new SpriteGroup(19, BG_LEFT.x, BG_LEFT.y, this.root, 100);
            this.leftFrame = new SpriteGroup(36, FRAME_LEFT.x + 99, FRAME_LEFT.y, this.root, -1);
            this.rightFrame = new SpriteGroup(53, FRAME_RIGHT.x - 99, FRAME_RIGHT.y, this.root, -1);
            this.leftFrame.show(false);
            this.rightFrame.show(false);

            this.timerDisplay = new TimerDisplay(TIMER_POS.x, TIMER_POS.y, this.root);
            this.timerDisplay.show(false);

            this.scoreDisplay = new ScoreDisplay(qf, this.root);

            this.icons = [];
            for (let i = 0; i < SIDE_ICONS.length; i++) {
                const pos = SIDE_ICONS[i];
                const sprite = new Sprite(33);
                sprite.show(false);
                Sprite.setPosition(sprite, pos.x, pos.y);
                this.root.appendChild(sprite.getElement());
                this.icons.push(sprite);
            }

            this.eventHandler.listen(this.input, "a", this.Xd);
            this.eventHandler.listen(this.snake, "catch item", this.handleItemCollected);
            this.eventHandler.listen(this.snake, "match pattern", this.handlePatternMatch);
            this.eventHandler.listen(this.soundButton, "click", this.Wd);

            this.snake.init();
            this.updateLoop();
        }
        onVisibilityLost() {
            if ("running" == this.state) {
                this.music.pause();
                var a = this.snake;
                a.ba = Yc;
                a.d[0].qa().setFrame(a.ba);
                Of(this);
            }
        }
        onVisibilityReturn() {
            if ("tutorial_start" == this.state || "tutorial_end" == this.state) {
                this.music.play();
                var a = this.snake;
                a.ba = Ee;
                a.d[0].qa().setFrame(a.ba);
                this.state = "running";
                Pf(this);
                minutes == this.remainingTime && Nf(this);
            }
        }
        flashStartButton() {
            if ("init" == this.state) {
                this.playButton.K(Cf, 80);
                setTimeout(this.flashStartButton, 3E3);
            }
        }

        handleItemCollected(evt) {
            let itemData = this.TileSpawner.getItem(evt.item);
            if (!itemData) return;

            if (itemData.i === 1 || itemData.cc < itemData.mainSprite.getHeight()) {
                let name = itemData.getName();

                this.comboData[name]++;
                console.log("Snake eaten " + name);

                this.score = Math.min(this.score + itemData.score, 999);

                switch (name) {
                    case "mushroom":
                    case "firecraker":
                    case "medicine":
                    case "tea":
                        let snake = this.snake;
                        let boostSrc = evt.gb;
                        snake.segments[0].animate(Ge, 80, 500);
                        boostFunction(snake, boostSrc, 0.1);
                        snake.frameId = Vc;
                        break;

                    case "lantern":
                        // Lantern combo logic (unchanged)
                        let comboStr = processLanternCombo(itemData);
                        if (comboStr) {
                            let spawner = this.TileSpawner;
                            for (let i = 0; i < comboStr.length; i++)
                                spawnItem(spawner, createItem("steamer"), find2x2Block(spawner.grid));

                            if (comboStr.length === 6)
                                fillGridWithItems(spawner, comboStr[random(comboStr.length)]);
                        }
                        triggerLanternEffect(this);
                        break;
                }

                itemData.destroy();
                this.scoreDisplay.update(this.score);
            } else {
                itemData.shadowSprite.show(false);
                itemData.mainSprite.setZIndex(1);
            }
        }

        Yd(a) {
            var b = this.TileSpawner.getItem(a.item);
            if (b != null)
                if (1 == b.i || b.cc < b.mainSprite.getHeight()) {
                    var c = b.getName();
                    this.comboData[c]++;
                    console.log("Snake eaten " + c);
                    this.score += b.z;
                    this.score = Math.min(this.score, 999);
                    switch (c) {
                        case "mushroom":
                        case "firecraker":
                        case "medicine":
                        case "tea":
                            c = this.snake;
                            a = a.gb;
                            c.d[0].K(Ge, 80, 500);
                            boostFunction(c, a, .1);
                            c.ba = Vc;
                            break;
                        case "lantern":
                            a: {
                                a = Td;
                                c = b.be;
                                if (1 == a.length) c == a[0] ? U = true : a[0] == "GOOGLE"[0] && c == "GOOGLE"[1] ? U = false : (Td = [], U = true);
                                else if (a.length)
                                    if (U && c == a[0] || !U && c == "GOOGLE"[a.length]) {
                                        if (U && 2 == a.length || !U && 5 == a.length) {
                                            a.push(c);
                                            Td = [];
                                            U = true;
                                            a = a.join("");
                                            break a;
                                        }
                                    } else Td = [], U = true;
                                Td.push(c);
                                a = "";
                            }
                            if (a) {
                                for (var c = this.TileSpawner, d = a.length, e = 0; e < d; e++) {
                                    spawnItem(c, createItem("steamer"), find2x2Block(c.g));
                                }
                                6 == a.length && fillGridWithItems(this.TileSpawner, a[random(a.length)]);
                            }
                            Tf(this);
                    }
                    b.Ia();
                    this.scoreDisplay.update(this.score);
                } else {
                    b.J.show(false);
                    b.mainSprite.setZIndex(1);
                }
        }
        handlePatternMatch(a) {
            const pattern = evt.pattern;
            if (pattern !== "") fillGridWithItems(this.TileSpawner, pattern);
            this.gc++;
        }
        Xd(a) {
            this.visibilityTimer.resetTimer();
            if ("tutorial_end" == this.state) {
                Pf(this);
                Nf(this);
            } else if ("running" == this.state) {
                ze(this.snake, a.Ie);
            }
        }
        De() {
            this.music.load(false);
            this.visibilityTimer.resetTimer();
            var seq = new AnimationSequence();
            this.uiSeq = seq;
            seq.addStep(function () {
                Sprite.fadeOut(this.cb);
            });
            seq.addStep(function (a) {
                Sprite.setPosition(this.playButton, Z.x, Z.y + 80 * a * a);
                setOpacity(this.playButton.aa(), 1 - a * a);
            }, 700);
            seq.addPauseStep(200);
            seq.addStep(function () {
                this.cb.show(false);
                this.playButton.show(false);
                setOpacity(this.fa, 1);
            });
            seq.addStep(function () {
                this.leftFrame.show(true);
                this.rightFrame.show(true);
            });
            seq.addStep(function (a) {
                Sprite.setPosition(this.leftFrame, FRAME_LEFT.x + 99 * (1 - a), FRAME_LEFT.y);
                Sprite.setPosition(this.rightFrame, FRAME_RIGHT.x - 99 * (1 - a), FRAME_RIGHT.y);
            }, 1E3);
            seq.addStep(function () {
                Sprite.animateOpacity(this.La, 500, 0, 1);
                this.soundButton.show(true);
            });
            seq.addStep(function () {
                Of(this);
            });
            seq.play();
        }
        td() {
            this.visibilityTimer.resetTimer();
            if ("tutorial_end" == this.state) {
                Pf(this);
                Nf(this);
            }
        }
        playTutorialSequence() {
            if ("tutorial_start" == this.state || "tutorial_end" == this.state) {
                var seq = new AnimationSequence();
                this.tutSeq = seq;
                for (var b in Bf) {
                    seq.addStep(createFrameAnimation(this.eb[b], Bf[b], Af[b], 29));
                    seq.addPauseStep(300);
                }
                seq.addStep(function () {
                    if ("tutorial_start" == this.state) this.state = "tutorial_end";
                });
                seq.play();
                setTimeout(this.playTutorialSequence, 3E3);
            }
        }
        Wd() {
            this.visibilityTimer.resetTimer();
            this.Ka = !this.Ka;
            this.La.setFrame(this.Ka ? 90 : 89);
            this.soundButton.H.muted = this.Ka ? false : true;
        }
        ze() {
            setOpacity(this.fa, 1);
            this.Aa.show(false);
            Nf(this);
        }
        updateLoop = () => {
            var now = getTime();
            let delta = Math.min(50, now - this.lastUpdateTime);
            if ("running" == this.state) {
                updateGameState(this, delta, now);
            } else if ("unstarted" == this.state && 1500 < now - this.startTime) {
                this.state = "init";
                playIntroSequence(this);
            }
            requestAnimFrame(this.updateLoop);
            this.lastUpdateTime = now;
        }
        dispose() {
            this.state = "stop";
            safeDispose(this.eventHandler);
            if (this.introSeq) this.introSeq.stop();
            if (this.tutSeq) this.tutSeq.stop();
            if (this.uiSeq) this.uiSeq.stop();
            window.isAnimationPaused = true;
            this.comboData = null;
            this.timerDisplay.dispose();
            this.scoreDisplay.dispose();
            this.TileSpawner.dispose();
            this.snake.dispose();
            this.input.dispose();
            this.soundButton.dispose();
            this.visibilityTimer.dispose();
            super.dispose();
        }
    }

    var START_BUTTON = new Point(309, 79),
        SOUND_BUTTON = new Point(625, 125),
        MAIN_SPR_POS = new Point(256, 46),
        sf = new Point(164, 36),
        vf = new Point(425, 110),
        wf = new Point(212, 80),
        xf = [91, 92, 93],
        yf = [new Point(415, 82), new Point(397, 82), new Point(379, 82)],
        BG_LEFT = new Point(96, 6), //mf
        START_POS = new Point(110, 20), //jf
        FRAME_LEFT = new Point(4, 46), //nf
        FRAME_RIGHT = new Point(577, 46), //of
        TIMER_POS = new Point(43, 103), //pf
        qf = [new Point(640, 103), new Point(629, 103), new Point(618, 103), new Point(607, 103), new Point(596, 103), new Point(585, 103)],
        SIDE_ICONS = [new Point(6, 127), new Point(6, 143), new Point(22, 143), new Point(5, 159), new Point(22, 159), new Point(38, 159)], //rf
        zf = new Point(294, 44),
        Af = [new Point(387, 81), new Point(387, 115), new Point(353, 115), new Point(420, 115)],
        Bf = [
            [98, 102, 106, 102, 98],
            [95, 99, 103, 99, 95],
            [96, 100, 104, 100, 96],
            [97, 101, 105, 101, 97]
        ],
        Cf = [12, 13, 14, 15, 16, 17, 18],
        Ff = [51, 50],
        If = [51, 52];

    /**
     * Updates the current game state per frame.
     * 
     * @param {Object} game - The main game controller.
     * @param {number} deltaTime - Time passed since last frame.
     * @param {number} currentTime - Current game time.
     */
    function updateGameState(game, deltaTime, currentTime) {
        // Update managers
        game.ka.update(currentTime);
        game.N.move(currentTime);
        game.ya.update(currentTime);
        game.za.update(Math.floor(game.ea / 1000));

        // Countdown timer
        game.ea -= deltaTime;

        // Check for phase transitions
        if (he === 1 && game.ea < 40000) {
            switchGamePhase(game, 2);
        } else if (he === 2 && game.ea < 20000) {
            switchGamePhase(game, 3);
        }

        // Time over condition
        if (game.ea < 0 && game.state === "running") {
            game.state = "stop";
            stopGame(game);

            game.za.show(false);
            resetDisplay(game.ya);

            ArrayUtils.forEach(game.yb, sprite => sprite.show(false));

            game.la.load(false);
        }
    }

    /**
     * Switches the game to a new phase/level.
     * 
     * @param {Object} game - The game instance.
     * @param {number} phaseId - The new phase index.
     */
    function switchGamePhase(game, phaseId) {
        he = phaseId;

        // Reset object counters for this phase
        initializeObjectCounter(ObjectPoolManager.getInstance(), phaseId);

        // Update entity parameters from registry
        const entity = game.N;
        entity.Fb = ObjectRegistry[phaseId].V;
        entity.Ab = entity.Fb * entity.Gb;
        game.ka.vc = ObjectRegistry[phaseId].U;
    }

    /**
     * Plays the game's intro animation sequence.
     * 
     * @param {Object} game - The game controller.
     */
    function playIntroSequence(game) {
        const seq = new AnimationSequence();
        game.seq = seq;

        // Animate entity 38 times with short pauses
        for (let i = 1; i < 39; i++) {
            seq.addStep(runTutorialStep(game.snake));
            seq.addPauseStep(150);
        }

        // Fade in secondary sprite
        seq.addPauseStep(200);
        seq.addStep(function () {
            this.cb.show(true);
            Sprite.animateOpacity(this.cb, 400, 0, 1);
        });

        // Move main sprite (`ca`)
        seq.addPauseStep(600);
        seq.addStep(function () {
            Sprite.setPosition(game.playButton, Z.x, Z.y - 80);
            this.playButton.show(true);
        });

        // Bounce animation 1
        seq.addStep(function (t) {
            Sprite.setPosition(game.playButton, Z.x, Z.y - 80 * (1 - t * t));
        }, 700);

        // Bounce animation 2
        seq.addStep(function (t) {
            Sprite.setPosition(game.playButton, Z.x, Z.y - 80 * (0.25 - (0.5 - t) * (0.5 - t)));
        }, 700);

        // Run "ready" callback
        seq.addStep(function () {
            game.flashStartButton();
        });

        // Add click handler
        seq.addStep(function () {
            game.playButton.addEventListener("mousedown", this.De)
        });

        seq.play();
    }

    function createFrameAnimation(sprite, frames, position, offsetY) {
        return function () {
            const anim = new AnimationSequence();
            frames.forEach(frame => {
                anim.addStep(() => {
                    sprite.setFrame(frame);
                    Sprite.setPosition(sprite, position.x, position.y + offsetY - sprite.getHeight());
                });
                anim.addPauseStep(80);
            });
            anim.play();
        };
    }

    var Nf = function (a) {
        Ue(a.N, getTime());
        a.i = "running";
        a.ea = minutes;
        switchGamePhase(a, 1);
        a.za.update(Math.floor(a.ea / 1E3));
        a.za.show(true);
        a.z = 0;
        a.ya.update(a.z);
        a.ya.reset();
        Mf(a);
        Td = [];
        U = true;
        ArrayUtils.forEach(a.yb, function (a) {
            a.show(false)
        });
        a.La.show(true);
        a.la.play();
        a.la.H.muted = !a.Ka;
        a.gc = 0
    };
    var Mf = function (a) {
        getObjectKeys(ItemDefinitions).forEach(function (a) {
            this.comboData[a] = 0
        }, a);
    };

    var Tf = function (a) {
        ArrayUtils.forEach(a.yb, function (a, c) {
            if (c < Td.length) {
                a.setFrame(sd[Td[c]]);
                a.show(true);
            } else a.show(false);
        })
    };

    function stopGame(a) {
        isOver = true;
        if (a.Aa) {
            setOpacity(a.fa, 0.3);
            a.hc.setFrame(xf[(80 > a.z ? 1 : 150 > a.z ? 2 : 3) - 1]);
            var b = createDigitSprites(a.z, vd);
            a.Aa.show(true);
            for (var c in b) {
                if (b[c] != null) {
                    a.Ma[c].show(true);
                    a.Ma[c].setFrame(b[c]);
                } else a.Ma[c].show(false);
            }
        } else {
            a.Aa = new SpriteGroup(61, sf.x, sf.y, a.v, 100);
            if (!a.bd) {
                var q = new ClickableElement(52, vf.x, vf.y, a.v, 101);
                a.eventHandler.listen(q, "click", a.ze);
                a.eventHandler.listen(q, "mouseover", createFrameAnimation(q, Ff, vf, 28));
                a.eventHandler.listen(q, "mouseout", createFrameAnimation(q, If, vf, 28));
                a.Aa.add(q);
            }
            a.hc = new SpriteGroup(xf[(80 > a.z ? 1 : 150 > a.z ? 2 : 3) - 1], wf.x, wf.y, a.v, 101);
            a.Aa.add(a.hc);
            for (var r in createDigitSprites(a.z, vd)) {
                c = b[r];
                a.Ma[r] = new SpriteGroup(c == null ? td[0] : c, yf[r].x, yf[r].y, a.v, 101)
                if (c == null) {
                    a.Ma[r].show(false);
                    a.Aa.add(a.Ma[r]);
                }
            }
            setOpacity(a.fa, 0.3)
        }
    };
    var Of = function (a) {
        a.fb = new ClickableElement(94, zf.x, zf.y, a.v, 100);
        for (var b in Bf) {
            a.eb[b] = new ClickableElement(Bf[b][0], Af[b].x, Af[b].y, a.v, 101);
            a.eventHandler.listen(a.eb[b], "click", a.td);
            a.fb.add(a.eb[b]);
        }
        a.state = "tutorial_start";
        a.eventHandler.listen(a.fb, "click", a.td);
        a.sd()
    };
    var Pf = function (a) {
        Sprite.fadeOut(a.fb);
        ArrayUtils.forEach(a.eb, function (a) {
            Sprite.fadeOut(a)
        });
        a.fb.show(false)
    };

    var logoElement = null;
    var gameController = null;
    (function(callInit){
        callInit();
    })(function init() {
        if (logoElement = document.getElementById("hplogo")) {
            // Sprite / resource loader for the doodle
            SpriteManager = new SpriteSheet("./resources/spritesheet.png", lc);
            SpriteManager.load();

            // Build a configuration set (rc) with many keys enabled
            var enabledSet = new MapEx();
            enabledSet.set(Bc, true);
            enabledSet.set(pc, true);
            enabledSet.set(id, true);
            enabledSet.set(jd, true);
            enabledSet.set(kd, true);
            enabledSet.set(ld, true);
            enabledSet.set(md, true);
            enabledSet.set(nd, true);
            enabledSet.set(od, true);
            enabledSet.set(pd, true);
            enabledSet.set(qd, true);
            enabledSet.set(rd, true);
            rc = enabledSet;

            // Another configuration set (sc) with a different set of keys
            var otherSet = new MapEx();
            otherSet.set(Zc, true);
            otherSet.set($c, true);
            otherSet.set(ad, true);
            otherSet.set(bd, true);
            otherSet.set(cd, true);
            otherSet.set(id, true);
            otherSet.set(jd, true);
            otherSet.set(kd, true);
            otherSet.set(ld, true);
            otherSet.set(md, true);
            sc = otherSet;

            // Build level / wave presets (W)
            var keyEnum = LootTable;
            var configObj;

            configObj = {};
            configObj[keyEnum.firecraker] = 10;
            configObj[keyEnum.dumpling] = 20;
            configObj[keyEnum.Kb] = 20;
            configObj[keyEnum.envelope] = 20;
            configObj[keyEnum.Fa] = 10;
            configObj[keyEnum.coin] = 40;
            configObj[keyEnum.Ea] = 20;
            ObjectRegistry[1] = { data: configObj, V: 200, U: 1 };

            configObj = {};
            configObj[keyEnum.firecraker] = 10;
            configObj[keyEnum.Fa] = 10;
            configObj[keyEnum.Kb] = 10;
            configObj[keyEnum.nb] = 10;
            configObj[keyEnum.lantern] = 50;
            ObjectRegistry[2] = { data: configObj, V: 180, U: 0.85 };

            configObj = {};
            configObj[keyEnum.nb] = 30;
            configObj[keyEnum.Fa] = 20;
            configObj[keyEnum.mb] = 20;
            configObj[keyEnum.firecraker] = 30;
            configObj[keyEnum.lantern] = 30;
            ObjectRegistry[3] = { data: configObj, V: 160, U: 0.6 };

            // Some named presets
            configObj = {};
            configObj[keyEnum.firecraker] = 20;
            configObj[keyEnum.dumpling] = 30;
            configObj[keyEnum.coin] = 50;
            ObjectRegistry.O = { data: configObj, V: 200, U: 1 };

            configObj = {};
            configObj[keyEnum.firecraker] = 40;
            configObj[keyEnum.dumpling] = 10;
            configObj[keyEnum.coin] = 50;
            ObjectRegistry.O2 = { data: configObj, V: 200, U: 1 };

            configObj = {};
            configObj[keyEnum.dumpling] = 30;
            configObj[keyEnum.coin] = 40;
            configObj[keyEnum.Ea] = 30;
            ObjectRegistry.G1 = { data: configObj, V: 200, U: 1 };
            ObjectRegistry.E = { data: configObj, V: 200, U: 1 };
            ObjectRegistry.L = { data: configObj, V: 200, U: 1 };

            configObj = {};
            configObj[keyEnum.coin] = 50;
            configObj[keyEnum.Ea] = 50;
            ObjectRegistry.G = { data: configObj, V: 200, U: 1 };

            // Some global flags / counters
            he = 1;
            xe = we = 0;

            GridPatternManager.getInstance().init();

            // Build reverse mapping Xd from keys in Zd to some default T, then override some
            var enumObj = LootTable;
            var reverseMap = {};
            var enumKey;
            for (enumKey in enumObj) {
                reverseMap[enumObj[enumKey]] = T;
            }
            reverseMap[enumObj.firecraker] = AnimatedFallingEntity;
            reverseMap[enumObj.dumpling] = StaticVariantEntity;
            reverseMap[enumObj.steamer] = ShadowedEntity;
            reverseMap[enumObj.nb] = RandomMovingEntity;
            reverseMap[enumObj.envelope] = MovingEntity;
            reverseMap[enumObj.lantern] = LanternEntity;
            ItemClasses = reverseMap;

            // Build item definitions (Wd)
            var itemDefs = {};
            itemDefs[enumObj.firecraker] = new Item([R.pe], enumObj.firecraker, 5000);
            itemDefs[enumObj.dumpling] = new Item([R.ne, R.oe], enumObj.dumpling, 7000, 2);
            itemDefs[enumObj.steamer] = new Item([R.ob], enumObj.steamer, 7000, 10);
            itemDefs[enumObj.Kb] = new Item([R.we, R.xe], enumObj.Kb, 6000, 2, true);
            itemDefs[enumObj.Fa] = new Item([R.Fa], enumObj.Fa, 6000, 2, false);
            itemDefs[enumObj.nb] = new Item([R.qe, R.le], enumObj.nb, 6000, 5);
            itemDefs[enumObj.envelope] = new Item([R.envelope], enumObj.envelope, 7000, 2);
            itemDefs[enumObj.mb] = new Item([R.mb], enumObj.mb, 7000, 1, false);
            itemDefs[enumObj.lantern] = new Item([R.se, R.ve, R.ue, R.re], enumObj.lantern, 8000, 2);
            itemDefs[enumObj.coin] = new Item([R.coin], enumObj.coin, 10000, 1);
            itemDefs[enumObj.Ea] = new Item([R.Ea], enumObj.Ea, 5000, 5);
            console.log(itemDefs);
            ItemDefinitions = itemDefs;

            // Start or set some initial state (ae probably attaches / activates level/state manager)
            initializeObjectCounter(ObjectPoolManager.getInstance(), 1);

            // Create controller/handler for the logo DOM element
            gameController = new GameController(logoElement);
        }
    }, function cleanup() {
        // cleanup callback — release controller if present
        if (gameController) gameController.dispose();
    });
})();