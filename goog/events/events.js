import Pools from './pools.js';
import { IE, isVersion } from '../userAgent/userAgent.js';
import { forEach, getCount, extend } from '../object/object.js';
import { remove, some } from '../array.js';
import BrowserEvent from './BrowserEvent.js';
import Event from './Event.js';
import { isArray, getUid, isDef, isString } from '../goog.js';

const listeners = {};
const listenerTree = {};
const sources = {};
const onStringCache = new Map();

let uniqueIdCounter = 0;
let requiresSyntheticPropagation;

const own = (object, key) => (Object.hasOwn(object, key) ? object[key] : undefined);
const isDocument = (target) => typeof document !== 'undefined' && target === document;
const matches = (entry, listener, capture, handler) => entry.listener === listener && entry.capture === capture && (entry.handler ?? null) === (handler ?? null);

export const getOnString_ = (type) => {
  if (!onStringCache.has(type)) onStringCache.set(type, `on${type}`);
  return onStringCache.get(type);
};

export const getUniqueId = (prefix) => `${prefix}_${uniqueIdCounter++}`;

export const synthesizeEventPropagation_ = () => {
  requiresSyntheticPropagation ??= IE && !document.addEventListener;
  return requiresSyntheticPropagation;
};

export const BrowserFeature = Object.freeze({
  HAS_W3C_BUTTON: !IE || isVersion('9'),
  SET_KEY_CODE_TO_PREVENT_DEFAULT: IE && !isVersion('8')
});

export const markIeEvent_ = (event) => {
  let useReturnValue = false;

  if (event.keyCode === 0) {
    try {
      event.keyCode = -1;
      return;
    } catch { useReturnValue = true; }
  }

  if (useReturnValue || event.returnValue === undefined) event.returnValue = true;
};

export const isMarkedIeEvent_ = (event) => event.keyCode < 0 || event.returnValue !== undefined;

export const getListeners_ = (source, type, capture) => {
  const captureNode = own(listenerTree, type)?.[capture];
  return captureNode ? own(captureNode, getUid(source)) ?? null : null;
};

export const getListeners = (source, type, capture) => getListeners_(source, type, capture) || [];

export const getListener = (source, type, listener, capture, handler) => {
  const useCapture = !!capture;
  const entries = getListeners_(source, type, useCapture);
  return entries?.find((entry) => matches(entry, listener, useCapture, handler)) ?? null;
};

export const cleanUp_ = (type, capture, sourceId, entries) => {
  if (entries.locked_ || !entries.needsCleanup_) return;

  let writeIndex = 0;
  for (let readIndex = 0; readIndex < entries.length; readIndex++) {
    const entry = entries[readIndex];

    if (entry.removed) {
      const proxy = entry.proxy;
      proxy.src = null;
      Pools.releaseProxy(proxy);
      Pools.releaseListener(entry);
    } else {
      if (readIndex !== writeIndex) entries[writeIndex] = entry;
      writeIndex++;
    }
  }

  entries.length = writeIndex;
  entries.needsCleanup_ = false;

  if (writeIndex !== 0) return;

  Pools.releaseArray(entries);

  const typeNode = listenerTree[type];
  const captureNode = typeNode[capture];

  delete captureNode[sourceId];
  captureNode.count_--;
  if (captureNode.count_ !== 0) return;

  Pools.releaseObject(captureNode);
  delete typeNode[capture];
  typeNode.count_--;
  if (typeNode.count_ !== 0) return;

  Pools.releaseObject(typeNode);
  delete listenerTree[type];
};

export const listen = (source, type, listener, capture, handler) => {
  if (!type) throw new Error('Invalid event type');

  if (isArray(type)) {
    for (const singleType of type) listen(source, singleType, listener, capture, handler);
    return null;
  }

  const useCapture = !!capture;

  let typeNode = own(listenerTree, type);
  if (!typeNode) typeNode = listenerTree[type] = Pools.getObject();

  let captureNode = own(typeNode, useCapture);
  if (!captureNode) {
    captureNode = typeNode[useCapture] = Pools.getObject();
    typeNode.count_++;
  }

  const sourceId = getUid(source);
  captureNode.remaining_++;

  let entries = captureNode[sourceId];
  if (entries) {
    for (const existing of entries) {
      if (matches(existing, listener, useCapture, handler)) {
        if (existing.removed) break;
        return existing.key;
      }
    }
  } else {
    entries = captureNode[sourceId] = Pools.getArray();
    captureNode.count_++;
  }

  const proxy = Pools.getProxy();
  proxy.src = source;

  const entry = Pools.getListener();
  entry.init(listener, proxy, source, type, useCapture, handler);

  const key = entry.key;
  proxy.key = key;

  entries.push(entry);
  listeners[key] = entry;

  if (!sources[sourceId]) sources[sourceId] = Pools.getArray();
  sources[sourceId].push(entry);

  if (source.addEventListener) {
    if (isDocument(source) || !source.customEvent_) source.addEventListener(type, proxy, useCapture);
  } else source.attachEvent(getOnString_(type), proxy);

  return key;
};

