import MediaSequence from './MediaSequence.js';
import { listen } from '../../goog/events/events.js';

export default class AudioPlayer extends MediaSequence {
  /**
   * @param {string[]} audioPaths
   * @param {HTMLElement=} parent
   */
  constructor(audioPaths, parent) {
    super();

    this.items = audioPaths; // pb
    this.audioElement = null; // H
    this.parent = parent || document.body; // Dc
    this.autoplay = false; // Cc

    this.onLoadedCallback = null; // Lb
    this.onPlayCallback = null; // Wa
    this.lastLoadedIndex = this.index; // ud
  }

  disposeInternal() {
    this.pause();
    this.autoplay = false;
    this.onPlayCallback = this.onLoadedCallback = null;

    if (this.audioElement) this.parent.removeChild(this.audioElement);
    super.disposeInternal();
  }

  /**Triggered when audio is ready to play. (wd)*/
  handleCanPlay() {
    this.isLoaded = true;
    if (this.onLoadedCallback) this.onLoadedCallback();

    if (this.autoplay && !this.isPlaying) {
      this.play(this.onPlayCallback);
    }
  }

  /**Triggered when audio ends. (Ce)*/
  handleEnded() {
    this.isPlaying = false;
    if (this.onPlayCallback) this.onPlayCallback();
  }

  /**Load the current audio item.*/
  load(autoplay, onLoaded = null, onPlay = null) {
    this.autoplay = autoplay;
    this.onLoadedCallback = onLoaded;
    this.onPlayCallback = onPlay;

    // If we already loaded this track earlier
    if (this.audioElement && this.lastLoadedIndex === this.index) {
      if (this.isLoaded) {
        this.pause();
        this.audioElement.currentTime = 0;
        this.handleCanPlay();
      }
      return;
    }

    // Replace old audio element
    if (this.audioElement) {
      this.parent.removeChild(this.audioElement);
    }

    this.isLoaded = false;
    this.audioElement = document.createElement("audio");
    this.audioElement.setAttribute("controls", "false");
    this.audioElement.setAttribute("preload", "auto");
    this.audioElement.style.display = "none";

    // Events
    listen(this.audioElement, "canplay", this.handleCanPlay, false, this);
    listen(this.audioElement, "ended", this.handleEnded, false, this);

    // Build source
    const source = document.createElement("source");
    source.setAttribute("src", this.items[this.index] + '.mp3');
    source.setAttribute("type", 'audio/mpeg');
    this.audioElement.appendChild(source);

    this.parent.appendChild(this.audioElement);
    this.lastLoadedIndex = this.index;
  }

  play(onPlay = null) {
    if (this.isLoaded && !this.isPlaying) {
      this.onPlayCallback = onPlay;
      this.audioElement.play();
      this.isPlaying = true;
    }
  }

  pause() {
    if (this.isPlaying) {
      this.audioElement.pause();
      this.isPlaying = false;
    }
  }

  getCurrentTime() {
    return this.isPlaying ? this.audioElement.currentTime : 0;
  }
}