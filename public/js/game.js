var minutes = 6E4;

var ItemDefinitions = {}; // Registry of base item data
var ItemClasses = null; // Registry mapping item names to their constructors

function defineSingleton(cls) {
    cls.getInstance = function () {
        if (!cls._instance) {
            cls._instance = new cls();
        }
        return cls._instance;
    };
}

/**
 * Parse a Starling-style XML spritesheet into a JavaScript object.
 * @param {string} xmlText - The content of spritesheet.xml as string.
 * @returns {object} Parsed data: frames: {[name]: {x,y,width,height}}
 */
function parseSpriteSheetXML(xmlText) {
    const parser = new DOMParser();
    const xml = parser.parseFromString(xmlText, "application/xml");
    const atlas = xml.querySelector("TextureAtlas");
    if (!atlas) throw new Error("Invalid spritesheet XML: missing <TextureAtlas>");

    const frames = [];
    atlas.querySelectorAll("SubTexture").forEach((node) => {
        frames.push({
            x: parseInt(node.getAttribute("x")),
            y: parseInt(node.getAttribute("y")),
            width: parseInt(node.getAttribute("width")),
            height: parseInt(node.getAttribute("height"))
        });
    });
    return frames;
}

function readTextFile(file) {
    var rawStr = "";
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function () {
        if (rawFile.readyState === 4) {
            if (rawFile.status === 200 || rawFile.status == 0) {
                rawStr = rawFile.responseText;
            }
        }
    }
    rawFile.send();
    return rawStr;
}

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
                case -90: x = accel.y; y = accel.y; break;
                case 180: x = -accel.x; y = accel.y; break;
            }

            let gamma = event.gamma || 57 * event.x || 2 * x;
            let beta = event.beta || 57 * event.y || 2 * y;

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

                if (deltaX > 5) { // right
                    intensity = (deltaX - 5) / 10;
                    direction = 4;
                } else if (deltaX < -5) {
                    intensity = (-deltaX - 5) / 10;
                    direction = 3;
                } // left

                if (Math.abs(deltaY) > Math.abs(deltaX)) {
                    if (deltaY > 5) { intensity = (deltaY - 5) / 10; direction = 2; } // down
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
        console.log(direction);
        if (direction) {
            this.dispatchEvent(new DirectionEvent(direction));
            if (this.preventDefault && e.preventDefault) e.preventDefault();
        }
    }

    disposeInternal() {
        super.disposeInternal();
        this.handler.disposeInternal();
        this.handler = null;

        if (!goog.userAgent.ASSUME_IE) {
            window.removeEventListener("deviceorientation", this.onMotion, true);
            window.removeEventListener("MozOrientation", this.onMotion, true);
            window.removeEventListener("devicemotion", this.onMotion, true);
        }
    }
}

var KeyToDirection = {
    37: 3, // ARROWLEFT
    38: 1, // ARROWUP
    39: 4, // ARROWRIGHT
    40: 2, // ARROWDOWN
    87: 1, // W
    83: 2, // S
    65: 3, // A
    68: 4 // D
};

class DirectionEvent extends goog.events.Event {
    constructor(direction) {
        super("input");
        this.direction = direction; // 1=up, 2=down, 3=left, 4=right
    }
}

function swapDirection(dir) {
    const map = { 1: 2, 2: 1, 3: 4, 4: 3 };
    return map[dir] || dir;
}

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

