import EventTarget from '../../goog/events/EventTarget.js';
import { LOOK_LEFT, LOOK_RIGHT, NORMAL_BODY, NORMAL_HEAD, Oe, Pe, Qe, Re } from '../data/Anim_Data.js';
import { BLINK, DIZZY, EAT_ANIM, LOOK_AROUND, NUDGE, REVERSAL, SHOCK } from '../data/Expressions.js';
import ObjectRegistry from '../data/ObjectRegistry.js';
import { CatchItemEvent, MatchPatternEvent } from '../events.js';
import DirectionManager from '../manager/DirectionManager.js';
import GridPatternManager from '../manager/GridPatternManager.js';
import SnakeSegment, { isSpecialFrame, updateSegmentSprite } from '../objects/SnakeSegment.js';
import Sprite from '../objects/Sprite.js';
import { stopAllAnimations } from '../utils/AnimUtils.js';
import { getActiveLinkedCells, updateCellUsage } from '../utils/GridUtils.js';
import { createSprite } from '../utils/SprUtils.js';
import { getTime } from '../utils/utils.js';

const GRID_COLUMNS = 23;
const GRID_ROWS = 9;
const CELL_SIZE = 20;
const SEGMENT_COUNT = 15;
const START_COLUMN = GRID_COLUMNS - 1;
const START_ROW = 7;
const HEAD_Z_INDEX = 15;
const BASE_Z_INDEX = 16;
const TURN_FRAME_COUNT = 5;
const MAX_FRAME_DELTA = 100;
const IDLE_RESET_MS = 5000;
const PATTERN_INTERVAL_MS = 5000;
const NUDGE_INTERVAL_MS = 5000;
const REVERSE_DURATION_MS = 5000;
const EXPRESSION_DELAY_MS = 80;
const MAX_QUEUED_DIRECTIONS = 2;

const Direction = Object.freeze({ UP: 1, DOWN: 2, LEFT: 3, RIGHT: 4 });
const SegmentType = Object.freeze({ HEAD: 0, BODY: 1, TAIL: 2 });

const DIRECTION_VECTORS = Object.freeze({
  [Direction.UP]: [0, -1],
  [Direction.DOWN]: [0, 1],
  [Direction.LEFT]: [-1, 0],
  [Direction.RIGHT]: [1, 0],
});

const OPPOSITE_DIRECTION = Object.freeze({
  [Direction.UP]: Direction.DOWN,
  [Direction.DOWN]: Direction.UP,
  [Direction.LEFT]: Direction.RIGHT,
  [Direction.RIGHT]: Direction.LEFT,
});

const NO_MOVEMENT = Object.freeze([0, 0]);

const isVertical = (direction) => direction === Direction.UP || direction === Direction.DOWN;
const isHorizontal = (direction) => direction === Direction.LEFT || direction === Direction.RIGHT;
const isPerpendicular = (a, b) => (isVertical(a) && isHorizontal(b)) || (isHorizontal(a) && isVertical(b));
const wrap = (value, size) => ((value % size) + size) % size;
const swapDirection = (direction) => OPPOSITE_DIRECTION[direction] ?? direction;
const reversed = (items) => [...items].reverse();

function segmentTypeFor(index) {
  if (index === 0) return SegmentType.HEAD;
  return index === SEGMENT_COUNT - 1 ? SegmentType.TAIL : SegmentType.BODY;
}

function animateSegmentTurn(segment, progress) {
  const frameId = segment.mainSprite.getFrameId();
  if (SHOCK.includes(frameId) || DIZZY.includes(frameId)) return;

  const frameIndex = Math.min(Math.floor(TURN_FRAME_COUNT * progress), TURN_FRAME_COUNT - 1);
  const directionManager = DirectionManager.getInstance();
  const turn = [segment.baseDirection, segment.currentDirection];
  let frameSet;

  if (segment.entityType === SegmentType.HEAD) {
    frameSet = directionManager.alternateTransform.get(turn) === 3 ? Oe : Pe;
  } else {
    frameSet = directionManager.transformMap.get(turn) === 3 ? Qe : Re;
    segment.mainSprite.rotate(directionManager.getBaseAngle(segment.baseDirection));
  }

  stopAllAnimations(segment.mainSprite);
  Sprite.setFrame(segment.mainSprite, frameSet[frameIndex]);
}

