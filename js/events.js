import Event from '../goog/events/Event.js'

export class DirectionEvent extends Event {
  constructor(direction) {
    super("input");
    this.direction = direction; // 1=up, 2=down, 3=left, 4=right
  }
}

export class CatchItemEvent extends Event {
  constructor(a, b) {
    super("catch item");
    this.item = a;
    this.time = b;
  }
}

export class MatchPatternEvent extends Event {
  constructor(a, b) {
    super("match pattern");
    this.pattern = a;
    this.time = b;
  }
}