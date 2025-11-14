LISTENER_MAP_PROP_ = 'closure_lm_' + ((Math.random() * 1e6) | 0);

onString_ = 'on';
onStringMap_ = {};

listenerCountEstimate_ = 0;

listen = function (src, type, listener, opt_options, opt_handler) {
    if (opt_options && opt_options.once) {
        return listenOnce(src, type, listener, opt_options, opt_handler);
    }
    if (Array.isArray(type)) {
        for (var i = 0; i < type.length; i++) {
            listen(src, type[i], listener, opt_options, opt_handler);
        }
        return null;
    }

    listener = wrapListener(listener);
    if (Listenable.isImplementedBy(src)) {
        var capture = goog.isObject(opt_options) ? !!opt_options.capture : !!opt_options;
        return src.listen(listener, capture, opt_handler);
    } else {
        return listen_(type, listener, false, opt_options, opt_handler);
    }
};

listen_ = function (src, type, listener, callOnce, opt_options, opt_handler) {
    if (!type) throw new Error('Invalid event type');

    var capture = goog.isObject(opt_options) ? !!opt_options.capture : !!opt_options;

    var listenerMap = getListenerMap_(src);
    if (!listenerMap) {
        src[LISTENER_MAP_PROP_] = listenerMap = new ListenerMap(src);
    }

    var listenerObj = listenerMap.add(type, listener, callOnce, capture, opt_handler);
    if (listenerObj.proxy) {
        return listenerObj;
    }

    var proxy = getProxy();
    listenerObj.proxy = proxy;
    proxy.src = src;
    proxy.listener = listenerObj;

    if (src.addEventListener) {
        if (!BrowserFeature.PASSIVE_EVENTS) {
            opt_options = capture;
        }

        if (opt_options === undefined) opt_options = false;
        src.addEventListener(type.toString(), proxy, opt_options);
    } else if (src.attachEvent) {
        src.attachEvent(getOnString_(type.toString()), proxy);
    } else if (src.addListener && src.removeListener) {
        assert(type === 'change', 'MediaQueryList only has a change event');
        src.addListener(proxy);
    } else {
        throw new Error('addEventListener and attachEvent are unavailable.');
    }

    listenerCountEstimate_++;
    return listenerObj;
};

getProxy = function () {
    const proxyCallbackFunction = handleBrowserEvent_;
    const f = function (eventObject) {
        return proxyCallbackFunction.call(f.src, f.listener, eventObject);
    };
    return f;
};

listenOnce = function (
    src, type, listener, opt_options, opt_handler) {

    if (Array.isArray(type)) {
        for (var i = 0; i < type.length; i++) {
            listenOnce(src, type[i], listener, opt_options, opt_handler);
        }
        return null;
    }

    listener = wrapListener(listener);
    if (Listenable.isImplementedBy(src)) {
        var capture = goog.isObject(opt_options) ? !!opt_options.capture : !!opt_options;
        return src.listenOnce(type, listener, capture, opt_handler);
    } else {
        return listen_(src, type, listener, true, opt_options, opt_handler);
    }
};

listenWithWrapper = function (src, wrapper, listener, opt_capt, opt_handler) {
    wrapper.listen(src, listener, opt_capt, opt_handler);
};

unlisten = function (src, type, listener, opt_options, opt_handler) {
    if (Array.isArray(type)) {
        for (var i = 0; i < type.length; i++) {
            unlisten(src, type[i], listener, opt_options, opt_handler);
        }
        return null;
    }
    var capture = goog.isObject(opt_options) ? !!opt_options.capture : !!opt_options;

    listener = wrapListener(listener);
    if (Listenable.isImplementedBy(src)) {
        return src.unlisten(type, listener, capture, opt_handler);
    }

    if (!src) return false;

    var listenerMap = getListenerMap_(src);
    if (listenerMap) {
        var listenerObj = listenerMap.getListener(type, listener, capture, opt_handler);
        if (listenerObj) return unlistenByKey(listenerObj);
    }

    return false;
};

unlistenByKey = function (key) {
    if (typeof key === 'number') {
        return false;
    }

    var listener = key;
    if (!listener || listener.removed) return false;

    var src = listener.src;
    if (Listenable.isImplementedBy(src)) {
        return src.unlistenByKey(listener);
    }

    var type = listener.type;
    /** @suppress {strictMissingProperties} Added to tighten compiler checks */
    var proxy = listener.proxy;
    if (src.removeEventListener) {
        src.removeEventListener(type, proxy, listener.capture);
    } else if (src.detachEvent) {
        src.detachEvent(getOnString_(type), proxy);
    } else if (src.addListener && src.removeListener) {
        src.removeListener(proxy);
    }
    listenerCountEstimate_--;

    var listenerMap = getListenerMap_(src);
    if (listenerMap) {
        listenerMap.removeByKey(listener);
        if (listenerMap.getTypeCount() == 0) {
            listenerMap.src = null;
            src[LISTENER_MAP_PROP_] = null;
        }
    } else listener.markAsRemoved();

    return true;
};

unlistenWithWrapper = function (src, wrapper, listener, opt_capt, opt_handler) {
    wrapper.unlisten(src, listener, opt_capt, opt_handler);
};