export const listenOnce = (source, type, listener, capture, handler) => {
  if (isArray(type)) {
    for (const singleType of type) listenOnce(source, singleType, listener, capture, handler);
    return null;
  }

  const key = listen(source, type, listener, capture, handler);
  listeners[key].callOnce = true;
  return key;
};

export const listenWithWrapper = (source, wrapper, listener, capture, handler) => {
  wrapper.listen(source, listener, capture, handler);
};

export const unlistenByKey = (key) => {
  const entry = listeners[key];
  if (!entry || entry.removed) return false;

  const { src, type, proxy, capture } = entry;

  if (src.removeEventListener) {
    if (isDocument(src) || !src.customEvent_) src.removeEventListener(type, proxy, capture);
  } else if (src.detachEvent) {
    src.detachEvent(getOnString_(type), proxy);
  }

  const sourceId = getUid(src);
  const entries = listenerTree[type][capture][sourceId];
  const sourceEntries = sources[sourceId];

  if (sourceEntries) {
    remove(sourceEntries, entry);
    if (sourceEntries.length === 0) delete sources[sourceId];
  }

  entry.removed = true;
  entries.needsCleanup_ = true;
  cleanUp_(type, capture, sourceId, entries);
  delete listeners[key];

  return true;
};

export const unlisten = (source, type, listener, capture, handler) => {
  if (isArray(type)) {
    for (const singleType of type) unlisten(source, singleType, listener, capture, handler);
    return null;
  }

  const useCapture = !!capture;
  const entries = getListeners_(source, type, useCapture);
  const entry = entries?.find((candidate) => matches(candidate, listener, useCapture, handler));

  return entry ? unlistenByKey(entry.key) : false;
};

export const unlistenWithWrapper = (source, wrapper, listener, capture, handler) => {
  wrapper.unlisten(source, listener, capture, handler);
};

export const removeAll = (source, type, capture) => {
  const anyType = type == null;
  const anyCapture = capture == null;
  const useCapture = !!capture;
  let count = 0;

  const removeMatching = (entries) => {
    for (let i = entries.length - 1; i >= 0; i--) {
      const entry = entries[i];
      if ((anyType || type === entry.type) && (anyCapture || useCapture === entry.capture)) {
        unlistenByKey(entry.key);
        count++;
      }
    }
  };

  if (source == null) {
    forEach(sources, (entries) => removeMatching(entries));
  } else {
    const entries = sources[getUid(source)];
    if (entries) removeMatching(entries);
  }

  return count;
};

export const hasListener = (source, type, capture) => {
  const sourceId = getUid(source);
  const entries = sources[sourceId];
  if (!entries) return false;

  const hasType = isDef(type);
  const hasCapture = isDef(capture);

  if (hasType && hasCapture) {
    const captureNode = own(listenerTree, type)?.[!!capture];
    return !!captureNode && sourceId in captureNode;
  }

  if (!hasType && !hasCapture) return true;

  return some(entries, (entry) => (hasType && entry.type === type) || (hasCapture && entry.capture === !!capture));
};

export const expose = (object) => {
  const lines = [];

  for (const key in object) {
    const value = object[key];
    lines.push(value && value.id ? `${key} = ${value} (${value.id})` : `${key} = ${value}`);
  }

  return lines.join('\n');
};

export const fireListener = (entry, event) => {
  const returnValue = entry.handleEvent(event);
  if (entry.callOnce) unlistenByKey(entry.key);
  return returnValue;
};

export const fireListeners_ = (captureNode, source, type, capture, event) => {
  let result = true;
  const sourceId = getUid(source);
  const entries = captureNode[sourceId];

  if (entries) {
    captureNode.remaining_--;
    entries.locked_ = (entries.locked_ || 0) + 1;

    try {
      const length = entries.length;
      for (let i = 0; i < length; i++) {
        const entry = entries[i];
        if (entry && !entry.removed && fireListener(entry, event) === false) result = false;
      }
    } finally {
      entries.locked_--;
      cleanUp_(type, capture, sourceId, entries);
    }
  }

  return result;
};

