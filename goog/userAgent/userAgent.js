import { compareVersions } from "../string/string.js";

const hasWindow = typeof window !== "undefined";
const hasDocument = typeof document !== "undefined";

export const getNavigator = () => (hasWindow ? window.navigator : undefined);

export const getUserAgentString = () => getNavigator()?.userAgent ?? null;

const detectBrowser = (userAgent, navigator) => {
  const opera = userAgent.startsWith("Opera");
  const ie = !opera && userAgent.includes("MSIE");
  const webkit = !opera && userAgent.includes("WebKit");
  const mobile = webkit && userAgent.includes("Mobile");
  const gecko = !opera && !webkit && navigator?.product === "Gecko";
  return { opera, ie, webkit, mobile, gecko };
};

const detectPlatform = (navigator) => {
  const platform = navigator?.platform || "";
  return {
    platform,
    mac: platform.includes("Mac"),
    windows: platform.includes("Win"),
    linux: platform.includes("Linux"),
    x11: (navigator?.appVersion || "").includes("X11")
  };
};

const userAgentString = getUserAgentString() ?? "";
const browser = detectBrowser(userAgentString, getNavigator());
const platformInfo = detectPlatform(getNavigator());

export const OPERA = browser.opera;
export const IE = browser.ie;
export const GECKO = browser.gecko;
export const WEBKIT = browser.webkit;
export const MOBILE = browser.mobile;
export const SAFARI = WEBKIT;

export const PLATFORM = platformInfo.platform;
export const MAC = platformInfo.mac;
export const WINDOWS = platformInfo.windows;
export const LINUX = platformInfo.linux;
export const X11 = platformInfo.x11;

const getDocumentMode = () => (hasDocument ? document.documentMode : undefined);

const getVersionPattern = () => {
  if (GECKO) return /rv:([^);]+)(\)|;)/;
  if (IE) return /MSIE\s+([^);]+)(\)|;)/;
  if (WEBKIT) return /WebKit\/(\S+)/;
  return null;
};

const determineVersion = () => {
  const operaApi = OPERA && hasDocument ? document.opera : undefined;
  let version = "";

  if (operaApi) {
    version = typeof operaApi.version === "function" ? operaApi.version() : operaApi.version;
  } else {
    const match = getVersionPattern()?.exec(userAgentString);
    version = match ? match[1] : "";
  }

  if (IE) {
    const documentMode = getDocumentMode();
    if (documentMode > parseFloat(version)) return String(documentMode);
  }

  return version;
};

export const VERSION = determineVersion();
export const compare = (a, b) => compareVersions(a, b);

const versionCache = new Map();
export const isVersion = (target) => {
  if (!versionCache.has(target)) versionCache.set(target, compareVersions(VERSION, target) >= 0);
  return versionCache.get(target);
};