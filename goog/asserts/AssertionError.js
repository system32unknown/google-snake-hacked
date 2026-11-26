import DebugError from "../debug/DebugError.js";
import { subs } from "../string/string.js";

export default class AssertionError extends DebugError {
  name = "AssertionError";
  constructor(a, b) {
    b.unshift(a);
    DebugError.call(this, subs.apply(null, b));
    b.shift();
    this.messagePattern = a;
  }
}