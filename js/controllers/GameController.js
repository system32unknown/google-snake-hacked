import Disposable from '../../goog/Disposable.js';
import EventHandler from '../../goog/events/EventHandler.js';
import { randomInt } from '../../goog/math/math.js';
import AudioPlayer from '../audio/AudioPlayer.js';
import AnimationSequence from '../backend/AnimationSequence.js';
import VisibilityTimer from '../backend/VisibilityTimer.js';
import InputController from '../controllers/InputController.js';
import SnakeController from '../controllers/SnakeController.js';
import { NORMAL_HEAD } from '../data/Anim_Data.js';
import { BITTER, BLINK, DIZZY, EYE_CLOSE, HAPPY_HEAD, LOST_HEAD, SHOCK } from '../data/Expressions.js';
import { LANTERN_ICONS } from '../data/LetterShapes.js';
import ObjectRegistry, { initObjCounter } from '../data/ObjectRegistry.js';
import { LOOT_TABLE, SCORE_DIGITS, TIMER_DIGITS } from '../data/data.js';
import * as UI_POS from '../data/ui.js';
import ObjectPoolManager from '../manager/ObjectPoolManager.js';
import TileSpawner from '../manager/TileSpawner.js';
import ClickableElement from '../objects/ClickableElement.js';
import Sprite from '../objects/Sprite.js';
import SpriteGroup from '../objects/SpriteGroup.js';
import { ScoreDisplay, createDigitSprites } from '../ui/ScoreDisplay.js';
import TimerDisplay from '../ui/TimerDisplay.js';
import { createFrameAnimation } from '../utils/AnimUtils.js';
import { generatePatternedCellSequence } from '../utils/GridUtils.js';
import { createItem, generateRandomItem } from '../utils/ItemUtils.js';
import { attachSpritesToContainer, snapPos } from '../utils/SprUtils.js';
import { createDiv, getTime, setOpacity, setPosition } from '../utils/utils.js';

const {
  START_POS,
  START_BUTTON_POS,
  SOUND_BUTTON_POS,
  MAIN_SPR_POS,
  BG_LEFT_POS,
  FRAME_LEFT_POS,
  FRAME_RIGHT_POS,
  TIMER_POS,
  SCORE_DIGIT_POS,
  SIDE_ICON_POS,
  TUTORIAL_ROOT_POS,
  TUTORIAL_BUTTON_FRAMES,
  TUTORIAL_BUTTON_POS,
  RESULT_FRAMES,
  RESULT_POS,
  REPLAY_POS,
  MEDAL_POS,
  SCORE_POS,
  HOVER_FRAMES,
  OUT_FRAMES,
  PLAY_FRAME_ANIM,
} = UI_POS;

const GameState = Object.freeze({
  UNSTARTED: 'unstarted',
  INIT: 'init',
  TUTORIAL_START: 'tutorial_start',
  TUTORIAL_END: 'tutorial_end',
  RUNNING: 'running',
  STOP: 'stop',
});

const GAME_DURATION_MS = 60000;
const MAX_FRAME_DELTA_MS = 50;
const INTRO_DELAY_MS = 1500;
const INTRO_STEP_COUNT = 38;
const INTRO_STEP_PAUSE_MS = 150;
const SEGMENT_COUNT = 15;
const MAX_SCORE = 999;
const SILVER_SCORE = 80;
const GOLD_SCORE = 150;
const PHASE_TWO_TIME_MS = 40000;
const PHASE_THREE_TIME_MS = 20000;
const RESULT_OPACITY = 0.3;
const BUTTON_FLASH_INTERVAL_MS = 3000;
const TUTORIAL_REPEAT_MS = 3000;
const TUTORIAL_BUTTON_PAUSE_MS = 300;
const EXPRESSION_DELAY_MS = 80;
const GOOGLE_WORD = 'GOOGLE';
const TRIPLE_FINAL_LENGTH = 2;
const GOOGLE_FINAL_LENGTH = 5;

