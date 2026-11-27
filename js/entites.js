import { randomInt } from '../goog/math/math.js';
import GridEntity from './objects/GridEntity.js';
import Sprite from './objects/Sprite.js';

const FIRECRACKER_ANIM = [86, 84, 83, 80, 78, 76];
const FIRECRACKER_BREAK = [74, 70, 68, 66];
const FIRECRACKER_ANIM_FRAME_MS = 700;
const FIRECRACKER_BREAK_FRAME_MS = 80;
const FIRECRACKER_IMPACT_FRAME_MS = 400;
const FIRECRACKER_IMPACT_DELAY_MS = 500;
const FIRECRACKER_SPEED = -5;

const LANTERN_VARIANT_KEYS = 'GOLE';
const SHADOW_VARIANT_FRAME = 11;
const SHADOW_OFFSET_DIVISOR = 4;
const SHADOW_OFFSET_Y = 5;
const CELL_SIZE = 20;

const ENABLED_TARGET_Y = 2000;
const DEFAULT_TARGET_Y = 1400;
const IMPACT_DONE_STATE = 2;

function initMotion(entity) {
  entity.randomMove = true;
  entity.targetY = entity.enabled ? ENABLED_TARGET_Y : DEFAULT_TARGET_Y;
  entity.direction = Math.random() < 0.5 ? 1 : -1;
}

function applyRandomVariant(entity) {
  const variant = randomInt(2);
  if (variant) Sprite.setFrame(entity.mainSprite, entity.grid[variant]);
}

export class AnimatedFallingEntity extends GridEntity {
  #impactTimer = null;

  constructor(config) {
    super(config);
    this.speed = FIRECRACKER_SPEED;

    this.mainSprite.playFrameSequence(FIRECRACKER_ANIM, FIRECRACKER_ANIM_FRAME_MS, this.targetY);
    this.mainSprite.playFrameSequence(FIRECRACKER_BREAK, FIRECRACKER_BREAK_FRAME_MS, this.targetY + FIRECRACKER_ANIM_FRAME_MS * FIRECRACKER_ANIM.length);
  }

  onImpact() {
    this.mainSprite.playFrameSequence(FIRECRACKER_BREAK, FIRECRACKER_IMPACT_FRAME_MS);
    clearTimeout(this.#impactTimer);
    this.#impactTimer = setTimeout(() => {
      this.#impactTimer = null;
      this.state = IMPACT_DONE_STATE;
    }, FIRECRACKER_IMPACT_DELAY_MS);
  }

  disposeInternal() {
    clearTimeout(this.#impactTimer);
    this.#impactTimer = null;
    super.disposeInternal();
  }
}

export class StaticVariantEntity extends GridEntity {
  constructor(config) {
    super(config);
    applyRandomVariant(this);
  }
}

export class ShadowedEntity extends GridEntity {
  constructor(config) {
    super(config);
    Sprite.setFrame(this.shadowSprite, SHADOW_VARIANT_FRAME);
  }

  renderPosition() {
    const worldX = CELL_SIZE * (this.getCol() + 0.5);
    const worldY = CELL_SIZE * (this.getRow() + 0.5);

    this.mainX = worldX - this.mainSprite.getWidth() / SHADOW_OFFSET_DIVISOR;
    this.mainY = worldY - this.mainSprite.getHeight() / SHADOW_OFFSET_DIVISOR;
    Sprite.setPosition(this.mainSprite, this.mainX, this.mainY);

    this.shadowX = worldX - this.shadowSprite.getWidth() / SHADOW_OFFSET_DIVISOR;
    this.shadowY = worldY + SHADOW_OFFSET_Y - this.shadowSprite.getHeight();
    Sprite.setPosition(this.shadowSprite, this.shadowX, this.shadowY);
  }
}

export class MovingEntity extends GridEntity {
  constructor(config) {
    super(config);
    initMotion(this);
  }
}

export class RandomMovingEntity extends GridEntity {
  constructor(config) {
    super(config);
    applyRandomVariant(this);
    initMotion(this);
  }
}

export class LanternEntity extends GridEntity {
  constructor(config) {
    super(config);

    const variant = randomInt(LANTERN_VARIANT_KEYS.length);
    if (variant) Sprite.setFrame(this.mainSprite, this.grid[variant]);

    this.variantKey = LANTERN_VARIANT_KEYS[variant];
    initMotion(this);
  }
}