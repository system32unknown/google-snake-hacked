import Disposable from '../../goog/Disposable.js';
import { randomInt } from '../../goog/math/math.js';
import GoogMap from '../../goog/structs/GoogMap.js';
import GoogSet from '../../goog/structs/GoogSet.js';
import { LOOT_TABLE } from '../data/data.js';
import SpriteGroup from '../objects/SpriteGroup.js';
import { find2x2Block, selectRandomAvailableCell, updateCellUsage } from '../utils/GridUtils.js';
import { generateRandomItem } from '../utils/ItemUtils.js';
import { attachSpritesToContainer, snapPos } from '../utils/SprUtils.js';
import { defineSingleton, getTime } from '../utils/utils.js';
import GridPatternManager from './GridPatternManager.js';
import ObjectPoolManager from './ObjectPoolManager.js';

const MAX_ACTIVE_ITEMS = 8;
const SPAWN_INTERVAL_MS = 2500;
const ITEM_UPDATE_INTERVAL_MS = 40;
const SPAWN_AREA_FRAME = 88;
const SPAWN_AREA_OFFSET = -3;
const NO_CELL = -1;

const ItemState = Object.freeze({
  FALLING: 0,
  SETTLED: 1,
});

const isItemAlive = (item) => item.state === ItemState.FALLING || item.state === ItemState.SETTLED;

export default class TileSpawner extends Disposable {
  constructor() {
    super();

    this.rootElement = null;
    this.itemMap = null;
    this.activeItems = null;
    this.spawnArea = null;

    this.lastSpawnTime = 0;
    this.lastItemUpdateTime = 0;
    this.spawnScale = 1;

    this.gridManager = GridPatternManager.getInstance();
    this.objectPool = ObjectPoolManager.getInstance();
  }

  init(parentElement) {
    this.rootElement = parentElement;

    this.itemMap = new GoogMap();
    this.activeItems = new GoogSet();

    const now = getTime();
    this.lastSpawnTime = now;
    this.lastItemUpdateTime = now;
    this.spawnScale = 1;

    this.spawnArea = new SpriteGroup(SPAWN_AREA_FRAME, SPAWN_AREA_OFFSET, SPAWN_AREA_OFFSET, this.rootElement);
  }

  update() {
    const now = getTime();

    this.#updateItems(now);
    this.#spawnMissingItems(now);
  }

  spawnItem(item, positions) {
    const cells = Array.isArray(positions) ? positions : [positions];

    for (const cell of cells) {
      this.itemMap.set(cell, item);
      this.activeItems.add(item);
      this.gridManager.markCell(cell);
    }

    snapPos(item, cells[0]);
    attachSpritesToContainer(item, this.rootElement);
    item.texture *= this.spawnScale;
  }

  getItem(id) {
    return this.itemMap.get(id, null);
  }

  #spawnMissingItems(now) {
    const missingCount = MAX_ACTIVE_ITEMS - this.activeItems.getCount();
    if (missingCount <= 0 || now - this.lastSpawnTime <= SPAWN_INTERVAL_MS) return;

    const spawnCount = randomInt(missingCount) + 1;

    for (let i = 0; i < spawnCount; i++) {
      const item = generateRandomItem(this.objectPool);
      const cell = item.getName() === LOOT_TABLE.steamer ? find2x2Block(this.gridManager) : selectRandomAvailableCell(this.gridManager);

      if (cell === NO_CELL) {
        item.disposeInternal();
      } else {
        this.spawnItem(item, cell);
      }
    }

    this.lastSpawnTime = now;
  }

  #updateItems(now) {
    if (now - this.lastItemUpdateTime <= ITEM_UPDATE_INTERVAL_MS) return;

    for (const item of this.activeItems.getValues()) {
      item.update?.(now);

      if (!isItemAlive(item)) {
        this.activeItems.remove(item);
        item.disposeInternal();
      }
    }

    for (const key of this.itemMap.getKeys()) {
      if (this.itemMap.get(key)?.Bc) {
        updateCellUsage(this.gridManager, key);
        this.itemMap.remove(key);
      }
    }

    this.lastItemUpdateTime = now;
  }

  disposeInternal() {
    this.activeItems?.forEach((item) => item.disposeInternal());
    this.activeItems?.clear();
    this.itemMap?.clear();
    this.spawnArea?.disposeInternal();

    super.disposeInternal();
  }
}

defineSingleton(TileSpawner);