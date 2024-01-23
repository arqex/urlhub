import { UrlhubOptions, UrlhubStrategy } from "../urlhub.types";

export class NodeStrategy implements UrlhubStrategy {
  history: string[];
  listeners: ((pathname: string) => void)[] = [];

  constructor({initialLocation}: UrlhubOptions) {
		this.history = [ initialLocation || '/' ];
  }

  addChangeListener(cb: (pathname: string) => void) {
    this.listeners.push(cb);
  }

  removeChangeListener(cb: (pathname: string) => void) {
    this.listeners = this.listeners.filter(c => c !== cb);
  }

  emit() {
    let fullpath = this.getFullPath();
    this.listeners.forEach( cb => cb(fullpath) );
  }

  getFullPath() {
    return this.history[ this.history.length - 1 ];
  }

  push(fullpath: string) {
		this.history.push( fullpath );
    this.emit();
  }

  replace(fullpath: string) {
		this.history[ this.history.length - 1 ] = fullpath;
    this.emit();
  }
}