const INTRO_STEPS = Object.freeze([
  { point: [3, 7], dir: 1 },
  { point: [2, 6], dir: 4 },
  { point: [4, 5], dir: 2 },
  { point: [5, 6], dir: 3 },
  { point: [3, 7], dir: 1 },
  { point: [2, 3], dir: 4 },
  { point: [4, 2], dir: 4 },
]);

const getMedalIndex = (score) => {
  if (score < SILVER_SCORE) return 0;
  return score < GOLD_SCORE ? 1 : 2;
};

function createIntroStepRunner(snake) {
  let stepIndex = 0;
  let visibleSegments = 0;

  return () => {
    const step = INTRO_STEPS[stepIndex];

    if (step) {
      const [x, y] = step.point;

      if (snake.getX() === x && snake.getY() === y) {
        snake.enqueueDirection(step.dir);
        stepIndex++;

        if (stepIndex === INTRO_STEPS.length) {
          snake.setSpeedParameters(getTime(), Infinity);
          snake.segments[0].playAnimation(EYE_CLOSE, EXPRESSION_DELAY_MS);
        }
      }
    }

    snake.forward();
    snake.updateVisualsAfterStep();

    if (visibleSegments < SEGMENT_COUNT) {
      snake.segments.forEach((segment, i) => segment.mainSprite.show(i <= visibleSegments + 1));
    }

    visibleSegments++;
  };
}

function playIntroSequence(game) {
  const seq = new AnimationSequence();
  game.uiSeq = seq;

  const runIntroStep = createIntroStepRunner(game.snake);
  const buttonY = (offset) => START_BUTTON_POS.y - offset;

  for (let i = 0; i < INTRO_STEP_COUNT; i++) {
    seq.addStep(runIntroStep);
    seq.addPauseStep(INTRO_STEP_PAUSE_MS);
  }

  seq.addPauseStep(200);
  seq.addStep(() => {
    game.mainSprite.show(true);
    Sprite.animateOpacity(game.mainSprite, 400, 0, 1);
  });

  seq.addPauseStep(600);
  seq.addStep(() => {
    Sprite.setPosition(game.playButton, START_BUTTON_POS.x, buttonY(80));
    game.playButton.show(true);
  });

  seq.addStep((t) => {
    Sprite.setPosition(game.playButton, START_BUTTON_POS.x, buttonY(80 * (1 - t * t)));
  }, 700);

  seq.addStep((t) => {
    Sprite.setPosition(game.playButton, START_BUTTON_POS.x, buttonY(80 * (0.25 - (0.5 - t) * (0.5 - t))));
  }, 700);

  seq.addStep(() => game.flashStartButton());
  seq.addStep(() => game.eventHandler.listenOnce(game.playButton, 'mousedown', game.playIntroUISequence));

  seq.play();
}

function resetComboData(game) {
  game.comboData = Object.fromEntries(Object.keys(LOOT_TABLE).map((key) => [key, 0]));
}

function switchGamePhase(game, phaseId) {
  const { V, U } = ObjectRegistry[phaseId];

  game.phase = phaseId;
  initObjCounter(game.objectPool, phaseId);

  game.snake.baseDuration = V;
  game.snake.moveDuration = V * game.snake.speedMultiplier;
  game.tileSpawner.spawnScale = U;
}

function resetGame(game) {
  game.snake.resetSpeed(getTime());
  game.state = GameState.RUNNING;
  game.remainingTime = game.gameDuration;
  switchGamePhase(game, 1);

  game.timerDisplay.update(Math.floor(game.remainingTime / 1000));
  game.timerDisplay.show(true);

  game.score = 0;
  game.scoreDisplay.update(game.score);
  game.scoreDisplay.reset();
  resetComboData(game);
  game.resetLanternSequence();

  game.icons.forEach((icon) => icon.show(false));
  game.soundButton.show(true);
  game.music.play();
  game.music.audioElement.muted = game.muted;
}

function updateIcons(game) {
  game.icons.forEach((icon, index) => {
    const key = game.lanternSequence[index];

    if (key === undefined) {
      icon.show(false);
      return;
    }

    Sprite.setFrame(icon, LANTERN_ICONS[key]);
    icon.show(true);
  });
}

