

export interface UrlhubOptions {
  initialLocation?: string;
  basePath?: string;
  strategy?: UrlhubStrategy;
}

export interface UrlhubLocation<T> {
  pathname: string;
  search: string;
  hash: string;
  query: any;
  fullpath: string;
  matches: T[];
  matchIds: string[];
  route: string;
  params: { [key: string]: string };
}

export abstract class UrlhubStrategy {
  abstract push: (fullpath: string ) => void;
  abstract replace: (fullpath: string ) => void;
  abstract addChangeListener: (cb: (fullpath: string) => void) => void;
  abstract removeChangeListener: (cb: (fullpath: string) => void) => void;
  abstract getFullPath: () => string;
}

export type UrlhubRoute<T> = {
  path: string,
  cb: T,
  children?: UrlhubRoute<T>[],
  isModal?: boolean,
}

export interface RegexRoute<T> {
  regex: RegExp;
  id: string;
  cb: T;
  params: string[],
  childRegex?: RegExp;
  children?: RegexRoute<T>[];
}

export interface MatchInfo<T> {
  matches: T[];
  matchIds: string[];
}

export type OnChangeCallback<T> = ( location: UrlhubLocation<T> ) => void;
export type OnBeforeChangeCallback<T> = ( location: UrlhubLocation<T> ) => UrlhubLocation<T> | string;
