import { defineSingleton } from "../utils/utils.js";

export default class ObjectPoolManager {
  constructor() {
    this.objects = {};
    this.count = 0;
  }
}
defineSingleton(ObjectPoolManager);