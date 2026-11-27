import { LOOT_TABLE as Loot } from './data.js';
import { forEach } from '../../goog/array.js';

const createEntry = (data, V = 200, U = 1) => ({ data: { ...data }, V, U });

const DUMPLING_COIN_INGOT = {
  [Loot.dumpling]: 30,
  [Loot.coin]: 40,
  [Loot.ingot]: 30,
};

export const ObjectRegistry = {
  1: createEntry({
    [Loot.firecraker]: 10,
    [Loot.dumpling]: 20,
    [Loot.tea]: 20,
    [Loot.envelope]: 20,
    [Loot.medicine]: 10,
    [Loot.coin]: 40,
    [Loot.ingot]: 20,
  }),

  2: createEntry({
    [Loot.firecraker]: 10,
    [Loot.medicine]: 10,
    [Loot.tea]: 10,
    [Loot.papercut]: 10,
    [Loot.lantern]: 50,
  }, 180, 0.85),

  3: createEntry({
    [Loot.papercut]: 30,
    [Loot.medicine]: 20,
    [Loot.mushroom]: 20,
    [Loot.firecraker]: 30,
    [Loot.lantern]: 30,
  }, 160, 0.6),

  O: createEntry({
    [Loot.firecraker]: 20,
    [Loot.dumpling]: 30,
    [Loot.coin]: 50,
  }),

  O2: createEntry({
    [Loot.firecraker]: 40,
    [Loot.dumpling]: 10,
    [Loot.coin]: 50,
  }),

  G1: createEntry(DUMPLING_COIN_INGOT),
  E: createEntry(DUMPLING_COIN_INGOT),
  L: createEntry(DUMPLING_COIN_INGOT),

  G: createEntry({
    [Loot.coin]: 50,
    [Loot.ingot]: 50,
  }),
};

export function initObjCounter(target, typeId) {
  target.count = 0;
  target.objects = (typeId in ObjectRegistry) ? ObjectRegistry[typeId].data : ObjectRegistry[1].data;
  forEach(target.objects, function (value) {
    this.count += value;
  }, target)
}

export default ObjectRegistry;