function stopGame(game) {
  const digits = createDigitSprites(game.score, SCORE_DIGITS);
  const medalFrame = RESULT_FRAMES[getMedalIndex(game.score)];

  if (game.resultUI) {
    setOpacity(game.gridContainer, RESULT_OPACITY);
    Sprite.setFrame(game.medalGroup, medalFrame);
    game.resultUI.show(true);

    for (const i of Object.keys(digits)) {
      const group = game.scoreDigits[i];
      group.show(digits[i] != null);
      if (digits[i] != null) Sprite.setFrame(group, digits[i]);
    }
    return;
  }

  game.resultUI = new SpriteGroup(61, RESULT_POS.x, RESULT_POS.y, game.root, 100);

  if (!game.isStandalone) {
    const replayButton = new ClickableElement(52, REPLAY_POS.x, REPLAY_POS.y, game.root, 101);
    game.eventHandler.listen(replayButton, 'click', game.showGameplayUI);
    game.eventHandler.listen(replayButton, 'mouseover', createFrameAnimation(replayButton, HOVER_FRAMES, REPLAY_POS, 28));
    game.eventHandler.listen(replayButton, 'mouseout', createFrameAnimation(replayButton, OUT_FRAMES, REPLAY_POS, 28));
    game.resultUI.add(replayButton);
  }

  game.medalGroup = new SpriteGroup(medalFrame, MEDAL_POS.x, MEDAL_POS.y, game.root, 101);
  game.resultUI.add(game.medalGroup);

  for (const i of Object.keys(digits)) {
    const frame = digits[i];
    const group = new SpriteGroup(frame ?? TIMER_DIGITS[0], SCORE_POS[i].x, SCORE_POS[i].y, game.root, 101);

    group.show(frame != null);
    game.scoreDigits[i] = group;
    game.resultUI.add(group);
  }

  setOpacity(game.gridContainer, RESULT_OPACITY);
}

function initTutorial(game) {
  game.tutorialRoot = new ClickableElement(94, TUTORIAL_ROOT_POS.x, TUTORIAL_ROOT_POS.y, game.root, 100);

  for (const key of Object.keys(TUTORIAL_BUTTON_FRAMES)) {
    const pos = TUTORIAL_BUTTON_POS[key];
    const button = new ClickableElement(TUTORIAL_BUTTON_FRAMES[key][0], pos.x, pos.y, game.root, 101);

    game.tutorialButtons[key] = button;
    game.eventHandler.listen(button, 'click', game.handleClick);
    game.tutorialRoot.add(button);
  }

  game.state = GameState.TUTORIAL_START;
  game.eventHandler.listen(game.tutorialRoot, 'click', game.handleClick);
  game.playTutorialSequence();
}

function hideTutorialUI(game) {
  if (!game.tutorialRoot) return;

  Sprite.fadeOut(game.tutorialRoot);
  Object.values(game.tutorialButtons).forEach((button) => Sprite.fadeOut(button));
  game.tutorialRoot.show(false);
}

function resetDisplay(display) {
  Object.values(display.digitSprites).forEach((sprite) => sprite.show(false));
  display.animation?.stop();
  display.backgroundSprite.show(false);
  display.effectSprites.forEach((sprite) => sprite.show(false));
}

export function spawnItem(tileSpawner, item, positions) {
  const cells = Array.isArray(positions) ? positions : [positions];

  for (const cell of cells) {
    tileSpawner.itemMap.set(cell, item);
    tileSpawner.activeItems.add(item);
    tileSpawner.gridManager.markCell(cell);
  }

  snapPos(item, cells[0]);
  attachSpritesToContainer(item, tileSpawner.rootElement);
  item.texture *= tileSpawner.spawnRate;
}

function fillGridWithItems(game, patternCount) {
  const { tileSpawner, objectPool } = game;
  const cells = generatePatternedCellSequence(tileSpawner.gridManager, patternCount);

  initObjCounter(objectPool, patternCount);
  cells.forEach((cell) => spawnItem(tileSpawner, generateRandomItem(objectPool), cell));
  initObjCounter(objectPool, game.phase);
}

