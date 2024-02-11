
import { createLocation, toRegexRoutes } from './routeUtils';
import { OnBeforeChangeCallback, OnChangeCallback, RegexRoute, UrlhubLocation, UrlhubOptions, UrlhubRoute, UrlhubStrategy } from './urlhub.types';

export class Urlhub<T> {
  options: UrlhubOptions;
  strategy?: UrlhubStrategy;
  onBeforeChangeClbks: Array<OnBeforeChangeCallback<T>> = [];
  onChangeClbks: Array<OnChangeCallback<T>> = [];
  routes?: RegexRoute<T>[];
  location?: UrlhubLocation<T>;

  constructor( ops: UrlhubOptions ) {
    const { strategy, ...options} = ops;
    this.options = options;
    if( strategy ) {
      this.setStrategy(strategy );
    }
  }

  setStrategy( Strategy: UrlhubStrategy ) {
    // @ts-ignore
    this.strategy = new Strategy( this.options );
  }

  setRoutes( routes: UrlhubRoute<T>[] ) {
    this.routes = toRegexRoutes( routes );
  }

  onChange( cb: OnChangeCallback<T> ) {
    this.onChangeClbks.push( cb );
  }

  offChange( cb: OnChangeCallback<T> ) {
    this.onChangeClbks = this.onChangeClbks.filter( c => c !== cb );
  }

  onBeforeChange( cb: OnBeforeChangeCallback<T> ) {
    this.onBeforeChangeClbks.push( cb );
  }

  offBeforeChange( cb: OnBeforeChangeCallback<T> ) {
    this.onBeforeChangeClbks = this.onBeforeChangeClbks.filter( c => c !== cb );
  }

  emitChange() {
    const location = this.location;
    if( location ){
      this.onChangeClbks.forEach( cb => cb(location) );
    }
  }

  start() {
    if( !this.strategy ) throw new Error('Urlhub: Cannot start without a strategy.');
    if( !this.routes ) throw new Error ('Urlhub: Cannot start without routes.');

    this.strategy.addChangeListener( this._onRouteChange );

    const fullpath = this.strategy.getFullPath();
    const location = createLocation( fullpath, this.routes! );
    this.setLocation( fullpath, location, false );
  }

  stop() {
    this.strategy?.removeChangeListener( this._onRouteChange );
  }

  _onRouteChange = ( fullpath: string ) => {
    if( fullpath === this.location?.fullpath ) return;

    let location = createLocation(fullpath, this.routes!);
    if( location ) {
      const updatedLocation = this.runOnBeforeChangeClbks( location );
      if( updatedLocation ){
        this.setLocation( updatedLocation.fullpath, updatedLocation );
      }
    }
  }

  runOnBeforeChangeClbks( location: UrlhubLocation<T> ): UrlhubLocation<T> | undefined {
    let updatedLocation = location;
    for (const cb of this.onBeforeChangeClbks) {
      const result = cb( updatedLocation );
      if( !result ) throw new Error('Urlhub: onBeforeChange callbacks must return a string or a location object.');
      if( typeof result === 'string' ){
        const cbLocation = createLocation( result, this.routes! );
        if( !cbLocation ) throw new Error('Urlhub: onBeforeChange callbacks must return a valid route.');
        updatedLocation = cbLocation;
      }
      else {
        updatedLocation = result;
      }
    }

    if( updatedLocation.fullpath !== location.fullpath ) {
      this.strategy?.replace( updatedLocation.fullpath );
    }
    return updatedLocation;
  }

  setLocation(fullpath: string, location?: UrlhubLocation<T>, needEmit: boolean = true) {
    if( location  && location.fullpath !== this.location?.fullpath) {
      this.location = location;
      needEmit && this.emitChange();
    }
    else {
      return console.error('Urlhub: There is no route match for ' + fullpath );
    }
  }

  push( fullpath: string ) {
    this.strategy?.push( fullpath );
  }
  replace( fullpath: string ) {
    this.strategy?.replace( fullpath );
  }
}
