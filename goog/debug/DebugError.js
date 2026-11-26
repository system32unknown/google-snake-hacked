
export default class DebugError extends Error {
  name = "CustomError";
  constructor(a) {
    this.stack = Error().stack || "";
    a && (this.message = "" + a);
  }
}