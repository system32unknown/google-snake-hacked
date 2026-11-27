import { Coordinate as Point } from './goog/math/Coordinate.js';
import { forEach } from './goog/array.js';
import { randomInt } from './goog/math/math.js';
import { getKeys } from './goog/object/object.js';
import * as goog from './goog/goog.js';
import { DirectionEvent } from './js/events.js';
import Disposable from './goog/Disposable.js';
import GoogSet from './goog/structs/GoogSet.js';
import GoogMap from './goog/structs/GoogMap.js';
import EventHandler from './goog/events/EventHandler.js';
import { getTime, setPosition, createDiv, defineSingleton } from './js/utils/utils.js';
import { updateCellUsage, selectRandomAvailableCell, generatePatternedCellSequence } from './js/utils/GridUtils.js';
import { AnimatedFallingEntity, StaticVariantEntity, ShadowedEntity, MovingEntity, RandomMovingEntity, LanternEntity } from './js/entites.js';
import AudioPlayer from './js/audio/AudioPlayer.js';
import InputController from './js/controllers/InputController.js';
import ObjectPoolManager from './js/manager/ObjectPoolManager.js';
import GridPatternManager from './js/manager/GridPatternManager.js';
import AnimationSequence from './js/backend/AnimationSequence.js';
import VisibilityTimer from './js/backend/VisibilityTimer.js';
import GridEntity from './js/objects/GridEntity.js';
import Sprite from './js/objects/Sprite.js';
import SpriteGroup from './js/objects/SpriteGroup.js';
import SnakeController from './js/controllers/SnakeController.js';
import ClickableElement from './js/objects/ClickableElement.js';
import { SCORE_DIGITS, TIMER_DIGITS, LOOT_TABLE } from './js/data/data.js';
import { ScoreDisplay, createDigitSprites } from './js/ui/ScoreDisplay.js';
import TimerDisplay from './js/ui/TimerDisplay.js';
import { NORMAL_HEAD } from './js/data/Anim_Data.js';
import { HAPPY_HEAD, BITTER, LOST_HEAD, EYE_CLOSE } from './js/data/Expressions.js';
import ObjectRegistry from './js/data/ObjectRegistry.js';

var minutes = 6E4;

var ItemDefinitions = {}; // Registry of base item data
var ItemClasses = null; // Registry mapping item names to their constructors

