import Pools from './pools.js';
import { IE, isVersion } from '../userAgent/userAgent.js';
import { forEach, getCount, extend } from '../object/object.js';
import BrowserEvent from './BrowserEvent.js';
import Event from './Event.js';

const listeners_ = {};
const listenerTree_ = {};
const sources_ = {};
const onString_ = "on";
const onStringMap_ = {};

export const listen = function (a, b, c, d, e) {
  if (!b) throw Error("Invalid event type");
  if (goog.isArray(b)) {
    for (var f = 0; f < b.length; f++) listen(a, b[f], c, d, e);
    return null
  }

  var d = !!d, g = listenerTree_;
  b in g || (g[b] = Pools.getObject());
  g = g[b];
  d in g || (g[d] = Pools.getObject(), g.count_++);
  var g = g[d], h = goog.getUid(a), j;
  g.remaining_++;
  if (g[h]) {
    j = g[h];
    for (f = 0; f < j.length; f++)
      if (g = j[f], g.listener == c && g.handler == e) {
        if (g.removed) break;
        return j[f].key
      }
  } else j = g[h] = Pools.getArray(), g.count_++;
  f = Pools.getProxy();
  f.src = a;
  g = Pools.getListener();
  g.init(c, f, a, b, d, e);
  c = g.key;
  f.key = c;
  j.push(g);
  listeners_[c] = g;
  sources_[h] || (sources_[h] = Pools.getArray());
  sources_[h].push(g);
  a.addEventListener ? (a == document || !a.customEvent_) && a.addEventListener(b, f, d) : a.attachEvent(getOnString_(b), f);
  return c
};
export const listenOnce = function (a, b, c, d, e) {
  if (goog.isArray(b)) {
    for (var f = 0; f < b.length; f++) listenOnce(a, b[f], c, d, e);
    return null
  }
  a = listen(a, b, c, d, e);
  listeners_[a].callOnce = true;
  return a
};
export const listenWithWrapper = function (a, b, c, d, e) {
  b.listen(a, c, d, e)
};
export const unlisten = function (a, b, c, d, e) {
  if (goog.isArray(b)) {
    for (var f = 0; f < b.length; f++) unlisten(a, b[f], c, d, e);
    return null
  }
  d = !!d;
  a = getListeners_(a, b, d);
  if (!a) return false;
  for (f = 0; f < a.length; f++)
    if (a[f].listener == c && a[f].capture == d && a[f].handler == e) return unlistenByKey(a[f].key);
  return false
};
export const unlistenByKey = function (a) {
  if (!listeners_[a]) return false;
  var b = listeners_[a];
  if (b.removed) return false;
  var c = b.src,
    d = b.type,
    e = b.proxy,
    f = b.capture;
  c.removeEventListener ? (c == document || !c.customEvent_) && c.removeEventListener(d, e, f) : c.detachEvent && c.detachEvent(getOnString_(d), e);
  c = goog.getUid(c);
  e = listenerTree_[d][f][c];
  if (sources_[c]) {
    var g = sources_[c];
    goog.array.remove(g, b);
    0 == g.length && delete sources_[c];
  }
  b.removed = true;
  e.needsCleanup_ = true;
  cleanUp_(d, f, c, e);
  delete listeners_[a];
  return true
};
export const unlistenWithWrapper = function (a, b, c, d, e) {
  b.unlisten(a, c, d, e)
};
export const cleanUp_ = function (a, b, c, d) {
  if (!d.locked_ && d.needsCleanup_) {
    for (var e = 0, f = 0; e < d.length; e++)
      if (d[e].removed) {
        var g = d[e].proxy;
        g.src = null;
        Pools.releaseProxy(g);
        Pools.releaseListener(d[e])
      } else e != f && (d[f] = d[e]), f++;
    d.length = f;
    d.needsCleanup_ = false;
    if (0 == f && (Pools.releaseArray(d), delete listenerTree_[a][b][c], listenerTree_[a][b].count_--, 0 == listenerTree_[a][b].count_ && (Pools.releaseObject(listenerTree_[a][b]),
      delete listenerTree_[a][b], listenerTree_[a].count_--), 0 == listenerTree_[a].count_)) Pools.releaseObject(listenerTree_[a]), delete listenerTree_[a]
  }
};
export const removeAll = function (a, b, c) {
  var d = 0,
    e = null == b,
    f = null == c,
    c = !!c;
  if (null == a) forEach(sources_, function (a) {
    for (var g = a.length - 1; 0 <= g; g--) {
      var h = a[g];
      if ((e || b == h.type) && (f || c == h.capture)) unlistenByKey(h.key), d++
    }
  });
  else if (a = goog.getUid(a), sources_[a])
    for (var a = sources_[a], g = a.length - 1; 0 <= g; g--) {
      var h = a[g];
      if ((e || b == h.type) && (f || c == h.capture)) unlistenByKey(h.key), d++
    }
  return d
};
export const getListeners = function (a, b, c) {
  return getListeners_(a, b, c) || []
};
export const getListeners_ = function (a, b, c) {
  var d = listenerTree_;
  return b in d && (d = d[b], c in d && (d = d[c], a = goog.getUid(a), d[a])) ? d[a] : null
};
export const getListener = function (a, b, c, d, e) {
  d = !!d;
  if (a = getListeners_(a, b, d))
    for (b = 0; b < a.length; b++)
      if (a[b].listener == c && a[b].capture == d && a[b].handler == e) return a[b];
  return null
};
export const hasListener = function (a, b, c) {
  var a = goog.getUid(a),
    d = sources_[a];
  if (d) {
    var e = goog.isDef(b), f = goog.isDef(c);
    return e && f ? (d = listenerTree_[b], !!d && !!d[c] && a in d[c]) : !e && !f ? true : goog.array.some(d, function (a) {
      return e && a.type == b || f && a.capture == c
    })
  }
  return false
};
export const expose = function (a) {
  var b = [],
    c;
  for (c in a) a[c] && a[c].id ? b.push(c + " = " + a[c] + " (" + a[c].id + ")") : b.push(c + " = " + a[c]);
  return b.join("\n")
};
export const getOnString_ = function (a) {
  return a in onStringMap_ ? onStringMap_[a] : onStringMap_[a] = onString_ + a
};
export const fireListeners = function (a, b, c, d) {
  var e = listenerTree_;
  return b in e && (e = e[b], c in e) ? fireListeners_(e[c], a, b, c, d) : true
};
export const fireListeners_ = function (a, b, c, d, e) {
  var f = 1,
    b = goog.getUid(b);
  if (a[b]) {
    a.remaining_--;
    a = a[b];
    a.locked_ ? a.locked_++ : a.locked_ = 1;
    try {
      for (var g = a.length, h = 0; h < g; h++) {
        var j = a[h];
        j && !j.removed && (f &= false !== fireListener(j, e))
      }
    } finally { a.locked_--, cleanUp_(c, d, b, a) }
  }
  return Boolean(f)
};
export const fireListener = function (a, b) {
  var c = a.handleEvent(b);
  a.callOnce && unlistenByKey(a.key);
  return c
};
export const getTotalListenerCount = function () {
  return getCount(listeners_)
};
export const dispatchEvent = function (a, b) {
  if (goog.isString(b)) b = new Event(b, a);
  else if (b instanceof Event) b.target = b.target || a;
  else {
    var c = b, b = new Event(b.type, a);
    extend(b, c);
  }
  var c = 1,
    d, e = b.type,
    f = listenerTree_;
  if (!(e in f)) return true;
  var f = f[e],
    e = true in f,
    g;
  if (e) {
    d = [];
    for (g = a; g; g = g.getParentEventTarget()) d.push(g);
    g = f[true];
    g.remaining_ = g.count_;
    for (var h = d.length - 1; !b.propagationStopped_ && 0 <= h && g.remaining_; h--) b.currentTarget = d[h], c &= fireListeners_(g,
      d[h], b.type, true, b) && false != b.returnValue_
  }
  if (false in f)
    if (g = f[false], g.remaining_ = g.count_, e)
      for (h = 0; !b.propagationStopped_ && h < d.length && g.remaining_; h++) b.currentTarget = d[h], c &= fireListeners_(g, d[h], b.type, false, b) && false != b.returnValue_;
    else
      for (d = a; !b.propagationStopped_ && d && g.remaining_; d = d.getParentEventTarget()) b.currentTarget = d, c &= fireListeners_(g, d, b.type, false, b) && false != b.returnValue_;
  return Boolean(c)
};
export const protectBrowserEventEntryPoint = function (a) {
  handleBrowserEvent_ = a.protectEntryPoint(handleBrowserEvent_);
  Pools.setProxyCallbackFunction(handleBrowserEvent_);
};
export const handleBrowserEvent_ = function (a, b) {
  if (!listeners_[a]) return true;
  var c = listeners_[a],
    d = c.type,
    e = listenerTree_;
  if (!(d in e)) return true;
  var e = e[d],
    f, g;
  if (synthesizeEventPropagation_()) {
    f = b || goog.getObjectByName("window.event");
    var h = true in e,
      j = false in e;
    if (h) {
      if (isMarkedIeEvent_(f)) return true;
      markIeEvent_(f)
    }
    var k = Pools.getEvent();
    k.init(f, this);
    f = true;
    try {
      if (h) {
        for (var l = Pools.getArray(), n = k.currentTarget; n; n = n.parentNode) l.push(n);
        g = e[true];
        g.remaining_ = g.count_;
        for (var m = l.length - 1; !k.propagationStopped_ && 0 <= m && g.remaining_; m--) k.currentTarget = l[m], f &= fireListeners_(g, l[m], d, true, k);
        if (j) {
          g = e[false];
          g.remaining_ = g.count_;
          for (m = 0; !k.propagationStopped_ && m < l.length && g.remaining_; m++) k.currentTarget = l[m], f &= fireListeners_(g, l[m], d, false, k)
        }
      } else f = fireListener(c, k)
    } finally {
      l && (l.length = 0, Pools.releaseArray(l)), k.dispose(), Pools.releaseEvent(k)
    }
    return f
  }
  d = new BrowserEvent(b, this);
  try {
    f = fireListener(c, d)
  } finally {
    d.dispose()
  }
  return f
};
Pools.setProxyCallbackFunction(handleBrowserEvent_);

export const markIeEvent_ = function (a) {
  var b = false;
  if (0 == a.keyCode) try {
    a.keyCode = -1;
    return
  } catch { b = true; }
  if (b || undefined == a.returnValue) a.returnValue = true
};

export const isMarkedIeEvent_ = function (a) {
  return 0 > a.keyCode || undefined != a.returnValue
};

let uniqueIdCounter_ = 0;
export const getUniqueId = function (a) {
  return a + "_" + uniqueIdCounter_++
};

const requiresSyntheticEventPropagation_ = undefined;
export const synthesizeEventPropagation_ = function () {
  undefined === requiresSyntheticEventPropagation_ && (requiresSyntheticEventPropagation_ = IE && !document.addEventListener);
  return requiresSyntheticEventPropagation_
};

export const BrowserFeature = {
  HAS_W3C_BUTTON: !IE || isVersion("9"),
  SET_KEY_CODE_TO_PREVENT_DEFAULT: IE && !isVersion("8")
};