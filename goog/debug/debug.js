import { htmlEscape } from '../string/string.js';
import { isDef, isFunction, isString, isObject, isArray } from '../goog.js';

const MAX_STACK_DEPTH = 50;
const NOT_AVAILABLE = 'Not available';

const captureFrames = (skip = 0) => {
  const lines = (new Error().stack ?? '').split('\n').map((line) => line.trim());
  const frames = lines[0]?.startsWith('Error') ? lines.slice(1) : lines;
  return frames.filter(Boolean).slice(skip);
};

const formatFrames = (frames, limit) => {
  const shown = frames.slice(0, limit).map((frame) => `${frame}\n`);
  const truncated = frames.length > limit;
  return [...shown, truncated ? '[...long stack...]' : '[end]'].join('');
};

export const catchErrors = (logFunction, cancel, target) => {
  const scope = target ?? globalThis;
  const previousHandler = scope.onerror;

  scope.onerror = (message, fileName, line) => {
    previousHandler?.(message, fileName, line);
    logFunction({ message, fileName, line });
    return Boolean(cancel);
  };
};

export const expose = (object, includeFunctions) => {
  if (object === undefined) return 'undefined';
  if (object === null) return 'NULL';

  const lines = [];

  for (const key in object) {
    if (!includeFunctions && isFunction(object[key])) continue;

    let line = `${key} = `;
    try {
      line += object[key];
    } catch (error) {
      line += `*** ${error} ***`;
    }
    lines.push(line);
  }

  return lines.join('\n');
};

export const deepExpose = (root, includeFunctions) => {
  const seen = new Set();
  const output = [];

  const visit = (value, indent) => {
    const childIndent = `${indent}  `;

    try {
      if (!isDef(value)) {
        output.push('undefined');
      } else if (value === null) {
        output.push('NULL');
      } else if (isString(value)) {
        output.push(`"${value.replace(/\n/g, `\n${indent}`)}"`);
      } else if (isFunction(value)) {
        output.push(String(value).replace(/\n/g, `\n${indent}`));
      } else if (isObject(value)) {
        if (seen.has(value)) {
          output.push('*** reference loop detected ***');
          return;
        }

        seen.add(value);
        output.push('{');

        for (const key in value) {
          if (!includeFunctions && isFunction(value[key])) continue;
          output.push('\n', childIndent, `${key} = `);
          visit(value[key], childIndent);
        }

        output.push(`\n${indent}}`);
      } else {
        output.push(value);
      }
    } catch (error) {
      output.push(`*** ${error} ***`);
    }
  };

  visit(root, '');
  return output.join('');
};

export const exposeArray = (array) => {
  const items = array.map((item) => (isArray(item) ? exposeArray(item) : item));
  return `[ ${items.join(', ')} ]`;
};

export const getFunctionName = (fn) => {
  if (fn?.name) return fn.name;
  const match = /function ([^(]+)/.exec(String(fn));
  return match ? match[1] : '[Anonymous]';
};

export const getStacktraceSimple = (maxDepth) => {
  const limit = Math.min(maxDepth || MAX_STACK_DEPTH, MAX_STACK_DEPTH);
  const frames = captureFrames(2);
  const shown = frames.slice(0, limit).map((frame) => `${frame}\n`);

  if (frames.length <= limit) return [...shown, '[end]'].join('');

  const reachedRequestedDepth = maxDepth && limit === maxDepth;
  return [
    ...shown,
    reachedRequestedDepth ? '[...reached max depth limit...]' : '[...long stack...]'
  ].join('');
};

export const getStacktrace = () => formatFrames(captureFrames(2), MAX_STACK_DEPTH);

export const normalizeErrorObject = (error) => {
  const href = globalThis.location?.href;

  if (typeof error === 'string') {
    return {
      message: error,
      name: 'Unknown error',
      lineNumber: NOT_AVAILABLE,
      fileName: href,
      stack: NOT_AVAILABLE
    };
  }

  if (error.lineNumber && error.fileName && error.stack) return error;

  return {
    message: error.message,
    name: error.name,
    lineNumber: error.lineNumber || error.line || NOT_AVAILABLE,
    fileName: error.fileName || error.filename || error.sourceURL || href,
    stack: error.stack || NOT_AVAILABLE
  };
};

export const exposeException = (error) => {
  try {
    const normalized = normalizeErrorObject(error);

    return [
      `Message: ${htmlEscape(normalized.message)}`,
      `Url: <a href="view-source:${normalized.fileName}" target="_new">${normalized.fileName}</a>`,
      `Line: ${normalized.lineNumber}`,
      '',
      'Browser stack:',
      `${htmlEscape(`${normalized.stack}-> `)}[end]`,
      '',
      'JS stack traversal:',
      htmlEscape(`${getStacktrace()}-> `)
    ].join('\n');
  } catch (exception) {
    return `Exception trying to expose exception! You win, we lose. ${exception}`;
  }
};

export const enhanceError = (error, extraMessage) => {
  const enhanced = typeof error === 'string' ? new Error(error) : error;

  if (!enhanced.stack) enhanced.stack = getStacktrace();

  if (extraMessage) {
    let index = 0;
    while (enhanced[`message${index}`]) index++;
    enhanced[`message${index}`] = String(extraMessage);
  }

  return enhanced;
}

export class EntryPointRegistry {
  static #entryPoints = [];

  static register(entryPoint) {
    EntryPointRegistry.#entryPoints.push(entryPoint);
  }

  static monitorAll(errorHandler) {
    const wrap = errorHandler.wrap.bind(errorHandler);
    for (const entryPoint of EntryPointRegistry.#entryPoints) entryPoint(wrap);
  }

  static unmonitorAllIfPossible(errorHandler) {
    const unwrap = errorHandler.unwrap.bind(errorHandler);
    for (const entryPoint of EntryPointRegistry.#entryPoints) entryPoint(unwrap);
  }
}