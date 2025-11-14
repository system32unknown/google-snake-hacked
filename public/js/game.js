var spawnItem = null;
var createItem = null;
var find2x2Block = null;
var gridClass = null;
var boostFunction = null;
var snakeClass = null;

var minutes = 6E4;

(function () {
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

    // Safely disposes an object if it has a dispose method.
    function safeDispose(object) {
        if (object && typeof object.dispose === "function") {
            object.dispose();
        }
    }

    class BaseEvent {
        constructor(type, target) {
            this.type = type;
            this.target = this.currentTarget = target;

            this.defaultPrevented = false;
            this.propagationEnabled = true;

            // Old browser/engine flag — not used in modern code
            this._internalFlag = false;
        }

        // Called on event cleanup (no-op)
        onDispose() {}

        // Framework dispose hook
        dispose() {}

        preventDefault() {
            this.defaultPrevented = true;
            this.propagationEnabled = false;
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

    // Detect navigator info
    const getUserAgent = () => window.navigator ? window.navigator.userAgent : null;

    // Browser flags
    let isIE = false;

    const userAgent = getUserAgent();
    if (userAgent) {
        isIE = userAgent.includes("MSIE");
    }

    // IE Document Mode (for compatibility)
    const getDocumentMode = () => {
        const doc = window.document;
        return doc ? doc.documentMode : undefined;
    };

    // --- Browser version extraction ---
    let browserVersion = "";
    (function detectVersion() {
        let match;

        if (isIE) {
            match = /MSIE\s+([^\);]+)(\)|;)/.exec(userAgent);
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

    // --- Feature flags ---
    const doc = window.document;
    var docMode = (!doc || !isIE)
        ? undefined
        : getDocumentMode() || (doc.compatMode === "CSS1Compat" ? parseInt(browserVersion, 10) : 5);

    const supportsDOM9 = !isIE || (isIE && docMode >= 9);

    class NormalizedEvent extends BaseEvent {
        constructor(nativeEvent = null, currentTarget = null) {
            super(nativeEvent ? nativeEvent.type : "");
            
            // default fields
            this.target = null;
            this.relatedTarget = null;

            this.offsetX = 0;
            this.offsetY = 0;
            this.clientX = 0;
            this.clientY = 0;
            this.screenX = 0;
            this.screenY = 0;

            this.button = 0;
            this.keyCode = 0;
            this.charCode = 0;

            this.ctrlKey = false;
            this.altKey = false;
            this.shiftKey = false;
            this.metaKey = false;

            this.nativeEvent = null;

            if (nativeEvent) this.init(nativeEvent, currentTarget);
            delete this._internalFlag;
        }

        init(event, currentTarget) {
            const type = event.type;
            this.type = type;
            this.target = event.target || event.srcElement || null;
            this.currentTarget = currentTarget;

            // --- relatedTarget normalization ---
            let related = event.relatedTarget;
            if (!related) {
                if (type === "mouseover") related = event.fromElement;
                else if (type === "mouseout") related = event.toElement;
            }
            this.relatedTarget = related || null;

            // --- position ---
            this.offsetX = event.offsetX ?? event.layerX ?? 0;
            this.offsetY = event.offsetY ?? event.layerY ?? 0;

            this.clientX = event.clientX ?? event.pageX ?? 0;
            this.clientY = event.clientY ?? event.pageY ?? 0;

            this.screenX = event.screenX || 0;
            this.screenY = event.screenY || 0;

            // --- mouse + keyboard ---
            this.button = event.button;
            this.keyCode = event.keyCode || 0;
            this.charCode = event.charCode || (type === "keypress" ? event.keyCode : 0);

            // --- modifier keys ---
            this.ctrlKey = !!event.ctrlKey;
            this.altKey = !!event.altKey;
            this.shiftKey = !!event.shiftKey;
            this.metaKey = !!event.metaKey;

            this.state = event.state;
            this.nativeEvent = event;

            // auto prevent-default if browser marks it
            if (event.defaultPrevented) this.preventDefault();
        }

        preventDefault() {
            super.preventDefault();

            const event = this.nativeEvent;
            if (!event) return;

            if (event.preventDefault) {
                event.preventDefault();
            } else {
                // IE fallback
                event.returnValue = false;

                // special ctrl+F1–F12 hack for old browsers
                try {
                    if (event.ctrlKey || (event.keyCode >= 112 && event.keyCode <= 123)) {
                        event.keyCode = -1;
                    }
                } catch (_) {}
            }
        }

        // override for framework compatibility
        dispose() {}
    }

    class EventHandler extends Disposable {
        constructor(opt_scope) {
            super()
            this.handler_ = opt_scope;
            this.keys_ = {};
        }

        listen(src, type, opt_fn, opt_options) {
            return this.listen_(src, type, opt_fn, opt_options);
        }

        listenWithScope(src, type, fn, options, scope) {
            return this.listen_(src, type, fn, options, scope);
        }

        listen_(src, type, opt_fn, opt_options, opt_scope) {
            if (!Array.isArray(type)) {
                if (type) {
                    EventHandler.typeArray_[0] = type.toString();
                }
                type = EventHandler.typeArray_;
            }
            for (var i = 0; i < type.length; i++) {
                var listenerObj = listen(src, type[i], opt_fn || this.handleEvent, opt_options || false, opt_scope || this.handler_ || this);
                if (!listenerObj) {
                    return this;
                }

                var key = listenerObj.key;
                this.keys_[key] = listenerObj;
            }

            return this;
        }

        listenOnce(src, type, opt_fn, opt_options) {
            return this.listenOnce_(src, type, opt_fn, opt_options);
        }
        listenOnceWithScope(src, type, fn, capture, scope) {
            return this.listenOnce_(src, type, fn, capture, scope);
        }

        listenOnce_(src, type, opt_fn, opt_options, opt_scope) {
            if (Array.isArray(type)) {
                for (var i = 0; i < type.length; i++) {
                    this.listenOnce_(src, type[i], opt_fn, opt_options, opt_scope);
                }
            } else {
                var listenerObj = listenOnce(src, type, opt_fn || this.handleEvent, opt_options, opt_scope || this.handler_ || this);
                if (!listenerObj) {
                    return this;
                }

                var key = listenerObj.key;
                this.keys_[key] = listenerObj;
            }

            return this;
        }

        listenWithWrapper(src, wrapper, listener, opt_capt) {
            return this.listenWithWrapper_(src, wrapper, listener, opt_capt);
        }

        listenWithWrapperAndScope(src, wrapper, listener, capture, scope) {
            return this.listenWithWrapper_(src, wrapper, listener, capture, scope);
        }

        listenWithWrapper_(src, wrapper, listener, opt_capt, opt_scope) {
            wrapper.listen(src, listener, opt_capt, opt_scope || this.handler_ || this, this);
            return this;
        }

        getListenerCount() {
            var count = 0;
            for (var key in this.keys_) {
                if (this.keys_.hasOwnProperty(key)) {
                    count++;
                }
            }
            return count;
        }

        unlisten(src, type, opt_fn, opt_options, opt_scope) {
            if (Array.isArray(type)) {
                for (var i = 0; i < type.length; i++) {
                    this.unlisten(src, type[i], opt_fn, opt_options, opt_scope);
                }
            } else {
                var capture = isObject(opt_options) ? !!opt_options.capture : !!opt_options;
                var listener = getListener(
                    src, type, opt_fn || this.handleEvent, capture,
                    opt_scope || this.handler_ || this);

                if (listener) {
                    unlistenByKey(listener);
                    delete this.keys_[listener.key];
                }
            }

            return this;
        }

        unlistenWithWrapper(src, wrapper, listener, opt_capt, opt_scope) {
            wrapper.unlisten(src, listener, opt_capt, opt_scope || this.handler_ || this, this);
            return this;
        }

        removeAll() {
            Object.forEach(this.keys_, function (listenerObj, key) {
                if (this.keys_.hasOwnProperty(key)) {
                    unlistenByKey(listenerObj);
                }
            }, this);

            this.keys_ = {};
        }

        dispose() {
            super.dispose();
            this.removeAll();
        }

        handleEvent(_) {
            throw new Error('EventHandler.handleEvent not implemented');
        }
    }
    EventHandler.typeArray_ = [];

    class EventDispatcher extends Disposable {
        constructor() {
            super();
            this.enabled = true;
            this.parent = null;
        }

        addEventListener(type, callback, useCapture, priority) {
            addListener(this, type, callback, useCapture, priority);
        }

        removeEventListener(type, callback, useCapture, priority) {
            removeListener(this, type, callback, useCapture, priority);
        }

        dispatchEvent(event) {
            let type = event.type || event;
            let registry = globalEventRegistry;

            if (!(type in registry)) return true;

            if (typeof event === "string") event = new Event(type, this);
            else if (event instanceof Event) event.target ||= this;
            else {
                let temp = event;
                event = new Event(type, this);
                Object.assign(event, temp);
            }

            let result = true;
            let listeners = registry[type];
            let capture = listeners[true];
            let bubble = listeners[false];

            // Capture phase
            if (capture) {
                let ancestors = [];
                for (let node = this; node; node = node.parent) ancestors.push(node);
                for (let i = ancestors.length - 1; i >= 0 && !event.stopped && capture.active; i--)
                    result &= invokeListeners(capture, ancestors[i], event.type, true, event) && !event.defaultPrevented;
            }

            // Bubble phase
            if (bubble) {
                if (capture) {
                    for (let i = 0; i < ancestors.length && !event.stopped && bubble.active; i++)
                        result &= invokeListeners(bubble, ancestors[i], event.type, false, event) && !event.defaultPrevented;
                } else {
                    for (let node = this; node && !event.stopped && bubble.active; node = node.parent)
                        result &= invokeListeners(bubble, node, event.type, false, event) && !event.defaultPrevented;
                }
            }

            return Boolean(result);
        }

        dispose() {
            super.dispose();
            clearAllListeners(this);
            this.parent = null;
        }
    }
``
    class InputController {
        constructor(element = document, preventDefault = false) {
            this.element = element;
            this.handler = new EventHandler(this);
            this.preventDefault = preventDefault;

            this.handler.listen(this.element, "keydown", this.onKeyDown);

            if (!isIE) {
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
                        dispatchEvent(new DirectionEvent(direction));
                    }
                }
            }
        }

        onKeyDown(e) {
            let direction = vb[e.keyCode];
            if (direction) {
                dispatchEvent(new DirectionEvent(direction));
                if (this.preventDefault && e.preventDefault) e.preventDefault();
            }
        }

        dispose() {
            super.dispose();
            this.handler.dispose();
            this.handler = null;
            window.removeEventListener("deviceorientation", this.onMotion, true);
            window.removeEventListener("MozOrientation", this.onMotion, true);
            window.removeEventListener("devicemotion", this.onMotion, true);
        }
    }

    class DirectionEvent extends Event {
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

    class VisibilityTimer extends Disposable {
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
                var listener = new EventHandler(this);
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
        constructor(tracks, container = document.body) {
            super();
            this.tracks = tracks;
            this.container = container;
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

            audio.addEventListener("canplay", () => {
                this.ready = true;
                if (this.onReady) this.onReady();
            });

            audio.addEventListener("ended", () => {
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

    class Sprite extends EventDispatcher {
        constructor(frameId) {
            super();

            // Current frame identifier (like image or tile type)
            this.frameId = frameId;

            // Rotation (0, 90, 180, 270 degrees)
            this.rotation = 0;

            // DOM element (the sprite's visual)
            this.element = SpriteManager.createFrame(this._getFrameSource());

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
        getElement() {
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
        getFrameId() {
            return this.frameId;
        }

        // Returns current rotation
        getRotation() {
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

        // Play frame animation sequence
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
        if (target.X) {
            target.X.stop();
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

    class ScoreDisplay extends Disposable {
        constructor(tilePositions, textureId) {
            super();

            // Base positions for main digits
            this.digitPositions = [];
            this.currentScore = 0;
            this.mainDigits = [];

            // Create main digit tiles (3 digits)
            for (let i = 0; i < 3; i++) {
                this.digitPositions[i] = tilePositions[i];
                this.mainDigits.push(createBackgroundTile(textureId, this.digitPositions[i].x, this.digitPositions[i].y));
            }

            // Background or base tile for the score display
            this.baseTile = createBackgroundTile(textureId, tilePositions[0].x, tilePositions[0].y);

            // Temporary flashing or bonus digit overlays
            this.overlayDigits = [];
            for (let i = 0; i < 2; i++) {
                this.overlayDigits[i] = createBackgroundTile(textureId, tilePositions[i + 4].x, tilePositions[i + 4].y);
                this.overlayDigits[i].element.style.opacity = 0;
                this.overlayDigits[i].show(true);
            }

            // Frame change history and timing
            this.pendingChanges = [];
            this.lastUpdateTime = null;
            this.overlayVisible = false;
        }

        /**
         * Resets the score display to 0 and hides overlays.
         */
        reset() {
            for (let i in this.mainDigits) {
                this.mainDigits[i].setFrame(td[0]); // reset frame to 0 digit
            }

            this.currentScore = 0;

            // Ensure main and overlay digits are visible but transparent
            this.mainDigits[0].show(true);
            this.overlayDigits[0].s.style.opacity = 0;
            this.overlayDigits[1].s.style.opacity = 0;
            this.overlayDigits[0].show(true);
            this.overlayDigits[1].show(true);
            this.pendingChanges = [];
        }

        /**
         * Updates the score display to show a new score.
         * @param {number} newScore - The updated score value.
         */
        update(newScore) {
            if (newScore > 999 || newScore === this.currentScore) return;

            let delta = newScore - this.currentScore;
            this.currentScore = newScore;

            // Generate sprite frames for each digit
            const newDigitFrames = createDigitSprites(newScore);

            for (let i in newDigitFrames) {
                const digitSprite = this.mainDigits[i];
                const newFrame = newDigitFrames[i];
                const pos = this.digitPositions[i];

                if (newFrame != null) {
                    digitSprite.show(true);
                    if (digitSprite.getFrameId() !== newFrame) {
                        // Animate digit transition
                        playSwapAnimation(this, pos, digitSprite, newFrame);
                    }
                } else {
                    digitSprite.show(false);
                }
            }

            this.pendingChanges.push(delta);
        }

        /**
         * Called every frame — animates overlay digits showing score gain.
         * @param {number} currentTime - Timestamp for timing overlays.
         */
        animateOverlay(currentTime) {
            if (this.pendingChanges.length) {
                const delta = this.pendingChanges.shift();
                const overlayFrames = createDigitSprites(delta, ud, 2);

                for (let i in overlayFrames) {
                    stopAllAnimations(this.overlayDigits[i]);
                    const frame = overlayFrames[i];

                    if (frame != null) {
                        this.overlayDigits[i].setFrame(frame);
                        Sprite.animateOpacity(this.overlayDigits[i], 300, 0, 1);
                    } else {
                        this.overlayDigits[i].s.style.opacity = 0;
                    }
                }

                this.lastUpdateTime = currentTime;
                this.overlayVisible = overlayFrames[1] != null;
            }

            // Fade out overlays after 1 second
            if (this.lastUpdateTime && currentTime - this.lastUpdateTime > 1000) {
                Sprite.fadeOut(this.overlayDigits[0]);
                if (this.overlayVisible) Sprite.fadeOut(this.overlayDigits[1]);
                this.lastUpdateTime = null;
            }
        }

        /**
         * Clean up resources.
         */
        dispose() {
            this.mainDigits.forEach(sprite => sprite.destroy());
            super.dispose();
        }
    }

    class xd extends Disposable {
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

    class TimerDisplay extends Disposable {
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

    class SpritePool extends Disposable {
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

    class GridEntity extends Disposable {
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
            this.sprite.K(Ld, 700, this.targetY);
            this.sprite.K(Md, 80, this.targetY + 700 * Ld.length);
            this.speed = -5;
        }

        onImpact() {
            this.sprite.K(Md, 400);
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
        constructor(grid, name, texture, extra = 0, data = null) {
            this.grid = grid;        // Reference to grid or item container
            this.name = name;        // Name/type of the item
            this.texture = texture;  // Resource or sprite handle
            this.extra = extra;      // Optional numeric field
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
        Da: "dumpling",
        ob: "steamer",
        ha: "coin",
        Ea: "ingot",
        Kb: "tea",
        Fa: "medicine",
        mb: "mushroom",
        nb: "papercut",
        envelope: "envelope",
        lantern: "lantern"
    };
    var be = [new Point(0, 4), new Point(1, 4), new Point(2, 4), new Point(3, 4), new Point(3, 3), new Point(3, 2), new Point(3, 1), new Point(3, 0), new Point(2, 0), new Point(1, 0), new Point(0, 0), new Point(0, 1), new Point(0, 2), new Point(1, 2), new Point(2, 2)],
        ce = [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0), new Point(3, 1), new Point(3, 2), new Point(3, 3), new Point(3, 4), new Point(2, 4), new Point(1, 4), new Point(0, 4), new Point(0, 3), new Point(0, 2), new Point(0, 1)],
        de = [new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0), new Point(3, 1), new Point(3, 2), new Point(3, 3), new Point(2, 3), new Point(1, 3), new Point(0, 3), new Point(0, 2), new Point(0, 1)],
        ee = [new Point(3, 4), new Point(2, 4), new Point(1, 4), new Point(0, 4), new Point(0, 3), new Point(0, 2), new Point(0, 1), new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0), new Point(3, 1), new Point(3, 2), new Point(2, 2), new Point(1, 2)],
        fe = [new Point(3, 4), new Point(2, 4), new Point(1, 4), new Point(0, 4), new Point(0, 3), new Point(0, 2), new Point(0, 1), new Point(0, 0), new Point(1, 0), new Point(1, 1), new Point(1, 2), new Point(1, 3), new Point(2, 3), new Point(3, 3)]
    var ge = {
        G: [new Point(2, 3), new Point(3, 3), new Point(3, 4), new Point(3, 5), new Point(2, 5), new Point(1, 5), new Point(0, 5), new Point(0, 4), new Point(0, 3), new Point(0, 2), new Point(0, 1), new Point(0, 0), new Point(1, 0), new Point(2, 0), new Point(3, 0)],
        G1: be,
        O: ce,
        O2: de,
        L: fe,
        E: ee,
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

    class Fe extends EventDispatcher {
        constructor(a) {
            super();
            this.d = [];
            this.A = null;
            this.ma = [];
            this.ba = Ee;
            this.v = a;
            this.jc = getTime();
            this.oc = this.qc = null;
            this.Ab = ObjectRegistry[1].V;
            this.Fb = ObjectRegistry[1].V;
            this.Gb = 1;
            this.ed = this.Z = 0;
            this.Yc = this.Hb = this.Ib = null;
            this.g = GridPatternManager.getInstance();
        }
        init() {
            for (var a = 22, b = null, c = 0; 15 > c; c++) b = new Te(3, 0 == c ? 0 : 14 == c ? 2 : 1, a, 7, c, b, this.v), b.a.show(false), this.d.push(b), this.g.markCell(161 + a, true), a++, a = 23 <= a ? a - 23 : a;
            this.A = createSprite(qc, 15, this.v);
        }
        forward() {
            var a = this.d[this.d.length - 1].Jb();
            ArrayUtils.forEachReverse(this.d, function (a) {
                a.parent ? (a.k = a.parent.k, a.o = a.parent.o) : 0 == a.W && (a.k += 3 == a.F ? -1 : 4 == a.F ? 1 : 0, a.o += 1 == a.F ? -1 : 2 == a.F ? 1 : 0, a.k = (a.k + 23) % 23, a.o = (a.o + 9) % 9);
            });
            this.g.markCell(this.d[0].Jb(), true);
            updateCellUsage(this.g, a, true);
            var b = null;
            this.ma.length && (b = this.ma.shift());
            ArrayUtils.forEachReverse(this.d, function (a) {
                var d = b;
                a.oa = a.F;
                a.F = 0 == a.W ? d ? d : a.F : 2 == a.W ? a.parent.parent.F : a.parent.F;
            });
        }
        move(b) {
            this.Ib && 5E3 < b - this.Ib && Ue(this, b);
            if (1 <= this.Z) {
                this.forward();
                if (5E3 <= (this.qc ? b - this.qc : 5E3)) {
                    var c = this.g.match();
                    "" != c && (dispatchEvent(new MatchPatternEvent(c, b)), this.qc = b, this.d[0].K(Ge, 80, 500));
                }
                We(this, b);
                Ce(this);
                this.Z = 0;
            }
            Xe(this, b);
            this.jc = b;
        }
        dispose() {
            ArrayUtils.forEach(this.d, function (a) {
                a.C();
            });
            this.ma = null;
            this.A.C();
            super.dispose();
        }
        Sa() {
            return this.d[0].Sa();
        }
        Ta() {
            return this.d[0].Ta();
        }
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
            } else a.A.show(false), Ye(a.d[0], a.Z);
            e = a.d.length - 1;
            if (Ze(a.d[e - 1])) a.d[e].qa().show(false),
                Ye(a.d[e - 1], a.Z);
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
            this.d[0].Jb() == a && this.d[0].K(Ie, 80);
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
            if ((1 == c || 2 == c) && (3 == b || 4 == b) || (1 == b || 2 == b) && (3 == c || 4 == c)) a.ma.push(b), c = 3 == DirectionManager.getInstance().transformMap.get([c, b]) ? Le : Me, a.d[0].K(c, 80)
        }
    },
    Ce = function (a) {
        var b = a.d.length - 1;
        a.d[b].getElement().show(true);
        for (var c = a.d[b - 1].qa(), d = b - 1; 1 < d; d--) {
            a.d[d].a = a.d[d - 1].a;
            a.d[d].a.setZIndex(16 - d);
        }
        a.d[1].a = c;
        a.d[1].a.setZIndex(15);
        cf(a.d[0], a.ba);
        cf(a.d[1]);
        cf(a.d[b])
    },
    Ae = function(a, b, c) {
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
    class SnakeController extends EventDispatcher {
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
                seg.a.show(false);                 // mirror: hide initially
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
            const releasingIndex = this.segments[this.segments.length - 1].Jb();

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
            this.patternManager.markCell(this.segments[0].Jb(), true);

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
                        dispatchEvent(new CatchItemEvent(pattern, now));
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
                if (Ze(this.segments[lastIndex - 1])) {
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
                    if (this.segments[0].Jb() === idx) {
                        this.segments[0].K(Ie, 80);
                    }
                    // dispatch catch event (custom $e)
                    dispatchEvent(new CatchItemEvent(idx, now));
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
                this.segments[i].a = this.segments[i - 1].a;
                this.segments[i].a.setZIndex(16 - i);
            }

            // second element uses previous sprite instance
            this.segments[1].a = this.segments[lastIndex - 1].qa();
            this.segments[1].a.setZIndex(15);

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
        Sa() { return this.segments[0].Sa(); }
        Ta() { return this.segments[0].Ta(); }

        // cleanup
        dispose() {
            ArrayUtils.forEach(this.segments, seg => seg.dispose());
            this.directionQueue = null;
            this.headSprite.dispose();
            super.dispose();
        }

        // convenience getters used in original code
        getRow() { return this.Ta(); }
        getColumn() { return this.Sa(); }
    }

    class CatchItemEvent extends Event {
        constructor(a, b) {
            super("catch item");
            this.item = a;
            this.gb = b;
        }
    }
    class MatchPatternEvent extends Event {
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
    class SnakeSegment extends Event {
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
            this.baseDirection = this.currentDirection = direction; // current + previous direction
            this.entityType = type;                                 // 0=head, 1=body, 2=tail
            this.gridX = gridX;                                     // grid X
            this.gridY = gridY;                                     // grid Y
            this.parent = parentSegment;                            // previous segment

            // Sprite for this segment
            this.mainSprite = createSprite(qc, 16 - index, container); // base sprite
            this.mainSprite.show(true);

            // Secondary sprite (for head/tail overlays)
            this.shadowSprite = null;
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
        const frameId = segment.a.getFrameId();
        const isTurnA = Oe.includes(frameId) || Pe.includes(frameId);
        const isTurnB = Qe.includes(frameId) || Re.includes(frameId);
        return frameId === pc || isTurnA || isTurnB;
    }

    /**
     * Sets the correct frame, rotation, and position for a segment.
     */
    function updateSegmentSprite(segment, overrideFrame) {
        let frameSet = SegmentFrames[segment.W];
        if (segment.W === 0) frameSet = overrideFrame || frameSet;

        const directionMgr = DirectionManager.getInstance();
        let angle = directionMgr.getBaseAngle(segment.oa);

        if (segment.W === 1 && segment.oa && segment.F !== segment.oa) {
            frameSet = pc;
            angle = directionMgr.rotationMap.get([segment.F, segment.oa]);
        }

        if (!segment.a.X || !segment.a.X.isPlaying()) {
            segment.a.setFrame(frameSet);
            if (segment.A) segment.A.setFrame(frameSet);
        }

        if (segment.W === 0 && angle === 180) segment.a.flip();
        else segment.a.rotate(angle);

        if (segment.A) segment.A.show(false);
        Sprite.moveToGrid(segment.a, segment.k, segment.o);
    }

    /**
     * Updates transition frames for turning animation.
     */
    function animateSegmentTurn(segment, progress) {
        const frameId = segment.a.Ua();
        if (Je.includes(frameId) || Ke.includes(frameId)) return;

        const frameIndex = Math.min(Math.floor(5 * progress), 4);
        const directionMgr = DirectionManager.getInstance();
        let frameSet;

        if (segment.W === 0) {
            const mapType = directionMgr.alternateTransform.get([segment.oa, segment.F]);
            frameSet = mapType === 3 ? Oe : Pe;
        } else {
            const mapType = directionMgr.transformMap.get([segment.oa, segment.F]);
            frameSet = mapType === 3 ? Qe : Re;
            segment.a.rotate(directionMgr.getBaseAngle(segment.oa));
        }

        stopAllAnimations(segment.a);
        segment.a.setFrame(frameSet[frameIndex]);
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

    class $ extends Disposable {
        constructor(rootElement) {
            super();
            this.root = rootElement;

            this.gridContainer = createDiv();
            addClass(this.gridContainer, "grids");
            this.root.appendChild(this.gridContainer);
            setPosition(this.gridContainer, START_POS.x, START_POS.y);

            this.lastUpdateTime = 0;
            this.state = "unstarted";
            this.startTime = getTime();
            this.remainingTime = minutes;

            this.score = 0; // score
            this.comboData = {};
            this.hc = this.Aa = this.Db = this.Cb = null;
            this.Ma = [];
            this.TileSpawner = TileSpawner.getInstance();
            gridClass = this.TileSpawner;
            this.TileSpawner.init(this.gridContainer);
            this.snake = new SnakeController(this.gridContainer);
            snakeClass = this.snake;

            this.input = new InputController(this.root, true);
            this.eventHandler = new EventHandler(this);
            this.objectPool = ObjectPoolManager.getInstance();

            this.playButton = new ClickableElement(12, START_BUTTON.x, START_BUTTON.y, this.root, 101);
            this.playButton.show(false);

            this.soundButton = new ClickableElement(90, SOUND_BUTTON.x, SOUND_BUTTON.y, this.root, 100);
            this.soundButton.show(false);

            this.music = new AudioPlayer(["./resources/snake"], this.root);

            this.mainSprite = new SpriteGroup(31, MAIN_SPR_POS.x, MAIN_SPR_POS.y, this.root, 100);
            this.mainSprite.show(false);

            this.fb = null;
            this.eb = [];

            this.uiSeq = null;
            this.tutSeq = null;
            this.introSeq = null;

            this.gc = 0;

            this.visibilityTimer = new VisibilityTimer(3E4, this.$d, this.ae);
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
            this.eventHandler.listen(this.snake, "catch item", this.Yd);
            this.eventHandler.listen(this.snake, "match pattern", this.Zd);
            this.eventHandler.listen(this.soundButton, "click", this.Wd);

            this.snake.init();
            this.dd();
        }
        $d() {
            if ("running" == this.state) {
                this.music.pause();
                var a = this.snake;
                a.ba = Yc;
                a.d[0].qa().setFrame(a.ba);
                Of(this);
            }
        }
        ae() {
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
        rd() {
            if ("init" == this.state) {
                this.playButton.K(Cf, 80);
                setTimeout(this.rd, 3E3);
            }
        }
        Yd(a) {
            var b = this.TileSpawner.getItem(a.item);
            if (b != null)
                if (1 == b.i || b.cc < b.a.getHeight()) {
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
                    b.a.setZIndex(1);
                }
        }
        Zd(a) {
            a = a.pattern;
            "" != a && (fillGridWithItems(this.TileSpawner, a), this.gc++);
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
                Sprite.setPosition(this.ca, Z.x, Z.y + 80 * a * a);
                setOpacity(this.ca.aa(), 1 - a * a);
            }, 700);
            seq.addPauseStep(200);
            seq.addStep(function () {
                this.cb.show(false);
                this.ca.show(false);
                setOpacity(this.fa, 1);
            });
            seq.addStep(function () {
                this.Cb.show(true);
                this.Db.show(true);
            });
            seq.addStep(function (a) {
                Sprite.setPosition(this.Cb, FRAME_LEFT.x + 99 * (1 - a), FRAME_LEFT.y);
                Sprite.setPosition(this.Db, FRAME_RIGHT.x - 99 * (1 - a), FRAME_RIGHT.y);
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
        sd() {
            if ("tutorial_start" == this.state || "tutorial_end" == this.state) {
                var a = new AnimationSequence();
                this.tutSeq = a;
                for (var b in Bf) {
                    a.addStep(createFrameAnimation(this.eb[b], Bf[b], Af[b], 29));
                    a.addPauseStep(300);
                }
                a.addStep(function () {
                    if ("tutorial_start" == this.state) this.state = "tutorial_end";
                });
                a.play();
                setTimeout(this.sd, 3E3);
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
        dd() {
            var a = getTime();
            var b = a - this.lastUpdateTime;
            var b = Math.min(50, b);
            if ("running" == this.state) {
                updateGameState(this, b, a);
            } else if ("unstarted" == this.state && 1500 < a - this.startTime) {
                this.state = "init";
                playIntroSequence(this);
            }
            requestAnimFrame(this.dd);
            this.lastUpdateTime = a;
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
            seq.addStep(bind(De, game, game.N));
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
            Sprite.setPosition(this.ca, Z.x, Z.y - 80);
            this.ca.show(true);
        });

        // Bounce animation 1
        seq.addStep(function (t) {
            Sprite.setPosition(this.ca, Z.x, Z.y - 80 * (1 - t * t));
        }, 700);

        // Bounce animation 2
        seq.addStep(function (t) {
            Sprite.setPosition(this.ca, Z.x, Z.y - 80 * (0.25 - (0.5 - t) * (0.5 - t)));
        }, 700);

        // Run "ready" callback
        seq.addStep(function () {
            this.rd();
        });

        // Add click handler
        seq.addStep(function () {
            this.ca.addEventListener("mousedown", this.De)
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
    var logoController = null;
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
            configObj[keyEnum.Da] = 20;
            configObj[keyEnum.Kb] = 20;
            configObj[keyEnum.envelope] = 20;
            configObj[keyEnum.Fa] = 10;
            configObj[keyEnum.ha] = 40;
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
            configObj[keyEnum.Da] = 30;
            configObj[keyEnum.ha] = 50;
            ObjectRegistry.O = { data: configObj, V: 200, U: 1 };

            configObj = {};
            configObj[keyEnum.firecraker] = 40;
            configObj[keyEnum.Da] = 10;
            configObj[keyEnum.ha] = 50;
            ObjectRegistry.O2 = { data: configObj, V: 200, U: 1 };

            configObj = {};
            configObj[keyEnum.Da] = 30;
            configObj[keyEnum.ha] = 40;
            configObj[keyEnum.Ea] = 30;
            ObjectRegistry.G1 = { data: configObj, V: 200, U: 1 };
            ObjectRegistry.E = { data: configObj, V: 200, U: 1 };
            ObjectRegistry.L = { data: configObj, V: 200, U: 1 };

            configObj = {};
            configObj[keyEnum.ha] = 50;
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
            reverseMap[enumObj.Da] = StaticVariantEntity;
            reverseMap[enumObj.ob] = ShadowedEntity;
            reverseMap[enumObj.nb] = RandomMovingEntity;
            reverseMap[enumObj.envelope] = MovingEntity;
            reverseMap[enumObj.lantern] = LanternEntity;
            ItemClasses = reverseMap;

            // Build item definitions (Wd)
            var itemDefs = {};
            itemDefs[enumObj.firecraker] = new Item([R.pe], enumObj.firecraker, 5000);
            itemDefs[enumObj.Da] = new Item([R.ne, R.oe], enumObj.Da, 7000, 2);
            itemDefs[enumObj.ob] = new Item([R.ob], enumObj.ob, 7000, 10);
            itemDefs[enumObj.Kb] = new Item([R.we, R.xe], enumObj.Kb, 6000, 2, true);
            itemDefs[enumObj.Fa] = new Item([R.Fa], enumObj.Fa, 6000, 2, false);
            itemDefs[enumObj.nb] = new Item([R.qe, R.le], enumObj.nb, 6000, 5);
            itemDefs[enumObj.envelope] = new Item([R.envelope], enumObj.envelope, 7000, 2);
            itemDefs[enumObj.mb] = new Item([R.mb], enumObj.mb, 7000, 1, false);
            itemDefs[enumObj.lantern] = new Item([R.se, R.ve, R.ue, R.re], enumObj.lantern, 8000, 2);
            itemDefs[enumObj.ha] = new Item([R.ha], enumObj.ha, 10000, 1);
            itemDefs[enumObj.Ea] = new Item([R.Ea], enumObj.Ea, 5000, 5);
            console.log(itemDefs);
            ItemDefinitions = itemDefs;

            // Start or set some initial state (ae probably attaches / activates level/state manager)
            initializeObjectCounter(ObjectPoolManager.getInstance(), 1);

            // Create controller/handler for the logo DOM element
            logoController = new $(logoElement);
        }
    }, function cleanup() {
        // cleanup callback — release controller if present
        if (logoController) logoController.C();
    });
})();