let lastUpdateTime = 0;
export default class GameController extends Disposable {
  #rafId = 0;
  #flashTimer = null;
  #tutorialTimer = null;

  constructor(rootElement) {
    super();

    this.root = rootElement;
    this.isStandalone = Boolean(rootElement?.standalone);

    this.gridContainer = createDiv();
    this.gridContainer.className = 'grids';
    this.root.appendChild(this.gridContainer);
    setPosition(this.gridContainer, START_POS.x, START_POS.y);

    this.gameDuration = GAME_DURATION_MS;
    this.state = GameState.UNSTARTED;
    this.phase = 0;
    this.startTime = getTime();
    this.remainingTime = this.gameDuration;

    this.score = 0;
    this.comboData = {};
    this.lanternSequence = [];
    this.lanternForward = true;
    this.completedCombos = 0;

    this.medalGroup = null;
    this.resultUI = null;
    this.scoreDigits = [];

    this.tileSpawner = TileSpawner.getInstance();
    this.tileSpawner.init(this.gridContainer);
    this.snake = new SnakeController(this.gridContainer);

    this.input = new InputController(true);
    this.eventHandler = new EventHandler(this);
    this.objectPool = ObjectPoolManager.getInstance();

    this.playButton = new ClickableElement(12, START_BUTTON_POS.x, START_BUTTON_POS.y, this.root, 101);
    this.playButton.show(false);

    this.soundButton = new ClickableElement(90, SOUND_BUTTON_POS.x, SOUND_BUTTON_POS.y, this.root, 100);
    this.soundButton.show(false);

    this.muted = false;
    this.music = new AudioPlayer(['./assets/snake']);

    this.mainSprite = new SpriteGroup(31, MAIN_SPR_POS.x, MAIN_SPR_POS.y, this.root, 100);
    this.mainSprite.show(false);

    this.tutorialRoot = null;
    this.tutorialButtons = {};

    this.introSeq = null;
    this.tutSeq = null;
    this.uiSeq = null;

    this.visibilityTimer = new VisibilityTimer(30000, () => this.onVisibilityLost(), () => this.onVisibilityReturn());
    AnimationSequence.isAnimationPaused = false;

    new SpriteGroup(19, BG_LEFT_POS.x, BG_LEFT_POS.y, this.root, 100);
    this.leftFrame = new SpriteGroup(36, FRAME_LEFT_POS.x + 99, FRAME_LEFT_POS.y, this.root, -1);
    this.rightFrame = new SpriteGroup(53, FRAME_RIGHT_POS.x - 99, FRAME_RIGHT_POS.y, this.root, -1);
    this.leftFrame.show(false);
    this.rightFrame.show(false);

    this.timerDisplay = new TimerDisplay(TIMER_POS.x, TIMER_POS.y, this.root);
    this.timerDisplay.show(false);

    this.scoreDisplay = new ScoreDisplay(SCORE_DIGIT_POS, this.root);

    this.icons = SIDE_ICON_POS.map(({ x, y }) => {
      const sprite = new Sprite(33);
      sprite.show(false);
      Sprite.setPosition(sprite, x, y);
      this.root.appendChild(sprite.getElement());
      return sprite;
    });

    this.eventHandler.listen(this.input, 'input', this.handleInput);
    this.eventHandler.listen(this.snake, 'catch item', this.handleItemCollected);
    this.eventHandler.listen(this.snake, 'match pattern', this.handlePatternMatch);
    this.eventHandler.listen(this.soundButton, 'click', this.toggleMute);

    this.snake.init();
    this.initialize();
  }

  initialize() {
    lastUpdateTime = getTime();
    this.#rafId = requestAnimationFrame(this.gameLoop);
  }

  playIntroUISequence = () => {
    this.music.load(false);
    this.visibilityTimer.resetTimer();

    const seq = new AnimationSequence();
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

    seq.addStep(() => initTutorial(this));
    seq.play();
  };

