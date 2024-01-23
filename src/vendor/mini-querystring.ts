// Taken from https://github.com/DylanPiercey/mini-querystring/blob/master/src/index.ts

const parseReg: RegExp = /([^=?&]+)=?([^&]*)/g;

const setDeep = deep;
const setShallow = shallow;
/**
 * @description
 * Converts an object to a query string and optionally flattens it.
 *
 * @example
 * stringify({ a: 1 }) === 'a=1'
 *
 * stringify({ a: { b: 1 } }, true) === 'a[b]=1'
 *
 * @param obj The object to stringify.
 * @param deep If true the object will be flattened using query string syntax.
 */
export function stringify(obj: any, deep?: boolean): string {
  if (deep) {
    obj = flatten(obj);
  }

  const keys: string[] = Object.keys(obj);
  if (!keys.length) {
    return "";
  }

  for (let i = 0, len = keys.length; i < len; i++) {
    const key: string = keys[i];
    keys[i] = encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
  }

  return keys.join("&");
}

/**
 * @description
 * Parses a query string and optionally unflattens it.
 *
 * @example
 * parse('a=1&b=2&') === "{ a: '1', b: '2' }"
 *
 * parse('a=1&b[c]=2', true) === "{ a: '1', b: { c: '1' } }"
 *
 * @param str The string to parse.
 * @param deep If true, nested querystring paths will be resolved.
 */
export function parse(str: string, deep?: boolean): any {
  const set = deep ? setDeep : setShallow;
  const result: any = {};

  for (;;) {
    const part = parseReg.exec(str);
    if (!part) {
      break;
    }

    const [, prop, val] = part;
    set(result, decodeURIComponent(prop), decodeURIComponent(val));
  }

  return result;
}

// q-set https://github.com/DylanPiercey/q-set/blob/master/src/index.ts

const matchArray: RegExp = /[^\[\]]+|\[\]/g;
const matchInteger: RegExp = /^\d+$/;
const temp: any[] = [];

/**
 * @description
 * A setter for querystring style fields like "a[b][c]".
 * The setter will create arrays for repeat keys and supports the "[]" push syntax.
 *
 * @example
 * deep({}, "a[b][c]", 1) // { a: { b: { c: 1 } } }
 *
 * @param obj The object to set a value on.
 * @param path The querystring path to set.
 * @param value The value to set at the path.
 */
export function deep(obj: any, path: string, value: any): any {
  const keys: string[] =
    path === "" ? [""] : path.match(matchArray) as string[];
  const len: number = keys.length;
  let cur: any = obj;
  let prev: any;
  let key: string;
  let exists = false;

  for (let i = 0; i < len; i++) {
    prev = cur;
    key = keys[i];
    const next = keys[i + 1];

    if (key === "[]") {
      key = cur.length;
    }

    // Make path as we go.
    cur = (exists = typeof cur === "object" && key in cur)
      ? cur[key]
      : // Check if the next path is an explicit array.
        (cur[key] = next === "[]" || matchInteger.test(next) ? [] : {});
  }

  // @ts-ignore
  prev[key] = exists ? temp.concat(cur, value) : value;

  return obj;
}

/**
 * @description
 * Appends to an object using query string syntax with "[]" syntax push support.
 *
 * @example
 * shallow({}, "a[b][c]", 1) // { "a[b][c]": 1 }
 * shallow({}, "a[]", 1) // { a: [1] }
 *
 * @param obj The object to set a value on.
 * @param path The querystring path to set.
 * @param value The value to set at the path.
 */
export function shallow(obj: any, key: string, val: any): any {
  key = arrayPushIndexes(obj, key);
  obj[key] = key in obj ? temp.concat(obj[key], val) : val;
  return obj;
}

/**
 * Given a qs style key and an object will convert array push syntax to integers.
 * Eg: a[b][] -> a[b][0]
 */
function arrayPushIndexes(obj: any, key: string): string {
  const path: string[] = key.split("[]");
  if (path.length === 1) {
    return key;
  }

  let cur: string = path[0];
  const keys: string[] = Object.keys(obj);

  for (let i = 1, len = path.length; i < len; i++) {
    cur += "[" + findLastIndex(keys, cur) + "]" + path[i];
  }

  return cur;
}

/**
 * Given a path to push to will return the next valid index if possible.
 * Eg: a[b][] -> 0 // if array is empty.
 */
function findLastIndex(keys: string[], path: string): number {
  let last: number = -1;

  for (let i = keys.length; i--; ) {
    const key: string = keys[i];
    if (key.indexOf(path) !== 0) {
      continue;
    }

    const index: number = Number(
      key.replace(path, "").slice(1, key.indexOf("]") - 1)
    );

    if (index > last) {
      last = index;
    }
  }

  return last + 1;
}

const { toString, hasOwnProperty } = Object.prototype;
const OBJECT_TYPE = "[object Object]";
const ARRAY_TYPE = "[object Array]";

/**
 * @description
 * Creates a querystring style object from a nested one.
 *
 * @example
 * var result = flatten({ a: { b: 1 }, c: { d: 1 } });
 * result; //-> { "a[b]": 1, "c[d]": 2 }
 *
 * @param obj The object to flatten.
 */
export function flatten(obj: any, path?: string, result?: any) {
  const type = toString.call(obj);

  if (result === undefined) {
    if (type === OBJECT_TYPE) {
      result = {};
    } else if (type === ARRAY_TYPE) {
      result = [];
    } else {
      return;
    }
  }

  for (const key in obj) {
    /* istanbul ignore if */
    if (!hasOwnProperty.call(obj, key)) {
      continue;
    }

    const val = obj[key];
    if (val == null) {
      continue;
    }

    switch (toString.call(val)) {
      case ARRAY_TYPE:
      case OBJECT_TYPE:
        flatten(val, join(path, key), result);
        break;
      default:
        result[join(path, key)] = val;
        break;
    }
  }

  return result;
}

/**
 * Join path keys using query string `a[b]` style syntax.
 */
function join(path: string | void, key: string) {
  return path != null ? path + "[" + key + "]" : key;
}
