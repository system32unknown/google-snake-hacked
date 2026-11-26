import ImageLoader from "./ImageLoader.js";
import { parseSpriteSheetXML, createDiv, fetchTextFile } from "../utils/utils.js";

const ASSET_FOLDER = "assets";

const whenImageLoaded = (loader) => new Promise((resolve) => loader.loaded ? resolve() : loader.callbacks.push(resolve));

export default class SpriteSheet {
  frames = [];
  isReady = false;
  #loadPromise = null;

  constructor(url) {
    this.imageUrl = `${url}.png`;
    this.frameUrl = `${url}.xml`;
    this.imgPath = `./${ASSET_FOLDER}/${this.imageUrl}`;
    this.framePath = `./${ASSET_FOLDER}/${this.frameUrl}`;
    this.imageLoader = new ImageLoader(this.imgPath);
  }

  static async create(url, callback) {
    return new SpriteSheet(url).load(callback);
  }

  getWidth(index) {
    return this.frames[index]?.width ?? 0;
  }

  getHeight(index) {
    return this.frames[index]?.height ?? 0;
  }

  async load(callback) {
    this.#loadPromise ??= this.#loadAssets().catch((error) => {
      this.#loadPromise = null;
      throw error;
    });
    await this.#loadPromise;
    callback?.();
    return this;
  }

  async #loadAssets() {
    const imageReady = whenImageLoaded(this.imageLoader);
    this.imageLoader.load();
    const [xml] = await Promise.all([fetchTextFile(this.framePath), imageReady]);
    this.frames = parseSpriteSheetXML(xml);
    this.isReady = true;
  }

  createFrame(index) {
    const div = createDiv();
    const frame = this.frames[index];
    if (!frame) return div;

    Object.assign(div.style, {
      width: `${frame.width}px`,
      height: `${frame.height}px`,
      background: `url("${this.imgPath}") -${frame.x}px -${frame.y}px no-repeat`,
    });
    return div;
  }
}