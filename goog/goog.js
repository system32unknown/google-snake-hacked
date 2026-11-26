/**
 * Determines the type of a value.
 * @param {*} a - The value to check.
 * @returns {string} The type string (e.g., 'array', 'function', 'object').
 */
export function typeOf(a) {
  var b = typeof a;
  if (b == "object")
    if (a) {
      if (a instanceof Array || !(a instanceof Object) && Object.prototype.toString.call(a) == "[object Array]" || typeof a.length == "number" && typeof a.splice != "undefined" && typeof a.propertyIsEnumerable != "undefined" && !a.propertyIsEnumerable("splice")) return "array";
      if (!(a instanceof Object) && (Object.prototype.toString.call(a) == "[object Function]" || typeof a.call != "undefined" && typeof a.propertyIsEnumerable != "undefined" && !a.propertyIsEnumerable("call"))) return "function"
    } else return "null";
  else if (b == "function" && typeof a.call == "undefined") return "object";
  return b
};

export const isDef = function (a) {
  return a !== undefined
};
export const isArray = function (a) {
  return typeOf(a) == "array"
};
export const isArrayLike = function (a) {
  var b = typeOf(a);
  return b == "array" || b == "object" && typeof a.length == "number"
};
export const isDateLike = function (a) {
  return  isObject(a) && typeof a.getFullYear == "function"
};
export const isString = function (a) {
  return typeof a == "string"
};
export const isBoolean = function (a) {
  return typeof a == "boolean"
};
export const isNumber = function (a) {
  return typeof a == "number"
};
export const isFunction = function (a) {
  return typeOf(a) == "function"
};
export const isObject = function (a) {
  a = typeOf(a);
  return a == "object" || a == "array" || a == "function"
};

export const getUid = function (a) {
  return a[UID_PROPERTY_] || (a[UID_PROPERTY_] = ++uidCounter_);
};
export const removeUid = function (a) {
  "removeAttribute" in a && a.removeAttribute(UID_PROPERTY_);
  try {
    delete a[UID_PROPERTY_];
  } catch { }
};

export const dispose = function (a) {
  a && "function" == typeof a.dispose && a.dispose()
};
export const nullFunction = function () { };

const UID_PROPERTY_ = "closure_uid_" + Math.floor(2147483648 * Math.random()).toString(36);
const uidCounter_ = 0;

const bindNative_ = function (a, b, c) {
  return a.call.apply(a.bind, arguments)
};

const bindJs_ = function (a, b, c) {
  var d = b;
  if (arguments.length > 2) {
    var e = Array.prototype.slice.call(arguments, 2);
    return function () {
      var b = Array.prototype.slice.call(arguments);
      Array.prototype.unshift.apply(b, e);
      return a.apply(d, b)
    }
  }
  return function () {
    return a.apply(d, arguments)
  }
};
export const bind = function () {
  bind = Function.prototype.bind && Function.prototype.bind.toString().indexOf("native code") != -1 ? bindNative_ : bindJs_;
  return bind.apply(null, arguments)
};

export const partial = function (a, b) {
	var c = Array.prototype.slice.call(arguments, 1);
	return function () {
		var b = Array.prototype.slice.call(arguments);
		b.unshift.apply(b, c);
		return a.apply(this, b)
	}
};

export const getObjectByName = function (a, b) {
	for (var c = a.split("."), d = b, e; e = c.shift();)
		if (d[e] != null) d = d[e];
		else return null;
	return d
};