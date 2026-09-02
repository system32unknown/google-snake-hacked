var goog = goog || {};

/**
 * Determines the type of a value.
 * @param {*} a - The value to check.
 * @returns {string} The type string (e.g., 'array', 'function', 'object').
 */
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
goog.nullFunction = function () {};
goog.UID_PROPERTY_ = "closure_uid_" + Math.floor(2147483648 * Math.random()).toString(36);
goog.uidCounter_ = 0;
goog.getHashCode = goog.getUid;
goog.removeHashCode = goog.removeUid;
goog.bindNative_ = function (a, b, c) {
	return a.call.apply(a.bind, arguments)
};
goog.bindJs_ = function (a, b, c) {
	var d = b || goog.global;
	if (arguments.length > 2) {
		var e = Array.prototype.slice.call(arguments, 2);
		return function () {
			var b = Array.prototype.slice.call(arguments);
			Array.prototype.unshift.apply(b, e);
			return a.apply(d, b)
		}
	}
	return function () {
		return a.apply(d, arguments)
	}
};
goog.bind = function() {
	goog.bind = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? goog.bindNative_ : goog.bindJs_;
	return goog.bind.apply(null, arguments)
};

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
    var a = "", b;        
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
    var d = {};
    for (var e in a) b.call(c, a[e], e, a) && (d[e] = a[e]);
    return d
};
goog.object.map = function (a, b, c) {
    var d = {};
    for (var e in a) d[e] = b.call(c, a[e], e, a);
    return d
};
goog.object.some = function (a, b, c) {
    for (var d in a) if (b.call(c, a[d], d, a)) return true;
    return false
};
goog.object.every = function (a, b, c) {
    for (var d in a) if (!b.call(c, a[d], d, a)) return false;
    return true
};
goog.object.getCount = function (a) {
    var b = 0;
    for (var _ in a) b++;
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
    var b = [], c = 0;
    for (var d in a) b[c++] = a[d];
    return b
};
goog.object.getKeys = function (a) {
    var b = [], c = 0;
    for (var d in a) b[c++] = d;
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
    for (var _b in a) if(Object.hasOwn(a, _b)) return false;
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
goog.array.indexOf = function (a, b, c) {
    c = null == c ? 0 : 0 > c ? Math.max(0, a.length + c) : c;
    if (goog.isString(a)) return !goog.isString(b) || 1 != b.length ? -1 : a.indexOf(b, c);
    for (; c < a.length; c++)
        if (c in a && a[c] === b) return c;
    return -1
};
goog.array.lastIndexOf = function (a, b, c) {
    c = null == c ? a.length - 1 : c;
    0 > c && (c = Math.max(0, a.length + c));
    if (goog.isString(a)) return !goog.isString(b) || 1 != b.length ? -1 : a.lastIndexOf(b, c);
    for (; 0 <= c; c--)
        if (c in a && a[c] === b) return c;
    return -1
};
goog.array.forEach = function (a, b, c) {
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++) f in e && b.call(c, e[f], f, a)
};
goog.array.forEachRight = function (a, b, c) {
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, d = d - 1; 0 <= d; --d) d in e && b.call(c, e[d], d, a)
};
goog.array.filter = function (a, b, c) {
    for (var d = a.length, e = [], f = 0, g = goog.isString(a) ? a.split("") : a, h = 0; h < d; h++)
        if (h in g) {
            var j = g[h];
            b.call(c, j, h, a) && (e[f++] = j)
        }
    return e
};
goog.array.map = function (a, b, c) {
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
goog.array.some = function (a, b, c) {
    for (var d = a.length, e = goog.isString(a) ? a.split("") : a, f = 0; f < d; f++)
        if (f in e && b.call(c, e[f], f, a)) return true;
    return false
};
goog.array.every = function (a, b, c) {
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
    return 1 == Array.prototype.splice.call(a, b, 1).length
};
goog.array.removeIf = function (a, b, c) {
    b = goog.array.findIndex(a, b, c);
    return 0 <= b ? (goog.array.removeAt(a, b), true) : false
};
goog.array.concat = function (a) {
    return Array.prototype.concat.apply(Array.prototype, arguments)
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
    return Array.prototype.splice.apply(a, goog.array.slice(arguments, 1))
};
goog.array.slice = function (a, b, c) {
    goog.asserts.assert(null != a.length);
    return 2 >= arguments.length ? Array.prototype.splice.call(a, b) : Array.prototype.splice.call(a, b, c)
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
    Array.prototype.sort.call(a, b || goog.array.defaultCompare)
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
    a.length && (b %= a.length, 0 < b ? Array.prototype.unshift.apply(a, a.splice(-b, b)) : 0 > b && Array.prototype.push.apply(a, a.splice(0, -b)));
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

goog.structs.Map = class {
    constructor(a) {
        this.map_ = {};
        this.keys_ = [];
        var c = arguments.length;
        if (1 < c) {
            if (c % 2) throw Error("Uneven number of arguments");
            for (var d = 0; d < c; d += 2) this.set(arguments[d], arguments[d + 1]);
        } else a && this.addAll(a);
    }
    static defaultEquals(a, b) {
        return a === b;
    }
    static hasKey_(a, b) {
        return Object.prototype.hasOwnProperty.call(a, b);
    }
    getCount() {
        return this.count_;
    }
    getValues() {
        this.cleanupKeysArray_();
        for (var a = [], b = 0; b < this.keys_.length; b++) a.push(this.map_[this.keys_[b]]);
        return a;
    }
    getKeys() {
        this.cleanupKeysArray_();
        return this.keys_.concat();
    }
    containsKey(a) {
        return goog.structs.Map.hasKey_(this.map_, a);
    }
    containsValue(a) {
        for (var b = 0; b < this.keys_.length; b++) {
            var c = this.keys_[b];
            if (goog.structs.Map.hasKey_(this.map_, c) && this.map_[c] == a) return true;
        }
        return false;
    }
    equals(a, b) {
        if (this === a) return true;
        if (this.count_ != a.getCount()) return false;
        var c = b || goog.structs.Map.defaultEquals;
        this.cleanupKeysArray_();
        for (var d, e = 0; d = this.keys_[e]; e++)
            if (!c(this.get(d), a.get(d))) return false;
        return true;
    }
    isEmpty() {
        return 0 == this.count_;
    }
    clear() {
        this.map_ = {};
        this.version_ = this.count_ = this.keys_.length = 0;
    }
    remove(a) {
        return goog.structs.Map.hasKey_(this.map_, a) ? (delete this.map_[a], this.count_--, this.version_++, this.keys_.length > 2 * this.count_ && this.cleanupKeysArray_(), true) : false;
    }
    cleanupKeysArray_() {
        if (this.count_ != this.keys_.length) {
            for (var a = 0, b = 0; a < this.keys_.length;) {
                var c = this.keys_[a];
                goog.structs.Map.hasKey_(this.map_, c) && (this.keys_[b++] = c);
                a++;
            }
            this.keys_.length = b;
        }
        if (this.count_ != this.keys_.length) {
            for (var d = {}, b = a = 0; a < this.keys_.length;) c = this.keys_[a], goog.structs.Map.hasKey_(d, c) || (this.keys_[b++] = c, d[c] = 1), a++;
            this.keys_.length = b;
        }
    }
    get(a, b) {
        return goog.structs.Map.hasKey_(this.map_, a) ? this.map_[a] : b;
    }
    set(a, b) {
        goog.structs.Map.hasKey_(this.map_, a) || (this.count_++, this.keys_.push(a), this.version_++);
        this.map_[a] = b;
    }
    addAll(a) {
        var b;
        a instanceof goog.structs.Map ? (b = a.getKeys(), a = a.getValues()) : (b = goog.object.getKeys(a), a = goog.object.getValues(a));
        for (var c = 0; c < b.length; c++) this.set(b[c], a[c]);
    }
    clone() {
        return new goog.structs.Map(this);
    }
    transpose() {
        for (var a = new goog.structs.Map, b = 0; b < this.keys_.length; b++) {
            var c = this.keys_[b];
            a.set(this.map_[c], c);
        }
        return a;
    }
    toObject() {
        this.cleanupKeysArray_();
        for (var a = {}, b = 0; b < this.keys_.length; b++) {
            var c = this.keys_[b];
            a[c] = this.map_[c];
        }
        return a;
    }
    getKeyIterator() {
        return this.__iterator__(true);
    }
    getValueIterator() {
        return this.__iterator__(false);
    }
    __iterator__(a) {
        this.cleanupKeysArray_();
        var b = 0, c = this.keys_, d = this.map_, e = this.version_, f = this, g = new goog.iter.Iterator;
        g.next = function () {
            for (; ;) {
                if (e != f.version_) throw Error("The map has changed since the iterator was created");
                if (b >= c.length) throw goog.iter.StopIteration;
                var g = c[b++];
                return a ? g : d[g];
            }
        };
        return g;
    }
};
goog.structs.Map.prototype.count_ = 0;
goog.structs.Map.prototype.version_ = 0;

goog.structs.Set = class {
    constructor(a) {
        this.map_ = new goog.structs.Map;
        a && this.addAll(a);
    }
    static getKey_(a) {
        var b = typeof a;
        return "object" == b && a || "function" == b ? "o" + goog.getUid(a) : b.substr(0, 1) + a;
    }
    getCount() {
        return this.map_.getCount();
    }
    add(a) {
        this.map_.set(goog.structs.Set.getKey_(a), a);
    }
    addAll(a) {
        for (var a = goog.structs.getValues(a), b = a.length, c = 0; c < b; c++) this.add(a[c]);
    }
    removeAll(a) {
        for (var a = goog.structs.getValues(a), b = a.length, c = 0; c < b; c++) this.remove(a[c]);
    }
    remove(a) {
        return this.map_.remove(goog.structs.Set.getKey_(a));
    }
    clear() {
        this.map_.clear();
    }
    isEmpty() {
        return this.map_.isEmpty();
    }
    contains(a) {
        return this.map_.containsKey(goog.structs.Set.getKey_(a));
    }
    containsAll(a) {
        return goog.structs.every(a, this.contains, this);
    }
    intersection(a) {
        for (var b = new goog.structs.Set, a = goog.structs.getValues(a), c = 0; c < a.length; c++) {
            var d = a[c];
            this.contains(d) && b.add(d);
        }
        return b;
    }
    getValues() {
        return this.map_.getValues();
    }
    clone() {
        return new goog.structs.Set(this);
    }
    equals(a) {
        return this.getCount() == goog.structs.getCount(a) && this.isSubsetOf(a);
    }
    isSubsetOf(a) {
        var b = goog.structs.getCount(a);
        if (this.getCount() > b) return false;
        !(a instanceof goog.structs.Set) && 5 < b && (a = new goog.structs.Set(a));
        return goog.structs.every(this, function (b) {
            return goog.structs.contains(a, b);
        });
    }
    __iterator__() {
        return this.map_.__iterator__(false);
    }
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
        this.clientX = undefined !== a.clientX ? a.clientX : a.pageX;
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
goog.events.listeners_ = {};
goog.events.listenerTree_ = {};
goog.events.sources_ = {};
goog.events.onString_ = "on";
goog.events.onStringMap_ = {};
goog.events.keySeparator_ = "_";
goog.events.listen = function (a, b, c, d, e) {
    if (!b) throw Error("Invalid event type");
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