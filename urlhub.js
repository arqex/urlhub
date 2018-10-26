var parser = require('path-to-regexp');
var qs = require('mini-querystring');

/*
routes = {
  path: '/hola',
  cb: fn,
  children: []
}
*/

// parseUrl function needed for testing
var parseUrl;
if( typeof global === 'undefined' || !global.parseUrl ){
  parseUrl = function( url ){
    var a = document.createElement('a');
    a.href = url;
    return a;
  };
}
else {
  parseUrl = global.parseUrl;
}

// The lib
var urlhub = {
  create: function( options ){
    return new Urlhub( options );
  },
  joinUrls: joinUrls // just for testing never used, see helpers at bottom
}


// The class
var Urlhub = function( options ){
  if( !options || !options.strategy ){
    throw new Error('Router needs an strategy to listen to url changes.');
  }

  var s = options.strategy;

  var ops = {};
  Object.keys( options ).forEach( function( key ){
    if( key === 'strategy' ) return;
    ops[key] = options[key];
  });

  s.init && s.init( ops );
  this.strategy = s;

  // Callbacks before the route change
  this.obc = [];

  // Callbacks to be called on route change
  this.cbs = [];
}

var prototype = {
  setRoutes: function( routes ){
    this.routes = this.parseRoutes( routes );
  },
  // Route translation methods
  parseRoutes: function( routes, parent ){
    if( !routes ) console.warn( 'No routes provided to parseRoutes' );

    if( !routes.length ){
      routes = [routes];
    }

    var parsedRoutes = [],
      me = this
    ;

    routes.forEach( function(r){
      var path = joinUrls(parent, r.path);

      var params = [],
        parsed = {
          regex: parser( path, params ),
          id: path,
          cb: r.cb
        }
      ;

      parsed.params = params.map( function(p){ return p.name } );

      if( r.children && r.children.length ){
        parsed.childRegex = parser( path, [], {end: false} );
        parsed.children = me.parseRoutes( r.children, path );
      }

      parsedRoutes.push( parsed );
    });

    return parsedRoutes;
  },

  match: function( location, candidates, isChild ){
    var i = 0,
      url = sanitizeUrl( location ),
      path, found, match, c
    ;

    if( !candidates ){
      candidates = this.routes;
    }

    var parsed = parseUrl( url );
    path =  parsed.pathname;

    // Normalize pathname
    if( path[0] !== '/' ){
      path = '/' + path;
    }

    while( i < candidates.length && !found ){
      c = candidates[i];
      if( c.childRegex ){
        //console.log( 'failed', c.regex, path );
        found = c.childRegex.exec( path );
        if( found ){
          match = this.match( url, c.children, true );
          if( match.matches.length ){
            match.matches = [c.cb].concat( match.matches );
            match.matchIds = [c.id].concat( match.matchIds );
            return match; // The recursive call will give all the info
          }
          else {
            found = false;
          }
        }
      }

      found = c.regex.exec( path );
      if( found ){
        found = {
          id: c.id, cb: c.cb, params: found.slice(1)
        };
      }

      if( !found ){
        i++;
      }
    }

    var matches = [];
    var matchIds = [];

    if( found ){
      matches.push( found.cb )
      matchIds.push( found.id )
    }
    else if( !isChild ){
      console.error('There is no route match for ' + location);
    }

    match = {
      matches: matches,
      matchIds: matchIds,
      pathname: path,
      search: parsed.search,
      query: qs.parse( parsed.search ),
      hash: parsed.hash,
      route: found && found.id || false,
      params: {}
    };

    if( found ){
      c.params.forEach( function( p, i ){
        match.params[ p ] = found.params[i];
      });
    }

    return match;
  },

  // Routing methods
  start: function(){
    var me = this;
    this.strategy.onChange( function(){
      var change = me.checkChange();
      if( !change.next ) return;

      if( change.current !== change.next ){
        me.strategy.replace( change.next );
      }
      else {
        me.location = change.nextLocation;
        me.cbs.forEach( function( cb ){
          cb( change.nextLocation );
        });
      }
    });

    this.strategy.start();
    this.location = this.match( this.strategy.getLocation() );
    return this.location;
  },
  stop: function(){
    this.strategy.onChange( function(){} );
  },
  refresh: function(){
    var change = this.checkChange();
    change.next && change.current !== change.next && this.strategy.replace( change.next );
  },
  checkChange: function(){
    var current = this.strategy.getLocation(),
      nextLocation = this.runOnBeforeChange( this.match(current) ),
      next = nextLocation && (nextLocation.pathname + nextLocation.search + nextLocation.hash)
    ;

    return {current:current, next:next, nextLocation:nextLocation};
  },
  runOnBeforeChange: function( match ){
    var me = this;

    this.obc.forEach( function(cb){
      if( match ){
        match = cb( match );
        if( typeof match === 'string' ){
          match = me.match( match );
        }
      }
    });

    return match;
  },
  onBeforeChange: function( cb ){
    this.obc.push( cb );
  },
  onChange: function( cb ){
    this.cbs.push( cb );
  },
  push: function( location ){
    this.updateLocation('push', location);
  },
  replace: function( location ){
    this.updateLocation('replace', location);
  },
  back: function(){
    window.history.back();
  },
  updateLocation: function( method, location ){
    var current = this.strategy.getLocation();
    var next;

    if(typeof location === 'string'){
      next = location;
    }
    else {
      next = mergeLocations( this.match( current ), location );
    }

    var nextLocation = this.runOnBeforeChange( this.match(next) );
    if( nextLocation ){
      next = nextLocation.pathname + nextLocation.search + nextLocation.hash;
      if( current !== next ){
        this.strategy[ method ]( next );
      }
    }
  }
}

for( var method in prototype ) Urlhub.prototype[ method ] = prototype[method];

module.exports = urlhub;


/********* HELPERS */
function joinUrls( one, two ){
  var first = sanitizeUrl(one),
    second = sanitizeUrl(two)
  ;

  if( !one ) return second;
  if( !two ) return first;

  if( first === '/'){
    return second;
  }
  else if( second === '/' ){
    return first;
  }
  else {
    return first + second;
  }
}

function sanitizeUrl( url ){
  if( !url ) return '/';
  var sanitized = url;
  if( sanitized[ sanitized.length - 1 ] === '/' ){
    sanitized = sanitized.slice(0, sanitized.length - 1);
  }
  if( sanitized[0] !== '/' ){
    sanitized = '/' + sanitized;
  }
  return sanitized;
}

function mergeLocations( prev, next ){
  var location = Object.assign( prev, next ),
    search = location.search
  ;

  if( Object.keys(location.query).length ){
    search = '?' + qs.stringify( location.query );
  }
  else {
    search = '';
  }

  return location.pathname + search + location.hash;
}
