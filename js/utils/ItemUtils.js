import { randomInt } from '../../goog/math/math.js';
import { LOOT_TABLE } from '../data/data.js';
import { ItemClasses, ItemDefinitions } from '../data/Item.js';
import ObjectPoolManager from '../manager/ObjectPoolManager.js';
import GridEntity from '../objects/GridEntity.js';

// Item factory
export function createItem(name) {
  if (!(name in ItemDefinitions) || !(name in ItemClasses))
    return new GridEntity(ItemDefinitions.coin);
  return new ItemClasses[name](ItemDefinitions[name]);
}

/**
 * Weighted random loot generator
 * @param {ObjectPoolManager} pool 
 * @returns 
 */
export function generateRandomItem(pool) {
  const roll = randomInt(pool.count);
  let cumulative = 0;
  let chosenKey = "coin";

  for (const key in LOOT_TABLE) {
    const weight = pool.objects[LOOT_TABLE[key]] || 0;
    cumulative += weight;
    if (roll < cumulative) {
      chosenKey = LOOT_TABLE[key];
      break;
    }
  }

  return createItem(chosenKey);
}