import * as structs from '../../goog/structs/structs.js';
import * as object from '../../goog/object/object.js';
import * as GoogArray from '../../goog/array.js';
import { LetterShapes } from '../data/LetterShapes.js';
import { defineSingleton } from '../utils/utils.js';
import { getAllGridCells, getLowestActiveCellIndex } from '../utils/GridUtils.js';
import GoogSet from '../../goog/structs/GoogSet.js';
import GoogMap from '../../goog/structs/GoogMap.js';

export default class GridPatternManager {
  constructor() {
    this.cellMap = null;  // Map of cell -> usage counters (g)
    this.availableCells = null; // Set of free cells (wa)
    this.activeCells = null; // Set of active/special cells (Xa)

    this.patterns = {}; // Predefined shape patterns (Kc)
  }

  init() {
    this.cellMap = new GoogMap();
    GoogArray.forEach(getAllGridCells(), function (a) {
      this.cellMap.set(a, {
        usedCount: 0, // Gc
        specialCount: 0, // Ic
        totalCount: 0 // Jc
      })
    }, this)

    this.availableCells = new GoogSet();
    this.availableCells.addAll(getAllGridCells(true));
    this.activeCells = new GoogSet();
    object.forEach(LetterShapes, function (a, b) {
      var c = new GoogSet();
      GoogArray.forEach(a, function (a) {
        c.add(23 * a.y + a.x);
      });
      this.patterns[b] = c;
    }, this)
  }

  markCell(cellIndex, isSpecial) {
    this.availableCells.remove(cellIndex);
    const info = this.cellMap.get(cellIndex);
    info.totalCount++;

    if (isSpecial) {
      info.specialCount++;
      this.activeCells.add(cellIndex);
    } else info.usedCount++;
  }

  match() {
    var a = new GoogSet();
    var b = getLowestActiveCellIndex(this);
    structs.forEach(this.activeCells, function (c) {
      a.add(c - b);
    }, this);
    var c = "";
    object.forEach(this.patterns, function (b, e) {
      b.equals(a) && (c = e);
    });
    return c;
  }
}
defineSingleton(GridPatternManager);