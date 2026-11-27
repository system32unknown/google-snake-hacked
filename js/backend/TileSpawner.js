import Disposable from '../../goog/Disposable.js';
import { randomInt } from '../../goog/math/math.js';
import GoogMap from '../../goog/structs/GoogMap.js';
import GoogSet from '../../goog/structs/GoogSet.js';
import { spawnItem } from '../controllers/GameController.js';
import GridPatternManager from '../manager/GridPatternManager.js';
import ObjectPoolManager from '../manager/ObjectPoolManager.js';
import SpriteGroup from '../objects/SpriteGroup.js';
import { selectRandomAvailableCell, updateCellUsage } from '../utils/GridUtils.js';
import { generateRandomItem } from '../utils/ItemUtils.js';
import { defineSingleton, getTime } from '../utils/utils.js';

export default class TileSpawner extends Disposable { // se
  constructor() {
    super();

    this.rootElement = null; // was: v
    this.itemMap = null; // was: Ra (Map)
    this.activeItems = null; // was: Ca (Set)
    this.lastSpawnTime = null; // was: Ec
    this.spawnScale = 1; // was: vc

    this.gridManager = GridPatternManager.getInstance();  // was: g
    this.objectPool = ObjectPoolManager.getInstance();    // was: bb
  }

  init(parentElement) {
    this.rootElement = parentElement;

    this.itemMap = new GoogMap(); // stores all items by ID (Ra)
    this.activeItems = new GoogSet(); // stores active items (Ca)

    this.lastSpawnTime = getTime();
    this.spawnRate = 1;

    this.spawnArea = new SpriteGroup(88, -3, -3, this.rootElement);
  }

  /** Original name: jb */
  update(deltaTime) {
    updateItems(this, deltaTime);

    const now = getTime();

    let missingItemCount = 8 - this.activeItems.getCount();
    if (now - this.lastSpawnTime > 2500 && missingItemCount > 0) {
      // number of items to spawn this tick
      for (let i = 0; i < randomInt(missingItemCount) + 1; i++) {
        const item = generateRandomItem(this.objectPool);

        // special logic for "steamer"
        let spawnCell = -1;
        spawnCell = (item.getName() === "steamer") ? find2x2Block(this.gridManager) : selectRandomAvailableCell(this.gridManager);
        if (spawnCell !== -1) spawnItem(this, item, spawnCell);
      }

      this.lastSpawnTime = now;
    }
  }

  getItem(id) {
    return this.itemMap.get(id, null);
  }

  disposeInternal() {
    this.activeItems.forEach((item) => item.disposeInternal()); // dispose

    this.activeItems.clear();
    this.itemMap.clear();
    this.spawnArea.disposeInternal();

    super.disposeInternal();
  }
}
defineSingleton(TileSpawner);

/**
 * Update items and remove inactive ones.
 * @param {TileSpawner} obj 
 * @param {number} currentTime 
 * @returns 
 */
function updateItems(obj, currentTime) {
  if (currentTime - obj.lastSpawnTime <= 40) return;

  // Update each item in Ca
  obj.activeItems.forEach(function (item) {
    if (item.update !== undefined) item.update(currentTime);

    // Remove items that are not in states 0 or 1
    if (item.i !== 0 && item.i !== 1) {
      obj.activeItems.remove(item);
      item.disposeInternal();
    }
  }, obj);

  // Update Ra cells
  obj.itemMap.forEach(function (cell, key) {
    if (cell.Bc) {
      updateCellUsage(obj.gridManager, key);
      obj.itemMap.remove(key);
    }
  }, obj);

  obj.lastSpawnTime = currentTime;
}