removeAll = function (obj, opt_type) {
    if (!obj) return 0;
    if (Listenable.isImplementedBy(obj)) {
        return obj.removeAllListeners(opt_type);
    }

    var listenerMap = getListenerMap_(obj);
    if (!listenerMap) return 0;

    var count = 0;
    var typeStr = opt_type && opt_type.toString();
    for (var type in listenerMap.listeners) {
        if (!typeStr || type == typeStr) {
            var listeners = listenerMap.listeners[type].concat();
            for (var i = 0; i < listeners.length; ++i) {
                if (unlistenByKey(listeners[i])) {
                    ++count;
                }
            }
        }
    }
    return count;
};

getListeners = function (obj, type, capture) {
    if (Listenable.isImplementedBy(obj)) {
        return obj.getListeners(type, capture);
    } else {
        if (!obj) return [];
        var listenerMap = getListenerMap_(obj);
        return listenerMap ? listenerMap.getListeners(type, capture) : [];
    }
};

getListener = function (src, type, listener, opt_capt, opt_handler) {
    type = type;
    listener = wrapListener(listener);
    var capture = !!opt_capt;
    if (Listenable.isImplementedBy(src)) {
        return src.getListener(type, listener, capture, opt_handler);
    }

    if (!src) return null;

    var listenerMap = getListenerMap_(src);
    if (listenerMap) {
        return listenerMap.getListener(type, listener, capture, opt_handler);
    }
    return null;
};

var hasListener = function (obj, opt_type, opt_capture) {
    if (Listenable.isImplementedBy(obj)) {
        return obj.hasListener(opt_type, opt_capture);
    }

    var listenerMap = getListenerMap_(obj);
    return !!listenerMap && listenerMap.hasListener(opt_type, opt_capture);
};

var expose = function (e) {
    var str = [];
    for (var key in e) {
        if (e[key] && e[key].id) {
            str.push(key + ' = ' + e[key] + ' (' + e[key].id + ')');
        } else {
            str.push(key + ' = ' + e[key]);
        }
    }
    return str.join('\n');
};

var getOnString_ = function (type) {
    if (type in onStringMap_) return onStringMap_[type];
    return onStringMap_[type] = onString_ + type;
};

var fireListeners = function (obj, type, capture, eventObject) {
    if (Listenable.isImplementedBy(obj)) {
        return obj.fireListeners(type, capture, eventObject);
    }

    return fireListeners_(obj, type, capture, eventObject);
};

var fireListeners_ = function (obj, type, capture, eventObject) {
    var retval = true;

    var listenerMap = getListenerMap_(obj);
    if (listenerMap) {
        var listenerArray = listenerMap.listeners[type.toString()];
        if (listenerArray) {
            listenerArray = listenerArray.concat();
            for (var i = 0; i < listenerArray.length; i++) {
                var listener = listenerArray[i];

                if (listener && listener.capture == capture && !listener.removed) {
                    var result = fireListener(listener, eventObject);
                    retval = retval && (result !== false);
                }
            }
        }
    }
    return retval;
};

var fireListener = function (listener, eventObject) {
    var listenerFn = listener.listener;
    var listenerHandler = listener.handler || listener.src;

    if (listener.callOnce) unlistenByKey(listener);
    return listenerFn.call(listenerHandler, eventObject);
};

var getTotalListenerCount = function () {
    return listenerCountEstimate_;
};

var dispatchEvent = function (src, e) {
    assert(Listenable.isImplementedBy(src), 'Can not use dispatchEvent with Listenable instance.');
    return src.dispatchEvent(e);
};

var protectBrowserEventEntryPoint = function (errorHandler) {
    handleBrowserEvent_ = errorHandler.protectEntryPoint(handleBrowserEvent_);
};

var handleBrowserEvent_ = function (listener, opt_evt) {
    if (listener.removed) {
        return true;
    }
    return fireListener(listener, new BrowserEvent(opt_evt, this));
};

var markIeEvent_ = function (e) {
    var useReturnValue = false;
    if (e.keyCode == 0) {
        try {
            e.keyCode = -1;
            return;
        } catch (ex) {
            useReturnValue = true;
        }
    }

    if (useReturnValue || (e.returnValue) == undefined) {
        e.returnValue = true;
    }
};

var isMarkedIeEvent_ = function (e) {
    return e.keyCode < 0 || e.returnValue != undefined;
};

uniqueIdCounter_ = 0;
var getUniqueId = function (identifier) {
    return identifier + '_' + uniqueIdCounter_++;
};

var getListenerMap_ = function (src) {
    var listenerMap = src[LISTENER_MAP_PROP_];
    return listenerMap instanceof ListenerMap ? listenerMap : null;
};

LISTENER_WRAPPER_PROP_ = '__closure_events_fn_' + ((Math.random() * 1e9) >>> 0);

var wrapListener = function (listener) {
    assert(listener, 'Listener can not be null.');

    if (typeof listener === 'function') {
        return listener;
    }

    assert(listener.handleEvent, 'An object listener must have handleEvent method.');
    if (!listener[LISTENER_WRAPPER_PROP_]) {
        listener[LISTENER_WRAPPER_PROP_] = function (e) {
            return listener.handleEvent(e);
        };
    }
    return listener[LISTENER_WRAPPER_PROP_];
};