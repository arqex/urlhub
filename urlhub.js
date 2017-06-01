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
  create: function( routes, options ){
    return new Yarl( routes, options );
  },
  joinUrls: joinUrls // just for testing never used, see helpers at bottom
}


// The class
var Yarl = function( routes, options ){
  if( !options || !options.strategy ){
    throw new Error('Router needs an strategy to listen to url changes.');
  }

  this.routes = this.parseRoutes( routes );
  this.strategy = options.strategy;

  // Callbacks to be called on route change
  this.cbs = [];
}

var prototype = {

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

    while( i < candidates.length && !found ){

      c = candidates[i];
      found = c.regex.exec( path );
      if( found ){
        found = {
          id: c.id, cb: c.cb, params: found.slice(1)
        };
      }
      else if( c.childRegex ){
        //console.log( 'failed', c.regex, path );
        found = c.childRegex.exec( path );
        if( found ){
          match = this.match( url, c.children, true );
          if( match ){
            match.matches = [c.cb].concat( match.matches );
            return match; // The recursive call will give all the info
          }
          else {
            found = false;
          }
        }
      }

      if( !found ){
        i++;
      }
    }

    if( !found ){
      if( !isChild ){
        console.error('There is no route match for ' + location);
      }
      return false;
    }

    match = {
      matches: [found.cb],
      pathname: path,
      search: parsed.search,
      query: qs.parse( parsed.search ),
      hash: parsed.hash,
      route: found.id,
      params: {}
    };

    c.params.forEach( function( p, i ){
      match.params[ p ] = found.params[i];
    });
    return match;
  },

  // Routing methods
  start: function(){
    var me = this;
    this.strategy.onChange( function( location ){
      var match = me.match( location );
      me.location = match;
      me.cbs.forEach( function( cb ){
        cb( match );
      });
    });
    this.strategy.start();
    return this.match( this.strategy.getLocation() );
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
    var next;

    if(typeof location === 'string'){
      next = location;
    }
    else {
      next = mergeLocations( this.match( this.strategy.getLocation()), location );
    }

    this.strategy[ method ]( next );
  }
}

for( var method in prototype ) Yarl.prototype[ method ] = prototype[method];

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
