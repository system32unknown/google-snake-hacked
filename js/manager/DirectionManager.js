import { defineSingleton } from "../utils/utils.js";

/**
 * DirectionManager handles rotation and direction mapping between entities.
 * It defines angle relationships and direction transforms.
 */
export class DirectionManager {
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