function getTime() {
    return new Date().getTime();
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
        this.intervalId = window.setInterval(goog.bind(this.update, this), 16); // ~60fps
        this.update();
    }

    // Stops the animation and finalizes all remaining steps
    stop() {
        if (this.intervalId) {
            let step;
            while ((step = this.steps[this.currentIndex++])) {
                if (step.update !== null) step.update(1);
            }
            window.clearInterval(this.intervalId);
            this.intervalId = 0;
        }
    }

    // Called every frame
    update = () => {
        const now = getTime();

        if (window.isAnimationPaused) return;

        let step;
        while ((step = this.steps[this.currentIndex])) {
            const elapsed = now - this.startTime;

            if (elapsed < step.duration) {
                step.update(elapsed / step.duration);
                return; // wait until next frame
            }

            if (step.update != undefined) step.update(1); // complete this step
            if (step.duration > 0) this.startTime += step.duration;

            this.currentIndex++;
        }

        this.stop(); // all done
    }

    // Add a step (duration in ms, update callback)
    addStep(callback, duration = 0) {
        this.steps.push({
            duration: duration,
            update: callback
        });
    }

    addPauseStep(duration) {
        this.addStep(function () { }, duration);
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
        this.visibilityChangeEvent = this.visibilityStateProp ? this.visibilityStateProp.replace(/state$/i, "change").toLowerCase() : null;

        // Listen to document visibility changes
        if (this.visibilityChangeEvent) {
            var listener = new goog.events.EventHandler(this);
            listener.listen(document, this.visibilityChangeEvent, goog.bind(this.onVisibilityChange, this));
        }

        // Start initial timer
        this.scheduleCheck();
    }

    disposeInternal() {
        window.clearTimeout(this.timer);
        super.disposeInternal();
    }

    // Called when timer interval passes
    checkVisibility = () => {
        this.timer = null;
        // True if enough time has passed
        this.isHidden = getTime() - this.startTime >= this.timeoutMs;
        this.updateCallbacks();
    }

    // Schedule next visibility check
    scheduleCheck() {
        if (this.timer) window.clearTimeout(this.timer);
        const remaining = Math.max(100, this.timeoutMs - (getTime() - this.startTime));
        this.timer = window.setTimeout(goog.bind(this.checkVisibility, this), remaining);
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

/**
 * Sets the position (left, top) of a DOM element.
 *
 * @param {HTMLElement} element
 * @param {K|number} x      // Either a K object with .x/.y or a number
 * @param {number} [y]      // Only used if x is a number
 */
function setPosition(element, x, y) {
    let posX, posY;

    var needsRoundingFix = goog.userAgent.ASSUME_GECKO && (goog.userAgent.ASSUME_MAC || goog.userAgent.ASSUME_LINUX) && goog.userAgent.isVersion("1.9");
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

function setOpacity(el, value) {
    const s = el.style;
    if ('opacity' in s) s.opacity = value;
    else if ('MozOpacity' in s) s.MozOpacity = value;
    else if ('filter' in s) s.filter = value === "" ? "" : `alpha(opacity=${value * 100})`;
}

class MediaSequence extends goog.Disposable {
    constructor() {
        super();

        this.items = [];            // pb
        this.index = 0;             // ua
        this.isLoaded = false;      // qb
        this.isPlaying = false;     // ia
    }

    disposeInternal() {
        this.items = [];
        this.index = 0;
        this.isLoaded = false;
        this.isPlaying = false;

        super.disposeInternal();
    }

    /**
     * Returns whether the item is currently playing.
     */
    isActive() {
        return this.isPlaying;
    }

    /**
     * Move to next item in sequence.
     */
    next(loop, onLoad, onEnd) {
        this.index++;
        if (this.index >= this.items.length) {
            this.index = loop ? 0 : this.items.length - 1;
        }
        this.load(loop, onLoad, onEnd);
    }
}

class AudioPlayer extends MediaSequence {
    /**
     * @param {string[]} audioPaths
     * @param {HTMLElement=} parent
     */
    constructor(audioPaths, parent) {
        super();

        this.items = audioPaths; // pb
        this.audioElement = null; // H
        this.parent = parent || document.body; // Dc
        this.autoplay = false; // Cc

        this.onLoadedCallback = null; // Lb
        this.onPlayCallback = null; // Wa
        this.lastLoadedIndex = this.index; // ud
    }

    disposeInternal() {
        this.pause();
        this.autoplay = false;
        this.onPlayCallback = this.onLoadedCallback = null;

        if (this.audioElement) this.parent.removeChild(this.audioElement);
        super.disposeInternal();
    }

    /**Triggered when audio is ready to play. (wd)*/
    handleCanPlay() {
        this.isLoaded = true;
        if (this.onLoadedCallback) this.onLoadedCallback();

        if (this.autoplay && !this.isPlaying) {
            this.play(this.onPlayCallback);
        }
    }

    /**Triggered when audio ends. (Ce)*/
    handleEnded() {
        this.isPlaying = false;
        if (this.onPlayCallback) this.onPlayCallback();
    }

    /**Load the current audio item.*/
    load(autoplay, onLoaded = null, onPlay = null) {
        this.autoplay = autoplay;
        this.onLoadedCallback = onLoaded;
        this.onPlayCallback = onPlay;

        // If we already loaded this track earlier
        if (this.audioElement && this.lastLoadedIndex === this.index) {
            if (this.isLoaded) {
                this.pause();
                this.audioElement.currentTime = 0;
                this.handleCanPlay();
            }
            return;
        }

        // Replace old audio element
        if (this.audioElement) {
            this.parent.removeChild(this.audioElement);
        }

        this.isLoaded = false;
        this.audioElement = document.createElement("audio");
        this.audioElement.setAttribute("controls", "false");
        this.audioElement.setAttribute("preload", "auto");
        this.audioElement.style.display = "none";

        // Events
        goog.events.listen(this.audioElement, "canplay", this.handleCanPlay, false, this);
        goog.events.listen(this.audioElement, "ended", this.handleEnded, false, this);

        // Build source list (.mp3, .ogg)
        const basePath = this.items[this.index];

        for (const info of AUDIO_FORMATS) {
            const source = document.createElement("source");
            source.setAttribute("src", basePath + info.extension);
            source.setAttribute("type", info.type);
            this.audioElement.appendChild(source);
        }

        this.parent.appendChild(this.audioElement);
        this.lastLoadedIndex = this.index;
    }

    play(onPlay = null) {
        if (this.isLoaded && !this.isPlaying) {
            this.onPlayCallback = onPlay;
            this.audioElement.play();
            this.isPlaying = true;
        }
    }

    pause() {
        if (this.isPlaying) {
            this.audioElement.pause();
            this.isPlaying = false;
        }
    }

    getCurrentTime() {
        return this.isPlaying ? this.audioElement.currentTime : 0;
    }
}

const AUDIO_FORMATS = [
    { extension: ".mp3", type: "audio/mpeg" },
    { extension: ".ogg", type: "audio/ogg" }
];

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
            var onLoad = goog.bind(() => {
                if (!this.loaded) {
                    this.loaded = true;
                    // Call all queued callbacks
                    for (const callback of this.callbacks) {
                        callback();
                    }
                }
            }, this);

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
    constructor(url) {
        this.imageUrl = url + ".png";
        this.frameUrl = url + ".xml";

        this.frames = parseSpriteSheetXML(readTextFile(`assets/${this.frameUrl}`));
        this.imageLoader = new ImageLoader(`./assets/${this.imageUrl}`);
        this.isReady = false;

        onImageLoaded(this.imageLoader, goog.bind(() => {
            this.isReady = true;
        }, this));
    }

    getWidth(index) {
        return this.frames[index].width;
    }

    getHeight(index) {
        return this.frames[index].height;
    }

    load(callback) {
        if (callback) onImageLoaded(this.imageLoader, callback);
        this.imageLoader.load();
    }

    createFrame(index) {
        const div = createDiv();
        const frame = this.frames[index];
        div.style.width = frame.width + "px";
        div.style.height = frame.height + "px";
        div.style.background = `url("./assets/${this.imageUrl}") -${frame.x}px -${frame.y}px no-repeat`;
        return div;
    }
}

function createDiv() {
    var div = document.createElement("div");
    div.style.position = "absolute";
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
                if (sprite.rotation === 180 || sprite.rotation === 0) sprite.pixelX--;
                else sprite.pixelY--;
            } else {
                sprite.pixelX--;
                sprite.pixelY--;
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
                    break;
            }

            if (tc[0].indexOf(sprite.frameId) !== -1 || tc[1].indexOf(sprite.frameId) !== -1) {
                if (sprite.rotation === 0) sprite.pixelX -= 1;
                else if (sprite.rotation === 180) sprite.pixelX += 1;

                if (sprite.rotation === 90) sprite.pixelY -= 1;
                else if (sprite.rotation === 270) sprite.pixelY += 1;
            }
        }

        Sprite.setPosition(sprite, sprite.pixelX, sprite.pixelY);
    }

    // Change z-isndex
    setZIndex(z) {
        this.element.style.zIndex = z;
    }

    // Change frame
    static setFrame(sprite, frameId) {
        if (sprite.element) {
            Sprite._updateSize(sprite, frameId);
            if (sprite.frameId !== frameId) {
                sprite.frameId = frameId;
                Sprite._updateBackground(sprite);
            }
        }
    }

    // Private: refresh background position for current frame
    static _updateBackground(sprite) {
        const frame = SpriteManager.frames[sprite._getFrameSource(sprite.frameId)];
        const pos = frame ? `-${frame.x}px -${frame.y}px` : undefined;
        sprite.element.style.backgroundPosition = pos;
        if (sprite.isLooping) Sprite.moveToGrid(sprite, sprite.gridX, sprite.gridY);
    }

    // Cleanup
    disposeInternal() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.element = null;
        super.disposeInternal();
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
            this.timeouts.push(setTimeout(goog.bind(() => {
                this.playFrameSequence(frames, delay, 0, repeatCount, looping);
            }, this), repeatDelay));
            return;
        }

        if (this.transition && this.transition.isPlaying()) {
            if (this.isTransitioning) return;
            this.transition.stop();
        }

        this.transition = new AnimationSequence();

        for (let i = 0; i < repeatCount; i++) {
            frames.forEach(frame => {
                this.transition.addStep(goog.bind(function () {
                    Sprite.setFrame(this, frame);
                }, this));
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
        sprite.height = h;
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

    if (target.animation) target.animation.stop();
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
    constructor(position, root) {
        super();
        this.digitPositions = []; // Nb
        this.currentScore = 0; // z
        this.digitSprites = []; // M
        for (let i = 0; i < 3; i++) {
            this.digitPositions[i] = position[i];
            this.digitSprites.push(createBackgroundTile(root, position[i].x, position[i].y));
        }
        this.backgroundSprite = createBackgroundTile(root, position[0].x, position[0].y); // A
        this.effectSprites = []; // P
        this.animation = null; // Ga
        this.pendingScoreDiffs = []; // Mb
        this.lastEffectTime = null; // Ob
        this.hasTwoDigitEffect = false; // pd

        for (let i = 0; i < 2; i++) {
            const p = createBackgroundTile(root, position[i + 4].x, position[i + 4].y);
            p.element.style.opacity = 0;
            p.show(true);
            this.effectSprites[i] = p;
        }
    }

    reset() {
        for (let key in this.digitSprites) Sprite.setFrame(this.digitSprites[key], td[0]);
        this.currentScore = 0;
        this.digitSprites[0].show(true);
        this.effectSprites[0].element.style.opacity = 0;
        this.effectSprites[1].element.style.opacity = 0;
        this.effectSprites[0].show(true);
        this.effectSprites[1].show(true);
        this.pendingScoreDiffs = [];
    }

    update(newScore) {
        if (newScore > 999 || newScore === this.currentScore) return;

        const diff = newScore - this.currentScore;
        this.currentScore = newScore;

        const digits = createDigitSprites(newScore);

        for (let i in digits) {
            const sprite = this.digitSprites[i];
            const frame = digits[i];
            const pos = this.digitPositions[i];

            if (frame != null) {
                sprite.show(true);
                if (sprite.getFrameId() !== frame) {
                    playSwapAnimation(this, pos, sprite, frame);
                }
            } else {
                sprite.show(false);
            }
        }

        // queue the numeric difference for the small pop effect
        this.pendingScoreDiffs.push(diff);
    }

    /**
     * Process any queued score-diff popup effects.
     * Call inside your frame/tick loop with a current timestamp (ms).
     *
     * @param {number} timeNow - ms timestamp (getTime()).
     */
    processPendingEffects(timeNow) {
        if (this.pendingScoreDiffs.length) {
            const diff = this.pendingScoreDiffs.shift();
            const effectFrames = createDigitSprites(diff, ud, 2);

            for (let i in effectFrames) {
                stopAllAnimations(this.effectSprites[i]);
                const frame = effectFrames[i];
                if (frame != null) {
                    Sprite.setFrame(this.effectSprites[i], frame);
                    Sprite.animateOpacity(this.effectSprites[i], 300, 0, 1);
                } else {
                    this.effectSprites[i].element.style.opacity = 0;
                }
            }

            this.lastEffectTime = timeNow;
            this.hasTwoDigitEffect = effectFrames[1] != null;
        }

        if (this.lastEffectTime && timeNow - this.lastEffectTime > 1000) {
            Sprite.fadeOut(this.effectSprites[0]);
            if (this.hasTwoDigitEffect) Sprite.fadeOut(this.effectSprites[1]);
            this.lastEffectTime = null;
        }
    }

    disposeInternal() {
        this.digitSprites.forEach(s => s.disposeInternal());
        super.disposeInternal();
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

/** @param {ScoreDisplay} obj */
function resetDisplay(obj) {
    Object.values(obj.digitSprites).forEach(child => child.show(false))

    // Stop active animation
    if (obj.animation) obj.animation.stop();

    // Hide main and side elements
    obj.backgroundSprite.show(false);
    obj.effectSprites[0].show(false);
    obj.effectSprites[1].show(false);
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
 * @param {ScoreDisplay} ctx - The context containing sprite `A` and its animation state.
 * @param {Point} startPos - Object with `{x, y}` representing the base position.
 * @param {Sprite} targetSprite - The sprite to animate towards.
 * @param {number} frameIndex - Frame index to display during animation.
 */
function playSwapAnimation(ctx, startPos, targetSprite, frameIndex) {
    const mainSprite = ctx.backgroundSprite;

    if (ctx.animation) ctx.animation.stop(); // Stop any ongoing animation
    ctx.animation = new AnimationSequence(); // Create a new animation sequence

    // Setup initial display state
    mainSprite.show(true);
    Sprite.setFrame(mainSprite, frameIndex);
    Sprite.setPosition(mainSprite, startPos.x, startPos.y - 25);

    // Define animation step
    ctx.animation.addStep(progress => {
        if (progress === 1) {
            // End of animation: show final sprite
            Sprite.setPosition(targetSprite, startPos.x, startPos.y);
            Sprite.setFrame(targetSprite, frameIndex);
            mainSprite.show(false);
        } else {
            // During animation: move sprites in opposite vertical directions
            Sprite.setPosition(mainSprite, startPos.x, startPos.y - 25 * (1 - progress));
            Sprite.setPosition(targetSprite, startPos.x, startPos.y + 25 * progress);
        }
    }, 400);

    // Play the sequence
    ctx.animation.play();
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
        Sprite.setFrame(this.digits[1], 49);
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
            Sprite.setFrame(this.digits[0], td[minutes]);
            Sprite.setFrame(this.digits[2], td[Math.floor(seconds / 10)]);
            Sprite.setFrame(this.digits[3], td[seconds % 10]);
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
    disposeInternal() {
        this.digits.forEach(digit => digit.disposeInternal());
        super.disposeInternal();
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
    disposeInternal() {
        this.children.forEach(child => child.disposeInternal());
        super.disposeInternal();
    }
}

// Clickable UI Element Class
class ClickableElement extends SpriteGroup {
    constructor(id, width, height, parent, zIndex) {
        super(id, width, height, parent, zIndex);

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
    disposeInternal() {
        this.eventHandler.disposeInternal();
        this.eventHandler = null;
        super.disposeInternal();
    }

    // Event Handlers
    handleClick() {
        this.dispatchEvent("click");
    }

    handleMouseDown() {
        this.dispatchEvent("mousedown");
    }

    handleMouseOver() {
        this.dispatchEvent("mouseover");
    }

    handleMouseOut() {
        this.dispatchEvent("mouseout");
    }
}

class SpritePool extends goog.Disposable {
    constructor() {
        super()
        this.pool = []
    }

    get() {
        return this.pool.length === 0 ? new Sprite(57) : this.pool.shift()
    }

    disposeInternal() {
        this.pool.forEach(function (spr) {
            spr.disposeInternal();
        });
        this.pool = null;
        super.disposeInternal();
    }
}
defineSingleton(SpritePool);

class GridEntity extends goog.Disposable { // T
    constructor(config) {
        super();

        // Grid configuration
        this.grid = config.grid;
        this.spritePool = SpritePool.getInstance();

        // --- Main sprite setup ---
        this.mainSprite = this.spritePool.get();
        Sprite.setFrame(this.mainSprite, this.grid[0]);
        this.mainSprite.setZIndex(17);
        this.mainSprite.show(false);

        // --- Shadow sprite setup ---
        this.shadowSprite = this.spritePool.get();
        Sprite.setFrame(this.shadowSprite, 57);
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
        this.score = config.score;
        this.data = config.data;

        // Sprite positions
        this.baseX = this.baseY = 40; // jd, cc
        this.mainX = this.mainY = 0; // hb, ib
        this.shadowX = this.shadowY = 0; // nc, qd

        // Motion parameters
        this.targetY = 1400;
        this.randomMove = false;
        this.direction = 1;

        // Behavior triggers
        this.behaviors = [
            new ConditionalTrigger(goog.bind(this.isEndingSoon, this), goog.bind(this.fadeOut, this), true),
            new ConditionalTrigger(goog.bind(this.hasData, this), goog.bind(this.cycleFrame, this), false, 400)
        ];
    }

    disposeInternal() {
        const pool = this.spritePool;
        [this.mainSprite, this.shadowSprite].forEach(sprite => {
            sprite.show(false);
            stopAllAnimations(sprite);
            sprite.Eb = false;
            pool.pool.push(sprite);
        });
        this.behaviors = null;
        super.disposeInternal();
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
        var worldX = 20 * (Math.floor(this.tileIndex % 23) + 0.5);
        var worldY = 20 * (Math.floor(this.tileIndex / 23) + 0.5);

        this.mainX = worldX - this.mainSprite.getWidth() / 2;
        this.mainY = worldY - this.mainSprite.getHeight() / 2;
        Sprite.setPosition(this.mainSprite, this.mainX, this.mainY);

        this.shadowX = worldX - this.shadowSprite.getWidth() / 2;
        this.shadowY = worldY + this.mainSprite.getHeight() / 2 - this.shadowSprite.getHeight() + this.tileOffset;
        Sprite.setPosition(this.shadowSprite, this.shadowX, this.shadowY);
    }

    getCellIndex() { return this.tileIndex; }
    getRow() { return Math.floor(this.tileIndex / 23); }
    getCol() { return this.tileIndex % 23; }
    getName() {
        return this.name;
    }

    cycleFrame() {
        let index = this.grid.indexOf(this.mainSprite.getFrame());
        index = (index + 1) % this.grid.length;
        Sprite.setFrame(this.mainSprite, this.grid[index]);
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

    const [low, mid, high] = [450, 900, 1350];

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
 * @param {GridEntity} obj - The target object containing sprite and transform data.
 * @param {number} deltaX - X offset.
 * @param {number} deltaY - Y offset.
 */
function applyMovement(obj, offX, offY) { // Gd
    if (obj.baseY === offY && obj.baseX === offX) return;
    if (offX > 15 || offY < -15) return;

    obj.baseX = offX;
    obj.baseY = offY;

    // Move sprite
    setPosition(obj.mainSprite, obj.mainX - offX, obj.mainY - offY);

    // Scale smoothly with vertical movement
    const scale = 1 - (1 - 0.7) * offY / 40;
    obj.shadowSprite.scale(scale, scale);
    if (offX) setPosition(obj.shadowSprite, obj.shadowX - offX, obj.shadowY);
}

function initMotion(a) {
    a.randomMove = true;
    a.targetY = a.enabled ? 2000 : 1400;
    a.direction = Math.random() < .5 ? 1 : -1;
}
function attachSpritesToContainer(entity, container) {
    container.appendChild(entity.mainSprite.getElement());
    container.appendChild(entity.shadowSprite.getElement());
}
function snapPos(entity, idx) {
    entity.tileIndex = idx;
    entity.renderPosition();
}

class AnimatedFallingEntity extends GridEntity {
    constructor(config) {
        super(config);
        this.mainSprite.playFrameSequence(Ld, 700, this.targetY);
        this.mainSprite.playFrameSequence(Md, 80, this.targetY + 700 * Ld.length);
        this.speed = -5;
    }

    onImpact() {
        this.mainSprite.playFrameSequence(Md, 400);
        setTimeout(goog.bind(() => {
            this.state = 2;
        }, this), 500);
    }
}

var Ld = [86, 84, 83, 80, 78, 76]
var Md = [74, 70, 68, 66]

class StaticVariantEntity extends GridEntity {
    constructor(config) {
        super(config);
        if (random(2)) Sprite.setFrame(this.mainSprite, this.grid[1]);
    }
}

class ShadowedEntity extends GridEntity {
    constructor(config) {
        super(config);
        Sprite.setFrame(this.shadowSprite, 11);
    }

    updatePosition() {
        const idx = this.tileIndex;
        const x = 20 * (Math.floor(idx % 23) + 0.5);
        const y = 20 * (Math.floor(idx / 23) + 0.5);

        this.baseX = x - this.sprite.getWidth() / 4;
        this.baseY = y - this.sprite.getHeight() / 4;
        Sprite.setPosition(this.mainSprite, this.baseX, this.baseY);
        Sprite.setPosition(this.shadowSprite, x - this.shadowSprite.getWidth() / 4, y + 5 - this.shadowSprite.getHeight());
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
        if (random(2)) Sprite.setFrame(this.mainSprite, this.grid[1]);
        initMotion(this);
    }
}

class LanternEntity extends GridEntity {
    constructor(config) {
        super(config);
        const variant = random(4);
        if (variant) Sprite.setFrame(this.mainSprite, this.grid[variant]);
        this.variantKey = "GOLE"[variant];
        initMotion(this);
    }
}

var sequence = [];
var forward = true;
var matchCount = 0;

class ObjectPoolManager {
    constructor() {
        this.objects = {};
        this.count = 0;
    }
}
defineSingleton(ObjectPoolManager);

// Item factory
function createItem(name) {
    if (!(name in ItemDefinitions) || !(name in ItemClasses))
        return new GridEntity(ItemDefinitions.coin);
    return new ItemClasses[name](ItemDefinitions[name]);
}

/**
 * Weighted random loot generator
 * @param {ObjectPoolManager} pool 
 * @returns 
 */
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
    target.objects = (typeId in ObjectRegistry) ? ObjectRegistry[typeId].data : ObjectRegistry[1].data;

    goog.object.forEach(target.objects, function (value) {
        this.count += value;
    }, target)
}

var LootTable = {
    firecraker: "firecraker",
    dumpling: "dumpling",
    steamer: "steamer",
    coin: "coin",
    ingot: "ingot",
    tea: "tea",
    medicine: "medicine",
    mushroom: "mushroom",
    papercut: "papercut",
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

var phase, ObjectRegistry = {};

class GridPatternManager {
    constructor() {
        this.cellMap = null;  // Map of cell -> usage counters (g)
        this.availableCells = null; // Set of free cells (wa)
        this.activeCells = null; // Set of active/special cells (Xa)

        this.patterns = {}; // Predefined shape patterns (Kc)
    }

    init() {
        this.cellMap = new goog.structs.Map();
        goog.array.forEach(getAllGridCells(), function (a) {
            this.cellMap.set(a, {
                usedCount: 0, // Gc
                specialCount: 0, // Ic
                totalCount: 0 // Jc
            })
        }, this)

        this.availableCells = new goog.structs.Set();
        this.availableCells.addAll(getAllGridCells(true));
        this.activeCells = new goog.structs.Set();
        goog.object.forEach(LetterShapes, function (a, b) {
            var c = new goog.structs.Set();
            goog.array.forEach(a, function (a) {
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
        var a = new goog.structs.Set();
        var b = getLowestActiveCellIndex(this);
        forEachItem(this.activeCells, function (c) {
            a.add(c - b);
        }, this);
        var c = "";
        goog.object.forEach(this.patterns, function (b, e) {
            b.equals(a) && (c = e);
        });
        return c;
    }
}
defineSingleton(GridPatternManager);

/**
 * Finds a 2x2 block of available cells in the grid.
 * @param {GridPatternManager} gridManager - Object containing availableCells (with values method)
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

/**
 * Selects a random available cell index from the grid.
 * 
 * @param {GridPatternManager} grid - The grid or cell manager.
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
 * @param {GridPatternManager} grid - The grid or cell manager.
 * @param {number} cellIndex - The target cell index.
 * @param {boolean} isActive - Whether the operation was active (true) or passive (false).
 */
function updateCellUsage(grid, cellIndex, isActive) {
    const cell = grid.cellMap.get(cellIndex);

    // Decrease reference counters
    cell.totalCount--;

    // If cell is now unused and not blocked, mark it as available
    if (cell.totalCount === 0 && blockedCells.indexOf(cellIndex) === -1) {
        grid.availableCells.add(cellIndex);
    }

    // Adjust active/passive counts
    if (isActive) {
        cell.specialCount--;
        if (cell.specialCount === 0) grid.activeCells.remove(cellIndex);
    } else {
        cell.usedCount--;
    }
}

/**
 * Returns a list of currently active cells that still have active links.
 * 
 * @param {GridPatternManager} grid - The grid or cell manager.
 * @returns {Array<number>} Active cell indices.
 */
function getActiveLinkedCells(grid) {
    const result = new goog.structs.Set();
    forEachItem(grid.activeCells, function (cellIndex) {
        if (grid.cellMap.get(cellIndex).usedCount > 0) result.add(cellIndex);
    }, grid);
    return result.getValues();
}

/**
 * Finds the smallest (earliest) active cell index.
 * 
 * @param {GridPatternManager} grid - The grid or cell manager.
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
 * @param {GridPatternManager} grid - The grid or cell manager.
 * @param {string|number} patternId - The ID of the pattern to use.
 * @returns {Array<number>} Array of valid target cell indices.
 */
function generatePatternedCellSequence(grid, patternId) {
    const startCell = selectRandomAvailableCell(grid);
    const result = [];

    goog.array.forEach(grid.patterns[patternId], function (offset) {
        let target = (offset + startCell) % 207;
        if (this.availableCells.contains(target)) {
            result.push(target);
        }
    }, grid);

    return result;
}

class TileSpawner extends goog.Disposable { // se
    constructor() {
        super();

        this.rootElement = null; // was: v
        this.itemMap = null; // was: Ra (Map)
        this.activeItems = null; // was: Ca (Set)
        this.lastSpawnTime = null; // was: Ec
        this.spawnScale = 1; // was: vc

        this.gridManager = GridPatternManager.getInstance();  // was: g
        this.objectPool = ObjectPoolManager.getInstance();    // was: bb
    }

    init(parentElement) {
        this.rootElement = parentElement;

        this.itemMap = new goog.structs.Map(); // stores all items by ID (Ra)
        this.activeItems = new goog.structs.Set(); // stores active items (Ca)

        this.lastSpawnTime = getTime();
        this.spawnRate = 1;

        this.spawnArea = new SpriteGroup(88, -3, -3, this.rootElement);
    }

    /** Original name: jb */
    update(deltaTime) {
        updateItems(this, deltaTime);

        const now = getTime();

        let missingItemCount = 8 - this.activeItems.getCount();
        if (now - this.lastSpawnTime > 2500 && missingItemCount > 0) {
            // number of items to spawn this tick
            for (let i = 0; i < random(missingItemCount) + 1; i++) {
                const item = generateRandomItem(this.objectPool);

                // special logic for "steamer"
                let spawnCell = -1;
                spawnCell = (item.getName() === "steamer") ? find2x2Block(this.gridManager) : selectRandomAvailableCell(this.gridManager);
                if (spawnCell !== -1) spawnItem(this, item, spawnCell);
            }

            this.lastSpawnTime = now;
        }
    }

    getItem(id) {
        return this.itemMap.get(id, null);
    }

    disposeInternal() {
        forEachItem(this.activeItems, item => {
            item.disposeInternal(); // dispose
        });

        this.activeItems.clear();
        this.itemMap.clear();
        this.spawnArea.disposeInternal();

        super.disposeInternal();
    }
}
defineSingleton(TileSpawner);

/**
 * Update items and remove inactive ones.
 * @param {TileSpawner} obj 
 * @param {number} currentTime 
 * @returns 
 */
function updateItems(obj, currentTime) {
    if (currentTime - obj.lastSpawnTime <= 40) return;

    // Update each item in Ca
    goog.array.forEach(obj.activeItems, function (item) {
        if (item.update !== undefined) item.update(currentTime);

        // Remove items that are not in states 0 or 1
        if (item.i !== 0 && item.i !== 1) {
            obj.activeItems.remove(item);
            item.disposeInternal();
        }
    }, obj);

    // Update Ra cells
    forEachItem(obj.itemMap, function (cell, key) {
        if (cell.Bc) {
            updateCellUsage(obj.gridManager, key);
            obj.itemMap.remove(key);
        }
    }, obj);

    obj.lastSpawnTime = currentTime;
}

// Generate items for a grid based on a pattern
function fillGridWithItems(obj, patternCount) {
    var sequence = generatePatternedCellSequence(obj.gridManager, patternCount);
    initializeObjectCounter(obj.objectPool, patternCount);

    sequence.forEach(function (cell) {
        const randomItem = generateRandomItem(this.objectPool);
        spawnItem(this, randomItem, cell);
    }, obj);

    initializeObjectCounter(obj.objectPool, phase);
}

/**
 * Spawns an item into the grid at specified positions.
 * 
 * @param {TileSpawner} tileSpawner - The TileSpawner instance managing the grid.
 * @param {Object} item - The item object to spawn.
 * @param {Point|Point[]} positions - Single position or array of positions to place the item.
 */
function spawnItem(tileSpawner, item, positions) {
    var addItemToGrid = (it, pos) => {
        tileSpawner.itemMap.set(pos, it);   // Map grid position → item
        tileSpawner.activeItems.add(it);        // Track active items
        tileSpawner.gridManager.markCell(pos);   // Mark cell as occupied
    };

    if (Array.isArray(positions)) {
        positions.forEach(pos => addItemToGrid.call(tileSpawner, item, pos));
        snapPos(item, positions[0]);
    } else {
        addItemToGrid.call(tileSpawner, item, positions);
        snapPos(item, positions);
    }

    attachSpritesToContainer(item, tileSpawner.rootElement);
    item.texture *= tileSpawner.spawnRate; // Apply spawn rate multiplier
}

var snakeStepIndex, snakeBodyVisible, introSteps = [ // was: ye
    { point: [3, 7], dir: 1 },
    { point: [2, 6], dir: 4 },
    { point: [4, 5], dir: 2 },
    { point: [5, 6], dir: 3 },
    { point: [3, 7], dir: 1 },
    { point: [2, 3], dir: 4 },
    { point: [4, 2], dir: 4 }
];

/** @param {SnakeController} snake */
function runIntroStep(snake) {
    const step = introSteps[snakeStepIndex];
    const point = step.point;

    if (snake.getRow() === point[1] && snake.getCol() === point[0]) {
        snake.enqueueDirection(step.dir);

        snakeStepIndex++;

        // If reached end of tutorial steps
        if (snakeStepIndex === introSteps.length) {
            snake.setSpeedParameters(getTime(), Infinity);
            snake.segments[0].playAnimation(Be, 80);
        }
    }

    // Move forward and update animation
    snake.forward();
    snake.updateVisualsAfterStep(); // was: Ce(a)

    // Gradually show more segments (max 15)
    if (snakeBodyVisible < 15) {
        for (let i = 0; i < 15; i++) {
            snake.segments[i].mainSprite.show(i <= snakeBodyVisible + 1);
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

function createSprite(spriteType, zIndex, parent) {
    const sprite = new Sprite(spriteType);
    sprite.show(false);
    sprite.setZIndex(zIndex);
    sprite.isLooping = true; // 'Eb = h' looks like a boolean property
    parent.appendChild(sprite.getElement()); // 'aa()' returns DOM element
    return sprite;
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

        /*** @type {SnakeSegment[]}*/
        this.segments = []; // segments array (head is segments[0]) (d)

        // visual "head" alternate sprite used when head matches next segment (A)
        this.headSprite = null;

        // queued direction inputs (ma)
        this.directionQueue = [];

        // current audio/visual frame (ba)
        this.currentFrame = Ee; // default frame constant from original

        this.container = containerElement;
        this.lastUpdateTime = getTime();

        // timing helpers & state
        this.lastMatchTime = null;       // qc
        this.lastCatchTime = null;       // oc
        this.moveProgress = 0;           // Z (0..1)
        this.moveDuration = ObjectRegistry[1].V; // Ab (base duration from registry)
        this.baseDuration = ObjectRegistry[1].V; // Fb (base)
        this.speedMultiplier = 1; // Gb
        this.stepPixel = 20; // used for pixel computations
        this.currentStepFrame = 0; // ed cached step frame
        this.patternManager = GridPatternManager.getInstance();
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
            const orientation = (i == 0) ? 0 : (i == 14 ? 2 : 1);
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
        goog.array.forEachRight(this.segments, seg => {
            if (seg.parent) {
                // if a link to previous exists, follow it
                seg.gridX = seg.parent.gridX;
                seg.gridY = seg.parent.gridY;
            } else if (seg.entityType === 0) {
                // default movement by orientation F
                seg.gridX += (seg.currentDirection === 3 ? -1 : seg.currentDirection === 4 ? 1 : 0);
                seg.gridY += (seg.currentDirection === 1 ? -1 : seg.currentDirection === 2 ? 1 : 0);
                seg.gridX = (seg.gridX + 23) % 23;
                seg.gridY = (seg.gridY + 9) % 9;
            }
        });

        // mark the newly occupied cell of head
        this.patternManager.markCell(this.segments[0].getCellIndex(), true);

        // update cell usage for the releasing cell (original 'oe')
        updateCellUsage(this.patternManager, releasingIndex, true);

        // pop a queued direction if present and apply to segments
        let queued = null;
        if (this.directionQueue.length) queued = this.directionQueue.shift();

        goog.array.forEachRight(this.segments, seg => {
            const d = queued;
            seg.baseDirection = seg.currentDirection; // store old facing
            // choose new current Direction based on segment type
            seg.currentDirection = (seg.entityType === 0) ? (d ? d : seg.currentDirection) : (seg.entityType === 2 ? seg.parent.parent.currentDirection : seg.parent.currentDirection);
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
                    this.segments[0].playAnimation(Ge, 80, 500);
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
                    sprite.getWidth(d + 1);
                    if (rot === 180) x -= 2;
                } else {
                    sprite.height(d + 1);
                    if (rot === 270) y -= 2;
                }

                Sprite.setPosition(sprite, x, y);
            };

            // If head and its follower face same direction, use special head sprite
            if (this.segments[0].currentDirection === this.segments[1].currentDirection) {
                const headAngle = this.segments[0].getSprite().getRotation();
                this.headSprite.show(true);
                const headPixelX = 20 * this.getCol();
                const headPixelY = 20 * this.getRow();
                placeSprite(headPixelX, headPixelY, headAngle, frame, this.headSprite, true);
                this.segments[0].move(this.moveProgress);
            } else {
                // hide alternate head and animate default head
                this.headSprite.show(false);
                animateSegmentTurn(this.segments[0], this.moveProgress);
            }

            // tail handling (depending on Ze checks)
            const lastIndex = this.segments.length - 1;
            if (isSpecialFrame(this.segments[lastIndex - 1])) {
                // special tail case: hide last sprite, animate previous
                this.segments[lastIndex].getSprite().show(false);
                animateSegmentTurn(this.segments[lastIndex - 1], this.moveProgress);
            } else {
                // normal tail interpolation
                this.segments[lastIndex].move(this.moveProgress);
                const prevSprite = this.segments[lastIndex - 1].getSprite();
                const px = 20 * this.segments[lastIndex - 1].getRow();
                const py = 20 * this.segments[lastIndex - 1].getRow();
                placeSprite(px, py, prevSprite.getRotation(), frame, prevSprite, false);
            }

            this.currentStepFrame = frame;
        }
    }

    /**
     * handleCatchAndItems - equivalent to original We
     * Checks active linked cells and emits catch events, or triggers head animation if none.
     * @param {number} now 
     */
    handleCatchAndItems(now) {
        const activeLinked = getActiveLinkedCells(this.patternManager);
        if (activeLinked.length) {
            goog.array.forEach(activeLinked, idx => {
                // if head occupies same cell, trigger short animation
                if (this.segments[0].getCellIndex() === idx) {
                    this.segments[0].playAnimation(Ie, 80);
                }
                // dispatch catch event (custom $e)
                this.dispatchEvent(new CatchItemEvent(idx, now));
            }, this);

            this.lastCatchTime = now;
        } else {
            // if no active linked cells for >5s, nudge head (original He)
            if ((now - (this.lastCatchTime || 0)) > 5000) {
                this.lastCatchTime = now;
                this.segments[0].playAnimation(He, 80);
            }
        }
    }

    /**
     * resetSpeed — equivalent to original Ue
     * Resets to default phase, speed and timing.
     */
    resetSpeed(now) {
        this.currentFrame = Ee; // reset frame
        this.segments[0].playAnimation(Ne, 80, 100);
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
    enqueueDirection(directionInput) {
        // original called xb(b) in some cases; allow mapping if required
        if (this.Hb != null) directionInput = swapDirection(directionInput);

        if (this.directionQueue.length < 2) {
            var currentFacing = this.segments[0].currentDirection;
            if (this.directionQueue.length) currentFacing = this.directionQueue[this.directionQueue.length - 1];

            // only allow orthogonal turns (1/2 vs 3/4 cross)
            if (((currentFacing === 1 || currentFacing === 2) && (directionInput === 3 || directionInput === 4)) || ((directionInput === 1 || directionInput === 2) && (currentFacing === 3 || currentFacing === 4))) {
                this.directionQueue.push(directionInput);
                // choose a quick animation depending on transform map result
                const transform = DirectionManager.getInstance().transformMap.get([currentFacing, directionInput]);
                this.segments[0].playAnimation((transform === 3) ? Le : Me, 80);
            }
        }
    }

    /**
     * updateVisualsAfterStep — equivalent to original Ce
     * Reassigns sprite frames down the chain and ensures correct z-index and visuals.
     */
    updateVisualsAfterStep() {
        var lastIndex = this.segments.length - 1;

        // ensure last segment element visible
        this.segments[lastIndex].getSprite().show(true);

        // Save the sprite from the segment right before the tail
        var savedSprite = this.segments[lastIndex - 1].getSprite()

        // cascade frame references from head to tail (preserving ordering)
        for (var i = lastIndex - 1; i > 1; i--) {
            this.segments[i].mainSprite = this.segments[i - 1].mainSprite;
            this.segments[i].mainSprite.setZIndex(16 - i);
        }

        // second element uses previous sprite instance
        this.segments[1].mainSprite = savedSprite;
        this.segments[1].mainSprite.setZIndex(15);

        // refresh visuals for head, second, tail
        updateSegmentSprite(this.segments[0], this.currentFrame);
        updateSegmentSprite(this.segments[1]);
        updateSegmentSprite(this.segments[lastIndex]);
    }

    /**
     * setSpeedParameters — equivalent to original Ae
     * For debugging, sets IB (some timer), speed multiplier Gb and derived duration Ab.
     */
    setSpeedParameters(secs, speed) {
        this.lastCatchTime = secs;
        this.speedMultiplier = speed;
        this.moveDuration = this.baseDuration * this.speedMultiplier;
        console.log(`duration: ${this.moveDuration} | speed: ${this.speedMultiplier}`);
    }

    // shorthand helpers to expose head coordinates like Sa / Ta
    getX() {
        return this.segments[0].getX();
    }
    getY() {
        return this.segments[0].getY();
    }

    // cleanup
    disposeInternal() {
        goog.array.forEach(this.segments, seg => seg.disposeInternal());
        this.directionQueue = null;
        this.headSprite.disposeInternal();
        super.disposeInternal();
    }

    // convenience getters used in original code
    getRow() {
        return this.getY();
    }
    getCol() {
        return this.getX();
    }
}

class CatchItemEvent extends goog.events.Event {
    constructor(a, b) {
        super("catch item");
        this.item = a;
        this.time = b;
    }
}
class MatchPatternEvent extends goog.events.Event {
    constructor(a, b) {
        super("match pattern");
        this.pattern = a;
        this.time = b;
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
     * @param {number} x - X position on grid.
     * @param {number} y - Y position on grid.
     * @param {number} index - Segment index (used for frame offset).
     * @param {SnakeSegment|null} parentSegment - Previous segment in chain.
     * @param {HTMLElement} container - The sprite layer/container.
     */
    constructor(direction, type, x, y, index, parentSegment, container) {
        super();

        // Movement and direction
        this.baseDirection = this.currentDirection = direction; // current + previous direction (oa, F)
        this.entityType = type;                                 // 0=head, 1=body, 2=tail (W)
        this.gridX = x;                                     // grid X (k)
        this.gridY = y;                                     // grid Y (o)
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
     * @param {number} step - 0 to 1 progress within the current move step.
     */
    move(step) {
        let nextX = this.gridX + (this.baseDirection === 3 ? -1 : this.baseDirection === 4 ? 1 : 0) * step;
        let nextY = this.gridY + (this.baseDirection === 1 ? -1 : this.baseDirection === 2 ? 1 : 0) * step;

        // Handle wrap-around on grid edges
        if ((nextX > 22 || nextX < 0 || nextY > 8 || nextY < 0) && this.shadowSprite) {
            const wrappedX = nextX > 22 ? nextX - 23 : nextX < 0 ? nextX + 23 : nextX;
            const wrappedY = nextY > 8 ? nextY - 9 : nextY < 0 ? nextY + 9 : nextY;

            const rotation = this.mainSprite.getRotation();
            if (rotation === 180) this.shadowSprite.flip();
            else this.shadowSprite.rotate(rotation);

            Sprite.moveToGrid(this.shadowSprite, wrappedX, wrappedY);
            this.shadowSprite.show(true);
        }

        Sprite.moveToGrid(this.mainSprite, nextX, nextY);
    }

    /**
     * Play an animation on the segment.
     */
    playAnimation(frame, delay, repeatdelay, count, loop) { // K
        if (isSpecialFrame(this) && frame !== Ke) return;

        delay = Math.min(delay, 500);
        this.mainSprite.playFrameSequence(frame, delay, repeatdelay, count, loop);
        if (this.shadowSprite) this.shadowSprite.playFrameSequence(frame, delay, repeatdelay, count, loop);
    }

    /**
     * Cleanup sprite resources.
     */
    disposeInternal() { // h
        this.mainSprite.disposeInternal();
        if (this.shadowSprite) this.shadowSprite.disposeInternal();
        super.disposeInternal();
    }

    /** @returns {Sprite} The main sprite object. (qa) */
    getSprite() {
        return this.mainSprite;
    }

    /** @returns {number} Grid X coordinate. (Sa) */
    getX() { return this.gridX; }

    /** @returns {number} Grid Y coordinate. (Ta) */
    getY() { return this.gridY; }

    /** @returns {number} Flattened cell index (Y * 23 + X). (Jb) */
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
 * @param {SnakeSegment} segment
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
        Sprite.setFrame(segment.mainSprite, frameSet);
        if (segment.shadowSprite) Sprite.setFrame(segment.shadowSprite, frameSet);
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

    if (segment.entityType === 0) {
        const mapType = directionMgr.alternateTransform.get([segment.baseDirection, segment.currentDirection]);
        frameSet = mapType === 3 ? Oe : Pe;
    } else {
        const mapType = directionMgr.transformMap.get([segment.baseDirection, segment.currentDirection]);
        frameSet = mapType === 3 ? Qe : Re;
        segment.mainSprite.rotate(directionMgr.getBaseAngle(segment.baseDirection));
    }

    stopAllAnimations(segment.mainSprite);
    Sprite.setFrame(segment.mainSprite, frameSet[frameIndex]);
}

/**
 * DirectionManager handles rotation and direction mapping between entities.
 * It defines angle relationships and direction transforms.
 */
class DirectionManager {
    constructor() {
        // Rotation angles between directional pairs [from, to]
        this.rotationMap = new goog.structs.Map(); //ga
        this.rotationMap.set([1, 3], 180);
        this.rotationMap.set([1, 4], 90);
        this.rotationMap.set([2, 3], 270);
        this.rotationMap.set([2, 4], 0);
        this.rotationMap.set([3, 1], 0);
        this.rotationMap.set([3, 2], 90);
        this.rotationMap.set([4, 1], 270);
        this.rotationMap.set([4, 2], 180);

        // Base facing direction angles
        this.baseDirection = new goog.structs.Map(); //g
        this.baseDirection.set(1, 270);
        this.baseDirection.set(2, 90);
        this.baseDirection.set(3, 180);
        this.baseDirection.set(4, 0);

        // Directional transformation table
        this.transformMap = new goog.structs.Map(); //$
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

    /**
     * @param {HTMLElement} rootElement 
     */
    constructor(rootElement) {
        super();
        this.root = rootElement;

        this.gridContainer = createDiv(); // fa
        addClass(this.gridContainer, "grids");
        this.root.appendChild(this.gridContainer);
        setPosition(this.gridContainer, START_POS.x, START_POS.y);

        this.state = "unstarted"; // i
        this.startTime = getTime(); // Vd
        this.remainingTime = minutes; // ea

        this.score = 0; // score (z)
        this.comboData = {}; // $b
        this.medalGroup = null;
        this.resultUI = null;
        this.scoreDigits = [];

        this.TileSpawner = TileSpawner.getInstance(); // ka
        this.TileSpawner.init(this.gridContainer);
        this.snake = new SnakeController(this.gridContainer); // N

        this.input = new InputController(true); // Zc
        this.eventHandler = new goog.events.EventHandler(this); // B
        this.objectPool = ObjectPoolManager.getInstance(); // bb

        this.playButton = new ClickableElement(12, START_BUTTON_POS.x, START_BUTTON_POS.y, this.root, 101); // ca
        this.playButton.show(false);

        this.soundButton = new ClickableElement(90, SOUND_BUTTON_POS.x, SOUND_BUTTON_POS.y, this.root, 100); // La
        this.soundButton.show(false);

        this.muted = false; // Ka
        this.music = new AudioPlayer(["./assets/snake"]); // la

        this.mainSprite = new SpriteGroup(31, MAIN_SPR_POS.x, MAIN_SPR_POS.y, this.root, 100); // cb
        this.mainSprite.show(false);

        this.tutorialRoot = null;
        this.tutorialButtons = [];

        this.introSeq = null; // this.ec
        this.tutSeq = null; // this.fc
        this.uiSeq = null; // this.dc

        this.visibilityTimer = new VisibilityTimer(3E4, goog.bind(this.onVisibilityLost, this), goog.bind(this.onVisibilityReturn, this));
        window.isAnimationPaused = false;

        new SpriteGroup(19, BG_LEFT_POS.x, BG_LEFT_POS.y, this.root, 100);
        this.leftFrame = new SpriteGroup(36, FRAME_LEFT_POS.x + 99, FRAME_LEFT_POS.y, this.root, -1); // Cb
        this.rightFrame = new SpriteGroup(53, FRAME_RIGHT_POS.x - 99, FRAME_RIGHT_POS.y, this.root, -1); // Db
        this.leftFrame.show(false);
        this.rightFrame.show(false);

        this.timerDisplay = new TimerDisplay(TIMER_POS.x, TIMER_POS.y, this.root); // za
        this.timerDisplay.show(false);

        this.scoreDisplay = new ScoreDisplay(SCORE_DIGIT_POS, this.root); // ya

        this.icons = [];
        SIDE_ICON_POS.forEach(icon => function () {
            const sprite = new Sprite(33);
            sprite.show(false);
            Sprite.setPosition(sprite, icon.x, icon.y);
            this.root.appendChild(sprite.getElement());
            this.icons.push(sprite);
        });

        this.eventHandler.listen(this.input, "input", this.handleInput);
        this.eventHandler.listen(this.snake, "catch item", this.handleItemCollected);
        this.eventHandler.listen(this.snake, "match pattern", this.handlePatternMatch);
        this.eventHandler.listen(this.soundButton, "click", this.toggleMute);

        this.isStandalone = !!(rootElement && rootElement.standalone);

        this.snake.init();
        this.initialize();
    }

    initialize() {
        this.lastUpdateTime = getTime();
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    playIntroUISequence = () => {
        this.music.load(false);
        this.visibilityTimer.resetTimer();

        let seq = new AnimationSequence();
        this.introSeq = seq;

        seq.addStep(() => Sprite.fadeOut(this.mainSprite));
        seq.addStep((t) => {
            Sprite.setPosition(this.playButton, START_BUTTON_POS.x, START_BUTTON_POS.y + 80 * t * t);
            setOpacity(this.playButton.getElement(), 1 - t * t);
        }, 700);
        seq.addPauseStep(200);

        seq.addStep(() => {
            this.mainSprite.show(false);
            this.playButton.show(false);
            setOpacity(this.gridContainer, 1);
        });

        seq.addStep(() => {
            this.leftFrame.show(true);
            this.rightFrame.show(true);
        });

        seq.addStep((t) => {
            Sprite.setPosition(this.leftFrame, FRAME_LEFT_POS.x + 99 * (1 - t), FRAME_LEFT_POS.y);
            Sprite.setPosition(this.rightFrame, FRAME_RIGHT_POS.x - 99 * (1 - t), FRAME_RIGHT_POS.y);
        }, 1000);

        seq.addStep(() => {
            Sprite.animateOpacity(this.soundButton, 500, 0, 1);
            this.soundButton.show(true);
        });

        seq.addStep(() => {
            initTutorial(this);
        });

        seq.play();
    }

    onVisibilityLost() {
        if ("running" == this.state) {
            this.music.pause();

            var snake = this.snake;
            snake.currentFrame = Yc;
            Sprite.setFrame(snake.segments[0].getSprite(), snake.currentFrame);
            initTutorial(this);
        }
    }
    onVisibilityReturn() {
        if ("tutorial_start" == this.state || "tutorial_end" == this.state) {
            this.music.play();

            var snake = this.snake;
            snake.currentFrame = Ee;
            Sprite.setFrame(snake.segments[0].getSprite(), snake.currentFrame);
            this.state = "running";
            hideTutorialUI(this);
            if (this.remainingTime == minutes) ResetGame(this);
        }
    }

    flashStartButton() {
        if ("init" == this.state) {
            this.playButton.playFrameSequence(playFrameAnim, 80);
            setTimeout(goog.bind(this.flashStartButton, this), 3E3);
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
                    snake.segments[0].playAnimation(Ge, 80, 500);
                    snake.setSpeedParameters(evt.time, 0.1)
                    snake.frameId = Vc;
                    break;

                case "lantern":
                    // Lantern combo logic (unchanged)
                    let comboStr = processLanternCombo(itemData);
                    if (comboStr) {
                        let spawner = this.TileSpawner;
                        for (let i = 0; i < comboStr.length; i++)
                            spawnItem(spawner, createItem("steamer"), find2x2Block(spawner.gridManager));

                        if (comboStr.length === 6) fillGridWithItems(spawner, comboStr[random(comboStr.length)]);
                    }
                    updateIcons(this);
                    break;
            }

            itemData.destroy();
            this.scoreDisplay.update(this.score);
        } else {
            itemData.shadowSprite.show(false);
            itemData.mainSprite.setZIndex(1);
        }
    }

    handlePatternMatch(evt) {
        const pattern = evt.pattern;
        if (pattern !== "") fillGridWithItems(this.TileSpawner, pattern);
    }

    handleInput(input) {
        this.visibilityTimer.resetTimer();
        if ("tutorial_end" == this.state) {
            hideTutorialUI(this);
            ResetGame(this);
        } else if ("running" == this.state) {
            this.snake.enqueueDirection(input.direction);
        }
    }

    handleClick() {
        this.visibilityTimer.resetTimer();
        if ("tutorial_end" == this.state) {
            hideTutorialUI(this);
            ResetGame(this);
        }
    }

    playTutorialSequence() {
        if ("tutorial_start" == this.state || "tutorial_end" == this.state) {
            var seq = new AnimationSequence();
            this.tutSeq = seq;
            for (var key in TUTORIAL_BUTTON_FRAMES) {
                seq.addStep(createFrameAnimation(this.tutorialButtons[key], TUTORIAL_BUTTON_FRAMES[key], TUTORIAL_BUTTON_POS[key], 29));
                seq.addPauseStep(300);
            }
            seq.addStep(goog.bind(function () {
                if ("tutorial_start" == this.state) this.state = "tutorial_end";
            }, this));
            seq.play();
            setTimeout(this.playTutorialSequence, 3E3);
        }
    }
    toggleMute() {
        this.visibilityTimer.resetTimer();
        this.muted = !this.muted;
        Sprite.setFrame(this.soundButton, this.muted ? 89 : 90);
        this.music.audioElement.muted = this.muted;
    }

    showGameplayUI() {
        setOpacity(this.gridContainer, 1);
        this.resultUI.show(false);
        ResetGame(this);
    }

    gameLoop() {
        var currentTime = getTime();
        let deltaTime = Math.min(50, currentTime - this.lastUpdateTime);

        switch (this.state) {
            case "running":
                this.update(deltaTime, currentTime);
                break;
            case "unstarted":
                if (currentTime - this.startTime > 1500) {
                    this.state = "init";
                    playIntroSequence(this);
                }
                break;
        }

        requestAnimationFrame(goog.bind(this.gameLoop, this));
        this.lastUpdateTime = currentTime;
    }

    /**
     * Updates the current game state per frame.
     * 
     * @param {GameController} game - The main game controller.
     * @param {number} deltaTime - Time passed since last frame.
     * @param {number} currentTime - Current game time.
     */
    update(deltaTime, currentTime) {
        // Update managers
        this.TileSpawner.update(currentTime);
        this.snake.move(currentTime);
        this.scoreDisplay.processPendingEffects(currentTime);
        this.timerDisplay.update(Math.floor(this.remainingTime / 1000));

        // Countdown timer
        this.remainingTime -= deltaTime;

        // Check for phase transitions
        if (phase === 1 && this.remainingTime < 40000) {
            switchGamePhase(this, 2);
        } else if (phase === 2 && this.remainingTime < 20000) {
            switchGamePhase(this, 3);
        }

        // Time over condition
        if (this.remainingTime < 0 && this.state === "running") {
            this.state = "stop";
            stopGame(this);

            this.timerDisplay.show(false);
            resetDisplay(this.scoreDisplay);

            goog.array.forEach(this.icons, sprite => sprite.show(false));
            this.music.load(false);
        }
    }

    disposeInternal() {
        this.state = "stop";
        this.eventHandler.disposeInternal();
        if (this.introSeq) this.introSeq.stop();
        if (this.tutSeq) this.tutSeq.stop();
        if (this.uiSeq) this.uiSeq.stop();
        window.isAnimationPaused = true;
        this.comboData = null;
        this.timerDisplay.disposeInternal();
        this.scoreDisplay.disposeInternal();
        this.TileSpawner.disposeInternal();
        this.snake.disposeInternal();
        this.input.disposeInternal();
        this.soundButton.disposeInternal();
        this.visibilityTimer.disposeInternal();
        super.disposeInternal();
    }
}

const START_BUTTON_POS = new Point(309, 79);
const SOUND_BUTTON_POS = new Point(625, 125);
const MAIN_SPR_POS = new Point(256, 46);
const RESULT_POS = new Point(164, 36);
const REPLAY_POS = new Point(425, 110);
const MEDAL_POS = new Point(212, 80);
const RESULT_FRAMES = [91, 92, 93];
const SCORE_POS = [new Point(415, 82), new Point(397, 82), new Point(379, 82)]; // yf
const BG_LEFT_POS = new Point(96, 6); // mf
const START_POS = new Point(110, 20); // jf
const FRAME_LEFT_POS = new Point(4, 46); // nf
const FRAME_RIGHT_POS = new Point(577, 46); // of
const TIMER_POS = new Point(43, 103); // pf
const SCORE_DIGIT_POS = [new Point(640, 103), new Point(629, 103), new Point(618, 103), new Point(607, 103), new Point(596, 103), new Point(585, 103)];
const SIDE_ICON_POS = [new Point(6, 127), new Point(6, 143), new Point(22, 143), new Point(5, 159), new Point(22, 159), new Point(38, 159)]; //rf
const TUTORIAL_ROOT_POS = new Point(294, 44);
const TUTORIAL_BUTTON_POS = [new Point(387, 81), new Point(387, 115), new Point(353, 115), new Point(420, 115)];
const TUTORIAL_BUTTON_FRAMES = [
    [98, 102, 106, 102, 98],
    [95, 99, 103, 99, 95],
    [96, 100, 104, 100, 96],
    [97, 101, 105, 101, 97]
];
const playFrameAnim = [12, 13, 14, 15, 16, 17, 18];
const HOVER_FRAMES = [51, 50];
const OUT_FRAMES = [51, 52];

/**
 * Switches the game to a new phase/level.
 * 
 * @param {GameController} game - The game instance.
 * @param {number} phaseId - The new phase index.
 */
function switchGamePhase(game, phaseId) {
    phase = phaseId;

    // Reset object counters for this phase
    initializeObjectCounter(ObjectPoolManager.getInstance(), phaseId);

    // Update entity parameters from registry
    const entity = game.snake;
    entity.baseDuration = ObjectRegistry[phaseId].V;
    entity.moveDuration = entity.baseDuration * entity.speedMultiplier;
    game.TileSpawner.spawnScale = ObjectRegistry[phaseId].U;
}

/**
 * Plays the game's intro animation sequence.
 * @param {GameController} game - The game controller.
 */
function playIntroSequence(game) {
    var seq = new AnimationSequence();
    game.uiSeq = seq;

    // Animate entity 38 times with short pauses
    for (let i = 1; i < 39; i++) {
        seq.addStep(goog.bind(runIntroStep, game, game.snake));
        seq.addPauseStep(150);
    }

    // Fade in secondary sprite
    seq.addPauseStep(200);
    seq.addStep(function () {
        game.mainSprite.show(true);
        Sprite.animateOpacity(game.mainSprite, 400, 0, 1);
    });

    seq.addPauseStep(600);
    seq.addStep(function () {
        Sprite.setPosition(game.playButton, START_BUTTON_POS.x, START_BUTTON_POS.y - 80);
        game.playButton.show(true);
    });

    // Bounce animation 1
    seq.addStep(function (t) {
        Sprite.setPosition(game.playButton, START_BUTTON_POS.x, START_BUTTON_POS.y - 80 * (1 - t * t));
    }, 700);

    // Bounce animation 2
    seq.addStep(function (t) {
        Sprite.setPosition(game.playButton, START_BUTTON_POS.x, START_BUTTON_POS.y - 80 * (.25 - (.5 - t) * (.5 - t)));
    }, 700);

    // Run "ready" callback
    seq.addStep(function () {
        game.flashStartButton();
    });

    // Add click handler
    seq.addStep(goog.bind(function () {
        this.eventHandler.listenOnce(this.playButton, "mousedown", this.playIntroUISequence)
    }, game));
    seq.play();
}

/**
 * @param {Sprite} sprite 
 * @param {number[]|number} frames 
 * @param {Point[]|Point} position 
 * @param {number} offsetY 
 */
function createFrameAnimation(sprite, frames, position, offsetY) {
    return function () {
        const anim = new AnimationSequence();
        frames.forEach(frame => {
            anim.addStep(() => {
                Sprite.setFrame(sprite, frame);
                Sprite.setPosition(sprite, position.x, position.y + offsetY - sprite.getHeight());
            });
            anim.addPauseStep(80);
        });
        anim.play();
    };
}

/** @param {GameController} game */
function ResetGame(game) {
    game.snake.resetSpeed(getTime());
    game.state = "running";
    game.remainingTime = minutes;
    switchGamePhase(game, 1);

    game.timerDisplay.update(Math.floor(game.remainingTime / 1E3));
    game.timerDisplay.show(true);

    game.score = 0;
    game.scoreDisplay.update(game.score);
    game.scoreDisplay.reset();
    resetComboData(game);

    sequence = [];
    forward = true;

    game.icons.forEach(function (icon) {
        icon.show(false)
    });
    game.soundButton.show(true);
    game.music.play();
    game.music.audioElement.muted = game.muted;
};

/**
 * Resets combo counters for all item definitions.
 * @param {GameController} game
 */
function resetComboData(game) {
    goog.object.getKeys(ItemDefinitions).forEach(function (key) {
        this.comboData[key] = 0
    }, game);
};

/**
 * Updates the icon sprites to match the current sequence.
 * @param {GameController} game
 */
function updateIcons(game) {
    game.icons.forEach(function (icon, index) {
        if (index < sequence.length) {
            Sprite.setFrame(icon, sd[sequence[index]]);
            icon.show(true);
        } else icon.show(false);
    })
}

/** @param {GameController} game */
function stopGame(game) {
    var digits = createDigitSprites(game.score, vd);
    if (game.resultUI) {
        setOpacity(game.gridContainer, .3);
        Sprite.setFrame(game.medalGroup, RESULT_FRAMES[(80 > game.score ? 1 : 150 > game.score ? 2 : 3) - 1]);
        game.resultUI.show(true);
        for (var i in digits) {
            if (digits[i] != null) {
                game.scoreDigits[i].show(true);
                Sprite.setFrame(game.scoreDigits[i], digits[i]);
            } else game.scoreDigits[i].show(false);
        }
    } else {
        game.resultUI = new SpriteGroup(61, RESULT_POS.x, RESULT_POS.y, game.root, 100);
        if (!game.isStandalone) {
            var replayButton = new ClickableElement(52, REPLAY_POS.x, REPLAY_POS.y, game.root, 101);
            game.eventHandler.listen(replayButton, "click", game.showGameplayUI);
            game.eventHandler.listen(replayButton, "mouseover", createFrameAnimation(replayButton, HOVER_FRAMES, REPLAY_POS, 28));
            game.eventHandler.listen(replayButton, "mouseout", createFrameAnimation(replayButton, OUT_FRAMES, REPLAY_POS, 28));
            game.resultUI.add(replayButton);
        }

        game.medalGroup = new SpriteGroup(RESULT_FRAMES[(80 > game.score ? 1 : 150 > game.score ? 2 : 3) - 1], MEDAL_POS.x, MEDAL_POS.y, game.root, 101);
        game.resultUI.add(game.medalGroup);
        for (let i in createDigitSprites(game.score, vd)) {
            const frame = digits[i];
            game.scoreDigits[i] = new SpriteGroup(frame == null ? td[0] : frame, SCORE_POS[i].x, SCORE_POS[i].y, game.root, 101);
            if (frame == null) {
                game.scoreDigits[i].show(false);
                game.resultUI.add(game.scoreDigits[i]);
            }
        }
        setOpacity(game.gridContainer, .3)
    }
};

/** @param {GameController} game */
function initTutorial(game) {
    game.tutorialRoot = new ClickableElement(94, TUTORIAL_ROOT_POS.x, TUTORIAL_ROOT_POS.y, game.root, 100);
    for (var key in TUTORIAL_BUTTON_FRAMES) {
        game.tutorialButtons[key] = new ClickableElement(TUTORIAL_BUTTON_FRAMES[key][0], TUTORIAL_BUTTON_POS[key].x, TUTORIAL_BUTTON_POS[key].y, game.root, 101);
        game.eventHandler.listen(game.tutorialButtons[key], "click", game.handleClick);
        game.tutorialRoot.add(game.tutorialButtons[key]);
    }
    game.state = "tutorial_start";
    game.eventHandler.listen(game.tutorialRoot, "click", game.handleClick);
    game.playTutorialSequence()
};

/** @param {GameController} game */
function hideTutorialUI(game) {
    Sprite.fadeOut(game.tutorialRoot);
    goog.array.forEach(game.tutorialButtons, function (a) {
        Sprite.fadeOut(a)
    });
    game.tutorialRoot.show(false)
};

var Logo = null;
var gameController = null;

/**
 * Initialization logic for the doodle
 */
function init() {
    if (Logo = document.getElementById("hplogo")) {
        // Sprite / resource loader for the doodle
        SpriteManager = new SpriteSheet("spritesheet");
        SpriteManager.load();

        // Build a configuration set (rc) with many keys enabled
        var enabledSet = new goog.structs.Map();
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
        var otherSet = new goog.structs.Map();
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
        configObj[keyEnum.tea] = 20;
        configObj[keyEnum.envelope] = 20;
        configObj[keyEnum.medicine] = 10;
        configObj[keyEnum.coin] = 40;
        configObj[keyEnum.ingot] = 20;
        ObjectRegistry[1] = { data: configObj, V: 200, U: 1 };

        configObj = {};
        configObj[keyEnum.firecraker] = 10;
        configObj[keyEnum.medicine] = 10;
        configObj[keyEnum.tea] = 10;
        configObj[keyEnum.papercut] = 10;
        configObj[keyEnum.lantern] = 50;
        ObjectRegistry[2] = { data: configObj, V: 180, U: 0.85 };

        configObj = {};
        configObj[keyEnum.papercut] = 30;
        configObj[keyEnum.medicine] = 20;
        configObj[keyEnum.mushroom] = 20;
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
        configObj[keyEnum.ingot] = 30;
        ObjectRegistry.G1 = { data: configObj, V: 200, U: 1 };
        ObjectRegistry.E = { data: configObj, V: 200, U: 1 };
        ObjectRegistry.L = { data: configObj, V: 200, U: 1 };

        configObj = {};
        configObj[keyEnum.coin] = 50;
        configObj[keyEnum.ingot] = 50;
        ObjectRegistry.G = { data: configObj, V: 200, U: 1 };

        // Some global flags / counters
        phase = 1;
        snakeBodyVisible = snakeStepIndex = 0;

        GridPatternManager.getInstance().init();

        // Build reverse mapping Xd from keys in Zd to some default T, then override some
        var enumObj = LootTable;
        var reverseMap = {};
        var enumKey;
        for (enumKey in enumObj) reverseMap[enumObj[enumKey]] = GridEntity;
        reverseMap[enumObj.firecraker] = AnimatedFallingEntity;
        reverseMap[enumObj.dumpling] = StaticVariantEntity;
        reverseMap[enumObj.steamer] = ShadowedEntity;
        reverseMap[enumObj.papercut] = RandomMovingEntity;
        reverseMap[enumObj.envelope] = MovingEntity;
        reverseMap[enumObj.lantern] = LanternEntity;
        ItemClasses = reverseMap;

        // Build item definitions (Wd)
        var itemDefs = {};
        itemDefs[enumObj.firecraker] = new Item([R.pe], enumObj.firecraker, 5000);
        itemDefs[enumObj.dumpling] = new Item([R.ne, R.oe], enumObj.dumpling, 7000, 2);
        itemDefs[enumObj.steamer] = new Item([R.ob], enumObj.steamer, 7000, 10);
        itemDefs[enumObj.tea] = new Item([R.we, R.xe], enumObj.tea, 6000, 2, true);
        itemDefs[enumObj.medicine] = new Item([R.Fa], enumObj.medicine, 6000, 2, false);
        itemDefs[enumObj.papercut] = new Item([R.qe, R.le], enumObj.papercut, 6000, 5);
        itemDefs[enumObj.envelope] = new Item([R.envelope], enumObj.envelope, 7000, 2);
        itemDefs[enumObj.mushroom] = new Item([R.mb], enumObj.mushroom, 7000, 1, false);
        itemDefs[enumObj.lantern] = new Item([R.se, R.ve, R.ue, R.re], enumObj.lantern, 8000, 2);
        itemDefs[enumObj.coin] = new Item([R.coin], enumObj.coin, 10000, 1);
        itemDefs[enumObj.ingot] = new Item([R.ingot], enumObj.ingot, 5000, 5);
        ItemDefinitions = itemDefs;

        initializeObjectCounter(ObjectPoolManager.getInstance(), 1);

        // Create controller/handler for the logo DOM element
        gameController = new GameController(Logo);
    }
}

// Execute the initialization
init();