function setOpacity(el, value) {
  const s = el.style;
  if ('opacity' in s) s.opacity = value;
  else if ('MozOpacity' in s) s.MozOpacity = value;
  else if ('filter' in s) s.filter = value === "" ? "" : `alpha(opacity=${value * 100})`;
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
var LANTERN_ICONS = {
  G: 33,
  O: 35,
  L: 34,
  E: 32
}

/** @param {ScoreDisplay} obj */
function resetDisplay(obj) {
  Object.values(obj.digitSprites).forEach(child => child.show(false))

  // Stop active animation
  if (obj.animation) obj.animation.stop();

  // Hide main and side elements
  obj.backgroundSprite.show(false);
  obj.effectSprites[0].show(false);
  obj.effectSprites[1].show(false);
}

function attachSpritesToContainer(entity, container) {
  container.appendChild(entity.mainSprite.getElement());
  container.appendChild(entity.shadowSprite.getElement());
}

function snapPos(entity, idx) {
  entity.tileIndex = idx;
  entity.renderPosition();
}

var lanternSequence = [];

// Item factory
function createItem(name) {
  if (!(name in ItemDefinitions) || !(name in ItemClasses))
    return new GridEntity(ItemDefinitions.coin);
  return new ItemClasses[name](ItemDefinitions[name]);
}

/**
 * Weighted random loot generator
 * @param {ObjectPoolManager} pool 
 * @returns 
 */
function generateRandomItem(pool) {
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

class Item {
  constructor(grid, name, texture, score = 0, data = null) {
    this.grid = grid; // Reference to grid or item container
    this.name = name; // Name/type of the item
    this.texture = texture; // Resource or sprite handle
    this.score = score; // Optional numeric field
    this.data = data; // Optional linked object or metadata
  }
}

function initializeObjectCounter(target, typeId) {
  target.count = 0;
  target.objects = (typeId in ObjectRegistry) ? ObjectRegistry[typeId].data : ObjectRegistry[1].data;
  forEach(target.objects, function (value) {
    this.count += value;
  }, target)
}

var phase = 1;

/**
 * Finds a 2x2 block of available cells in the grid.
 * @param {GridPatternManager} gridManager - Object containing availableCells (with values method)
 * @returns {Array|number} - Array of 4 cell indices or -1 if none found
 */
function find2x2Block(gridManager) {
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

class TileSpawner extends Disposable { // se
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

// Generate items for a grid based on a pattern
function fillGridWithItems(obj, patternCount) {
  var sequence = generatePatternedCellSequence(obj.gridManager, patternCount);
  initializeObjectCounter(obj.objectPool, patternCount);

  sequence.forEach(function (cell) {
    const randomItem = generateRandomItem(this.objectPool);
    spawnItem(this, randomItem, cell);
  }, obj);

  initializeObjectCounter(obj.objectPool, phase);
}

/**
 * Spawns an item into the grid at specified positions. (ue)
 * 
 * @param {TileSpawner} tileSpawner - The TileSpawner instance managing the grid.
 * @param {Object} item - The item object to spawn.
 * @param {Point|Point[]} positions - Single position or array of positions to place the item.
 */
function spawnItem(tileSpawner, item, positions) {
  var addItemToGrid = (it, pos) => {
    tileSpawner.itemMap.set(pos, it); // Map grid position → item
    tileSpawner.activeItems.add(it); // Track active items
    tileSpawner.gridManager.markCell(pos); // Mark cell as occupied
  }

  if (Array.isArray(positions)) {
    positions.forEach(pos => addItemToGrid.call(tileSpawner, item, pos));
    snapPos(item, positions[0]);
    console.log("Cell" + positions);
  } else {
    addItemToGrid.call(tileSpawner, item, positions);
    snapPos(item, positions);
    console.log("Cell" + positions);
  }

  attachSpritesToContainer(item, tileSpawner.rootElement);
  item.texture *= tileSpawner.spawnRate; // Apply spawn rate multiplier
}

var snakeStepIndex = 0;
var snakeBodyVisible = 0;
var introSteps = [ // was: ye
  { point: [3, 7], dir: 1 },
  { point: [2, 6], dir: 4 },
  { point: [4, 5], dir: 2 },
  { point: [5, 6], dir: 3 },
  { point: [3, 7], dir: 1 },
  { point: [2, 3], dir: 4 },
  { point: [4, 2], dir: 4 }
];

/** @param {SnakeController} snake */
function runIntroStep(snake) {
  const step = introSteps[snakeStepIndex];
  const point = step.point;

  if (snake.getY() === point[1] && snake.getX() === point[0]) {
    snake.enqueueDirection(step.dir);

    snakeStepIndex++;

    // If reached end of tutorial steps
    if (snakeStepIndex === introSteps.length) {
      snake.setSpeedParameters(getTime(), Infinity);
      snake.segments[0].playAnimation(EYE_CLOSE, 80);
    }
  }

  // Move forward and update animation
  snake.forward();
  snake.updateVisualsAfterStep(); // was: Ce(a)

  // Gradually show more segments (max 15)
  if (snakeBodyVisible < 15) {
    for (let i = 0; i < 15; i++) {
      snake.segments[i].mainSprite.show(i <= snakeBodyVisible + 1);
    }
  }
  snakeBodyVisible++;
}

class GameController extends Disposable {
  lastUpdateTime = 0;

  /**
   * @param {HTMLElement} rootElement 
   */
  constructor(rootElement) {
    super();
    this.root = rootElement;

    this.gridContainer = createDiv(); // fa
    this.gridContainer.className = "grids";
    this.root.appendChild(this.gridContainer);
    setPosition(this.gridContainer, START_POS.x, START_POS.y);

    this.state = "unstarted"; // i
    this.startTime = getTime(); // Vd
    this.remainingTime = minutes; // ea

    this.score = 0; // score (z)
    this.comboData = {}; // $b
    this.medalGroup = null;
    this.resultUI = null;
    this.scoreDigits = [];

    this.TileSpawner = TileSpawner.getInstance(); // ka
    this.TileSpawner.init(this.gridContainer);
    this.snake = new SnakeController(this.gridContainer); // N

    this.input = new InputController(true); // Zc
    this.eventHandler = new EventHandler(this); // B
    this.objectPool = ObjectPoolManager.getInstance(); // bb

    this.playButton = new ClickableElement(12, START_BUTTON_POS.x, START_BUTTON_POS.y, this.root, 101); // ca
    this.playButton.show(false);

    this.soundButton = new ClickableElement(90, SOUND_BUTTON_POS.x, SOUND_BUTTON_POS.y, this.root, 100); // La
    this.soundButton.show(false);

    this.muted = false; // Ka
    this.music = new AudioPlayer(["./assets/snake"]); // la

    this.mainSprite = new SpriteGroup(31, MAIN_SPR_POS.x, MAIN_SPR_POS.y, this.root, 100); // cb
    this.mainSprite.show(false);

    this.tutorialRoot = null;
    this.tutorialButtons = [];

    this.introSeq = null; // this.ec
    this.tutSeq = null; // this.fc
    this.uiSeq = null; // this.dc

    this.visibilityTimer = new VisibilityTimer(3E4, goog.bind(this.onVisibilityLost, this), goog.bind(this.onVisibilityReturn, this));
    AnimationSequence.isAnimationPaused = false;

    new SpriteGroup(19, BG_LEFT_POS.x, BG_LEFT_POS.y, this.root, 100);
    this.leftFrame = new SpriteGroup(36, FRAME_LEFT_POS.x + 99, FRAME_LEFT_POS.y, this.root, -1); // Cb
    this.rightFrame = new SpriteGroup(53, FRAME_RIGHT_POS.x - 99, FRAME_RIGHT_POS.y, this.root, -1); // Db
    this.leftFrame.show(false);
    this.rightFrame.show(false);

    this.timerDisplay = new TimerDisplay(TIMER_POS.x, TIMER_POS.y, this.root); // za
    this.timerDisplay.show(false);

    this.scoreDisplay = new ScoreDisplay(SCORE_DIGIT_POS, this.root); // ya

    this.icons = [];
    SIDE_ICON_POS.forEach(icon => function () {
      const sprite = new Sprite(33);
      sprite.show(false);
      Sprite.setPosition(sprite, icon.x, icon.y);
      this.root.appendChild(sprite.getElement());
      this.icons.push(sprite);
    });

    this.eventHandler.listen(this.input, "input", this.handleInput);
    this.eventHandler.listen(this.snake, "catch item", this.handleItemCollected);
    this.eventHandler.listen(this.snake, "match pattern", this.handlePatternMatch);
    this.eventHandler.listen(this.soundButton, "click", this.toggleMute);

    this.isStandalone = !!(rootElement && rootElement.standalone);

    this.snake.init();
    this.initialize();
  }

  initialize() {
    this.lastUpdateTime = getTime();
    requestAnimationFrame(this.gameLoop.bind(this));
  }

  playIntroUISequence = () => {
    this.music.load(false);
    this.visibilityTimer.resetTimer();

    let seq = new AnimationSequence();
    this.introSeq = seq;

    seq.addStep(() => Sprite.fadeOut(this.mainSprite));
    seq.addStep((t) => {
      Sprite.setPosition(this.playButton, START_BUTTON_POS.x, START_BUTTON_POS.y + 80 * t * t);
      setOpacity(this.playButton.getElement(), 1 - t * t);
    }, 700);
    seq.addPauseStep(200);

    seq.addStep(() => {
      this.mainSprite.show(false);
      this.playButton.show(false);
      setOpacity(this.gridContainer, 1);
    });

    seq.addStep(() => {
      this.leftFrame.show(true);
      this.rightFrame.show(true);
    });

    seq.addStep((t) => {
      Sprite.setPosition(this.leftFrame, FRAME_LEFT_POS.x + 99 * (1 - t), FRAME_LEFT_POS.y);
      Sprite.setPosition(this.rightFrame, FRAME_RIGHT_POS.x - 99 * (1 - t), FRAME_RIGHT_POS.y);
    }, 1000);

    seq.addStep(() => {
      Sprite.animateOpacity(this.soundButton, 500, 0, 1);
      this.soundButton.show(true);
    });

    seq.addStep(() => {
      initTutorial(this);
    });

    seq.play();
  }

  onVisibilityLost() {
    if ("running" == this.state) {
      this.music.pause();

      var snake = this.snake;
      snake.currentFrame = LOST_HEAD;
      Sprite.setFrame(snake.segments[0].getSprite(), snake.currentFrame);
      initTutorial(this);
    }
  }
  onVisibilityReturn() {
    if ("tutorial_start" == this.state || "tutorial_end" == this.state) {
      this.music.play();

      var snake = this.snake;
      snake.currentFrame = NORMAL_HEAD;
      Sprite.setFrame(snake.segments[0].getSprite(), snake.currentFrame);
      this.state = "running";
      hideTutorialUI(this);
      if (this.remainingTime == minutes) ResetGame(this);
    }
  }

  flashStartButton() {
    if ("init" == this.state) {
      this.playButton.playFrameSequence(playFrameAnim, 80);
      setTimeout(goog.bind(this.flashStartButton, this), 3E3);
    }
  }

  handleItemCollected(evt) {
    let itemData = this.TileSpawner.getItem(evt.item);
    if (!itemData) return;

    if (itemData.i === 1 || itemData.cc < itemData.mainSprite.getHeight()) {
      let name = itemData.getName();

      this.comboData[name]++;
      console.log("Snake eaten " + name);

      this.score = Math.min(this.score + itemData.score, 999);

      switch (name) {
        case "firecraker":
          var snake = this.snake;
          if (snake.Yc == null) {
            snake.segments[0].playAnimation(SHOCK, 80);
            snake.segments[0].playAnimation(DIZZY, 100, 500, 100);
            snake.setSpeedParameters(evt.time, Infinity);
          }
          break;
        case "tea":
          var snake = this.snake;
          snake.segments[0].playAnimation(BLINK, 80, 500);
          snake.setSpeedParameters(evt.time, 0.1);
          snake.frameId = HAPPY_HEAD;
          break;
        case "medicine":
          var snake = this.snake;
          snake.segments[0].playAnimation(BLINK, 80, 500);
          snake.setSpeedParameters(evt.time, 1.5);
          snake.frameId = BITTER;
          break;
        case "mushroom":
          snake.reverseMove(evt.time);
          break;
        case "lantern":
          let comboStr = this.processLanternCombo(itemData);
          if (comboStr) {
            let spawner = this.TileSpawner;
            for (let i = 0; i < comboStr.length; i++)
              spawnItem(spawner, createItem("steamer"), find2x2Block(spawner.gridManager));

            if (comboStr.length === 6) fillGridWithItems(spawner, comboStr[randomInt(comboStr.length)]);
          }
          updateIcons(this);
          break;
      }

      itemData.destroy();
      this.scoreDisplay.update(this.score);
    } else {
      itemData.shadowSprite.show(false);
      itemData.mainSprite.setZIndex(1);
    }
  }

  processLanternCombo(itemData) {
    var completedCombo = "";
    var sequence = lanternSequence;
    var value = itemData.variantKey;

    const GOOGLE_WORD = "GOOGLE";

    if (sequence.length === 1) {
      if (value === sequence[0]) {
        sequenceDirection = true;
      } else if (sequence[0] === GOOGLE_WORD[0] && value === GOOGLE_WORD[1]) {
        sequenceDirection = false;
      } else {
        lanternSequence = [];
        sequenceDirection = true;
      }
    } else if (sequence.length) {
      if ((sequenceDirection && value === sequence[0]) || (!sequenceDirection && value === GOOGLE_WORD[sequence.length])) {
        if ((sequenceDirection && sequence.length === 2) || (!sequenceDirection && sequence.length === 5)) {
          sequence.push(value);
          lanternSequence = [];
          sequenceDirection = true;
          completedSequences++;

          completedCombo = sequence.join("");
        }
      } else {
        lanternSequence = [];
        sequenceDirection = true;
      }
    }

    if (!completedCombo) lanternSequence.push(value);
    return completedCombo;
  }

  handlePatternMatch(evt) {
    const pattern = evt.pattern;
    if (pattern !== "") fillGridWithItems(this.TileSpawner, pattern);
  }

  /** @param {DirectionEvent} input */
  handleInput(input) {
    this.visibilityTimer.resetTimer();
    if ("tutorial_end" == this.state) {
      hideTutorialUI(this);
      ResetGame(this);
    } else if ("running" == this.state) this.snake.enqueueDirection(input.direction);
  }

  handleClick() {
    this.visibilityTimer.resetTimer();
    if ("tutorial_end" == this.state) {
      hideTutorialUI(this);
      ResetGame(this);
    }
  }

  playTutorialSequence() {
    if ("tutorial_start" == this.state || "tutorial_end" == this.state) {
      var seq = new AnimationSequence();
      this.tutSeq = seq;
      for (var key in TUTORIAL_BUTTON_FRAMES) {
        seq.addStep(createFrameAnimation(this.tutorialButtons[key], TUTORIAL_BUTTON_FRAMES[key], TUTORIAL_BUTTON_POS[key], 29));
        seq.addPauseStep(300);
      }
      seq.addStep(goog.bind(function () {
        if ("tutorial_start" == this.state) this.state = "tutorial_end";
      }, this));
      seq.play();
      setTimeout(this.playTutorialSequence, 3E3);
    }
  }
  toggleMute() {
    this.visibilityTimer.resetTimer();
    this.muted = !this.muted;
    Sprite.setFrame(this.soundButton, this.muted ? 89 : 90);
    this.music.audioElement.muted = this.muted;
  }

  showGameplayUI() {
    setOpacity(this.gridContainer, 1);
    this.resultUI.show(false);
    ResetGame(this);
  }

  gameLoop() {
    var currentTime = getTime();
    let deltaTime = Math.min(50, currentTime - this.lastUpdateTime);

    switch (this.state) {
      case "running":
        this.update(deltaTime, currentTime);
        break;
      case "unstarted":
        if (currentTime - this.startTime > 1500) {
          this.state = "init";
          playIntroSequence(this);
        }
        break;
    }

    requestAnimationFrame(goog.bind(this.gameLoop, this));
    this.lastUpdateTime = currentTime;
  }

  /**
   * Updates the current game state per frame.
   * 
   * @param {GameController} game - The main game controller.
   * @param {number} deltaTime - Time passed since last frame.
   * @param {number} currentTime - Current game time.
   */
  update(deltaTime, currentTime) {
    // Update managers
    this.TileSpawner.update(deltaTime);
    this.snake.move(currentTime);
    this.scoreDisplay.processPendingEffects(currentTime);
    this.timerDisplay.update(Math.floor(this.remainingTime / 1000));

    // Countdown timer
    this.remainingTime -= deltaTime;

    // Check for phase transitions
    if (phase === 1 && this.remainingTime < 40000) {
      switchGamePhase(this, 2);
    } else if (phase === 2 && this.remainingTime < 20000) {
      switchGamePhase(this, 3);
    }

    // Time over condition
    if (this.remainingTime < 0 && this.state === "running") {
      this.state = "stop";
      stopGame(this);

      this.timerDisplay.show(false);
      resetDisplay(this.scoreDisplay);

      this.icons.forEach((sprite) => sprite.show(false));
      this.music.load(false);
    }
  }

  disposeInternal() {
    this.state = "stop";
    this.eventHandler.disposeInternal();
    if (this.introSeq) this.introSeq.stop();
    if (this.tutSeq) this.tutSeq.stop();
    if (this.uiSeq) this.uiSeq.stop();
    AnimationSequence.isAnimationPaused = true;
    this.comboData = null;
    this.timerDisplay.disposeInternal();
    this.scoreDisplay.disposeInternal();
    this.TileSpawner.disposeInternal();
    this.snake.disposeInternal();
    this.input.disposeInternal();
    this.soundButton.disposeInternal();
    this.visibilityTimer.disposeInternal();
    super.disposeInternal();
  }
}

const START_BUTTON_POS = new Point(309, 79);
const SOUND_BUTTON_POS = new Point(625, 125);
const MAIN_SPR_POS = new Point(256, 46);
const RESULT_POS = new Point(164, 36);
const REPLAY_POS = new Point(425, 110);
const MEDAL_POS = new Point(212, 80);
const RESULT_FRAMES = [91, 92, 93];
const SCORE_POS = [new Point(415, 82), new Point(397, 82), new Point(379, 82)]; // yf
const BG_LEFT_POS = new Point(96, 6); // mf
const START_POS = new Point(110, 20); // jf
const FRAME_LEFT_POS = new Point(4, 46); // nf
const FRAME_RIGHT_POS = new Point(577, 46); // of
const TIMER_POS = new Point(43, 103); // pf
const SCORE_DIGIT_POS = [new Point(640, 103), new Point(629, 103), new Point(618, 103), new Point(607, 103), new Point(596, 103), new Point(585, 103)];
const SIDE_ICON_POS = [new Point(6, 127), new Point(6, 143), new Point(22, 143), new Point(5, 159), new Point(22, 159), new Point(38, 159)]; //rf
const TUTORIAL_ROOT_POS = new Point(294, 44);
const TUTORIAL_BUTTON_POS = [new Point(387, 81), new Point(387, 115), new Point(353, 115), new Point(420, 115)];
const TUTORIAL_BUTTON_FRAMES = [
  [98, 102, 106, 102, 98],
  [95, 99, 103, 99, 95],
  [96, 100, 104, 100, 96],
  [97, 101, 105, 101, 97]
];
const playFrameAnim = [12, 13, 14, 15, 16, 17, 18];
const HOVER_FRAMES = [51, 50];
const OUT_FRAMES = [51, 52];

/**
 * Switches the game to a new phase/level.
 * 
 * @param {GameController} game - The game instance.
 * @param {number} phaseId - The new phase index.
 */
function switchGamePhase(game, phaseId) {
  phase = phaseId;

  // Reset object counters for this phase
  initializeObjectCounter(ObjectPoolManager.getInstance(), phaseId);

  // Update entity parameters from registry
  const entity = game.snake;
  entity.baseDuration = ObjectRegistry[phaseId].V;
  entity.moveDuration = entity.baseDuration * entity.speedMultiplier;
  game.TileSpawner.spawnScale = ObjectRegistry[phaseId].U;
}

/**
 * Plays the game's intro animation sequence.
 * @param {GameController} game - The game controller.
 */
function playIntroSequence(game) {
  var seq = new AnimationSequence();
  game.uiSeq = seq;

  // Animate entity 38 times with short pauses
  for (let i = 1; i < 39; i++) {
    seq.addStep(goog.bind(runIntroStep, game, game.snake));
    seq.addPauseStep(150);
  }

  // Fade in secondary sprite
  seq.addPauseStep(200);
  seq.addStep(function () {
    game.mainSprite.show(true);
    Sprite.animateOpacity(game.mainSprite, 400, 0, 1);
  });

  seq.addPauseStep(600);
  seq.addStep(function () {
    Sprite.setPosition(game.playButton, START_BUTTON_POS.x, START_BUTTON_POS.y - 80);
    game.playButton.show(true);
  });

  // Bounce animation 1
  seq.addStep(function (t) {
    Sprite.setPosition(game.playButton, START_BUTTON_POS.x, START_BUTTON_POS.y - 80 * (1 - t * t));
  }, 700);

  // Bounce animation 2
  seq.addStep(function (t) {
    Sprite.setPosition(game.playButton, START_BUTTON_POS.x, START_BUTTON_POS.y - 80 * (.25 - (.5 - t) * (.5 - t)));
  }, 700);

  // Run "ready" callback
  seq.addStep(() => game.flashStartButton());

  // Add click handler
  seq.addStep(goog.bind(function () {
    this.eventHandler.listenOnce(this.playButton, "mousedown", this.playIntroUISequence)
  }, game));
  seq.play();
}

/**
 * @param {Sprite} sprite 
 * @param {number[]|number} frames 
 * @param {Point[]|Point} position 
 * @param {number} offsetY 
 */
function createFrameAnimation(sprite, frames, position, offsetY) {
  return function () {
    const anim = new AnimationSequence();
    frames.forEach(frame => {
      anim.addStep(() => {
        Sprite.setFrame(sprite, frame);
        Sprite.setPosition(sprite, position.x, position.y + offsetY - sprite.getHeight());
      });
      anim.addPauseStep(80);
    });
    anim.play();
  }
}

/** @param {GameController} game */
function ResetGame(game) {
  game.snake.resetSpeed(getTime());
  game.state = "running";
  game.remainingTime = minutes;
  switchGamePhase(game, 1);

  game.timerDisplay.update(Math.floor(game.remainingTime / 1E3));
  game.timerDisplay.show(true);

  game.score = 0;
  game.scoreDisplay.update(game.score);
  game.scoreDisplay.reset();
  resetComboData(game);

  lanternSequence = [];

  game.icons.forEach(icon => icon.show(false));
  game.soundButton.show(true);
  game.music.play();
  game.music.audioElement.muted = game.muted;
}

/**
 * Resets combo counters for all item definitions.
 * @param {GameController} game
 */
function resetComboData(game) {
  getKeys(ItemDefinitions).forEach(function (key) {
    this.comboData[key] = 0
  }, game);
}

/**
 * Updates the icon sprites to match the current sequence.
 * @param {GameController} game
 */
function updateIcons(game) {
  game.icons.forEach(function (icon, index) {
    if (index < lanternSequence.length) {
      Sprite.setFrame(icon, LANTERN_ICONS[lanternSequence[index]]);
      icon.show(true);
    } else icon.show(false);
  })
}

/** @param {GameController} game */
function stopGame(game) {
  var digits = createDigitSprites(game.score, SCORE_DIGITS);
  if (game.resultUI) {
    setOpacity(game.gridContainer, .3);
    Sprite.setFrame(game.medalGroup, RESULT_FRAMES[(80 > game.score ? 1 : 150 > game.score ? 2 : 3) - 1]);
    game.resultUI.show(true);
    for (var i in digits) {
      if (digits[i] != null) {
        game.scoreDigits[i].show(true);
        Sprite.setFrame(game.scoreDigits[i], digits[i]);
      } else game.scoreDigits[i].show(false);
    }
  } else {
    game.resultUI = new SpriteGroup(61, RESULT_POS.x, RESULT_POS.y, game.root, 100);
    if (!game.isStandalone) {
      var replayButton = new ClickableElement(52, REPLAY_POS.x, REPLAY_POS.y, game.root, 101);
      game.eventHandler.listen(replayButton, "click", game.showGameplayUI);
      game.eventHandler.listen(replayButton, "mouseover", createFrameAnimation(replayButton, HOVER_FRAMES, REPLAY_POS, 28));
      game.eventHandler.listen(replayButton, "mouseout", createFrameAnimation(replayButton, OUT_FRAMES, REPLAY_POS, 28));
      game.resultUI.add(replayButton);
    }

    game.medalGroup = new SpriteGroup(RESULT_FRAMES[(80 > game.score ? 1 : 150 > game.score ? 2 : 3) - 1], MEDAL_POS.x, MEDAL_POS.y, game.root, 101);
    game.resultUI.add(game.medalGroup);
    for (let i in createDigitSprites(game.score, SCORE_DIGITS)) {
      const frame = digits[i];
      game.scoreDigits[i] = new SpriteGroup(frame == null ? TIMER_DIGITS[0] : frame, SCORE_POS[i].x, SCORE_POS[i].y, game.root, 101);
      if (frame == null) {
        game.scoreDigits[i].show(false);
        game.resultUI.add(game.scoreDigits[i]);
      }
    }
    setOpacity(game.gridContainer, .3)
  }
}

/** @param {GameController} game */
function initTutorial(game) {
  game.tutorialRoot = new ClickableElement(94, TUTORIAL_ROOT_POS.x, TUTORIAL_ROOT_POS.y, game.root, 100);
  for (var key in TUTORIAL_BUTTON_FRAMES) {
    game.tutorialButtons[key] = new ClickableElement(TUTORIAL_BUTTON_FRAMES[key][0], TUTORIAL_BUTTON_POS[key].x, TUTORIAL_BUTTON_POS[key].y, game.root, 101);
    game.eventHandler.listen(game.tutorialButtons[key], "click", game.handleClick);
    game.tutorialRoot.add(game.tutorialButtons[key]);
  }
  game.state = "tutorial_start";
  game.eventHandler.listen(game.tutorialRoot, "click", game.handleClick);
  game.playTutorialSequence()
}

/** @param {GameController} game */
function hideTutorialUI(game) {
  Sprite.fadeOut(game.tutorialRoot);
  game.tutorialButtons.forEach((a) => Sprite.fadeOut(a));
  game.tutorialRoot.show(false)
}

let Logo = null;
var gameController = null;

/**
 * Initialization logic for the doodle
 */
function init() {
  if (Logo = document.getElementById("hplogo")) {
    // Build level / wave presets (W)
    GridPatternManager.getInstance().init();

    // Build reverse mapping Xd from keys in Zd to some default T, then override some
    var enumObj = LOOT_TABLE;
    var reverseMap = {};
    for (var enumKey in enumObj) reverseMap[enumObj[enumKey]] = GridEntity;
    reverseMap[enumObj.firecraker] = AnimatedFallingEntity;
    reverseMap[enumObj.dumpling] = StaticVariantEntity;
    reverseMap[enumObj.steamer] = ShadowedEntity;
    reverseMap[enumObj.papercut] = RandomMovingEntity;
    reverseMap[enumObj.envelope] = MovingEntity;
    reverseMap[enumObj.lantern] = LanternEntity;
    ItemClasses = reverseMap;

    // Build item definitions (Wd)
    var itemDefs = {};
    itemDefs[enumObj.firecraker] = new Item([ITEM_IDS.FIRECRACKER], enumObj.firecraker, 5000);
    itemDefs[enumObj.dumpling] = new Item([ITEM_IDS.DUMPLING1, ITEM_IDS.DUMPLING2], enumObj.dumpling, 7000, 2);
    itemDefs[enumObj.steamer] = new Item([ITEM_IDS.STEAMER], enumObj.steamer, 7000, 10);
    itemDefs[enumObj.tea] = new Item([ITEM_IDS.TEA1, ITEM_IDS.TEA2], enumObj.tea, 6000, 2, true);
    itemDefs[enumObj.medicine] = new Item([ITEM_IDS.MEDICINE], enumObj.medicine, 6000, 2, false);
    itemDefs[enumObj.papercut] = new Item([ITEM_IDS.PAPERCUT1, ITEM_IDS.PAPERCUT2], enumObj.papercut, 6000, 5);
    itemDefs[enumObj.envelope] = new Item([ITEM_IDS.ENVELOPE], enumObj.envelope, 7000, 2);
    itemDefs[enumObj.mushroom] = new Item([ITEM_IDS.MUSHROOM], enumObj.mushroom, 7000, 1, false);
    itemDefs[enumObj.lantern] = new Item([ITEM_IDS.LANTERNG, ITEM_IDS.LANTERNO, ITEM_IDS.LANTERNL, ITEM_IDS.LANTERNE], enumObj.lantern, 8000, 2);
    itemDefs[enumObj.coin] = new Item([ITEM_IDS.COIN], enumObj.coin, 10000, 1);
    itemDefs[enumObj.ingot] = new Item([ITEM_IDS.INGOT], enumObj.ingot, 5000, 5);
    ItemDefinitions = itemDefs;

    initializeObjectCounter(ObjectPoolManager.getInstance(), 1);

    // Create controller/handler for the logo DOM element
    gameController = new GameController(Logo);
  }
}

init(); // Execute the initialization