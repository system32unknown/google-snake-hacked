import { toRadians, angle } from './math.js';

/**
* A utility class for representing two-dimensional positions.
*/
export class Coordinate {
  /**
   * @param {number=} opt_x Left, defaults to 0.
   * @param {number=} opt_y Top, defaults to 0.
   */
  constructor(opt_x, opt_y) {
    /** @type {number} X-value */
    this.x = (opt_x !== undefined) ? opt_x : 0;

    /** @type {number} Y-value */
    this.y = (opt_y !== undefined) ? opt_y : 0;
  }

  /**
   * Returns a new copy of the coordinate.
   * @return {!Coordinate} A clone of this coordinate.
   */
  clone() {
    return new Coordinate(this.x, this.y);
  }

  /**
   * Returns a nice string representing the coordinate.
   * @return {string} In the form (50, 73).
   */
  toString() {
    return "(" + this.x + ", " + this.y + ")";
  }

  /**
   * Returns whether the specified value is equal to this coordinate.
   * @param {*} other Some other value.
   * @return {boolean} Whether the specified value is equal to this coordinate.
   */
  equals(other) {
    return other instanceof Coordinate && Coordinate.equals(this, other);
  }

  /**
   * Rounds the x and y fields to the next larger integer values.
   * @return {!Coordinate} This coordinate with ceil'd fields.
   */
  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }

  /**
   * Rounds the x and y fields to the next smaller integer values.
   * @return {!Coordinate} This coordinate with floored fields.
   */
  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  /**
   * Rounds the x and y fields to the nearest integer values.
   * @return {!Coordinate} This coordinate with rounded fields.
   */
  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  /**
   * Translates this coordinate by the given offsets. If a Coordinate is
   * given, x and y are translated by the coordinate's x and y. Otherwise,
   * x and y are translated by `tx` and `opt_ty` respectively.
   * @param {number|Coordinate} tx The value to translate x by, or the
   *     coordinate to translate this coordinate by.
   * @param {number=} opt_ty The value to translate y by.
   * @return {!Coordinate} This coordinate after translating.
   */
  translate(tx, opt_ty) {
    if (tx instanceof Coordinate) {
      this.x += tx.x;
      this.y += tx.y;
    } else {
      this.x += Number(tx);
      if (typeof opt_ty === "number") this.y += opt_ty;
    }
    return this;
  }

  /**
   * Scales this coordinate by the given scale factors. x is scaled by
   * `sx` and y by `opt_sy` (or `sx` again if `opt_sy` is omitted).
   * @param {number} sx The scale factor to use for the x dimension.
   * @param {number=} opt_sy The scale factor to use for the y dimension.
   * @return {!Coordinate} This coordinate after scaling.
   */
  scale(sx, opt_sy) {
    var sy = (typeof opt_sy === "number") ? opt_sy : sx;
    this.x *= sx;
    this.y *= sy;
    return this;
  }

  /**
   * Rotates this coordinate clockwise about the origin (or, optionally,
   * the given center) by the given angle, in radians.
   * @param {number} radians The angle to rotate by, clockwise, in radians.
   * @param {!Coordinate=} opt_center The center of rotation. Defaults to
   *     (0, 0) if not given.
   */
  rotateRadians(radians, opt_center) {
    var center = opt_center || new Coordinate(0, 0);

    var x = this.x;
    var y = this.y;
    var cos = Math.cos(radians);
    var sin = Math.sin(radians);

    this.x = (x - center.x) * cos - (y - center.y) * sin + center.x;
    this.y = (x - center.x) * sin + (y - center.y) * cos + center.y;
  }

  /**
   * Rotates this coordinate clockwise about the origin (or, optionally,
   * the given center) by the given angle, in degrees.
   * @param {number} degrees The angle to rotate by, clockwise, in degrees.
   * @param {!Coordinate=} opt_center The center of rotation. Defaults to
   *     (0, 0) if not given.
   */
  rotateDegrees(degrees, opt_center) {
    this.rotateRadians(toRadians(degrees), opt_center);
  }

  // ---- Static (class-level) methods ----

  /**
   * Compares coordinates for equality.
   * @param {Coordinate} a A Coordinate.
   * @param {Coordinate} b A Coordinate.
   * @return {boolean} True iff the coordinates are equal, or if both are null.
   */
  static equals(a, b) {
    if (a == b) return true;
    if (!a || !b) return false;
    return a.x == b.x && a.y == b.y;
  }

  /**
   * Returns the distance between two coordinates.
   * @param {!Coordinate} a A Coordinate.
   * @param {!Coordinate} b A Coordinate.
   * @return {number} The distance between `a` and `b`.
   */
  static distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Returns the magnitude of a coordinate.
   * @param {!Coordinate} a A Coordinate.
   * @return {number} The distance between the origin and `a`.
   */
  static magnitude(a) {
    return Math.sqrt(a.x * a.x + a.y * a.y);
  }

  /**
   * Returns the angle from the origin to a coordinate.
   * @param {!Coordinate} a A Coordinate.
   * @return {number} The angle, in degrees, clockwise from the positive
   *     X axis to `a`.
   */
  static azimuth(a) {
    return angle(0, 0, a.x, a.y); // goog.math.angle
  }

  /**
   * Returns the squared distance between two coordinates. Useful for
   * comparisons when the actual distance value isn't required, since it
   * avoids the cost of a square root.
   * @param {!Coordinate} a A Coordinate.
   * @param {!Coordinate} b A Coordinate.
   * @return {number} The squared distance between `a` and `b`.
   */
  static squaredDistance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  /**
   * Returns the difference between two coordinates as a new Coordinate.
   * @param {!Coordinate} a A Coordinate.
   * @param {!Coordinate} b A Coordinate.
   * @return {!Coordinate} A Coordinate representing `a - b`.
   */
  static difference(a, b) {
    return new Coordinate(a.x - b.x, a.y - b.y);
  }

  /**
   * Returns the sum of two coordinates as a new Coordinate.
   * @param {!Coordinate} a A Coordinate.
   * @param {!Coordinate} b A Coordinate.
   * @return {!Coordinate} A Coordinate representing `a + b`.
   */
  static sum(a, b) {
    return new Coordinate(a.x + b.x, a.y + b.y);
  }
}