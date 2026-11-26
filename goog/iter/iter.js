import Iterator from './Iterator.js';
import { assert } from '../asserts/asserts.js';
import * as GoogArray from '../array.js';

export const StopIteration = Error("StopIteration");

export const toIterator = function (a) {
  if (a instanceof Iterator) return a;
  if ("function" == typeof a.__iterator__) return a.__iterator__(!1);
  if (goog.isArrayLike(a)) {
    var b = 0, c = new Iterator;
    c.next = function () {
      for (; ;) {
        if (b >= a.length) throw StopIteration;
        if (b in a) return a[b++];
        b++
      }
    };
    return c
  }
  throw Error("Not implemented");
};
export const forEach = function (a, b, c) {
  if (goog.isArrayLike(a)) try {
    GoogArray.forEach(a, b, c)
  } catch (d) {
    if (d !== StopIteration) throw d;
  } else {
    a = toIterator(a);
    try {
      for (; ;) b.call(c, a.next(), void 0, a)
    } catch (e) {
      if (e !== StopIteration) throw e;
    }
  }
};
export const filter = function (a, b, c) {
  var a = toIterator(a), d = new Iterator;
  d.next = function () {
    for (; ;) {
      var d = a.next();
      if (b.call(c, d, void 0, a)) return d
    }
  };
  return d
};
export const range = function (a, b, c) {
  var d = 0, e = a, f = c || 1;
  1 < arguments.length && (d = a, e = b);
  if (0 == f) throw Error("Range step argument must not be zero");
  var g = new Iterator;
  g.next = function () {
    if (f > 0 && d >= e || f < 0 && d <= e) throw StopIteration;
    var a = d;
    d = d + f;
    return a
  };
  return g
};
export const join = function (a, b) {
  return toArray(a).join(b)
};
export const map = function (a, b, c) {
  var a = toIterator(a), d = new Iterator;
  d.next = function () {
    for (; ;) {
      var d = a.next();
      return b.call(c, d, void 0, a)
    }
  };
  return d
};
export const reduce = function (a, b, c, d) {
  var e = c;
  forEach(a, function (a) {
    e = b.call(d, e, a)
  });
  return e
};
export const some = function (a, b, c) {
  a = toIterator(a);
  try {
    for (; ;)
      if (b.call(c, a.next(), void 0, a)) return !0
  } catch (d) {
    if (d !== StopIteration) throw d;
  }
  return !1
};
export const every = function (a, b, c) {
  a = toIterator(a);
  try {
    for (; ;)
      if (!b.call(c, a.next(), void 0, a)) return !1
  } catch (d) {
    if (d !== StopIteration) throw d;
  }
  return !0
};
export const chain = function (a) {
  var b = arguments, c = b.length, d = 0, e = new Iterator;
  e.next = function () {
    try {
      if (d >= c) throw StopIteration;
      return toIterator(b[d]).next()
    } catch (a) {
      if (a !== StopIteration || d >= c) throw a;
      d++;
      return this.next()
    }
  };
  return e
};
export const dropWhile = function (a, b, c) {
  var a = toIterator(a),
    d = new Iterator,
    e = !0;
  d.next = function () {
    for (; ;) {
      var d = a.next();
      if (!e || !b.call(c, d, void 0, a)) return e = !1, d
    }
  };
  return d
};
export const takeWhile = function (a, b, c) {
  var a = toIterator(a),
    d = new Iterator,
    e = !0;
  d.next = function () {
    for (; ;)
      if (e) {
        var d = a.next();
        if (b.call(c, d, void 0, a)) return d;
        e = !1
      } else throw StopIteration;
  };
  return d
};
export const toArray = function (a) {
  if (goog.isArrayLike(a)) return GoogArray.toArray(a);
  var a = toIterator(a), b = [];
  forEach(a, function (a) {
    b.push(a)
  });
  return b
};
export const equals = function (a, b) {
  var a = toIterator(a), b = toIterator(b), c, d;
  try {
    for (; ;) {
      c = d = !1;
      var e = a.next();
      c = !0;
      var f = b.next();
      d = !0;
      if (e != f) break
    }
  } catch (g) {
    if (g !== StopIteration) throw g;
    if (c && !d) return !1;
    if (!d) try {
      b.next()
    } catch (h) {
      if (h !== StopIteration) throw h;
      return !0
    }
  }
  return !1
};
export const nextOrValue = function (a, b) {
  try {
    return toIterator(a).next()
  } catch (c) {
    if (c != StopIteration) throw c;
    return b
  }
};
export const product = function (a) {
  if (GoogArray.some(arguments, function (a) {
    return !a.length
  }) || !arguments.length) return new Iterator;
  var b = new Iterator, c = arguments, d = GoogArray.repeat(0, c.length);
  b.next = function () {
    if (d) {
      for (var a = GoogArray.map(d, function (a, b) {
        return c[b][a]
      }), b = d.length - 1; 0 <= b; b--) {
        assert(d);
        if (d[b] < c[b].length - 1) {
          d[b]++;
          break
        }
        if (0 == b) {
          d = null;
          break
        }
        d[b] = 0
      }
      return a
    }
    throw StopIteration;
  };
  return b
};