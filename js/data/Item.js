import { LOOT_TABLE as enumObj } from "./data.js";
import GridEntity from '../objects/GridEntity.js';
import { AnimatedFallingEntity, LanternEntity, MovingEntity, RandomMovingEntity, ShadowedEntity, StaticVariantEntity } from '../entites.js';

export default class Item {
  constructor(grid, name, texture, score = 0, data = null) {
    this.grid = grid; // Reference to grid or item container
    this.name = name; // Name/type of the item
    this.texture = texture; // Resource or sprite handle
    this.score = score; // Optional numeric field
    this.data = data; // Optional linked object or metadata
  }
}

const ITEM_IDS = {
  FIRECRACKER: 86,
  DUMPLING1: 65,
  DUMPLING2: 62,
  COIN: 64,
  INGOT: 71,
  TEA1: 69,
  TEA2: 73,
  MEDICINE: 87,
  MUSHROOM: 85,
  PAPERCUT1: 81,
  PAPERCUT2: 82,
  LANTERNG: 72,
  LANTERNO: 75,
  LANTERNL: 77,
  LANTERNE: 79,
  STEAMER: 67,
  ENVELOPE: 63
}

export const ItemClasses = {}; // Registry mapping item names to their constructors
for (var enumKey in enumObj) ItemClasses[enumObj[enumKey]] = GridEntity;
ItemClasses[enumObj.firecraker] = AnimatedFallingEntity;
ItemClasses[enumObj.dumpling] = StaticVariantEntity;
ItemClasses[enumObj.steamer] = ShadowedEntity;
ItemClasses[enumObj.papercut] = RandomMovingEntity;
ItemClasses[enumObj.envelope] = MovingEntity;
ItemClasses[enumObj.lantern] = LanternEntity;

// Build item definitions (Wd)
export const ItemDefinitions = {}; // Registry of base item data
ItemDefinitions[enumObj.firecraker] = new Item([ITEM_IDS.FIRECRACKER], enumObj.firecraker, 5000);
ItemDefinitions[enumObj.dumpling] = new Item([ITEM_IDS.DUMPLING1, ITEM_IDS.DUMPLING2], enumObj.dumpling, 7000, 2);
ItemDefinitions[enumObj.steamer] = new Item([ITEM_IDS.STEAMER], enumObj.steamer, 7000, 10);
ItemDefinitions[enumObj.tea] = new Item([ITEM_IDS.TEA1, ITEM_IDS.TEA2], enumObj.tea, 6000, 2, true);
ItemDefinitions[enumObj.medicine] = new Item([ITEM_IDS.MEDICINE], enumObj.medicine, 6000, 2, false);
ItemDefinitions[enumObj.papercut] = new Item([ITEM_IDS.PAPERCUT1, ITEM_IDS.PAPERCUT2], enumObj.papercut, 6000, 5);
ItemDefinitions[enumObj.envelope] = new Item([ITEM_IDS.ENVELOPE], enumObj.envelope, 7000, 2);
ItemDefinitions[enumObj.mushroom] = new Item([ITEM_IDS.MUSHROOM], enumObj.mushroom, 7000, 1, false);
ItemDefinitions[enumObj.lantern] = new Item([ITEM_IDS.LANTERNG, ITEM_IDS.LANTERNO, ITEM_IDS.LANTERNL, ITEM_IDS.LANTERNE], enumObj.lantern, 8000, 2);
ItemDefinitions[enumObj.coin] = new Item([ITEM_IDS.COIN], enumObj.coin, 10000, 1);
ItemDefinitions[enumObj.ingot] = new Item([ITEM_IDS.INGOT], enumObj.ingot, 5000, 5);