  onVisibilityLost() {
    if (this.state !== GameState.RUNNING) return;

    const { snake } = this;
    this.music.pause();
    snake.currentFrame = LOST_HEAD;
    Sprite.setFrame(snake.segments[0].getSprite(), snake.currentFrame);
    initTutorial(this);
  }

  onVisibilityReturn() {
    if (this.state !== GameState.TUTORIAL_START && this.state !== GameState.TUTORIAL_END) return;

    const { snake } = this;
    this.music.play();
    snake.currentFrame = NORMAL_HEAD;
    Sprite.setFrame(snake.segments[0].getSprite(), snake.currentFrame);
    this.state = GameState.RUNNING;
    hideTutorialUI(this);

    if (this.remainingTime === this.gameDuration) resetGame(this);
  }

  flashStartButton() {
    if (this.state !== GameState.INIT) return;

    this.playButton.playFrameSequence(PLAY_FRAME_ANIM, EXPRESSION_DELAY_MS);
    clearTimeout(this.#flashTimer);
    this.#flashTimer = setTimeout(() => this.flashStartButton(), BUTTON_FLASH_INTERVAL_MS);
  }

  handleItemCollected(evt) {
    const item = this.tileSpawner.getItem(evt.item);
    if (!item) return;

    const isCollectable = item.state === 1 || item.baseY < item.mainSprite.getHeight();

    if (!isCollectable) {
      item.shadowSprite.show(false);
      item.mainSprite.setZIndex(1);
      return;
    }

    const name = item.getName();
    const { snake } = this;
    const head = snake.segments[0];

    this.comboData[name] = (this.comboData[name] ?? 0) + 1;
    this.score = Math.min(this.score + item.score, MAX_SCORE);

    switch (name) {
      case LOOT_TABLE.firecraker:
        if (snake.Yc == null) {
          head.playAnimation(SHOCK, EXPRESSION_DELAY_MS);
          head.playAnimation(DIZZY, 100, 500, 100);
          snake.setSpeedParameters(evt.time, Infinity);
        }
        break;

      case LOOT_TABLE.tea:
        head.playAnimation(BLINK, EXPRESSION_DELAY_MS, 500);
        snake.setSpeedParameters(evt.time, 0.1);
        snake.currentFrame = HAPPY_HEAD;
        break;

      case LOOT_TABLE.medicine:
        head.playAnimation(BLINK, EXPRESSION_DELAY_MS, 500);
        snake.setSpeedParameters(evt.time, 1.5);
        snake.currentFrame = BITTER;
        break;

      case LOOT_TABLE.mushroom:
        snake.reverseMove(evt.time);
        break;

      case LOOT_TABLE.lantern:
        this.#handleLantern(item);
        break;
    }

    item.disposeInternal();
    this.scoreDisplay.update(this.score);
  }

  #handleLantern(item) {
    const combo = this.processLanternCombo(item);

    if (combo) {
      const { tileSpawner } = this;
      for (let i = 0; i < combo.length; i++) spawnItem(tileSpawner, createItem(LOOT_TABLE.steamer), find2x2Block(tileSpawner.gridManager));
      if (combo.length === GOOGLE_WORD.length) fillGridWithItems(this, combo[randomInt(combo.length)]);
    }

    updateIcons(this);
  }

  resetLanternSequence() {
    this.lanternSequence = [];
    this.lanternForward = true;
  }

  processLanternCombo(item) {
    const value = item.variantKey;
    const sequence = this.lanternSequence;
    let completed = '';

    if (sequence.length === 1) {
      if (value === sequence[0]) {
        this.lanternForward = true;
      } else if (sequence[0] === GOOGLE_WORD[0] && value === GOOGLE_WORD[1]) {
        this.lanternForward = false;
      } else {
        this.resetLanternSequence();
      }
    } else if (sequence.length > 1) {
      const expected = this.lanternForward ? sequence[0] : GOOGLE_WORD[sequence.length];
      const finalLength = this.lanternForward ? TRIPLE_FINAL_LENGTH : GOOGLE_FINAL_LENGTH;

      if (value !== expected) {
        this.resetLanternSequence();
      } else if (sequence.length === finalLength) {
        completed = [...sequence, value].join('');
        this.resetLanternSequence();
        this.completedCombos++;
      }
    }

    if (!completed) this.lanternSequence.push(value);
    return completed;
  }

