const PRODUCT_RULES = [
  ['FIREFOX', ['Firefox']],
  ['CAMINO', ['Camino']],
  ['IPHONE', ['iPhone', 'iPod']],
  ['IPAD', ['iPad']],
  ['ANDROID', ['Android']],
  ['CHROME', ['Chrome']],
  ['SAFARI', ['Safari']]
];

const VERSION_EXTRACTORS = {
  FIREFOX: [/Firefox\/([0-9.]+)/, (m) => m[1]],
  CAMINO: [/Camino\/([0-9.]+)/, (m) => m[1]],
  CHROME: [/Chrome\/([0-9.]+)/, (m) => m[1]],
  SAFARI: [/Safari\/([0-9.]+)/, (m) => m[1]],
  IPHONE: [/Version\/(\S+).*Mobile\/(\S+)/, (m) => `${m[1]}.${m[2]}`],
  IPAD: [/Version\/(\S+).*Mobile\/(\S+)/, (m) => `${m[1]}.${m[2]}`],
  ANDROID: [/Android\s+([0-9.]+)(?:.*Version\/([0-9.]+))?/, (m) => m[2] || m[1]]
};

const OPERA_PATTERN = /Opera|OPR\//;
const OPERA_VERSION = /(?:Opera|OPR)[/ ]([0-9.]+)/;
const IE_PATTERN = /MSIE|Trident\//;
const IE_VERSION = /(?:MSIE |rv:)([0-9.]+)/;

const getUserAgent = () => typeof navigator !== 'undefined' && navigator.userAgent ? navigator.userAgent : '';
const emptyFlags = () => Object.fromEntries(PRODUCT_RULES.map(([name]) => [name, false]));

export const compareVersions = (a, b) => {
  const left = String(a).split('.');
  const right = String(b).split('.');
  const length = Math.max(left.length, right.length);
  for (let i = 0; i < length; i++) {
    const x = parseInt(left[i] ?? '0', 10) || 0;
    const y = parseInt(right[i] ?? '0', 10) || 0;
    if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
};

export const detectProduct = (userAgent = getUserAgent()) => {
  const flags = { ...emptyFlags(), OPERA: false, IE: false };
  let version = '';

  if (!userAgent) return { flags, version };

  flags.OPERA = OPERA_PATTERN.test(userAgent);
  flags.IE = IE_PATTERN.test(userAgent);

  if (flags.IE || flags.OPERA) {
    const match = userAgent.match(flags.IE ? IE_VERSION : OPERA_VERSION);
    return { flags, version: match ? match[1] : '' };
  }

  const detected = PRODUCT_RULES.find(([, tokens]) =>
    tokens.some((token) => userAgent.includes(token))
  );

  if (!detected) return { flags, version };

  const [name] = detected;
  flags[name] = true;

  const [pattern, format] = VERSION_EXTRACTORS[name];
  const match = pattern.exec(userAgent);
  version = match ? format(match) : '';

  return { flags, version };
};

const { flags, version } = detectProduct();

export const {
  OPERA,
  IE,
  FIREFOX,
  CAMINO,
  IPHONE,
  IPAD,
  ANDROID,
  CHROME,
  SAFARI
} = flags;

export const VERSION = version;
export const isVersion = (target, current = VERSION) => compareVersions(current, target) >= 0;