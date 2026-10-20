/**
 * Return configuration keys whose draft value differs from the value loaded
 * when the database property dialog opened.
 *
 * `defaults` (optional, key -> schema default) covers a key that was never
 * explicitly in the conf file: `initialParams[key]` is then `undefined`, so
 * without this a user who simply retypes the schema's own displayed default
 * into that field would have it counted as "modified" — every onChange on a
 * previously-untouched field reads as a real change, and there's no way for
 * it to go back to "unmodified" by typing the same default back in, since
 * `undefined !== <anything typed>` is always true. Falling back to the
 * schema default as the "before" value when there's no real loaded value
 * fixes that without changing behavior for any key that actually did have a
 * loaded value (those never consult `defaults` at all).
 */
export function getModifiedKeys(initialParams = {}, params = {}, defaults = {}) {
  return Object.keys({ ...initialParams, ...params })
    .filter(key => {
      if (params[key] === undefined) return initialParams[key] !== undefined;
      const before = initialParams[key] !== undefined ? initialParams[key] : defaults[key];
      return before !== params[key];
    });
}
