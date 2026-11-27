import Event from '../../goog/events/Event.js';
import { LOWBODY_TURN, NORMAL_BODY, Oe, Pe, Qe, Re, SegmentFrames } from '../data/Anim_Data.js';
import { DIZZY } from '../data/Expressions.js';
import DirectionManager from '../manager/DirectionManager.js';
import Sprite from '../objects/Sprite.js';
import { createSprite } from '../utils/SprUtils.js';

const GRID_COLUMNS = 23;
const GRID_ROWS = 9;
const BASE_Z_INDEX = 16;
const MAX_ANIMATION_DELAY = 500;
const FLIPPED_ANGLE = 180;

const SegmentType = Object.freeze({
  HEAD: 0,
  BODY: 1,
  TAIL: 2,
});

const DIRECTION_VECTORS = Object.freeze({
  1: [0, -1],
  2: [0, 1],
  3: [-1, 0],
  4: [1, 0],
});

const NO_MOVEMENT = Object.freeze([0, 0]);
const TURN_FRAME_SETS = [Oe, Pe, Qe, Re];

const wrap = (value, size) => ((value % size) + size) % size;

const hasOverlay = (type) => type === SegmentType.HEAD || type === SegmentType.TAIL;

export function isSpecialFrame(segment) {
  const frameId = segment.mainSprite.getFrameId();
  return frameId === LOWBODY_TURN || TURN_FRAME_SETS.some((frames) => frames.includes(frameId));
}

function applyRotation(sprite, angle, flipOnHalfTurn) {
  if (flipOnHalfTurn && angle === FLIPPED_ANGLE) sprite.flip();
  else sprite.rotate(angle);
}

export function updateSegmentSprite(segment, overrideFrame) {
  const { mainSprite, shadowSprite, entityType, baseDirection, currentDirection } = segment;
  const directionManager = DirectionManager.getInstance();

  let frameSet = SegmentFrames[entityType];
  if (entityType === SegmentType.HEAD) frameSet = overrideFrame || frameSet;

  let angle = directionManager.getBaseAngle(baseDirection);

  if (entityType === SegmentType.BODY && baseDirection && currentDirection !== baseDirection) {
    frameSet = LOWBODY_TURN;
    angle = directionManager.rotationMap.get([currentDirection, baseDirection]);
  }

  if (!mainSprite.animation?.isPlaying()) {
    Sprite.setFrame(mainSprite, frameSet);
    if (shadowSprite) Sprite.setFrame(shadowSprite, frameSet);
  }

  applyRotation(mainSprite, angle, entityType === SegmentType.HEAD);

  shadowSprite?.show(false);
  Sprite.moveToGrid(mainSprite, segment.gridX, segment.gridY);
}

export default class SnakeSegment extends Event {
  constructor(direction, type, x, y, index, parentSegment, container) {
    super();

    this.baseDirection = direction;
    this.currentDirection = direction;
    this.entityType = type;
    this.gridX = x;
    this.gridY = y;
    this.parent = parentSegment;

    const zIndex = BASE_Z_INDEX - index;

    this.mainSprite = createSprite(NORMAL_BODY, zIndex, container);
    this.mainSprite.show(true);

    this.shadowSprite = hasOverlay(type) ? createSprite(SegmentFrames[type], zIndex, container) : null;

    updateSegmentSprite(this);
  }

  move(step) {
    const [dx, dy] = DIRECTION_VECTORS[this.baseDirection] ?? NO_MOVEMENT;
    const nextX = this.gridX + dx * step;
    const nextY = this.gridY + dy * step;

    const isOutOfBounds = nextX > GRID_COLUMNS - 1 || nextX < 0 || nextY > GRID_ROWS - 1 || nextY < 0;

    if (isOutOfBounds && this.shadowSprite) {
      applyRotation(this.shadowSprite, this.mainSprite.getRotation(), true);
      Sprite.moveToGrid(this.shadowSprite, wrap(nextX, GRID_COLUMNS), wrap(nextY, GRID_ROWS));
      this.shadowSprite.show(true);
    }

    Sprite.moveToGrid(this.mainSprite, nextX, nextY);
  }

  playAnimation(frame, delay, repeatDelay, count, loop) {
    if (frame !== DIZZY && isSpecialFrame(this)) return;

    const clampedDelay = Math.min(delay, MAX_ANIMATION_DELAY);
    this.mainSprite.playFrameSequence(frame, clampedDelay, repeatDelay, count, loop);
    this.shadowSprite?.playFrameSequence(frame, clampedDelay, repeatDelay, count, loop);
  }

  disposeInternal() {
    this.mainSprite.disposeInternal();
    this.shadowSprite?.disposeInternal();
    super.disposeInternal();
  }

  getSprite() {
    return this.mainSprite;
  }

  getX() {
    return this.gridX;
  }

  getY() {
    return this.gridY;
  }

  getCellIndex() {
    return GRID_COLUMNS * this.gridY + this.gridX;
  }
}