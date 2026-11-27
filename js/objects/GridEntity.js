import Disposable from '../../goog/Disposable.js';
import Sprite from './Sprite.js';
import SpritePool from './SpritePool.js';
import { getTime } from '../utils/utils.js';
import ConditionalTrigger from '../backend/ConditionalTrigger.js';
import { stopAllAnimations } from '../utils/AnimUtils.js';

const GRID_COLUMNS = 23;
const CELL_SIZE = 20;
const SHADOW_FRAME = 57;
const MAIN_Z_INDEX = 17;
const SHADOW_Z_INDEX = 0;
const SETTLED_Z_INDEX = 1;
const SHADOW_MIN_SCALE = 0.7;
const FADE_DURATION = 300;
const FRAME_CYCLE_INTERVAL = 400;
const MAX_OFFSET_X = 15;
const MAX_OFFSET_Y = 40;
const SCROLL_START = 200;
const SCROLL_FADE_END = 800;
const PARALLAX_RANGE = 1800;
const PARALLAX_STEP = 450;

const State = Object.freeze({
  FALLING: 0,
  SETTLED: 1,
  EXPIRED: 3,
});

const isHidden = (sprite) => sprite.style.display === 'none';

const fadeIn = (sprite) => {
  if (!isHidden(sprite)) return;
  sprite.show(true);
  Sprite.animateOpacity(sprite, FADE_DURATION, 0, 1);
};

const easeOutParabola = (value) => 1 - value * value;

function handleVerticalScroll(entity, scrollY) {
  let movementY = MAX_OFFSET_Y;

  if (scrollY > SCROLL_FADE_END) {
    movementY = 10 * easeOutParabola((scrollY - 1100) / 300);
  } else if (scrollY > SCROLL_START) {
    fadeIn(entity.mainSprite);
    movementY = MAX_OFFSET_Y * easeOutParabola((scrollY - SCROLL_START) / 600);
  }

  applyMovement(entity, 0, Math.floor(movementY));
}

function handleParallaxScroll(entity, scrollY) {
  if (scrollY <= SCROLL_START) {
    applyMovement(entity, 0, MAX_OFFSET_Y);
    return;
  }

  fadeIn(entity.mainSprite);

  const relativeScroll = scrollY - SCROLL_START;
  const movementY = MAX_OFFSET_Y * easeOutParabola(relativeScroll / PARALLAX_RANGE);

  const movingLeft = relativeScroll < PARALLAX_STEP * 2;
  const center = movingLeft ? PARALLAX_STEP : PARALLAX_STEP * 3;
  const sign = movingLeft ? -MAX_OFFSET_X : MAX_OFFSET_X;
  const curve = Math.floor(1000 * easeOutParabola((relativeScroll - center) / PARALLAX_STEP)) / 1000;

  applyMovement(entity, Math.floor(curve * sign * entity.direction), Math.floor(movementY));
}

function applyMovement(entity, offsetX, offsetY) {
  if (entity.baseX === offsetX && entity.baseY === offsetY) return;
  if (offsetX > MAX_OFFSET_X || offsetY < -MAX_OFFSET_X) return;

  entity.baseX = offsetX;
  entity.baseY = offsetY;

  Sprite.setPosition(entity.mainSprite, entity.mainX - offsetX, entity.mainY - offsetY);

  const scale = 1 - (1 - SHADOW_MIN_SCALE) * offsetY / MAX_OFFSET_Y;
  entity.shadowSprite.scale(scale, scale);

  if (offsetX) {
    Sprite.setPosition(entity.shadowSprite, entity.shadowX - offsetX, entity.shadowY);
  }
}