export const fireListeners = (source, type, capture, event) => {
  const captureNode = own(listenerTree, type)?.[capture];
  return captureNode ? fireListeners_(captureNode, source, type, capture, event) : true;
};

export const getTotalListenerCount = () => getCount(listeners);

export const dispatchEvent = (source, eventOrType) => {
  let event;

  if (isString(eventOrType)) {
    event = new Event(eventOrType, source);
  } else if (eventOrType instanceof Event) {
    event = eventOrType;
    event.target = event.target || source;
  } else {
    event = new Event(eventOrType.type, source);
    extend(event, eventOrType);
  }

  const typeNode = own(listenerTree, event.type);
  if (!typeNode) return true;

  let result = true;

  const fire = (node, target, capture) => {
    event.currentTarget = target;
    const handled = fireListeners_(node, target, event.type, capture, event);
    if (!handled || event.returnValue_ === false) result = false;
  };

  const captureNode = own(typeNode, true);
  const bubbleNode = own(typeNode, false);
  let ancestors;

  if (captureNode) {
    ancestors = [];
    for (let target = source; target; target = target.getParentEventTarget()) {
      ancestors.push(target);
    }

    captureNode.remaining_ = captureNode.count_;
    for (let i = ancestors.length - 1; !event.propagationStopped_ && i >= 0 && captureNode.remaining_; i--) {
      fire(captureNode, ancestors[i], true);
    }
  }

  if (bubbleNode) {
    bubbleNode.remaining_ = bubbleNode.count_;

    if (captureNode) {
      for (let i = 0; !event.propagationStopped_ && i < ancestors.length && bubbleNode.remaining_; i++) {
        fire(bubbleNode, ancestors[i], false);
      }
    } else {
      for (let target = source; !event.propagationStopped_ && target && bubbleNode.remaining_; target = target.getParentEventTarget()) {
        fire(bubbleNode, target, false);
      }
    }
  }

  return result;
};

export let handleBrowserEvent_ = function (key, browserEvent) {
  const entry = listeners[key];
  if (!entry) return true;

  const type = entry.type;
  const typeNode = own(listenerTree, type);
  if (!typeNode) return true;

  if (!synthesizeEventPropagation_()) {
    const wrapped = new BrowserEvent(browserEvent, this);
    try {
      return fireListener(entry, wrapped);
    } finally {
      wrapped.dispose();
    }
  }

  const nativeEvent = browserEvent || globalThis.event;
  const captureNode = own(typeNode, true);
  const bubbleNode = own(typeNode, false);

  if (captureNode) {
    if (isMarkedIeEvent_(nativeEvent)) return true;
    markIeEvent_(nativeEvent);
  }

  const wrapped = Pools.getEvent();
  wrapped.init(nativeEvent, this);

  let result = true;
  let path;

  const fire = (node, target, capture) => {
    wrapped.currentTarget = target;
    if (!fireListeners_(node, target, type, capture, wrapped)) result = false;
  };

  try {
    if (captureNode) {
      path = Pools.getArray();
      for (let node = wrapped.currentTarget; node; node = node.parentNode) path.push(node);

      captureNode.remaining_ = captureNode.count_;
      for (let i = path.length - 1; !wrapped.propagationStopped_ && i >= 0 && captureNode.remaining_; i--) {
        fire(captureNode, path[i], true);
      }

      if (bubbleNode) {
        bubbleNode.remaining_ = bubbleNode.count_;
        for (let i = 0; !wrapped.propagationStopped_ && i < path.length && bubbleNode.remaining_; i++) {
          fire(bubbleNode, path[i], false);
        }
      }
    } else result = fireListener(entry, wrapped);
  } finally {
    if (path) {
      path.length = 0;
      Pools.releaseArray(path);
    }
    wrapped.dispose();
    Pools.releaseEvent(wrapped);
  }

  return result;
};

Pools.setProxyCallbackFunction(handleBrowserEvent_);

export const protectBrowserEventEntryPoint = (entryPointRegistry) => {
  handleBrowserEvent_ = entryPointRegistry.protectEntryPoint(handleBrowserEvent_);
  Pools.setProxyCallbackFunction(handleBrowserEvent_);
};