  handlePatternMatch(evt) {
    if (evt.pattern !== '') fillGridWithItems(this, evt.pattern);
  }

  handleInput(input) {
    this.visibilityTimer.resetTimer();

    if (this.state === GameState.TUTORIAL_END) {
      hideTutorialUI(this);
      resetGame(this);
    } else if (this.state === GameState.RUNNING) {
      this.snake.enqueueDirection(input.direction);
    }
  }

  handleClick() {
    this.visibilityTimer.resetTimer();

    if (this.state === GameState.TUTORIAL_END) {
      hideTutorialUI(this);
      resetGame(this);
    }
  }

  playTutorialSequence() {
    if (this.state !== GameState.TUTORIAL_START && this.state !== GameState.TUTORIAL_END) return;

    const seq = new AnimationSequence();
    this.tutSeq = seq;

    for (const key of Object.keys(TUTORIAL_BUTTON_FRAMES)) {
      seq.addStep(createFrameAnimation(this.tutorialButtons[key], TUTORIAL_BUTTON_FRAMES[key], TUTORIAL_BUTTON_POS[key], 29));
      seq.addPauseStep(TUTORIAL_BUTTON_PAUSE_MS);
    }

    seq.addStep(() => {
      if (this.state === GameState.TUTORIAL_START) this.state = GameState.TUTORIAL_END;
    });

    seq.play();

    clearTimeout(this.#tutorialTimer);
    this.#tutorialTimer = setTimeout(() => this.playTutorialSequence(), TUTORIAL_REPEAT_MS);
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
    resetGame(this);
  }

  gameLoop = () => {
    const currentTime = getTime();
    const deltaTime = Math.min(MAX_FRAME_DELTA_MS, currentTime - lastUpdateTime);

    if (this.state === GameState.RUNNING) {
      this.update(deltaTime, currentTime);
    } else if (this.state === GameState.UNSTARTED && currentTime - this.startTime > INTRO_DELAY_MS) {
      this.state = GameState.INIT;
      playIntroSequence(this);
    }

    this.#rafId = requestAnimationFrame(this.gameLoop);
    lastUpdateTime = currentTime;
  };

  update(deltaTime, currentTime) {
    this.tileSpawner.update(deltaTime);
    this.snake.move(currentTime);
    this.scoreDisplay.processPendingEffects(currentTime);
    this.timerDisplay.update(Math.floor(this.remainingTime / 1000));

    this.remainingTime -= deltaTime;

    if (this.phase === 1 && this.remainingTime < PHASE_TWO_TIME_MS) {
      switchGamePhase(this, 2);
    } else if (this.phase === 2 && this.remainingTime < PHASE_THREE_TIME_MS) {
      switchGamePhase(this, 3);
    }

    if (this.remainingTime < 0 && this.state === GameState.RUNNING) {
      this.state = GameState.STOP;
      stopGame(this);

      this.timerDisplay.show(false);
      resetDisplay(this.scoreDisplay);

      this.icons.forEach((sprite) => sprite.show(false));
      this.music.load(false);
    }
  }

  disposeInternal() {
    this.state = GameState.STOP;

    cancelAnimationFrame(this.#rafId);
    clearTimeout(this.#flashTimer);
    clearTimeout(this.#tutorialTimer);

    this.eventHandler.disposeInternal();
    [this.introSeq, this.tutSeq, this.uiSeq].forEach((seq) => seq?.stop());
    AnimationSequence.isAnimationPaused = true;

    this.comboData = null;
    this.timerDisplay.disposeInternal();
    this.scoreDisplay.disposeInternal();
    this.tileSpawner.disposeInternal();
    this.snake.disposeInternal();
    this.input.disposeInternal();
    this.soundButton.disposeInternal();
    this.visibilityTimer.disposeInternal();

    super.disposeInternal();
  }
}