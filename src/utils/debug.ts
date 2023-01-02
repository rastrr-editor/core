import baseDebug from 'debug';

export function createDebug(namespace = ''): baseDebug.Debugger {
  return baseDebug(
    `@rastrr-editor/core${namespace !== '' ? ':' + namespace : ''}`
  );
}

const debug = createDebug();

export default debug;
