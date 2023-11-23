import _ from 'lodash';

/**
 *  true: Boolean Null Undefined Number String Symbol
 *  false: Object Array Function Class
 */
export function isPrimitive(val: any): boolean {
  if (typeof val === 'object') {
    return val === null;
  }
  return typeof val !== 'function';
}

_.mixin({
  isPrimitive
});

declare module 'lodash' {
  interface LoDashStatic {
    isPrimitive: typeof isPrimitive;
  }
}
