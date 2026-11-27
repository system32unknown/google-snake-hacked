import Sprite from '../objects/Sprite.js';

export function attachSpritesToContainer(entity, container) {
  container.appendChild(entity.mainSprite.getElement());
  container.appendChild(entity.shadowSprite.getElement());
}

export function snapPos(entity, idx) {
  entity.tileIndex = idx;
  entity.renderPosition();
}

export function createSprite(spriteType, zIndex, parent) {
  const sprite = new Sprite(spriteType);
  sprite.show(false);
  sprite.setZIndex(zIndex);
  sprite.isLooping = true;
  parent.appendChild(sprite.getElement());
  return sprite;
}