import Disposable from '../../goog/Disposable.js';
import EventHandler from '../../goog/events/EventHandler.js';
import * as goog from '../../goog/goog.js';
import { randomInt } from '../../goog/math/math.js';
import { getKeys } from '../../goog/object/object.js';
import AudioPlayer from '../audio/AudioPlayer.js';
import AnimationSequence from '../backend/AnimationSequence.js';
import TileSpawner from '../backend/TileSpawner.js';
import VisibilityTimer from '../backend/VisibilityTimer.js';
import InputController from '../controllers/InputController.js';
import SnakeController from '../controllers/SnakeController.js';
import { NORMAL_HEAD } from '../data/Anim_Data.js';
import { BITTER, EYE_CLOSE, HAPPY_HEAD, LOST_HEAD } from '../data/Expressions.js';
import { ItemDefinitions } from '../data/Item.js';
import { LANTERN_ICONS } from '../data/LetterShapes.js';
import { initObjCounter, ObjectRegistry } from '../data/ObjectRegistry.js';
import { SCORE_DIGITS } from '../data/data.js';
import * as UI_POS from '../data/ui.js';
import { DirectionEvent } from '../events.js';
import ObjectPoolManager from '../manager/ObjectPoolManager.js';
import ClickableElement from '../objects/ClickableElement.js';
import Sprite from '../objects/Sprite.js';
import SpriteGroup from '../objects/SpriteGroup.js';
import { ScoreDisplay } from '../ui/ScoreDisplay.js';
import TimerDisplay from '../ui/TimerDisplay.js';
import { createFrameAnimation } from '../utils/AnimUtils.js';
import { generatePatternedCellSequence } from '../utils/GridUtils.js';
import { createItem, generateRandomItem } from '../utils/ItemUtils.js';
import { snapPos, attachSpritesToContainer } from '../utils/SprUtils.js';
import { createDiv, getTime, setOpacity, setPosition } from '../utils/utils.js';

let lanternSequence = [];
let phase = 0;

let snakeStepIndex = 0;
let snakeBodyVisible = 0;