export default class GridEntity extends Disposable {
  constructor({ grid, name, texture, score, data }) {
    super();

    this.grid = grid;
    this.name = name;
    this.texture = texture;
    this.score = score;
    this.data = data;

    this.spritePool = SpritePool.getInstance();
    this.mainSprite = this.#createMainSprite();
    this.shadowSprite = this.#createShadowSprite();

    this.tileIndex = 0;
    this.tileOffset = 0;
    this.lastTime = getTime();
    this.stateTime = 0;
    this.phase = 0;
    this.state = State.FALLING;

    this.baseX = MAX_OFFSET_Y;
    this.baseY = MAX_OFFSET_Y;
    this.mainX = 0;
    this.mainY = 0;
    this.shadowX = 0;
    this.shadowY = 0;

    this.targetY = 1400;
    this.randomMove = false;
    this.direction = 1;

    this.behaviors = [
      new ConditionalTrigger(() => this.isEndingSoon(), () => this.fadeOut(), true),
      new ConditionalTrigger(() => this.hasData(), () => this.cycleFrame(), false, FRAME_CYCLE_INTERVAL),
    ];
  }

  #createMainSprite() {
    const sprite = this.spritePool.get();
    Sprite.setFrame(sprite, this.grid[0]);
    sprite.setZIndex(MAIN_Z_INDEX);
    sprite.show(false);
    return sprite;
  }

  #createShadowSprite() {
    const sprite = this.spritePool.get();
    Sprite.setFrame(sprite, SHADOW_FRAME);
    Sprite.animateOpacity(sprite, FADE_DURATION, 0, 1);
    sprite.setZIndex(SHADOW_Z_INDEX);
    sprite.scale(SHADOW_MIN_SCALE, SHADOW_MIN_SCALE);
    sprite.show(true);
    return sprite;
  }

  disposeInternal() {
    if (this.behaviors === null) return;

    for (const sprite of [this.mainSprite, this.shadowSprite]) {
      sprite.show(false);
      stopAllAnimations(sprite);
      sprite.Eb = false;
      this.spritePool.pool.push(sprite);
    }

    this.behaviors = null;
    super.disposeInternal();
  }

  update(now) {
    this.stateTime = now - this.lastTime;

    if (this.state === State.FALLING) {
      this.#updateFalling(now);
    } else if (this.state === State.SETTLED && now > this.texture + this.targetY) {
      this.state = State.EXPIRED;
    }

    this.behaviors?.forEach((behavior) => behavior.update());
  }

  #updateFalling(now) {
    if (now > this.targetY) {
      this.shadowSprite.show(false);
      this.mainSprite.setZIndex(SETTLED_Z_INDEX);
      this.state = State.SETTLED;
      applyMovement(this, 0, 0);
    } else if (this.randomMove) {
      handleParallaxScroll(this, now);
    } else {
      handleVerticalScroll(this, now);
    }
  }

  renderPosition() {
    const worldX = CELL_SIZE * (this.getCol() + 0.5);
    const worldY = CELL_SIZE * (this.getRow() + 0.5);
    const mainWidth = this.mainSprite.getWidth();
    const mainHeight = this.mainSprite.getHeight();

    this.mainX = worldX - mainWidth / 2;
    this.mainY = worldY - mainHeight / 2;
    Sprite.setPosition(this.mainSprite, this.mainX, this.mainY);

    this.shadowX = worldX - this.shadowSprite.getWidth() / 2;
    this.shadowY = worldY + mainHeight / 2 - this.shadowSprite.getHeight() + this.tileOffset;
    Sprite.setPosition(this.shadowSprite, this.shadowX, this.shadowY);
  }

  getCellIndex() {
    return this.tileIndex;
  }

  getRow() {
    return Math.floor(this.tileIndex / GRID_COLUMNS);
  }

  getCol() {
    return this.tileIndex % GRID_COLUMNS;
  }

  getName() {
    return this.name;
  }

  cycleFrame() {
    const index = this.grid.indexOf(this.mainSprite.getFrame());
    Sprite.setFrame(this.mainSprite, this.grid[(index + 1) % this.grid.length]);
  }

  isEndingSoon() {
    return this.state === State.SETTLED && this.stateTime > this.texture + this.targetY - FADE_DURATION;
  }

  fadeOut() {
    Sprite.fadeOut(this.mainSprite);
  }

  hasData() {
    return this.state === State.SETTLED && Boolean(this.data);
  }
}