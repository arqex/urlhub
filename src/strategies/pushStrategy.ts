import { UrlhubStrategy } from "../urlhub.types";

export class PushStrategy implements UrlhubStrategy {
  listeners: ((pathname: string) => void)[] = [];
  intervalTimer: number | undefined;
  lastHref: string | undefined;
  constructor() {
    this.lastHref = window.location.href;
    this.intervalTimer = window.setInterval(this._checkHrefChange, 50);
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

  _onURLChange = () => {
    this.emit();
  }

  _checkHrefChange = () => {
    if( window.location.href !== this.lastHref ) {
      this.lastHref = window.location.href;
      this.emit();
    }
  }

  getFullPath() {
    const { pathname, search, hash } = window.location;
    return pathname + search + hash;
  }

  push(fullpath: string) {
    history.pushState({fullpath}, '', fullpath);
  }

  replace(fullpath: string) {
    history.replaceState({fullpath}, '', fullpath);
  }
}
