export default class ImageLoader {
  constructor(src) {
    this.src = src;
    this.loaded = false;
    this.started = false;
    this.callbacks = [];
    this.image = new Image();
  }

  load() {
    if (this.started) return;
    this.started = true;

    const onLoad = () => {
      if (this.loaded) return;
      this.loaded = true;
      const pending = this.callbacks.splice(0);
      for (const callback of pending) callback();
    };

    this.image.onload = onLoad;
    this.image.onerror = () => {
      this.started = false;
      this.image.onload = null;
      this.image.onerror = null;
    };
    this.image.src = this.src;

    if (this.image.complete && this.image.naturalWidth > 0) onLoad();
  }
}