function placeScaledSprite(sprite, x, y, angle, frameValue, flip) {
  const length = flip ? frameValue : CELL_SIZE - frameValue;
  const rotation = flip ? angle : (angle + 180) % 360;
  let posX = x;
  let posY = y;

  if (rotation === 180) posX += CELL_SIZE - length;
  if (rotation === 270) posY += CELL_SIZE - length;
  if (flip) sprite.rotate(rotation);

  if (rotation === 180 || rotation === 0) {
    sprite.setWidth(length + 1);
    if (rotation === 180) posX -= 2;
  } else {
    sprite.setHeight(length + 1);
    if (rotation === 270) posY -= 2;
  }

  Sprite.setPosition(sprite, posX, posY);
}

export default class SnakeController extends EventTarget {
  #reverseTimer = null;

  constructor(containerElement) {
    super();

    this.container = containerElement;
    this.patternManager = GridPatternManager.getInstance();

    this.segments = [];
    this.headSprite = null;
    this.directionQueue = [];
    this.currentFrame = NORMAL_HEAD;

    this.lastUpdateTime = getTime();
    this.lastMatchTime = null;
    this.lastCatchTime = null;
    this.moveProgress = 0;

    this.baseDuration = ObjectRegistry[1].V;
    this.moveDuration = this.baseDuration;
    this.speedMultiplier = 1;
    this.stepPixel = CELL_SIZE;
    this.currentStepFrame = 0;

    this.Yc = null;
    this.Hb = null;
    this.Ib = null;
  }

  init() {
    let previous = null;

    for (let i = 0; i < SEGMENT_COUNT; i++) {
      const column = (START_COLUMN + i) % GRID_COLUMNS;
      const segment = new SnakeSegment(Direction.LEFT, segmentTypeFor(i), column, START_ROW, i, previous, this.container);

      segment.mainSprite.show(false);
      this.segments.push(segment);
      this.patternManager.markCell(GRID_COLUMNS * START_ROW + column, true);
      previous = segment;
    }

    this.headSprite = createSprite(NORMAL_BODY, HEAD_Z_INDEX, this.container);
  }

  forward() {
    const tail = this.segments[this.segments.length - 1];
    const releasingIndex = tail.getCellIndex();
    const backToFront = reversed(this.segments);

    for (const segment of backToFront) {
      if (segment.parent) {
        segment.gridX = segment.parent.gridX;
        segment.gridY = segment.parent.gridY;
      } else if (segment.entityType === SegmentType.HEAD) {
        const [dx, dy] = DIRECTION_VECTORS[segment.currentDirection] ?? NO_MOVEMENT;
        segment.gridX = wrap(segment.gridX + dx, GRID_COLUMNS);
        segment.gridY = wrap(segment.gridY + dy, GRID_ROWS);
      }
    }

    this.patternManager.markCell(this.segments[0].getCellIndex(), true);
    updateCellUsage(this.patternManager, releasingIndex, true);

    const queued = this.directionQueue.shift();

    for (const segment of backToFront) {
      segment.baseDirection = segment.currentDirection;

      if (segment.entityType === SegmentType.HEAD) {
        segment.currentDirection = queued || segment.currentDirection;
      } else if (segment.entityType === SegmentType.TAIL) {
        segment.currentDirection = segment.parent.parent.currentDirection;
      } else {
        segment.currentDirection = segment.parent.currentDirection;
      }
    }
  }

  move(now) {
    if (this.Ib && now - this.Ib > IDLE_RESET_MS) this.resetSpeed(now);

    if (this.moveProgress >= 1) {
      this.forward();
      this.#checkPatternMatch(now);
      this.handleCatchAndItems(now);
      this.updateVisualsAfterStep();
      this.moveProgress = 0;
    }

    this.updateInterpolation(now);
    this.lastUpdateTime = now;
  }

  #checkPatternMatch(now) {
    const elapsed = this.lastMatchTime ? now - this.lastMatchTime : PATTERN_INTERVAL_MS;
    if (elapsed < PATTERN_INTERVAL_MS) return;

    const pattern = this.patternManager.match();
    if (pattern === '') return;

