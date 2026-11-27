import { initObjCounter } from './js/data/ObjectRegistry.js';
import GridPatternManager from './js/manager/GridPatternManager.js';
import ObjectPoolManager from './js/manager/ObjectPoolManager.js';
import GameController from './js/controllers/GameController.js';

var gameController = null;

/**
 * Initialization logic for the doodle
 */
function init() {
  var Logo = null;
  if (Logo = document.getElementById("hplogo")) {
    GridPatternManager.getInstance().init();
    initObjCounter(ObjectPoolManager.getInstance(), 1);
    gameController = new GameController(Logo);
  }
}
init();