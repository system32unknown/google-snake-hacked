var ue = null;
var Yd = null;
var ne = null;
var Ge = null;
var gridClass = null;
var boostFunction = null;
var snakeClass = null;

var minutes = 6E4;

(function () {
    var g = void 0,
        h = !0,
        k = null,
        l = !1,
        m, p = this

    /** Checks if the value is an Array. */
    function isArray(value) {
        return typeOf(value) === "array";
    }

    /** Checks if the value is array-like (Array or object with a numeric length). */
    function isArrayLike(value) {
        const type = typeOf(value);
        return type === "array" || (type === "object" && typeof value.length === "number");
    }

    /** Checks if the value is a string. */
    function isString(value) {
        return typeof value === "string";
    }

    /**
     * Returns or assigns a unique ID to the given object.
     * Used to differentiate between objects in maps or sets.
     */
    function getUniqueId(obj) {
        return obj[UNIQUE_ID_KEY] || (obj[UNIQUE_ID_KEY] = ++uniqueIdCounter);
    }

    /** Internal key for storing object UIDs. */
    const UNIQUE_ID_KEY = "closure_uid_" + ((Math.random() * 1e9) >>> 0);

    /** Global incremental counter for unique IDs. */
    let uniqueIdCounter = 0;

    /**
     * Creates a function bound to a specific `this` value and optionally prepends arguments.
     * Similar to `Function.prototype.bind`.
     */
    function bindWithArgs(fn, context, ...presetArgs) {
        if (!fn) throw new Error("bindWithArgs: function is undefined");
        return function (...args) {
            return fn.apply(context, [...presetArgs, ...args]);
        };
    }

    /**
     * A universal `bind` function fallback — uses native `Function.bind` if available,
     * otherwise uses the custom `bindWithArgs` implementation.
     */
    function bind(fn, context, ...args) {
        // Replace itself after first call to optimize performance.
        bind = (Function.prototype.bind &&
                Function.prototype.bind.toString().includes("native code"))
            ? Function.prototype.bind
            : bindWithArgs;

        return bind.apply(null, [fn, context, ...args]);
    }

    /**
     * Adds a static singleton getter to a class.
     * 
     * Ensures only one instance of the given class `cls` is ever created.
     * The singleton instance is stored in `cls._instance`.
     *
     * @param {Function} cls - The class constructor to make a singleton.
     */
    function defineSingleton(cls) {
        cls.getInstance = function () {
            if (!cls._instance) {
                cls._instance = new cls();
            }
            return cls._instance;
        };
    }

    /**
     * Sets up inheritance between two constructor functions.
     * Equivalent to: `a` extends `b`.
     *
     * @param {Function} childCtor - The constructor function of the child class.
     * @param {Function} parentCtor - The constructor function of the parent class.
     */
    function inherit(childCtor, parentCtor) {
        function TempConstructor() {}
        TempConstructor.prototype = parentCtor.prototype;
        
        // Keep a reference to the parent’s prototype
        childCtor.superClass_ = parentCtor.prototype;
        
        // Set up the prototype chain
        childCtor.prototype = new TempConstructor();
    }

    /**
     * Creates a new function that pre-applies some arguments before the rest.
     * Similar to Function.prototype.bind but without binding 'this'.
     *
     * @param {Function} func - The target function.
     * @param {...*} presetArgs - Arguments to pre-apply.
     * @returns {Function} - A function that calls func with the presetArgs + newArgs.
     */
    function partialApply(func, ...presetArgs) {
        return function (...newArgs) {
            const allArgs = [...presetArgs, ...newArgs];
            return func.apply(this, allArgs);
        };
    }

    function bind(fn, thisArg, ...args) {
        return fn.bind(thisArg, ...args);
    }

    function typeOf(a) {
        var b = typeof a;
        if ("object" == b)
            if (a) {
                if (a instanceof Array) return "array";
                if (a instanceof Object) return b;
                var c = Object.prototype.toString.call(a);
                if ("[object Window]" == c) return "object";
                if ("[object Array]" == c || "number" == typeof a.length && "undefined" != typeof a.splice && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("splice")) return "array";
                if ("[object Function]" == c || "undefined" !=
                    typeof a.call && "undefined" != typeof a.propertyIsEnumerable && !a.propertyIsEnumerable("call")) return "function"
            } else return "null";
        else if ("function" == b && "undefined" == typeof a.call) return "object";
        return b
    }

    Function.prototype.bind = Function.prototype.bind || function (a, b) {
        if (1 < arguments.length) {
            var c = Array.prototype.slice.call(arguments, 1);
            c.unshift(this, a);
            return bind.apply(k, c)
        }
        return bind(this, a)
    };

    /**
     * Base class for disposable or finalizable objects.
     * Provides a mechanism to mark an object as "disposed"
     * and execute any cleanup callbacks.
     */
    class Disposable {
        constructor() {
            this.isDisposed = false;  // formerly `Bc`
            this.cleanupQueue = [];   // formerly `ub`
        }

        /**
         * Marks this object as disposed and triggers cleanup.
         * Prevents multiple calls from executing cleanup again.
         */
        dispose() {
            if (!this.isDisposed) {
                this.isDisposed = true;
                this._runCleanup();
            }
        }

        /**
         * Executes all queued cleanup functions.
         */
        _runCleanup() {
            if (this.cleanupQueue && this.cleanupQueue.length) {
                while (this.cleanupQueue.length) {
                    const fn = this.cleanupQueue.shift();
                    fn();
                }
            }
        }
    }

    var la = function (a) {
        a && "function" == typeof a.C && a.C()
    };

    /** ---------------------------
     * Event Class
     * --------------------------- */
    class CustomEvent {
        constructor(type, target) {
            this.type = type;
            this.target = target;
            this.currentTarget = target;

            this.handled = false;
            this.defaultPrevented = false;
            this.cancelable = true;
        }

        // Placeholder for subclasses or handlers
        init() { }

        // Cleanup or release resources
        destroy() { }

        preventDefault() {
            this.defaultPrevented = true;
            this.cancelable = false;
        }
    }

    /** ---------------------------
     * Error Classes
     * --------------------------- */
    class CustomError extends Error {
        constructor(message) {
            super(message ? String(message) : "");
            this.name = "CustomError";

            if (Error.captureStackTrace) {
                Error.captureStackTrace(this, CustomError);
            }
        }
    }

    class AssertionError extends CustomError {
        constructor(message, args = []) {
            const formatted = AssertionError.formatMessage(message, args);
            super(formatted);
            this.name = "AssertionError";
        }

        static formatMessage(message, args) {
            let formatted = message;
            args.forEach(arg => {
                const safeArg = String(arg).replace(/\$/g, "$$$$");
                formatted = formatted.replace(/%s/, safeArg);
            });
            return formatted;
        }
    }

    /** ---------------------------
     * Assert Utility
     * --------------------------- */
    function assert(condition, message, ...args) {
        if (!condition) {
            const errorMessage = message
                ? `Assertion failed: ${AssertionError.formatMessage(message, args)}`
                : "Assertion failed";
            throw new AssertionError(errorMessage);
        }
    }

    /** ---------------------------
     * Array Utilities
     * --------------------------- */
    const ArrayUtils = {
        indexOf(array, value, start = 0) {
            assert(array != null);
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
            assert(array != null);
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
            assert(array != null);
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
            assert(array != null);
            return Array.prototype.slice.call(array, start, end);
        }
    };

    /**
     * Returns an array of all values in an object.
     * @param {Object} obj - The object to extract values from.
     * @returns {Array} Array of object values.
     */
    function getObjectValues(obj) {
        const values = [];
        for (const key in obj) {
            values.push(obj[key]);
        }
        return values;
    }

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

    /**
     * Reserved property names that may need special handling when copying objects.
     */
    const reservedProps = [
        "constructor",
        "hasOwnProperty",
        "isPrototypeOf",
        "propertyIsEnumerable",
        "toLocaleString",
        "toString",
        "valueOf"
    ];

    /**
     * Merges multiple source objects into a target object (like Object.assign),
     * but also ensures reserved properties are copied.
     *
     * @param {Object} target - The object to assign properties to.
     * @param {...Object} sources - The objects to copy properties from.
     * @returns {Object} The modified target object.
     */
    function deepAssign(target, ...sources) {
        for (const source of sources) {
            // Copy normal enumerable properties
            for (const key in source) {
                target[key] = source[key];
            }

            // Explicitly copy reserved properties
            for (const prop of reservedProps) {
                if (Object.prototype.hasOwnProperty.call(source, prop)) {
                    target[prop] = source[prop];
                }
            }
        }
        return target;
    }

    function forEachObject(a, b, c) {
        for (var d in a) b.call(c, a[d], d, a)
    }

    // Detect navigator info
    const getUserAgent = () => window.navigator ? window.navigator.userAgent : null;
    const getNavigator = () => window.navigator || {};

    // Browser flags
    let isOpera = false;
    let isIE = false;
    let isWebKit = false;
    let isGecko = false;

    const userAgent = getUserAgent();
    const nav = getNavigator();

    if (userAgent) {
        isOpera  = userAgent.startsWith("Opera");
        isIE = !isOpera && userAgent.includes("MSIE");
        isWebKit = !isOpera && userAgent.includes("WebKit");
        isGecko  = !isOpera && !isWebKit && nav.product === "Gecko";
    }

    const platform = nav.platform || "";
    const isMac = platform.includes("Mac");
    const isUnix = (nav.appVersion || "").includes("X11");

    // IE Document Mode (for compatibility)
    const getDocumentMode = () => {
        const doc = window.document;
        return doc ? doc.documentMode : undefined;
    };

    // --- Browser version extraction ---
    let browserVersion = "";
    (function detectVersion() {
        let match;

        if (isOpera && window.opera) {
            const version = window.opera.version;
            browserVersion = typeof version === "function" ? version() : version;
        } else if (isGecko) {
            match = /rv\:([^\);]+)(\)|;)/.exec(userAgent);
        } else if (isIE) {
            match = /MSIE\s+([^\);]+)(\)|;)/.exec(userAgent);
        } else if (isWebKit) {
            match = /WebKit\/(\S+)/.exec(userAgent);
        }

        if (match) browserVersion = match[1] || "";

        // IE may override version if documentMode is higher
        if (isIE) {
            const docMode = getDocumentMode();
            if (docMode > parseFloat(browserVersion)) {
                browserVersion = String(docMode);
            }
        }
    })();

    // --- Version comparison cache ---
    const versionCache = {};

    // Compares the current browser version to a target version.
    const versionAtLeast = (targetVersion) => {
        if (versionCache[targetVersion] !== undefined)
            return versionCache[targetVersion];

        const normalize = str =>
            String(str).trim().split(".").map(x => x || "0");

        const aParts = normalize(browserVersion);
        const bParts = normalize(targetVersion);
        const len = Math.max(aParts.length, bParts.length);

        let result = 0;
        for (let i = 0; i < len && result === 0; i++) {
            const [a, b] = [aParts[i] || "", bParts[i] || ""];
            const numA = parseInt(a, 10) || 0;
            const numB = parseInt(b, 10) || 0;

            result = numA < numB ? -1 : numA > numB ? 1 : a.localeCompare(b);
        }

        return (versionCache[targetVersion] = result >= 0);
    };

    // --- Feature flags ---
    const doc = window.document;
    var docMode = (!doc || !isIE)
        ? undefined
        : getDocumentMode() || (doc.compatMode === "CSS1Compat" ? parseInt(browserVersion, 10) : 5);

    const supportsDOM9 = !isIE || (isIE && docMode >= 9);
    const isOldIE = isIE && !versionAtLeast("9");

    !isWebKit || versionAtLeast("528");
    isGecko && versionAtLeast("1.9b");
    isIE && versionAtLeast("8");

    var ab = function (a, b) {
        a && this.init(a, b)
    };
    inherit(ab, CustomEvent);
    m = ab.prototype;
    m.target = null;
    m.relatedTarget = null;
    m.offsetX = 0;
    m.offsetY = 0;
    m.clientX = 0;
    m.clientY = 0;
    m.screenX = 0;
    m.screenY = 0;
    m.button = 0;
    m.keyCode = 0;
    m.charCode = 0;
    m.ctrlKey = false;
    m.altKey = false;
    m.shiftKey = false;
    m.metaKey = false;
    m.Id = k;
    m.init = function (a, b) {
        var c = this.type = a.type;
        x.call(this, c);
        this.target = a.target || a.srcElement;
        this.currentTarget = b;
        var d = a.relatedTarget;
        if (d) {
            if (Ja) {
                var e;
                a: {
                    try {
                        Ya(d.nodeName);
                        e = h;
                        break a
                    } catch (f) { }
                    e = l
                }
                e || (d = k)
            }
        } else "mouseover" == c ? d = a.fromElement : "mouseout" == c && (d = a.toElement);
        this.relatedTarget = d;
        this.offsetX = Ka || a.offsetX !== g ? a.offsetX : a.layerX;
        this.offsetY = Ka || a.offsetY !== g ? a.offsetY : a.layerY;
        this.clientX = a.clientX !== g ? a.clientX : a.pageX;
        this.clientY = a.clientY !== g ? a.clientY : a.pageY;
        this.screenX = a.screenX || 0;
        this.screenY = a.screenY || 0;
        this.button = a.button;
        this.keyCode = a.keyCode || 0;
        this.charCode = a.charCode || ("keypress" == c ? a.keyCode : 0);
        this.ctrlKey = a.ctrlKey;
        this.altKey = a.altKey;
        this.shiftKey = a.shiftKey;
        this.metaKey = a.metaKey;
        this.state = a.state;
        this.Id = a;
        a.defaultPrevented && this.preventDefault();
        delete this.Ya
    };
    m.preventDefault = function () {
        ab.superClass_.preventDefault.call(this);
        var a = this.Id;
        if (a.preventDefault) a.preventDefault();
        else if (a.returnValue = l, $a) try {
            if (a.ctrlKey || 112 <= a.keyCode && 123 >= a.keyCode) a.keyCode = -1
        } catch (b) { }
    };
    m.h = function () { };
    var bb = 0;
    var cb = function () { };
    m = cb.prototype;
    m.key = 0;
    m.Ha = l;
    m.Qb = l;
    m.init = function (a, b, c, d, e, f) {
        if ("function" == typeOf(a)) this.Fd = h;
        else if (a && a.handleEvent && "function" == typeOf(a.handleEvent)) this.Fd = l;
        else throw Error("Invalid listener argument");
        this.xa = a;
        this.yd = b;
        this.src = c;
        this.type = d;
        this.capture = !!e;
        this.Lc = f;
        this.Qb = l;
        this.key = ++bb;
        this.Ha = l
    };
    m.handleEvent = function (a) {
        return this.Fd ? this.xa.call(this.Lc || this.src, a) : this.xa.handleEvent.call(this.xa, a)
    };
    var db = {},
        D = {},
        eb = {},
        fb = {},
        gb = function (a, b, c, d, e) {
            if (isArray(b)) {
                for (var f = 0; f < b.length; f++) gb(a, b[f], c, d, e);
                return k
            }
            a = hb(a, b, c, l, d, e);
            b = a.key;
            db[b] = a;
            return b
        },
        hb = function (a, b, c, d, e, f) {
            if (!b) throw Error("Invalid event type");
            e = !!e;
            var n = D;
            b in n || (n[b] = {
                D: 0,
                R: 0
            });
            n = n[b];
            e in n || (n[e] = {
                D: 0,
                R: 0
            }, n.D++);
            var n = n[e],
                q = getUniqueId(a),
                r;
            n.R++;
            if (n[q]) {
                r = n[q];
                for (var A = 0; A < r.length; A++)
                    if (n = r[A], n.xa == c && n.Lc == f) {
                        if (n.Ha) break;
                        d || (r[A].Qb = l);
                        return r[A]
                    }
            } else r = n[q] = [], n.D++;
            A = ib();
            n = new cb;
            n.init(c, A, a, b, e, f);
            n.Qb =
                d;
            A.src = a;
            A.xa = n;
            r.push(n);
            eb[q] || (eb[q] = []);
            eb[q].push(n);
            a.addEventListener ? (a == p || !a.xd) && a.addEventListener(b, A, e) : a.attachEvent(b in fb ? fb[b] : fb[b] = "on" + b, A);
            return n
        },
        ib = function () {
            var a = jb,
                b = supportsDOM9 ? function (c) {
                    return a.call(b.src, b.xa, c)
                } : function (c) {
                    c = a.call(b.src, b.xa, c);
                    if (!c) return c
                };
            return b
        },
        kb = function (a, b, c, d, e) {
            if (isArray(b)) {
                for (var f = 0; f < b.length; f++) kb(a, b[f], c, d, e);
                return k
            }
            a = hb(a, b, c, h, d, e);
            b = a.key;
            db[b] = a;
            return b
        },
        lb = function (a, b, c, d, e) {
            if (isArray(b))
                for (var f = 0; f < b.length; f++) lb(a, b[f],
                    c, d, e);
            else {
                d = !!d;
                a: {
                    f = D;
                    if (b in f && (f = f[b], d in f && (f = f[d], a = getUniqueId(a), f[a]))) {
                        a = f[a];
                        break a
                    }
                    a = k
                }
                if (a)
                    for (f = 0; f < a.length; f++)
                        if (a[f].xa == c && a[f].capture == d && a[f].Lc == e) {
                            mb(a[f].key);
                            break
                        }
            }
        },
        mb = function (a) {
            var b = db[a];
            if (!b || b.Ha) return l;
            var c = b.src,
                d = b.type,
                e = b.yd,
                f = b.capture;
            c.removeEventListener ? (c == p || !c.xd) && c.removeEventListener(d, e, f) : c.detachEvent && c.detachEvent(d in fb ? fb[d] : fb[d] = "on" + d, e);
            c = getUniqueId(c);
            if (eb[c]) {
                var e = eb[c],
                    n = ArrayUtils.indexOf(e, b);
                0 <= n && (assert(e.length != k), Array.prototype.splice.call(e, n, 1));
                0 == e.length && delete eb[c]
            }
            b.Ha =
                h;
            if (b = D[d][f][c]) b.Ed = h, nb(d, f, c, b);
            delete db[a];
            return h
        },
        nb = function (a, b, c, d) {
            if (!d.Tb && d.Ed) {
                for (var e = 0, f = 0; e < d.length; e++) d[e].Ha ? d[e].yd.src = k : (e != f && (d[f] = d[e]), f++);
                d.length = f;
                d.Ed = l;
                0 == f && (delete D[a][b][c], D[a][b].D--, 0 == D[a][b].D && (delete D[a][b], D[a].D--), 0 == D[a].D && delete D[a])
            }
        },
        ob = function (a) {
            var b = 0;
            if (a != k) {
                if (a = getUniqueId(a), eb[a]) {
                    a = eb[a];
                    for (var c = a.length - 1; 0 <= c; c--) mb(a[c].key), b++
                }
            } else forEachObject(db, function (a, c) {
                mb(c);
                b++
            })
        },
        qb = function (a, b, c, d, e) {
            var f = 1;
            b = getUniqueId(b);
            if (a[b]) {
                var n = --a.R,
                    q =
                        a[b];
                q.Tb ? q.Tb++ : q.Tb = 1;
                try {
                    for (var r = q.length, A = 0; A < r; A++) {
                        var v = q[A];
                        v && !v.Ha && (f &= pb(v, e) !== l)
                    }
                } finally {
                    a.R = Math.max(n, a.R), q.Tb--, nb(c, d, b, q)
                }
            }
            return Boolean(f)
        },
        pb = function (a, b) {
            a.Qb && mb(a.key);
            return a.handleEvent(b)
        },
        jb = function (a, b) {
            if (a.Ha) return h;
            var c = a.type,
                d = D;
            if (!(c in d)) return h;
            var d = d[c],
                e, f;
            if (!supportsDOM9) {
                var n;
                if (!(n = b)) a: {
                    n = ["window", "event"];
                    for (var q = p; e = n.shift();)
                        if (q[e] != k) q = q[e];
                        else {
                            n = k;
                            break a
                        } n = q
                }
                e = n;
                n = h in d;
                q = l in d;
                if (n) {
                    if (0 > e.keyCode || e.returnValue != g) return h;
                    a: {
                        var r =
                            l;
                        if (0 == e.keyCode) try {
                            e.keyCode = -1;
                            break a
                        } catch (A) {
                            r = h
                        }
                        if (r || e.returnValue == g) e.returnValue = h
                    }
                }
                r = new ab;
                r.init(e, this);
                e = h;
                try {
                    if (n) {
                        for (var v = [], I = r.currentTarget; I; I = I.parentNode) v.push(I);
                        f = d[h];
                        f.R = f.D;
                        for (var Y = v.length - 1; !r.Ya && 0 <= Y && f.R; Y--) r.currentTarget = v[Y], e &= qb(f, v[Y], c, h, r);
                        if (q) {
                            f = d[l];
                            f.R = f.D;
                            for (Y = 0; !r.Ya && Y < v.length && f.R; Y++) r.currentTarget = v[Y], e &= qb(f, v[Y], c, l, r)
                        }
                    } else e = pb(a, r)
                } finally {
                    v && (v.length = 0)
                }
                return e
            }
            c = new ab(b, this);
            return e = pb(a, c)
        };
    var E = function (a) {
        this.Hd = a;
        this.w = []
    };
    inherit(E, Disposable);
    var rb = [];
    E.prototype.listen = function (a, b, c, d, e) {
        isArray(b) || (rb[0] = b, b = rb);
        for (var f = 0; f < b.length; f++) {
            var n = gb(a, b[f], c || this, d || l, e || this.Hd || this);
            this.w.push(n)
        }
        return this
    };
    var sb = function (a, b, c, d, e, f) {
        if (isArray(c))
            for (var n = 0; n < c.length; n++) sb(a, b, c[n], d, e, f);
        else b = kb(b, c, d || a, e, f || a.Hd || a), a.w.push(b)
    };
    E.prototype.Ad = function () {
        ArrayUtils.forEach(this.w, mb);
        this.w.length = 0
    };
    E.prototype.h = function () {
        E.I.h.call(this);
        this.Ad()
    };
    E.prototype.handleEvent = function () {
        throw Error("EventHandler.handleEvent not implemented");
    };
    var tb = function () { };
    inherit(tb, Disposable);
    m = tb.prototype;
    m.xd = h;
    m.Hc = k;
    m.addEventListener = function (a, b, c, d) {
        gb(this, a, b, c, d)
    };
    m.removeEventListener = function (a, b, c, d) {
        lb(this, a, b, c, d)
    };
    m.dispatchEvent = function (a) {
        var b = a.type || a,
            c = D;
        if (b in c) {
            if (isString(a)) a = new CustomEvent(a, this);
            else if (a instanceof CustomEvent) a.target = a.target || this;
            else {
                var d = a;
                a = new CustomEvent(b, this);
                deepAssign(a, d)
            }
            var d = 1,
                e, c = c[b],
                b = h in c,
                f;
            if (b) {
                e = [];
                for (f = this; f; f = f.Hc) e.push(f);
                f = c[h];
                f.R = f.D;
                for (var n = e.length - 1; !a.Ya && 0 <= n && f.R; n--) a.currentTarget = e[n], d &= qb(f, e[n], a.type, h, a) && a.Vb != l
            }
            if (l in c)
                if (f = c[l], f.R = f.D, b)
                    for (n = 0; !a.Ya && n < e.length && f.R; n++) a.currentTarget = e[n], d &= qb(f, e[n], a.type, l, a) && a.Vb != l;
                else
                    for (e = this; !a.Ya && e && f.R; e = e.Hc) a.currentTarget =
                        e, d &= qb(f, e, a.type, l, a) && a.Vb != l;
            a = Boolean(d)
        } else a = h;
        return a
    };
    m.h = function () {
        tb.I.h.call(this);
        ob(this);
        this.Hc = k
    };
    var ub = function (a, b) {
        this.Ne = a || document;
        this.B = new E(this);
        this.Pe = b || l;
        this.B.listen(this.Ne, "keydown", this.Oe);
        isIE || (window.addEventListener("deviceorientation", bind(this.Za, this), h), window.addEventListener("MozOrientation", bind(this.Za, this), h), window.addEventListener("devicemotion", bind(this.Za, this), h))
    };
    inherit(ub, tb);
    var vb = {
        37: 3,
        38: 1,
        39: 4,
        40: 2,
        87: 1,
        83: 2,
        65: 3,
        68: 4
    };
    m = ub.prototype;
    m.Jd = 0;
    m.$a = 0;
    m.ab = 0;
    m.Yb = 10;
    m.Za = function (a) {
        var b = screen.orientation;
        this.Jd != b && (this.Jd = b, this.Yb = 10, this.ab = this.$a = 0);
        var c = a.accelerationIncludingGravity;
        if (c) {
            var d = c.x,
                e = c.Vc;
            switch (b) {
                case 90:
                    d = -c.y;
                    e = c.Vc;
                    break;
                case -90:
                    d = c.y;
                    e = c.Vc;
                    break;
                case 180:
                    d = -c.x, e = c.Vc
            }
        }
        b = a.gamma || 57 * a.x || 2 * d;
        e = a.beta || 57 * a.y || 2 * e;
        this.Yb ? (this.$a += b, this.ab += e, this.Yb--, 0 == this.Yb && (this.$a /= 10, this.ab /= 10)) : (a = b - this.$a, e -= this.ab, b = k, c = 0, 5 < a ? (c = (a - 5) / 10, b = 4) : -5 > a && (c = (-a - 5) / 10, b = 3), Math.abs(e) > Math.abs(a) && (5 < e ? (c = (e - 5) / 10, b = 2) : -5 > e && (c =
            (-e - 5) / 10, b = 1)), 0 < c && b && this.dispatchEvent(new wb(b)))
    };
    m.Oe = function (a) {
        var b = vb[a.keyCode];
        b && (this.dispatchEvent(new wb(b)), this.Pe && a.preventDefault && a.preventDefault())
    };
    m.h = function () {
        la(this.B);
        this.B = k;
        window.removeEventListener("deviceorientation", bind(this.Za, this), h);
        window.removeEventListener("MozOrientation", bind(this.Za, this), h);
        window.removeEventListener("devicemotion", bind(this.Za, this), h)
    };

    class wb extends CustomEvent {
        constructor(a) {
            super(this, a);
            this.Ie = a
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

    var yb = ["Moz", "ms", "O", "webkit"],
    zb = ["", "moz", "ms", "o", "webkit"],
    Ab = function (a) {
        var b = document;
        if (!b) return k;
        for (var c = 0; c < zb.length; c++) {
            var d = zb[c],
                e = a;
            0 < d.length && (e = a.charAt(0).toUpperCase() + a.substr(1));
            d += e;
            if ("undefined" != typeof b[d]) return d
        }
        return k
    },
    Bb = function () {
        for (var a = ["requestAnimationFrame", "mozRequestAnimationFrame", "msRequestAnimationFrame", "oRequestAnimationFrame", "webkitRequestAnimationFrame"], b = 0; b < a.length; b++) {
            var c = window[a[b]];
            if (c) return bind(c, window)
        }
        return function (a) {
            window.setTimeout(a, 17)
        }
    },
    Cb = function (a) {
        Cb = Bb();
        return Cb(a)
    };

    function getTime() {
        return new Date().getTime()
    }

    var Db = function (a, b, c, d) {
        this.Re = a;
        this.Se = b;
        this.Md = l;
        this.Ld = c;
        this.Te = d || 0;
        this.Kd = 0
    };
    Db.prototype.jb = function () {
        var a = getTime();
        if (!(this.Ld && this.Md || !this.Ld && a - this.Kd <= this.Te) && this.Re()) this.Se(), this.Md = h, this.Kd = a
    };

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
            this.intervalId = window.setInterval(this.update.bind(this), 16); // ~60fps
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
    }

    // Helper
    function addPauseStep(sequence, duration) {
        sequence.addStep(() => {}, duration);
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

    var Kb = function (a, b, c) {
        this.zd = a;
        this.Je = b;
        this.Ke = c;
        this.Ub = this.Sb = this.Pc = l;
        this.Oc = getTime();
        this.Le = Ab("hidden");
        if (this.Dd = (this.Qc = Ab("visibilityState")) ? this.Qc.replace(/state$/i, "change").toLowerCase() : k) a = new E, b = partialApply(la, a), this.ub || (this.ub = []), this.ub.push(bind(b, g)), a.listen(document, this.Dd, bind(this.Me, this));
        Jb(this)
    };
    inherit(Kb, Disposable);
    Kb.prototype.h = function () {
        window.clearTimeout(this.Rb);
        Kb.I.h.call(this)
    };
    Kb.prototype.Xe = function () {
        this.Rb = k;
        (this.Sb = getTime() - this.Oc >= this.zd) || Jb(this);
        Lb(this)
    };
    var Lb = function (a) {
        var b = a.Pc || a.Sb;
        a.Ub && !b ? (a.Ub = l, a.Ke(), Jb(a)) : !a.Ub && b && (a.Ub = h, a.Je())
    };
    Kb.prototype.Me = function () {
        var a = document[this.Qc];
        (this.Pc = document[this.Le] || "hidden" == a) ? Lb(this) : Mb(this)
    };
    var Jb = function (a) {
        a.Rb && window.clearTimeout(a.Rb);
        var b = Math.max(100, a.zd - (getTime() - a.Oc));
        a.Rb = window.setTimeout(bind(a.Xe, a), b)
    },
    Mb = function (a) {
        a.Oc = getTime();
        a.Sb = l;
        Lb(a)
    };

    function random(a) {
        return Math.floor(Math.random() * a)
    };

    class Point {
        constructor(x, y) {
            // `g` likely means undefined or null in the original code.
            // So if x or y are not provided, default to 0.
            this.x = (typeof x !== 'undefined') ? x : 0;
            this.y = (typeof y !== 'undefined') ? y : 0;
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

    (!isGecko && !isIE) ||(isIE && getDocumentMode() >= 9) || (isGecko && versionAtLeast("1.9.1"));
    isIE && versionAtLeast("9");

    var Pb = function (a, b) {
        var c;
        c = a.className;
        c = isString(c) && c.match(/\S+/g) || [];
        for (var d = ArrayUtils.slice(arguments, 1), e = c, f = 0; f < d.length; f++) 0 <= ArrayUtils.indexOf(e, d[f]) || e.push(d[f]);
        a.className = c.join(" ")
    };
    var Rb = function (a, b, c) {
        var d, e = isGecko && (isMac || isUnix) && versionAtLeast("1.9");
        b instanceof Point ? (d = b.x, b = b.y) : (d = b, b = c);
        a.style.left = Qb(d, e);
        a.style.top = Qb(b, e)
    },
    Qb = function (a, b) {
        "number" == typeof a && (a = (b ? Math.round(a) : a) + "px");
        return a
    },
    Sb = function (a, b) {
        var c = a.style;
        "opacity" in c ? c.opacity = b : "MozOpacity" in c ? c.MozOpacity = b : "filter" in c && (c.filter = "" === b ? "" : "alpha(opacity=" + 100 * b + ")")
    };
    var Tb = function () {
        this.pb = [];
        this.ua = 0;
        this.qb = this.ia = l
    };
    inherit(Tb, Disposable);
    Tb.prototype.h = function () {
        this.pb = [];
        this.ua = 0;
        this.qb = this.ia = l;
        Tb.I.h.call(this)
    };
    Tb.prototype.tc = function () {
        return this.ia
    };
    Tb.prototype.next = function (a, b, c, d) {
        this.ua++;
        this.ua >= this.pb.length && (this.ua = b ? 0 : this.pb.length - 1);
        this.load(a, c, d)
    };
    var Ub = function (a, b) {
        Tb.call(this);
        this.pb = a;
        this.H = k;
        this.Dc = b || document.body;
        this.Cc = l;
        this.Wa = this.Lb = k;
        this.ud = this.ua
    };
    inherit(Ub, Tb);
    var Vb = [{
        vd: ".mp3",
        type: "audio/mpeg"
    }, {
        vd: ".ogg",
        type: "audio/ogg"
    }];
    m = Ub.prototype;
    m.h = function () {
        this.pause();
        this.Cc = l;
        this.Wa = this.Lb = k;
        this.H && this.Dc.removeChild(this.H);
        Ub.I.h.call(this)
    };
    m.wd = function () {
        this.qb = h;
        this.Lb && this.Lb();
        this.Cc && !this.ia && this.play(this.Wa)
    };
    m.Ce = function () {
        this.ia = l;
        this.Wa && this.Wa()
    };
    m.load = function (a, b, c) {
        this.Cc = a;
        this.Lb = b || k;
        this.Wa = c || k;
        if (this.H && this.ud == this.ua) this.qb && (this.pause(), this.H.currentTime = 0, this.wd());
        else {
            this.H && this.Dc.removeChild(this.H);
            this.qb = l;
            this.H = document.createElement("audio");
            this.H.setAttribute("controls", "false");
            this.H.setAttribute("preload", "auto");
            this.H.style.display = "none";
            gb(this.H, "canplay", this.wd, l, this);
            gb(this.H, "ended", this.Ce, l, this);
            a = this.pb[this.ua];
            for (b = 0; c = Vb[b++];) {
                var d = document.createElement("source");
                d.setAttribute("src", a + c.vd);
                d.setAttribute("type", c.type);
                this.H.appendChild(d)
            }
            this.Dc.appendChild(this.H);
            this.ud = this.ua
        }
    };
    m.play = function (a) {
        this.qb && !this.ia && (this.Wa = a || k, this.H.play(), this.ia = h)
    };
    m.pause = function () {
        this.ia && (this.H.pause(), this.ia = l)
    };
    m.currentTime = function () {
        return this.ia ? this.H.currentTime : 0
    };

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
                if (this.image.complete || this.image.readyState === "complete") {
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
            return Object.prototype.hasOwnProperty.call(this._map, key)
                ? this._map[key]
                : defaultValue;
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
    var N = function (a) {
        this.Q = a;
        this.T = 0;
        this.s = M.createFrame(mc(this));
        this.md = this.nd = this.o = this.k = 0;
        this.kb = l;
        this.od = h;
        this.xc = M.getHeight(mc(this));
        this.yc = M.getWidth(mc(this));
        this.ra = null;

        this.X = null;
        this.uc = this.Eb = l;
        this.kd = []
    };
    inherit(N, tb);
    var M = k;
    N.prototype.aa = function () {
        return this.s
    };
    var nc = function (a, b) {
        a.yc != b && a.s && (a.yc = b, a.s.style.width = b + 1 + "px")
    };
    N.prototype.getWidth = function () {
        return M.getWidth(mc(this))
    };
    var oc = function (a, b) {
        a.xc != b && a.s && (a.xc = b, a.s.style.height = b + 1 + "px")
    };
    N.prototype.getHeight = function () {
        return M.getHeight(mc(this))
    };
    N.prototype.Ua = function () {
        return this.Q
    };
    var mc = function (a, b) {
        var c = b == k ? a.Q : b;
        return isArray(c) ? c[Math.floor(a.T / 90)] : c
    };
    N.prototype.Na = function () {
        return this.T
    };
    var O = function (a, b, c) {
        a.s && (a.k = Math.floor(b), a.o = Math.floor(c), Rb(a.s, a.k, a.o))
    },
        uc = function (a, b, c) {
            if (a.s) {
                a.md = b;
                a.nd = c;
                a.k = Math.floor(20 * b);
                a.o = Math.floor(20 * c);
                if (a.Q == pc || a.Q == qc) a.Q == qc ? 180 == a.T || 0 == a.T ? a.k-- : a.o-- : (a.k--, a.o--);
                else {
                    b = rc.get(a.Q);
                    c = sc.get(a.Q);
                    var d = a.yc - 20,
                        e = a.xc - 20;
                    switch (a.T) {
                        case 0:
                            a.k -= b ? d : 0;
                            a.o -= c ? e : 0;
                            break;
                        case 90:
                            a.k -= c ? 0 : d;
                            a.o -= b ? e : 0;
                            break;
                        case 180:
                            a.kb && (c = !c);
                            a.k -= b ? 0 : d;
                            a.o -= c ? 0 : e;
                            break;
                        case 270:
                            a.k -= c ? d : 0, a.o -= b ? 0 : e
                    }
                    if (-1 < tc[0].indexOf(a.Q) || -1 < tc[1].indexOf(a.Q)) a.k +=
                        180 == a.T ? 1 : 0 == a.T ? -1 : 0, a.o += 270 == a.T ? 1 : 90 == a.T ? -1 : 0
                }
                O(a, a.k, a.o)
            }
        },
        P = function (a, b) {
            a.s.style.zIndex = b
        },
        Q = function (a, b) {
            a.s && (vc(a, b), a.Q != b && (a.Q = b, wc(a)))
        },
        wc = function (a) {
            var b;
            b = (b = M.frames[mc(a, a.Q)]) ? -(b[0] + 0) + "px " + -(b[1] + 0) + "px" : g;
            a.s.style.backgroundPosition = b;
            a.Eb && uc(a, a.md, a.nd)
        };
    N.prototype.h = function () {
        var a = this.s;
        a && a.parentNode && a.parentNode.removeChild(a);
        this.s = k;
        N.I.h.call(this)
    };
    var vc = function (a, b) {
        var c = mc(a, b);
        nc(a, M.getWidth(c));
        oc(a, M.getHeight(c))
    };
    N.prototype.rotate = function (a) {
        if (this.T != a || this.kb) this.T = a, this.kb = l, vc(this, this.Q), wc(this)
    };
    var xc = function (a) {
        a.kb || (a.T = 180, a.kb = h, vc(a, a.Q), wc(a))
    };
    N.prototype.scale = function (a, b) {
        var c = this.s,
            d = "";
        a != k && (d += " scaleX(" + a + ")");
        b != k && (d += " scaleY(" + b + ")");
        for (var e = 0, f; f = yb[e++];) c.style[f + "Transform"] = d
    };
    N.prototype.show = function (a) {
        this.od != a && (this.od = a, this.s.style.display = a ? "" : "none")
    };
    var yc = function (a, b, c, d) {
        a.ra && a.ra.stop && a.ra.stop();
        a.ra = new AnimationSequence();
        a.ra.addStep(createOpacityAnimator(a.s, c, d), b);
        a.ra.play()
    },
    zc = function (a) {
        yc(a, 300, 1, 0)
    };
    N.prototype.K = function (a, b, c, d, e) {
        if (c) this.kd.push(setTimeout(bind(function () {
            this.K(a, b, 0, d, e)
        }, this), c));
        else {
            if (this.X && this.X.isPlaying()) {
                if (this.uc) return;
                this.X.stop()
            }
            this.X = new AnimationSequence();
            c = d || 1;
            for (var f = 0; f < c; f++) ArrayUtils.forEach(a, function (a) {
                this.X.addStep(bind(function () {
                    Q(this, a)
                }, this));
                addPauseStep(this.X, b)
            }, this);
            this.X.play();
            this.uc = e || l
        }
    };
    var Ac = function (a) {
        a.X && (a.X.stop(), a.uc = l, ArrayUtils.forEach(a.kd, function (a) {
            clearTimeout(a)
        }));
        a.ra && a.ra.stop()
    },
        qc = [111, 114, 112, 113],
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
        rc = k,
        sc = k,
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
        ],
        xd = function (a, b) {
            this.Nb = [];
            this.z = 0;
            this.M = [];
            for (var c = wd, d = 0; 3 > d; d++) {
                this.Nb[d] = a[d];
                var e = c(b, this.Nb[d].x, this.Nb[d].y);
                this.M.push(e)
            }
            this.A = c(b, a[0].x, a[0].y);
            this.Ga = k;
            this.P = [];
            for (d = 0; 2 > d; d++) this.P[d] = c(b, a[d + 4].x, a[d + 4].y), this.P[d].s.style.opacity = 0, this.P[d].show(h);
            this.Mb = [];
            this.Ob = k;
            this.pd = l
        };
    inherit(xd, Disposable);
    var wd = function (a, b, c) {
        var d = new N(td[0]);
        d.show(l);
        P(d, -2);
        O(d, b, c);
        a.appendChild(d.aa());
        return d
    },
        yd = function (a, b, c) {
            b = b || td;
            var d = [b[0]];
            c = c || 3;
            for (var e = 0; e < c; e++)
                if (0 != a) {
                    var f = a % 10;
                    a = Math.floor(a / 10);
                    d[e] = b[f]
                } else 0 < e && (d[e] = k);
            return d
        };
    xd.prototype.reset = function () {
        for (var a in this.M) Q(this.M[a], td[0]);
        this.z = 0;
        this.M[0].show(h);
        this.P[0].s.style.opacity = 0;
        this.P[1].s.style.opacity = 0;
        this.P[0].show(h);
        this.P[1].show(h);
        this.Mb = []
    };
    var zd = function (a) {
        for (var b in a.M) a.M[b].show(l);
        a.Ga && a.Ga.stop();
        a.A.show(l);
        a.P[0].show(l);
        a.P[1].show(l)
    };
    xd.prototype.update = function (a) {
        if (!(999 < a || a == this.z)) {
            var b = a - this.z;
            this.z = a;
            a = yd(a);
            for (var c in a) {
                var d = this.M[c],
                    e = a[c],
                    f = this.Nb[c];
                e != k ? (d.show(h), d.Ua() != e && Ad(this, f, d, e)) : d.show(l)
            }
            this.Mb.push(b)
        }
    };
    xd.prototype.jb = function (a) {
        if (this.Mb.length) {
            var b = this.Mb.shift(),
                b = yd(b, ud, 2),
                c;
            for (c in b) Ac(this.P[c]), b[c] != k ? (Q(this.P[c], b[c]), yc(this.P[c], 300, 0, 1)) : this.P[c].s.style.opacity = 0;
            this.Ob = a;
            this.pd = b[1] != k
        }
        this.Ob && 1E3 < a - this.Ob && (zc(this.P[0]), this.pd && zc(this.P[1]), this.Ob = k)
    };
    var Ad = function (a, b, c, d) {
        var e = a.A;
        a.Ga && a.Ga.stop();
        a.Ga = new AnimationSequence();
        e.show(h);
        Q(e, d);
        O(e, b.x, b.y - 25);
        a.Ga.addStep(function (a) {
            1 == a ? (O(c, b.x, b.y), Q(c, d), e.show(l)) : (O(e, b.x, b.y - 25 * (1 - a)), O(c, b.x, b.y + 25 * a))
        }, 400)
        a.Ga.play()
    };
    xd.prototype.h = function () {
        ArrayUtils.forEach(this.M, function (a) {
            a.C()
        });
        xd.I.h.call(this)
    };
    var Bd = function (a, b, c) {
        this.M = [];
        for (var d = 0; 4 > d; d++) {
            var e = new N(td[0]);
            O(e, a + 10 * d, b);
            c.appendChild(e.aa());
            this.M.push(e)
        }
        Q(this.M[1], 49);
        this.Gd = k
    };
    inherit(Bd, Disposable);
    Bd.prototype.update = function (a) {
        if (a != this.Gd) {
            var b = Math.floor(a / 60) % 10,
                c = Math.floor(a % 60);
            0 > b || 0 > c || (Q(this.M[0], td[b]), Q(this.M[2], td[Math.floor(c / 10)]), Q(this.M[3], td[c % 10]), this.Gd = a)
        }
    };
    Bd.prototype.show = function (a) {
        ArrayUtils.forEach(this.M, function (b) {
            b.show(a)
        })
    };
    Bd.prototype.h = function () {
        ArrayUtils.forEach(this.M, function (a) {
            a.C()
        });
        Bd.I.h.call(this)
    };
    var S = function (a, b, c, d, e) {
        N.call(this, a);
        O(this, b, c);
        e && P(this, e);
        d.appendChild(this.aa());
        this.v = d;
        this.Fc = []
    };
    inherit(S, N);
    S.prototype.add = function (a) {
        this.Fc.push(a)
    };
    S.prototype.show = function (a) {
        S.superClass_.show.call(this, a);
        ArrayUtils.forEach(this.Fc, function (b) {
            b.show(a)
        })
    };
    S.prototype.h = function () {
        ArrayUtils.forEach(this.Fc, function (a) {
            a.C()
        });
        S.superClass_.h.call(this)
    };
    var Cd = function (a, b, c, d, e) {
        S.call(this, a, b, c, d, e);
        this.B = new E(this);
        this.B.listen(this.s, "click", this.Ee);
        this.B.listen(this.s, "mousedown", this.Fe);
        this.B.listen(this.s, "mouseover", this.He);
        this.B.listen(this.s, "mouseout", this.Ge);
        this.s.style.cursor = "pointer"
    };
    inherit(Cd, S);
    m = Cd.prototype;
    m.h = function () {
        this.B.C();
        this.B = k;
        Cd.I.h.call(this)
    };
    m.Ee = function () {
        this.dispatchEvent("click")
    };
    m.Fe = function () {
        this.dispatchEvent("mousedown")
    };
    m.He = function () {
        this.dispatchEvent("mouseover")
    };
    m.Ge = function () {
        this.dispatchEvent("mouseout")
    };
    var Dd = function () {
        this.Y = []
    };
    inherit(Dd, Disposable);
    defineSingleton(Dd);
    Dd.prototype.get = function () {
        return !this.Y.length ? new N(57) : this.Y.shift()
    };
    Dd.prototype.h = function () {
        ArrayUtils.forEach(this.Y, function (a) {
            a.C()
        });
        this.Y = k;
        Dd.superClass_.h.call(this)
    };
    var T = function (a) {
        this.Ba = a.grid;
        this.Y = Dd.getInstance();
        this.a = this.Y.get();
        Q(this.a, this.Ba[0]);
        P(this.a, 17);
        this.a.show(l);
        this.J = this.Y.get();
        Q(this.J, 57);
        yc(this.J, 300, 0, 1);
        P(this.J, 0);
        this.J.scale(0.7, 0.7);
        this.J.show(h);
        this.Qa = this.fd = 0;
        this.ce = getTime();
        this.i = this.hd = 0;
        this.ie = a.name;
        this.zb = a.texture;
        this.z = a.extra;
        this.fe = a.data;
        this.cc = this.jd = 40;
        this.nc = this.ib = this.hb = 0;
        this.Oa = 1400;
        this.lc = l;
        this.kc = 1;
        this.ic = [];
        this.ic.push(new Db(bind(this.he, this), bind(this.ke, this), h), new Db(bind(this.ge, this), bind(this.je, this), l, 400))
    };
    inherit(T, Disposable);
    var Ed = [450, 900, 1350];
    T.prototype.getName = function () {
        return this.ie
    };
    T.prototype.qa = function () {
        return this.a
    };
    var Fd = function (a) {
        a.lc = h;
        a.Oa = a.lc ? 2E3 : 1400;
        a.kc = random(2) ? 1 : -1
    };
    T.prototype.Ia = function () {
        this.i = 2
    };
    T.prototype.h = function () {
        var a = this.Y,
            b = this.a;
        b.show(l);
        Ac(b);
        b.Eb = l;
        a.Y.push(b);
        a = this.Y;
        b = this.J;
        b.show(l);
        Ac(b);
        b.Eb = l;
        a.Y.push(b);
        this.ic = k;
        T.I.h.call(this)
    };
    T.prototype.update = function (a) {
        this.hd = a -= this.ce;
        0 == this.i ? a > this.Oa ? (this.J.show(l), P(this.a, 1), this.i = 1, Gd(this, 0, 0)) : this.lc ? Hd(this, a) : Id(this, a) : 1 == this.i && a > this.zb + this.Oa && (this.i = 3);
        ArrayUtils.forEach(this.ic, function (a) {
            a.jb()
        })
    };
    var Id = function (a, b) {
        var c = 40;
        800 < b ? c = 10 * (1 - Math.pow((b - 800 - 300) / 300, 2)) : 200 < b && ("none" == a.a.s.style.display && (a.a.show(h), yc(a.a, 300, 0, 1)), c = 40 * (1 - Math.pow((b - 200) / 600, 2)));
        Gd(a, 0, Math.floor(c))
    },
        Hd = function (a, b) {
            var c = 40,
                d = 0,
                e = b - 200,
                f = Ed[0],
                n = Ed[1],
                q = Ed[2];
            200 < b && ("none" == a.a.s.style.display && (a.a.show(h), yc(a.a, 300, 0, 1)), c = 40 * (1 - Math.pow(e / 1800, 2)), d = 1, e < n ? (d = Math.floor(1E3 * (1 - Math.pow((e - f) / f, 2))) / 1E3, d *= 15 * -a.kc) : (d = Math.floor(1E3 * (1 - Math.pow((e - q) / f, 2))) / 1E3, d *= 15 * a.kc));
            Gd(a, Math.floor(d),
                Math.floor(c))
        };
    T.prototype.Ud = function () {
        var a = this.Qa,
            b = 20 * (Math.floor(a % 23) + 0.5),
            a = 20 * (Math.floor(a / 23) + 0.5);
        this.hb = b - this.a.getWidth() / 2;
        this.ib = a - this.a.getHeight() / 2;
        O(this.a, this.hb, this.ib);
        this.nc = b - this.J.getWidth() / 2;
        this.qd = a + this.a.getHeight() / 2 - this.J.getHeight() + this.fd;
        O(this.J, this.nc, this.qd)
    };
    var Gd = function (a, b, c) {
        a.cc == c && a.jd == b || (15 < b || -15 > b) || (a.jd = b, a.cc = c, O(a.a, a.hb - b, a.ib - c), c = 1 - (1 - 0.7) * c / 40, a.J.scale(c, c), b && O(a.J, a.nc - b, a.qd))
    },
        Jd = function (a, b) {
            b.appendChild(a.a.aa());
            b.appendChild(a.J.aa())
        },
        Kd = function (a, b) {
            a.Qa = b;
            a.Ud()
        };
    m = T.prototype;
    m.Jb = function () {
        return this.Qa
    };
    m.Ta = function () {
        return Math.floor(this.Qa / 23)
    };
    m.Sa = function () {
        return this.Qa % 23
    };
    m.Ua = function () {
        return this.a.Ua()
    };
    m.he = function () {
        return 1 == this.i && this.hd > this.zb + this.Oa - 300
    };
    m.ke = function () {
        zc(this.a)
    };
    m.ge = function () {
        return 1 == this.i && this.fe
    };
    m.je = function () {
        var a = this.Ba.indexOf(this.a.Ua()),
            a = (a + 1) % this.Ba.length;
        Q(this.a, this.Ba[a])
    };
    var Nd = function (a) {
        T.call(this, a);
        this.a.K(Ld, 700, this.Oa);
        this.a.K(Md, 80, this.Oa + 700 * Ld.length);
        this.fd = -5
    };
    inherit(Nd, T);
    Nd.prototype.Ia = function () {
        this.a.K(Md, 400);
        setTimeout(bind(function () {
            this.i = 2
        }, this), 500)
    };
    var Ld = [86, 84, 83, 80, 78, 76],
        Md = [74, 70, 68, 66],
        Od = function (a) {
            T.call(this, a);
            random(2) && Q(this.a, this.Ba[1])
        };
    inherit(Od, T);
    var Pd = function (a) {
        T.call(this, a);
        Q(this.J, 11)
    };
    inherit(Pd, T);
    Pd.prototype.Ud = function () {
        var a = this.Qa,
            b = 20 * (Math.floor(a % 23) + 0.5),
            a = 20 * (Math.floor(a / 23) + 0.5);
        this.hb = b - this.a.getWidth() / 4;
        this.ib = a - this.a.getHeight() / 4;
        O(this.a, this.hb, this.ib);
        O(this.J, b - this.J.getWidth() / 4, a + 5 - this.J.getHeight())
    };
    var Qd = function (a) {
        T.call(this, a);
        Fd(this)
    };
    inherit(Qd, T);
    var Rd = function (a) {
        T.call(this, a);
        random(2) && Q(this.a, this.Ba[1]);
        Fd(this)
    };
    inherit(Rd, T);
    class Sd {
        constructor(a) {
            T.call(this, a);
            (a = random(4)) && Q(this.a, this.Ba[a]);
            this.be = "GOLE"[a];
            Fd(this);
        }
    }
    inherit(Sd, T);
    var Td = [],
        U = h,
        Ud = 0;
    class ObjectPoolManager {
        constructor() {
            this.objects = {};
            this.count = 0;
        }
    }
    defineSingleton(ObjectPoolManager);

    Yd = function (a) {
        return !(a in Wd) || !(a in Xd) ? new T(Wd.coin) : new Xd[a](Wd[a])
    };

    class Item {
        constructor(grid, name, texture, extra = 0, data = null) {
            this.grid = grid;        // Reference to grid or item container
            this.name = name;        // Name/type of the item
            this.texture = texture;  // Resource or sprite handle
            this.extra = extra;      // Optional numeric field
            this.data = data;        // Optional linked object or metadata
        }
    }

    var Wd = {},
    Xd = k,
    $d = function (a) {
        var b = random(a.count),
            c = "coin",
            d = 0,
            e;
        for (e in Zd) {
            var f = Zd[e],
                d = d + (a.objects[f] || 0);
            if (b < d) {
                c = f;
                break
            }
        }
        return Yd(c)
    },
    ae = function (a, b) {
        a.count = 0;
        a.objects = b in W ? W[b].da : W[1].da;
        forEachObject(a.objects, function (a) {
            this.count += a
        }, a)
    }
    var Zd = {
        ta: "firecraker",
        Da: "dumpling",
        ob: "steamer",
        ha: "coin",
        Ea: "ingot",
        Kb: "tea",
        Fa: "medicine",
        mb: "mushroom",
        nb: "papercut",
        Va: "envelope",
        lb: "lantern"
    };
    var be = [new Point(0, 4), new Point(1, 4), new Point(2, 4), new Point(3, 4), new Point(3, 3), new Point(3, 2), new Point(3, 1), new Point(3, 0), new Point(2, 0), new Point(1, 0), new Point(0, 0), new Point(0, 1), new Point(0, 2), new Point(1, 2), new Point(2, 2)],
        ce = [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0), new Point(3, 1), new Point(3, 2), new Point(3, 3), new Point(3, 4), new Point(2, 4), new Point(1, 4), new Point(0, 4), new Point(0, 3), new Point(0, 2), new Point(0, 1)],
        de = [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0), new Point(3, 1), new Point(3, 2), new Point(3, 3), new Point(2, 3), new Point(1, 3), new Point(0, 3), new Point(0, 2), new Point(0, 1)],
        ee = [new Point(3, 4), new Point(2, 4), new Point(1, 4), new Point(0, 4), new Point(0, 3), new Point(0, 2), new Point(0, 1), new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0), new Point(3, 1), new Point(3, 2), new Point(2, 2), new Point(1, 2)],
        fe = [new Point(3, 4), new Point(2, 4), new Point(1, 4), new Point(0, 4), new Point(0, 3), new Point(0, 2), new Point(0, 1), new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(1, 2), new Point(1, 3), new Point(2, 3), new Point(3, 3)],
        ge = {};
    ge.G = [new Point(2, 3), new Point(3, 3), new Point(3, 4), new Point(3, 5), new Point(2, 5), new Point(1, 5), new Point(0, 5), new Point(0, 4), new Point(0, 3), new Point(0, 2), new Point(0, 1), new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0)];
    ge.G1 = be;
    ge.O = ce;
    ge.O2 = de;
    ge.L = fe;
    ge.E = ee;
    var he, W = {};
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
            ArrayUtils.forEach(getAllGridCells(), function(a) {
                this.cellMap.set(a, {
                    usedCount: 0,
                    specialCount: 0,
                    totalCount: 0
                });
            }, this);

            this.availableCells = new SetEx;
            this.availableCells.addAll(getAllGridCells(true));
            this.activeCells = new SetEx;
            forEachObject(ge, function (a, b) {
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
            var a = new SetEx, b = qe(this);
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

    ne = function (a) {
        var b = a.availableCells.getValues(),
            b = b.filter(function (a) {
                return 22 != a % 23 && 0 <= ArrayUtils.indexOf(b, a + 1) && 0 <= ArrayUtils.indexOf(b, a + 23) && 0 <= ArrayUtils.indexOf(b, a + 23 + 1)
            });
        if (!b.length) return -1;
        a = b[random(b.length)];
        return [a, a + 1, a + 23, a + 23 + 1]
    };

    var me = function (a) {
        if (a.availableCells.Nc()) return -1;
        a = a.availableCells.getValues();
        return a[random(a.length)]
    },
    oe = function (a, b, c) {
        var d = a.cellMap.get(b);
        d.Jc--;
        !d.Jc && !(-1 < blockedCells.indexOf(b)) && a.availableCells.add(b);
        c ? (d.Ic--, d.Ic || a.activeCells.remove(b)) : d.Gc--
    },
    pe = function (a) {
        var b = new SetEx;
        forEachItem(a.activeCells, function (a) {
            0 < this.g.get(a).Gc && b.add(a)
        }, a);
        return b.values()
    },
    qe = function (a) {
        var b = Infinity;
        forEachItem(a.activeCells, function (a) {
            b > a && (b = a)
        });
        return b
    };
    var re = function (a, b) {
        var c = me(a),
            d = [];
        forEachItem(a.patterns[b], function (a) {
            a += c;
            a %= 207;
            this.availableCells.contains(a) && d.push(a)
        }, a);
        return d
    };
    class TileSpawner extends Disposable {
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
            this.spawnArea = new S(88, -3, -3, this.v);
        }
        jb(a) {
            te(this, a);
            a = getTime();
            var b = 8 - this.Ca.va();
            if (2500 < a - this.Ec && 0 < b) {
                for (var b = random(b) + 1, c = 0; c < b; c++) {
                    var d = $d(this.itemSource),
                        e = -1,
                        e = "steamer" == d.getName() ? ne(this.gridManager) : me(this.gridManager); -
                    1 != e && ue(this, d, e);
                }
                this.Ec = a;
            }
        }
        getItem(a) {
            return this.Ra.get(a, k);
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
    var te = function (a, b) {
        console.log(a);
        40 >= b - a.ye || (forEachItem(a.Ca, function(a) {
            a.update(b);
            0 == a.i || 1 == a.i || (this.Ca.remove(a), a.C())
        }, a), forEachItem(a.Ra, function (a, b) {
            a.Bc && (oe(this.g, b), this.Ra.remove(b))
        }, a), a.ye = b)
    };
    var ve = function (a, b) {
        var c = re(a.g, b);
        ae(a.bb, b);
        ArrayUtils.forEach(c, function (a) {
            var b = $d(this.bb);
            ue(this, b, a)
        }, a);
        ae(a.bb, he)
    };

    ue = function (a, b, c) {
        var d = function (a, b) {
            this.Ra.set(b, a);
            this.Ca.add(a);
            this.g.markCell(b)
        };
        isArray(c) ? (ArrayUtils.forEach(c, function (a) {
            d.call(this, b, a)
        }, a), Kd(b, c[0])) : (d.call(a, b, c), Kd(b, c));
        Jd(b, a.v);
        b.zb *= a.spawnRate
    };
    var we, xe, ye = [
        { point: [3, 7], dir: 1 },
        { point: [2, 6], dir: 4 },
        { point: [4, 5], dir: 2 },
        { point: [5, 6], dir: 3 },
        { point: [3, 7], dir: 1 },
        { point: [2, 3], dir: 4 },
        { point: [4, 2], dir: 4 }
    ],
        De = function (a) {
            var b = ye[we], c = b.point;
            a.Ta() == c[1] && a.Sa() == c[0] && (ze(a, b.dir), we++, we == ye.length && (boostFunction(a, getTime(), Infinity), a.d[0].K(Be, 80)));
            a.forward();
            Ce(a);
            if (15 > xe)
                for (b = 0; 15 > b; b++) a.d[b].a.show(b <= xe + 1);
            xe++
        };
    var Fe = function (a) {
        this.d = [];
        this.A = k;
        this.ma = [];
        this.ba = Ee;
        this.v = a;
        this.jc = getTime();
        this.oc = this.qc = k;
        this.Ab = W[1].V;
        this.Fb = W[1].V;
        this.Gb = 1;
        this.ed = this.Z = 0;
        this.Yc = this.Hb = this.Ib = k;
        this.g = GridPatternManager.getInstance()
    };
    inherit(Fe, tb);
    Ge = [Uc, Tc, Sc, Tc, Uc];
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
        Ee = Cc,
        Se = function (a, b, c) {
            a = new N(a);
            a.show(l);
            P(a, b);
            a.Eb = h;
            c.appendChild(a.aa());
            return a
        };
    Fe.prototype.init = function () {
        for (var a = 22, b = k, c = 0; 15 > c; c++) b = new Te(3, 0 == c ? 0 : 14 == c ? 2 : 1, a, 7, c, b, this.v), b.a.show(l), this.d.push(b), this.g.markCell(161 + a, h), a++, a = 23 <= a ? a - 23 : a;
        this.A = Se(qc, 15, this.v)
    };
    Fe.prototype.forward = function () {
        var a = this.d[this.d.length - 1].Jb();
        ArrayUtils.forEachReverse(this.d, function (a) {
            a.Pa ? (a.k = a.Pa.k, a.o = a.Pa.o) : 0 == a.W && (a.k += 3 == a.F ? -1 : 4 == a.F ? 1 : 0, a.o += 1 == a.F ? -1 : 2 == a.F ? 1 : 0, a.k = (a.k + 23) % 23, a.o = (a.o + 9) % 9)
        });
        this.g.markCell(this.d[0].Jb(), h);
        oe(this.g, a, h);
        var b = k;
        this.ma.length && (b = this.ma.shift());
        ArrayUtils.forEachReverse(this.d, function (a) {
            var d = b;
            a.oa = a.F;
            a.F = 0 == a.W ? d ? d : a.F : 2 == a.W ? a.Pa.Pa.F : a.Pa.F
        })
    };
    Fe.prototype.move = function (a, b) {
        this.Ib && 5E3 < b - this.Ib && Ue(this, b);
        if (1 <= this.Z) {
            this.forward();
            if (5E3 <= (this.qc ? b - this.qc : 5E3)) {
                var c = this.g.match();
                "" != c && (this.dispatchEvent(new MatchPatternEvent(c, b)), this.qc = b, this.d[0].K(Ge, 80, 500))
            }
            We(this, b);
            Ce(this);
            this.Z = 0
        }
        Xe(this, b);
        this.jc = b
    };
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
                O(e, a, b)
            };
            if (a.d[0].F == a.d[1].F) {
                var e = a.d[0].qa().Na();
                a.A.show(h);
                var f = 20 * a.Sa(),
                    n = 20 * a.Ta();
                d(f, n, e, c, a.A, h);
                a.d[0].move(a.Z)
            } else a.A.show(l), Ye(a.d[0], a.Z);
            e = a.d.length - 1;
            if (Ze(a.d[e - 1])) a.d[e].qa().show(l),
                Ye(a.d[e - 1], a.Z);
            else {
                a.d[e].move(a.Z);
                var q = a.d[e - 1].qa(),
                    f = 20 * a.d[e - 1].Sa(),
                    n = 20 * a.d[e - 1].Ta(),
                    e = q.Na();
                d(f, n, e, c, q, l)
            }
            a.ed = c
        }
    },
        We = function (a, b) {
            var c = pe(a.g);
            c.length ? (ArrayUtils.forEach(c, function (a) {
                this.d[0].Jb() == a && this.d[0].K(Ie, 80);
                this.dispatchEvent(new CatchItemEvent(a, b))
            }, a), a.oc = b) : 5E3 < b - a.oc && (a.oc = b, a.d[0].K(He, 80))
        },
        Ue = function (a, b) {
            a.ba = Ee;
            a.d[0].K(Ne, 80, 100);
            a.Ab = a.Fb;
            a.Gb = 1;
            a.jc = b;
            a.Ib = k
        },
        ze = function (a, b) {
            a.Hb != k && (b = xb(b));
            if (2 > a.ma.length) {
                var c = a.d[0].F;
                0 < a.ma.length && (c = a.ma[a.ma.length - 1]);
                if ((1 == c || 2 == c) && (3 == b || 4 == b) || (1 == b || 2 == b) && (3 == c || 4 == c)) a.ma.push(b), c = 3 == bf.getInstance().$.get([c, b]) ? Le : Me, a.d[0].K(c, 80)
            }
        },
        Ce = function (a) {
            var b = a.d.length - 1;
            a.d[b].qa().show(h);
            for (var c = a.d[b - 1].qa(), d = b - 1; 1 < d; d--) a.d[d].a = a.d[d - 1].a, P(a.d[d].a, 16 - d);
            a.d[1].a = c;
            P(a.d[1].a, 15);
            cf(a.d[0], a.ba);
            cf(a.d[1]);
            cf(a.d[b])
        };

    boostFunction = function (snake, seconds, speed) {
        console.log("obj: " + snake + " | secs: " + seconds + " | speed: " + speed);
        snake.Ib = seconds;
        snake.Gb = speed;
        snake.Ab = snake.Fb * snake.Gb
    };

    Fe.prototype.h = function () {
        ArrayUtils.forEach(this.d, function (a) {
            a.C()
        });
        this.ma = k;
        this.A.C();
        Fe.I.h.call(this)
    };
    Fe.prototype.Sa = function () {
        return this.d[0].Sa()
    };
    Fe.prototype.Ta = function () {
        return this.d[0].Ta()
    };
    class CatchItemEvent extends CustomEvent {
        constructor(a, b) {
            super(this, "catch item");
            this.item = a;
            this.gb = b;
        }
    }
    class MatchPatternEvent extends CustomEvent {
        constructor(a, b) {
            super(this, "match pattern");
            this.pattern = a;
            this.gb = b;
        }
    }

    var Te = function (a, b, c, d, e, f, n) {
        this.oa = this.F = a;
        this.W = b;
        this.k = c;
        this.o = d;
        this.Pa = f;
        this.a = Se(qc, 16 - e, n);
        this.a.show(h);
        this.A = k;
        if (0 == this.W || 2 == this.W) this.A = Se(df[this.W], 16 - e, n);
        cf(this)
    };
    inherit(Te, Disposable);
    var df = {
        "0": Cc,
        1: qc,
        2: Bc
    };
    Te.prototype.move = function (a) {
        var b = this.k + (3 == this.F ? -1 : 4 == this.F ? 1 : 0) * a;
        a = this.o + (1 == this.F ? -1 : 2 == this.F ? 1 : 0) * a;
        if ((22 < b || 0 > b || 8 < a || 0 > a) && this.A) {
            var c = 22 < b ? b - 23 : 0 > b ? b + 23 : b,
                d = 8 < a ? a - 9 : 0 > a ? a + 9 : a,
                e = this.a.Na();
            180 == e ? xc(this.A) : this.A.rotate(e);
            uc(this.A, c, d);
            this.A.show(h)
        }
        uc(this.a, b, a)
    };
    var Ze = function (a) {
        a = a.a.Ua();
        var b = -1 < Oe.indexOf(a) || -1 < Pe.indexOf(a),
            c = -1 < Qe.indexOf(a) || -1 < Re.indexOf(a);
        return a == pc || b || c
    },
        cf = function (a, b) {
            var c = df[a.W];
            0 == a.W && (c = b || c);
            var d = bf.getInstance(), e = d.Na(a.oa);
            1 == a.W && (a.oa && a.F != a.oa) && (c = pc, e = d.ga.get([a.F, a.oa]));
            if (!a.a.X || !a.a.X.isPlaying()) Q(a.a, c), a.A && Q(a.A, c);
            0 == a.W && 180 == e ? xc(a.a) : a.a.rotate(e);
            a.A && a.A.show(l);
            uc(a.a, a.k, a.o)
        },
        Ye = function (a, b) {
            var c = a.a.Ua();
            if (!(-1 < Je.indexOf(c) || -1 < Ke.indexOf(c))) {
                var c = Math.min(Math.floor(5 * b), 4),
                    d = bf.getInstance(),
                    e;
                0 == a.W ?
                    (e = d.wc.get([a.oa, a.F]), e = 3 == e ? Oe : Pe) : (e = d.$.get([a.oa, a.F]), e = 3 == e ? Qe : Re, a.a.rotate(d.Na(a.oa)));
                Ac(a.a);
                Q(a.a, e[c])
            }
        };
    m = Te.prototype;
    m.K = function (a, b, c, d, e) {
        Ze(this) && a != Ke || (b = Math.min(b, 500), this.a.K(a, b, c, d, e), this.A && this.A.K(a, b, c, d, e))
    };
    m.h = function () {
        this.a.C();
        this.A && this.A.C();
        Te.I.h.call(this)
    };
    m.qa = function () {
        return this.a
    };
    m.Sa = function () {
        return this.k
    };
    m.Ta = function () {
        return this.o
    };
    m.Jb = function () {
        return 23 * this.o + this.k
    };
    var bf = function () {
        this.ga = new MapEx;
        this.ga.set([1, 3], 180);
        this.ga.set([1, 4], 90);
        this.ga.set([2, 3], 270);
        this.ga.set([2, 4], 0);
        this.ga.set([3, 1], 0);
        this.ga.set([3, 2], 90);
        this.ga.set([4, 1], 270);
        this.ga.set([4, 2], 180);
        this.g = new MapEx;
        this.g.set(1, 270);
        this.g.set(2, 90);
        this.g.set(3, 180);
        this.g.set(4, 0);
        this.$ = new MapEx;
        this.$.set([3, 1], 4);
        this.$.set([3, 2], 3);
        this.$.set([4, 1], 3);
        this.$.set([4, 2], 4);
        this.$.set([2, 3], 4);
        this.$.set([2, 4], 3);
        this.$.set([1, 3], 3);
        this.$.set([1, 4], 4);
        this.wc = this.$.clone();
        this.wc.set([3, 1], 3);
        this.wc.set([3, 2], 4)
    };
    defineSingleton(bf);
    bf.prototype.Na = function (a) {
        return this.g.get(a)
    };
    var $ = function (a) {
        this.v = a;
        this.fa = createDiv();
        Pb(this.fa, "grids");
        this.v.appendChild(this.fa);
        Rb(this.fa, jf.x, jf.y);
        this.cd = 0;
        this.i = "unstarted";
        this.Vd = getTime();
        this.ea = minutes;
        this.za = k;
        this.z = 0;
        this.$b = {};
        this.ya = k;
        this.yb = [];
        this.hc = this.Aa = this.Db = this.Cb = k;
        this.Ma = [];
        this.ka = TileSpawner.getInstance();
        gridClass = this.ka;
        this.ka.init(this.fa);
        this.N = new Fe(this.fa);
        snakeClass = this.N;
        this.Zc = new ub(this.v, h);
        this.B = new E(this);
        this.bb = ObjectPoolManager.getInstance();
        this.ca = new Cd(12, Z.x, Z.y, this.v, 101);
        this.ca.show(l);
        this.La = new Cd(90, kf.x, kf.y, this.v, 100);
        this.La.show(l);
        this.Ka = h;
        this.la = new Ub(["./snakeyear/snake"], this.v);
        this.cb = new S(31, lf.x, lf.y, this.v, 100);
        this.cb.show(l);
        this.fb = k;
        this.eb = [];
        this.Ja = this.ec = this.fc = this.dc = k;
        this.bd = l;
        this.gc = this.$c = 0;
        this.B.listen(this.Zc, "a", this.Xd);
        this.B.listen(this.N, "catch item", this.Yd);
        this.B.listen(this.N, "match pattern", this.Zd);
        this.B.listen(this.La, "click", this.Wd);
        this.Ja = new Kb(3E4, bind(this.$d, this), bind(this.ae, this));
        this.bd = !(!a || !a.standalone);
        window.isAnimationPaused = l;
        new S(19, mf.x, mf.y, this.v, 100);
        this.Cb = new S(36, nf.x + 99, nf.y, this.v, -1);
        this.Db = new S(53, of.x - 99, of.y, this.v, -1);
        this.Cb.show(l);
        this.Db.show(l);
        this.za = new Bd(pf.x, pf.y, this.v);
        this.za.show(l);
        this.ya = new xd(qf, this.v);
        for (a = 0; a < rf.length; a++) {
            var b = rf[a],
                c = new N(33);
            c.show(l);
            O(c, b.x, b.y);
            this.v.appendChild(c.aa());
            this.yb[a] = c
        }
        this.N.init();
        this.dd()
    };
    inherit($, Disposable);
    var Z = new Point(309, 79),
        kf = new Point(625, 125),
        lf = new Point(256, 46),
        sf = new Point(164, 36),
        vf = new Point(425, 110),
        wf = new Point(212, 80),
        xf = [91, 92, 93],
        yf = [new Point(415, 82), new Point(397, 82), new Point(379, 82)],
        mf = new Point(96, 6),
        jf = new Point(110, 20),
        nf = new Point(4, 46),
        of = new Point(577, 46),
        pf = new Point(43, 103),
        qf = [new Point(640, 103), new Point(629, 103), new Point(618, 103), new Point(607, 103), new Point(596, 103), new Point(585, 103)],
        rf = [new Point(6, 127), new Point(6, 143), new Point(22, 143), new Point(5, 159), new Point(22, 159), new Point(38, 159)],
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
        If = [51, 52],
        Kf = function (a, b, c, d) {
            return function () {
                var e = new AnimationSequence();
                ArrayUtils.forEach(b, function (b) {
                    e.addStep(function () {
                        Q(a, b);
                        O(a, c.x, c.y + d - a.getHeight())
                    });
                    addPauseStep(e, 80);
                });
                e.play()
            }
        },
        Nf = function (a) {
            Ue(a.N, getTime());
            a.i = "running";
            a.ea = minutes;
            Lf(a, 1);
            a.za.update(Math.floor(a.ea / 1E3));
            a.za.show(h);
            a.z = 0;
            a.ya.update(a.z);
            a.ya.reset();
            Mf(a);
            Ud = 0;
            Td = [];
            U = h;
            ArrayUtils.forEach(a.yb, function (a) {
                a.show(l)
            });
            a.La.show(h);
            a.la.play();
            a.la.H.muted = !a.Ka;
            a.$c++;
            a.gc = 0
        };
    $.prototype.$d = function () {
        if ("running" == this.i) {
            this.la.pause();
            var a = this.N;
            a.ba = Yc;
            Q(a.d[0].qa(), a.ba);
            Of(this)
        }
    };
    $.prototype.ae = function () {
        if ("tutorial_start" == this.i || "tutorial_end" == this.i) {
            this.la.play();
            var a = this.N;
            a.ba = Ee;
            Q(a.d[0].qa(), a.ba);
            this.i = "running";
            Pf(this);
            minutes == this.ea && Nf(this)
        }
    };
    var Mf = function (a) {
        ArrayUtils.forEach(getObjectKeys(Wd), function (a) {
            this.$b[a] = 0
        }, a)
    },
        Qf = function (a) {
            var b = new AnimationSequence();
            a.dc = b;
            for (var c = 1; 39 > c; c++) b.addStep(bind(De, a, a.N)), addPauseStep(b, 150);
            addPauseStep(b, 200);
            b.addStep(bind(function () {
                this.cb.show(h);
                yc(this.cb, 400, 0, 1)
            }, a));
            addPauseStep(b, 600);
            b.addStep(bind(function () {
                O(this.ca, Z.x, Z.y - 80);
                this.ca.show(h)
            }, a));
            b.addStep(bind(function (a) {
                O(this.ca, Z.x, Z.y - 80 * (1 - a * a))
            }, a), 700);
            b.addStep(bind(function (a) {
                O(this.ca, Z.x, Z.y - 80 * (0.25 - (0.5 - a) * (0.5 - a)))
            }, a), 700);
            b.addStep(bind(function () {
                this.rd()
            }, a));
            b.addStep(bind(function () {
                sb(this.B, this.ca, "mousedown", this.De)
            }, a))
            b.play()
        };
    $.prototype.rd = function () {
        "init" == this.i && (this.ca.K(Cf, 80), setTimeout(bind(this.rd, this), 3E3))
    };
    var Sf = function (a, b, c) {
        a.ka.jb(c);
        a.N.move(b, c);
        a.ya.jb(c);
        a.za.update(Math.floor(a.ea / 1E3));
        a.ea -= b;
        1 == he && 4E4 > a.ea ? Lf(a, 2) : 2 == he && 2E4 > a.ea && Lf(a, 3);
        0 > a.ea && "running" == a.i && (a.i = "stop", Rf(a), a.za.show(l), zd(a.ya), ArrayUtils.forEach(a.yb, function (a) {
            a.show(l)
        }), a.la.load(l))
    },
        Lf = function (a, b) {
            he = b;
            ae(ObjectPoolManager.getInstance(), b);
            var c = a.N;
            c.Fb = W[b].V;
            c.Ab = c.Fb * c.Gb;
            a.ka.vc = W[b].U
        };
    $.prototype.Yd = function (a) {
        var b = this.ka.getItem(a.item);
        if (b != k)
            if (1 == b.i || b.cc < b.a.getHeight()) {
                var c = b.getName();
                this.$b[c]++;
                console.log("Snake eaten " + c);
                this.z += b.z;
                this.z = Math.min(this.z, 999);
                switch (c) {
                    case "mushroom":
                    case "firecraker":
                    case "medicine":
                    case "tea":
                        c = this.N;
                        a = a.gb;
                        c.d[0].K(Ge, 80, 500);
                        boostFunction(c, a, .1);
                        c.ba = Vc;
                        break;
                    case "lantern":
                        a: {
                            a = Td;
                            c = b.be;
                            if (1 == a.length) c == a[0] ? U = h : a[0] == "GOOGLE"[0] && c == "GOOGLE"[1] ? U = l : (Td = [], U = h);
                            else if (a.length)
                                if (U && c == a[0] || !U && c == "GOOGLE"[a.length]) {
                                    if (U && 2 == a.length || !U && 5 == a.length) {
                                        a.push(c);
                                        Td = [];
                                        U = h;
                                        Ud++;
                                        a = a.join("");
                                        break a
                                    }
                                } else Td = [], U = h;
                            Td.push(c);
                            a = ""
                        }
                        if (a) {
                            for (var c = this.ka, d = a.length, e = 0; e < d; e++) {
                                ue(c, Yd("steamer"), ne(c.g));
                            }
                            6 == a.length && ve(this.ka, a[random(a.length)])
                        }
                        Tf(this)
                }
                b.Ia();
                this.ya.update(this.z)
            } else b.J.show(l), P(b.a, 1)
    };
    $.prototype.Zd = function (a) {
        a = a.pattern;
        "" != a && (ve(this.ka, a), this.gc++)
    };
    var Tf = function (a) {
        ArrayUtils.forEach(a.yb, function (a, c) {
            c < Td.length ? (Q(a, sd[Td[c]]), a.show(h)) : a.show(l)
        })
    },
        Rf = function (a) {
            isOver = true;
            if (a.Aa) {
                Sb(a.fa, 0.3);
                Q(a.hc, xf[(80 > a.z ? 1 : 150 > a.z ? 2 : 3) - 1]);
                var b = yd(a.z, vd);
                a.Aa.show(h);
                for (var c in b) b[c] != k ? (a.Ma[c].show(h), Q(a.Ma[c], b[c])) : a.Ma[c].show(l)
            } else {
                a.Aa = new S(61, sf.x, sf.y, a.v, 100);
                if (!a.bd) {
                    var q = new Cd(52, vf.x, vf.y, a.v, 101);
                    a.B.listen(q, "click", a.ze);
                    a.B.listen(q, "mouseover", Kf(q, Ff, vf, 28));
                    a.B.listen(q, "mouseout", Kf(q, If, vf, 28));
                    a.Aa.add(q)
                } a.hc = new S(xf[(80 > a.z ? 1 : 150 > a.z ? 2 : 3) - 1], wf.x, wf.y, a.v, 101);
                a.Aa.add(a.hc);
                var b = yd(a.z, vd),
                    r;
                for (r in b) c = b[r], a.Ma[r] = new S(c == k ? td[0] : c, yf[r].x, yf[r].y, a.v, 101), c == k && a.Ma[r].show(l), a.Aa.add(a.Ma[r]);
                Sb(a.fa, 0.3)
            }
        };
    $.prototype.Xd = function (a) {
        Mb(this.Ja);
        "tutorial_end" == this.i ? (Pf(this), Nf(this)) : "running" == this.i && ze(this.N, a.Ie)
    };
    $.prototype.De = function () {
        this.la.load(l);
        Mb(this.Ja);
        var a = new AnimationSequence();
        this.ec = a;
        a.addStep(bind(function () {
            zc(this.cb)
        }, this));
        a.addStep(bind(function (a) {
            O(this.ca, Z.x, Z.y + 80 * a * a);
            Sb(this.ca.aa(), 1 - a * a)
        }, this), 700);
        addPauseStep(a, 200);
        a.addStep(bind(function () {
            this.cb.show(l);
            this.ca.show(l);
            Sb(this.fa, 1)
        }, this));
        a.addStep(bind(function () {
            this.Cb.show(h);
            this.Db.show(h)
        }, this));
        a.addStep(bind(function (a) {
            O(this.Cb, nf.x + 99 * (1 - a), nf.y);
            O(this.Db, of.x - 99 * (1 - a), of.y)
        }, this), 1E3);
        a.addStep(bind(function () {
            yc(this.La, 500, 0, 1);
            this.La.show(h)
        }, this));
        a.addStep(bind(function () {
            Of(this)
        }, this));
        a.play()
    };
    var Of = function (a) {
        a.fb = new Cd(94, zf.x, zf.y, a.v, 100);
        for (var b in Bf) a.eb[b] = new Cd(Bf[b][0], Af[b].x, Af[b].y, a.v, 101), a.B.listen(a.eb[b], "click", a.td), a.fb.add(a.eb[b]);
        a.i = "tutorial_start";
        a.B.listen(a.fb, "click", a.td);
        a.sd()
    };
    $.prototype.td = function () {
        Mb(this.Ja);
        "tutorial_end" == this.i && (Pf(this), Nf(this))
    };
    $.prototype.sd = function () {
        if ("tutorial_start" == this.i || "tutorial_end" == this.i) {
            var a = new AnimationSequence();
            this.fc = a;
            for (var b in Bf) a.addStep(Kf(this.eb[b], Bf[b], Af[b], 29)), addPauseStep(a, 300);
            a.addStep(bind(function () {
                "tutorial_start" == this.i && (this.i = "tutorial_end")
            }, this));
            a.play();
            setTimeout(bind(this.sd, this), 3E3)
        }
    };
    var Pf = function (a) {
        zc(a.fb);
        ArrayUtils.forEach(a.eb, function (a) {
            zc(a)
        });
        a.fb.show(l)
    };
    m = $.prototype;
    m.Wd = function () {
        Mb(this.Ja);
        this.Ka = !this.Ka;
        Q(this.La, this.Ka ? 90 : 89);
        this.la.H.muted = this.Ka ? l : h
    };
    m.ze = function () {
        Sb(this.fa, 1);
        this.Aa.show(l);
        Nf(this);
    };
    m.dd = function () {
        var a = getTime(),
            b = a - this.cd,
            b = Math.min(50, b);
        "running" == this.i ? Sf(this, b, a) : "unstarted" == this.i && 1500 < a - this.Vd && (this.i = "init", Qf(this));
        b = bind(this.dd, this);
        Cb(b);
        this.cd = a
    };
    m.h = function () {
        this.i = "stop";
        la(this.B);
        this.dc && this.dc.stop();
        this.fc && this.fc.stop();
        this.ec && this.ec.stop();
        window.isAnimationPaused = h;
        this.$b = this.B = k;
        this.za.C();
        this.ya.C();
        this.ka.C();
        this.N.C();
        this.Zc.C();
        this.la.C();
        this.Ja.C();
        $.I.h.call(this)
    };
    var logoElement = k;
    var logoController = k;
    (function(callInit){
        callInit();
    })(function init() {
        if (logoElement = document.getElementById("hplogo")) {
            // Sprite / resource loader for the doodle
            M = new SpriteSheet("./snakeyear/snakeyear-sprite.png", lc);
            M.load();

            // Build a configuration set (rc) with many keys enabled
            var enabledSet = new MapEx();
            enabledSet.set(Bc, h);
            enabledSet.set(pc, h);
            enabledSet.set(id, h);
            enabledSet.set(jd, h);
            enabledSet.set(kd, h);
            enabledSet.set(ld, h);
            enabledSet.set(md, h);
            enabledSet.set(nd, h);
            enabledSet.set(od, h);
            enabledSet.set(pd, h);
            enabledSet.set(qd, h);
            enabledSet.set(rd, h);
            rc = enabledSet;

            // Another configuration set (sc) with a different set of keys
            var otherSet = new MapEx();
            otherSet.set(Zc, h);
            otherSet.set($c, h);
            otherSet.set(ad, h);
            otherSet.set(bd, h);
            otherSet.set(cd, h);
            otherSet.set(id, h);
            otherSet.set(jd, h);
            otherSet.set(kd, h);
            otherSet.set(ld, h);
            otherSet.set(md, h);
            sc = otherSet;


            // Build level / wave presets (W)
            var keyEnum = Zd;   // Zd appears to be an enum/object of item keys
            var configObj;

            configObj = {};
            configObj[keyEnum.ta] = 10;
            configObj[keyEnum.Da] = 20;
            configObj[keyEnum.Kb] = 20;
            configObj[keyEnum.Va] = 20;
            configObj[keyEnum.Fa] = 10;
            configObj[keyEnum.ha] = 40;
            configObj[keyEnum.Ea] = 20;
            W[1] = { da: configObj, V: 200, U: 1 };

            configObj = {};
            configObj[keyEnum.ta] = 10;
            configObj[keyEnum.Fa] = 10;
            configObj[keyEnum.Kb] = 10;
            configObj[keyEnum.nb] = 10;
            configObj[keyEnum.lb] = 50;
            W[2] = { da: configObj, V: 180, U: 0.85 };

            configObj = {};
            configObj[keyEnum.nb] = 30;
            configObj[keyEnum.Fa] = 20;
            configObj[keyEnum.mb] = 20;
            configObj[keyEnum.ta] = 30;
            configObj[keyEnum.lb] = 30;
            W[3] = { da: configObj, V: 160, U: 0.6 };

            // Some named presets
            configObj = {};
            configObj[keyEnum.ta] = 20;
            configObj[keyEnum.Da] = 30;
            configObj[keyEnum.ha] = 50;
            W.O = { da: configObj, V: 200, U: 1 };

            configObj = {};
            configObj[keyEnum.ta] = 40;
            configObj[keyEnum.Da] = 10;
            configObj[keyEnum.ha] = 50;
            W.O2 = { da: configObj, V: 200, U: 1 };

            configObj = {};
            configObj[keyEnum.Da] = 30;
            configObj[keyEnum.ha] = 40;
            configObj[keyEnum.Ea] = 30;
            W.G1 = { da: configObj, V: 200, U: 1 };
            W.E = { da: configObj, V: 200, U: 1 };
            W.L = { da: configObj, V: 200, U: 1 };

            configObj = {};
            configObj[keyEnum.ha] = 50;
            configObj[keyEnum.Ea] = 50;
            W.G = { da: configObj, V: 200, U: 1 };

            // Some global flags / counters
            he = 1;
            xe = we = 0;

            GridPatternManager.getInstance().init();

            // Build reverse mapping Xd from keys in Zd to some default T, then override some
            var enumObj = Zd;
            var reverseMap = {};
            var enumKey;
            for (enumKey in enumObj) {
                reverseMap[enumObj[enumKey]] = T;
            }
            reverseMap[enumObj.ta] = Nd;
            reverseMap[enumObj.Da] = Od;
            reverseMap[enumObj.ob] = Pd;
            reverseMap[enumObj.nb] = Rd;
            reverseMap[enumObj.Va] = Qd;
            reverseMap[enumObj.lb] = Sd;
            Xd = reverseMap;

            // Build item definitions (Wd)
            var itemDefs = {};
            itemDefs[enumObj.ta] = new Item([R.pe], enumObj.ta, 5000); // rarer item?
            itemDefs[enumObj.Da] = new Item([R.ne, R.oe], enumObj.Da, 7000, 2);
            itemDefs[enumObj.ob] = new Item([R.ob], enumObj.ob, 7000, 10);
            itemDefs[enumObj.Kb] = new Item([R.we, R.xe], enumObj.Kb, 6000, 2, h);
            itemDefs[enumObj.Fa] = new Item([R.Fa], enumObj.Fa, 6000, 2, l);
            itemDefs[enumObj.nb] = new Item([R.qe, R.le], enumObj.nb, 6000, 5);
            itemDefs[enumObj.Va] = new Item([R.Va], enumObj.Va, 7000, 2);
            itemDefs[enumObj.mb] = new Item([R.mb], enumObj.mb, 7000, 1, l);
            itemDefs[enumObj.lb] = new Item([R.se, R.ve, R.ue, R.re], enumObj.lb, 8000, 2);
            itemDefs[enumObj.ha] = new Item([R.ha], enumObj.ha, 10000, 1);
            itemDefs[enumObj.Ea] = new Item([R.Ea], enumObj.Ea, 5000, 5);
            console.log(itemDefs);
            Wd = itemDefs;

            // Start or set some initial state (ae probably attaches / activates level/state manager)
            ae(ObjectPoolManager.getInstance(), 1);

            // Create controller/handler for the logo DOM element
            logoController = new $(logoElement);
        }
    }, function cleanup() {
        // cleanup callback — release controller if present
        logoController && logoController.C();
    });
})();