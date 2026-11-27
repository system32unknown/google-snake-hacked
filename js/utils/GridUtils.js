import * as structs from '../../goog/structs/structs.js';
import * as GoogArray from '../../goog/array.js';
import { randomInt } from '../../goog/math/math.js';
import GoogSet from '../../goog/structs/GoogSet.js';
import GridPatternManager from '../manager/GridPatternManager.js';

const blockedCells = [0, 22, 184, 206];

/**
 * Returns a list of valid grid cell indices.
 * 
 * @param {boolean} excludeBlocked - If true, excludes blocked cell indices listed in `blockedCells`.
 * @returns {number[]} Array of valid cell indices (0–206).
 */
export function getAllGridCells(excludeBlocked = false) {
  const cells = [];
  for (let i = 0; i < 207; i++) {
    if (!excludeBlocked || !blockedCells.includes(i)) cells.push(i);
  }
  return cells;
}

/**
 * Selects a random available cell index from the grid.
 * 
 * @param {GridPatternManager} grid - The grid or cell manager.
 * @returns {number} The selected cell index, or -1 if none available.
 */
export function selectRandomAvailableCell(grid) {
  if (grid.availableCells.isEmpty()) return -1;

  const available = grid.availableCells.getValues();
  return available[randomInt(available.length)];
}

/**
 * Updates a specific cell's usage counters after an operation.
 * 
 * @param {GridPatternManager} grid - The grid or cell manager.
 * @param {number} cellIndex - The target cell index.
 * @param {boolean} isActive - Whether the operation was active (true) or passive (false).
 */
export function updateCellUsage(grid, cellIndex, isActive) {
  const cell = grid.cellMap.get(cellIndex);

  // Decrease reference counters
  cell.totalCount--;

  // If cell is now unused and not blocked, mark it as available
  if (cell.totalCount === 0 && blockedCells.indexOf(cellIndex) === -1) {
    grid.availableCells.add(cellIndex);
  }

  // Adjust active/passive counts
  if (isActive) {
    cell.specialCount--;
    if (cell.specialCount === 0) grid.activeCells.remove(cellIndex);
  } else cell.usedCount--;
}

/**
 * Returns a list of currently active cells that still have active links.
 * 
 * @param {GridPatternManager} grid - The grid or cell manager.
 * @returns {Array<number>} Active cell indices.
 */
export function getActiveLinkedCells(grid) {
  const result = new GoogSet();
  structs.forEach(grid.activeCells, (cellIndex) => {
    if (grid.cellMap.get(cellIndex).usedCount > 0) result.add(cellIndex);
  }, grid);
  return result.getValues();
}

/**
 * Finds the smallest (earliest) active cell index.
 * 
 * @param {GridPatternManager} grid - The grid or cell manager.
 * @returns {number} Minimum active cell index.
 */
export function getLowestActiveCellIndex(grid) {
  let min = Infinity;
  structs.forEach(grid.activeCells, cellIndex => {
    if (cellIndex < min) min = cellIndex;
  });
  return min;
}

/**
 * Generates a pattern-based cell sequence starting from a random available cell.
 * 
 * @param {GridPatternManager} grid - The grid or cell manager.
 * @param {string|number} patternId - The ID of the pattern to use.
 * @returns {Array<number>} Array of valid target cell indices.
 */
export function generatePatternedCellSequence(grid, patternId) {
  const startCell = selectRandomAvailableCell(grid);
  const result = [];

  GoogArray.forEach(grid.patterns[patternId], function (offset) {
    let target = (offset + startCell) % 207;
    if (this.availableCells.contains(target)) result.push(target);
  }, grid);

  return result;
}

/**
 * Finds a 2x2 block of available cells in the grid.
 * @param {GridPatternManager} gridManager - Object containing availableCells (with values method)
 * @returns {Array|number} - Array of 4 cell indices or -1 if none found
 */
export function find2x2Block(gridManager) {
  // Get all available cell indices
  const cells = gridManager.availableCells.getValues();

  // Filter cells that can form a valid 2x2 block
  const validCells = cells.filter(index => {
    // Check right and bottom neighbors exist
    const right = cells.includes(index + 1);
    const bottom = cells.includes(index + 23);
    const bottomRight = cells.includes(index + 23 + 1);

    // Prevent wrapping to next row
    const notLastColumn = index % 23 !== 22;
    return notLastColumn && right && bottom && bottomRight;
  });

  if (validCells.length === 0) return -1;

  // Pick a random starting cell
  const start = validCells[Math.floor(Math.random() * validCells.length)];

  // Return the 4 indices forming the 2x2 block
  return [start, start + 1, start + 23, start + 23 + 1];
}