const introSteps = [ // was: ye
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
    Sprite.setPosition(game.playButton, UI_POS.START_BUTTON_POS.x, UI_POS.START_BUTTON_POS.y - 80);
    game.playButton.show(true);
  });

  // Bounce animation 1
  seq.addStep(function (t) {
    Sprite.setPosition(game.playButton, UI_POS.START_BUTTON_POS.x, UI_POS.START_BUTTON_POS.y - 80 * (1 - t * t));
  }, 700);

  // Bounce animation 2
  seq.addStep(function (t) {
    Sprite.setPosition(game.playButton, UI_POS.START_BUTTON_POS.x, UI_POS.START_BUTTON_POS.y - 80 * (.25 - (.5 - t) * (.5 - t)));
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
 * Resets combo counters for all item definitions.
 * @param {GameController} game
 */
function resetComboData(game) {
  getKeys(ItemDefinitions).forEach(function (key) {
    this.comboData[key] = 0
  }, game);
}

/**
 * Switches the game to a new phase/level.
 * 
 * @param {GameController} game - The game instance.
 * @param {number} phaseId - The new phase index.
 */
function switchGamePhase(game, phaseId) {
  phase = phaseId;

  // Reset object counters for this phase
  initObjCounter(ObjectPoolManager.getInstance(), phaseId);

  // Update entity parameters from registry
  const entity = game.snake;
  entity.baseDuration = ObjectRegistry[phaseId].V;
  entity.moveDuration = entity.baseDuration * entity.speedMultiplier;
  game.TileSpawner.spawnScale = ObjectRegistry[phaseId].U;
}

/** @param {GameController} game */
function ResetGame(game) {
  game.snake.resetSpeed(getTime());
  game.state = "running";
  game.remainingTime = game.minutes;
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
    Sprite.setFrame(game.medalGroup, UI_POS.RESULT_FRAMES[(80 > game.score ? 1 : 150 > game.score ? 2 : 3) - 1]);
    game.resultUI.show(true);
    for (var i in digits) {
      if (digits[i] != null) {
        game.scoreDigits[i].show(true);
        Sprite.setFrame(game.scoreDigits[i], digits[i]);
      } else game.scoreDigits[i].show(false);
    }
  } else {
    game.resultUI = new SpriteGroup(61, UI_POS.RESULT_POS.x, UI_POS.RESULT_POS.y, game.root, 100);
    if (!game.isStandalone) {
      var replayButton = new ClickableElement(52, UI_POS.REPLAY_POS.x, UI_POS.REPLAY_POS.y, game.root, 101);
      game.eventHandler.listen(replayButton, "click", game.showGameplayUI);
      game.eventHandler.listen(replayButton, "mouseover", createFrameAnimation(replayButton, UI_POS.HOVER_FRAMES, UI_POS.REPLAY_POS, 28));
      game.eventHandler.listen(replayButton, "mouseout", createFrameAnimation(replayButton, UI_POS.OUT_FRAMES, UI_POS.REPLAY_POS, 28));
      game.resultUI.add(replayButton);
    }

    game.medalGroup = new SpriteGroup(UI_POS.RESULT_FRAMES[(80 > game.score ? 1 : 150 > game.score ? 2 : 3) - 1], UI_POS.MEDAL_POS.x, UI_POS.MEDAL_POS.y, game.root, 101);
    game.resultUI.add(game.medalGroup);
    for (let i in createDigitSprites(game.score, UI_POS.SCORE_DIGITS)) {
      const frame = digits[i];
      game.scoreDigits[i] = new SpriteGroup(frame == null ? UI_POS.TIMER_DIGITS[0] : frame, UI_POS.SCORE_POS[i].x, UI_POS.SCORE_POS[i].y, game.root, 101);
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
  game.tutorialRoot = new ClickableElement(94, UI_POS.TUTORIAL_ROOT_POS.x, UI_POS.TUTORIAL_ROOT_POS.y, game.root, 100);
  for (var key in UI_POS.TUTORIAL_BUTTON_FRAMES) {
    game.tutorialButtons[key] = new ClickableElement(UI_POS.TUTORIAL_BUTTON_FRAMES[key][0], UI_POS.TUTORIAL_BUTTON_POS[key].x, UI_POS.TUTORIAL_BUTTON_POS[key].y, game.root, 101);
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

// Generate items for a grid based on a pattern
function fillGridWithItems(obj, patternCount) {
  var sequence = generatePatternedCellSequence(obj.gridManager, patternCount);
  initObjCounter(obj.objectPool, patternCount);

  sequence.forEach(function (cell) {
    const randomItem = generateRandomItem(this.objectPool);
    spawnItem(this, randomItem, cell);
  }, obj);

  initObjCounter(obj.objectPool, phase);
}

/**
 * Spawns an item into the grid at specified positions. (ue)
 * 
 * @param {TileSpawner} tileSpawner - The TileSpawner instance managing the grid.
 * @param {Object} item - The item object to spawn.
 * @param {Point|Point[]} positions - Single position or array of positions to place the item.
 */
export function spawnItem(tileSpawner, item, positions) {
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

export default class GameController extends Disposable {
  /**
   * @param {HTMLElement} rootElement 
   */
  constructor(rootElement) {
    super();
    this.root = rootElement;
    this.lastUpdateTime = 0;

    this.gridContainer = createDiv(); // fa
    this.gridContainer.className = "grids";
    this.root.appendChild(this.gridContainer);
    setPosition(this.gridContainer, UI_POS.START_POS.x, UI_POS.START_POS.y);

    this.minutes = 6E4;

    this.state = "unstarted"; // i
    this.startTime = getTime(); // Vd
    this.remainingTime = this.minutes; // ea

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

    this.playButton = new ClickableElement(12, UI_POS.START_BUTTON_POS.x, UI_POS.START_BUTTON_POS.y, this.root, 101); // ca
    this.playButton.show(false);

    this.soundButton = new ClickableElement(90, UI_POS.SOUND_BUTTON_POS.x, UI_POS.SOUND_BUTTON_POS.y, this.root, 100); // La
    this.soundButton.show(false);

    this.muted = false; // Ka
    this.music = new AudioPlayer(["./assets/snake"]); // la

    this.mainSprite = new SpriteGroup(31, UI_POS.MAIN_SPR_POS.x, UI_POS.MAIN_SPR_POS.y, this.root, 100); // cb
    this.mainSprite.show(false);

    this.tutorialRoot = null;
    this.tutorialButtons = [];

    this.introSeq = null; // this.ec
    this.tutSeq = null; // this.fc
    this.uiSeq = null; // this.dc

    this.visibilityTimer = new VisibilityTimer(3E4, goog.bind(this.onVisibilityLost, this), goog.bind(this.onVisibilityReturn, this));
    AnimationSequence.isAnimationPaused = false;

    new SpriteGroup(19, UI_POS.BG_LEFT_POS.x, UI_POS.BG_LEFT_POS.y, this.root, 100);
    this.leftFrame = new SpriteGroup(36, UI_POS.FRAME_LEFT_POS.x + 99, UI_POS.FRAME_LEFT_POS.y, this.root, -1); // Cb
    this.rightFrame = new SpriteGroup(53, UI_POS.FRAME_RIGHT_POS.x - 99, UI_POS.FRAME_RIGHT_POS.y, this.root, -1); // Db
    this.leftFrame.show(false);
    this.rightFrame.show(false);

    this.timerDisplay = new TimerDisplay(UI_POS.TIMER_POS.x, UI_POS.TIMER_POS.y, this.root); // za
    this.timerDisplay.show(false);

    this.scoreDisplay = new ScoreDisplay(UI_POS.SCORE_DIGIT_POS, this.root); // ya

    this.icons = [];
    UI_POS.SIDE_ICON_POS.forEach(icon => function () {
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
      Sprite.setPosition(this.playButton, UI_POS.START_BUTTON_POS.x, UI_POS.START_BUTTON_POS.y + 80 * t * t);
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
      Sprite.setPosition(this.leftFrame, UI_POS.FRAME_LEFT_POS.x + 99 * (1 - t), UI_POS.FRAME_LEFT_POS.y);
      Sprite.setPosition(this.rightFrame, UI_POS.FRAME_RIGHT_POS.x - 99 * (1 - t), UI_POS.FRAME_RIGHT_POS.y);
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
      if (this.remainingTime == this.minutes) ResetGame(this);
    }
  }

  flashStartButton() {
    if ("init" == this.state) {
      this.playButton.playFrameSequence(UI_POS.playFrameAnim, 80);
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
      for (var key in UI_POS.TUTORIAL_BUTTON_FRAMES) {
        seq.addStep(createFrameAnimation(this.tutorialButtons[key], UI_POS.TUTORIAL_BUTTON_FRAMES[key], UI_POS.TUTORIAL_BUTTON_POS[key], 29));
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