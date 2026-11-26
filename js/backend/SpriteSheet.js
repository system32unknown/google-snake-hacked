import ImageLoader from "./ImageLoader.js";
import { parseSpriteSheetXML, fetchTextFile, createDiv } from "../utils/utils.js";

function onImageLoaded(loader, callback) {
  loader.loaded ? callback() : loader.callbacks.push(callback);
}

export default class SpriteSheet {
  ASSET_FOLDER = "assets";

  constructor(url) {
    this.imageUrl = `${url}.png`;
    this.frameUrl = `${url}.xml`;
    this.imgPath = `./${this.ASSET_FOLDER}/${this.imageUrl}`;

    this.frames = [];
    this.isReady = false;
    this.imageLoader = new ImageLoader(this.imgPath);

    this.framesPromise = fetchTextFile(`${this.ASSET_FOLDER}/${this.frameUrl}`).then(parseSpriteSheetXML).then((frames) => this.frames = frames);
    this.framesPromise.catch(() => { });
  }

  getWidth(index) {
    return this.frames[index]?.width ?? 0;
  }

  getHeight(index) {
    return this.frames[index]?.height ?? 0;
  }

  async load(callback) {
    const imageReady = new Promise((resolve) => onImageLoaded(this.imageLoader, resolve));
    this.imageLoader.load();

    return Promise.all([imageReady, this.framesPromise]).then(() => {
      this.isReady = true;
      callback?.();
      return this;
    });
  }

  createFrame(index) {
    const frame = this.frames[index];
    const div = createDiv();
    if (frame !== undefined) {
      div.style.width = `${frame.width}px`;
      div.style.height = `${frame.height}px`;
      div.style.background = `url("${this.imgPath}") -${frame.x}px -${frame.y}px no-repeat`;
    }
    return div;
  }
}