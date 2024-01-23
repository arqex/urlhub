import { UrlhubStrategy } from "../urlhub.types";

export class HashStrategy implements UrlhubStrategy {
  listeners: ((pathname: string) => void)[] = [];

  constructor() {
    window.addEventListener('hashchange', this._onHashChange);
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

  _onHashChange = () => {
    this.emit();
  }

  getFullPath() {
    let fullpath = (window.location.hash || '#/').replace(/^#/, '');
    if( !fullpath.startsWith('/') ) {
      fullpath = '/' + location;
    }
    return fullpath;
  }

  push(fulpath: string) {
    const hash = `#${fulpath}`;
    const href = location.href.split('#')[0] + hash;
    // @ts-ignore updating location makes sure the hashchange event is fired
    window.location = href;
  }
  replace(fulpath: string) {
    const hash = `#${fulpath}`;
    const href = location.href.split('#')[0] + hash;
    location.replace(href);
  }
}