    this.dispatchEvent(new MatchPatternEvent(pattern, now));
    this.lastMatchTime = now;
    this.segments[0].playAnimation(BLINK, EXPRESSION_DELAY_MS, 500);
  }

  updateInterpolation(now) {
    const delta = Math.min(now - this.lastUpdateTime, MAX_FRAME_DELTA);
    this.moveProgress = Math.min(this.moveProgress + delta / this.moveDuration, 1);

    let frame = Math.floor(this.stepPixel * this.moveProgress);
    if (frame % 2) frame += 1;

    if (this.currentStepFrame === frame) return;

    const [head, follower] = this.segments;

    if (head.currentDirection === follower.currentDirection) {
      this.headSprite.show(true);
      placeScaledSprite(this.headSprite, CELL_SIZE * this.getX(), CELL_SIZE * this.getY(), head.getSprite().getRotation(), frame, true);
      head.move(this.moveProgress);
    } else {
      this.headSprite.show(false);
      animateSegmentTurn(head, this.moveProgress);
    }

    const tail = this.segments[this.segments.length - 1];
    const beforeTail = this.segments[this.segments.length - 2];

    if (isSpecialFrame(beforeTail)) {
      tail.getSprite().show(false);
      animateSegmentTurn(beforeTail, this.moveProgress);
    } else {
      tail.move(this.moveProgress);
      placeScaledSprite(beforeTail.getSprite(), CELL_SIZE * beforeTail.getX(), CELL_SIZE * beforeTail.getY(), beforeTail.getSprite().getRotation(), frame, false);
    }

    this.currentStepFrame = frame;
  }

  handleCatchAndItems(now) {
    const activeCells = getActiveLinkedCells(this.patternManager);

    if (activeCells.length) {
      const headCell = this.segments[0].getCellIndex();

      for (const cellIndex of activeCells) {
        if (headCell === cellIndex) this.segments[0].playAnimation(EAT_ANIM, EXPRESSION_DELAY_MS);
        this.dispatchEvent(new CatchItemEvent(cellIndex, now));
      }

      this.lastCatchTime = now;
    } else if (now - (this.lastCatchTime || 0) > NUDGE_INTERVAL_MS) {
      this.lastCatchTime = now;
      this.segments[0].playAnimation(NUDGE, EXPRESSION_DELAY_MS);
    }
  }

  resetSpeed(now) {
    this.currentFrame = NORMAL_HEAD;
    this.segments[0].playAnimation(LOOK_AROUND, EXPRESSION_DELAY_MS, 100);
    this.moveDuration = this.baseDuration;
    this.speedMultiplier = 1;
    this.lastUpdateTime = now;
    this.Ib = null;
  }

  setSpeedParameters(secs, speed) {
    this.Ib = secs;
    this.speedMultiplier = speed;
    this.moveDuration = this.baseDuration * this.speedMultiplier;
  }

  enqueueDirection(directionInput) {
    if (this.directionQueue.length >= MAX_QUEUED_DIRECTIONS) return;

    const direction = this.Hb != null ? swapDirection(directionInput) : directionInput;
    const currentFacing = this.directionQueue.at(-1) ?? this.segments[0].currentDirection;

    if (!isPerpendicular(currentFacing, direction)) return;

    this.directionQueue.push(direction);

    const transform = DirectionManager.getInstance().transformMap.get([currentFacing, direction]);
    this.segments[0].playAnimation(transform === 3 ? LOOK_LEFT : LOOK_RIGHT, EXPRESSION_DELAY_MS);
  }

  updateVisualsAfterStep() {
    const lastIndex = this.segments.length - 1;
    const beforeTailSprite = this.segments[lastIndex - 1].getSprite();

    this.segments[lastIndex].getSprite().show(true);

    for (let i = lastIndex - 1; i > 1; i--) {
      this.segments[i].mainSprite = this.segments[i - 1].mainSprite;
      this.segments[i].mainSprite.setZIndex(BASE_Z_INDEX - i);
    }

    this.segments[1].mainSprite = beforeTailSprite;
    this.segments[1].mainSprite.setZIndex(HEAD_Z_INDEX);

    updateSegmentSprite(this.segments[0], this.currentFrame);
    updateSegmentSprite(this.segments[1]);
    updateSegmentSprite(this.segments[lastIndex]);
  }

  reverseMove(token) {
    if (this.Yc != null) return;

    this.currentFrame = REVERSAL;
    this.Hb = token;

    clearTimeout(this.#reverseTimer);
    this.#reverseTimer = setTimeout(() => {
      this.#reverseTimer = null;
      if (this.Hb !== token) return;
      this.currentFrame = NORMAL_HEAD;
      this.Hb = null;
    }, REVERSE_DURATION_MS);
  }

  getX() {
    return this.segments[0].getX();
  }

  getY() {
    return this.segments[0].getY();
  }

  disposeInternal() {
    clearTimeout(this.#reverseTimer);
    this.#reverseTimer = null;

    this.segments.forEach((segment) => segment.disposeInternal());
    this.headSprite?.disposeInternal();
    this.directionQueue = null;

    super.disposeInternal();
  }
}