(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = {
	  urlhub: __webpack_require__(1),
	  pushStrategy: __webpack_require__(7),
	  hashStrategy: __webpack_require__(8)
	};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	var parser = __webpack_require__(2);
	var qs = __webpack_require__(4);

	/*
	routes = {
	  path: '/hola',
	  cb: fn,
	  children: []
	}
	*/

	// parseUrl function needed for testing
	var parseUrl;
	if( typeof window !== 'undefined' ){
	  parseUrl = function( url ){
	    var a = document.createElement('a');
	    a.href = url;
	    return a;
	  };
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

	    var parsed = (this.strategy.parseUrl || parseUrl)( url );
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
	    this.strategy.back();
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


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

	var isarray = __webpack_require__(3)

	/**
	 * Expose `pathToRegexp`.
	 */
	module.exports = pathToRegexp
	module.exports.parse = parse
	module.exports.compile = compile
	module.exports.tokensToFunction = tokensToFunction
	module.exports.tokensToRegExp = tokensToRegExp

	/**
	 * The main path matching regexp utility.
	 *
	 * @type {RegExp}
	 */
	var PATH_REGEXP = new RegExp([
	  // Match escaped characters that would otherwise appear in future matches.
	  // This allows the user to escape special characters that won't transform.
	  '(\\\\.)',
	  // Match Express-style parameters and un-named parameters with a prefix
	  // and optional suffixes. Matches appear as:
	  //
	  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
	  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
	  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
	  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?|(\\*))'
	].join('|'), 'g')

	/**
	 * Parse a string for the raw tokens.
	 *
	 * @param  {string}  str
	 * @param  {Object=} options
	 * @return {!Array}
	 */
	function parse (str, options) {
	  var tokens = []
	  var key = 0
	  var index = 0
	  var path = ''
	  var defaultDelimiter = options && options.delimiter || '/'
	  var res

	  while ((res = PATH_REGEXP.exec(str)) != null) {
	    var m = res[0]
	    var escaped = res[1]
	    var offset = res.index
	    path += str.slice(index, offset)
	    index = offset + m.length

	    // Ignore already escaped sequences.
	    if (escaped) {
	      path += escaped[1]
	      continue
	    }

	    var next = str[index]
	    var prefix = res[2]
	    var name = res[3]
	    var capture = res[4]
	    var group = res[5]
	    var modifier = res[6]
	    var asterisk = res[7]

	    // Push the current path onto the tokens.
	    if (path) {
	      tokens.push(path)
	      path = ''
	    }

	    var partial = prefix != null && next != null && next !== prefix
	    var repeat = modifier === '+' || modifier === '*'
	    var optional = modifier === '?' || modifier === '*'
	    var delimiter = res[2] || defaultDelimiter
	    var pattern = capture || group

	    tokens.push({
	      name: name || key++,
	      prefix: prefix || '',
	      delimiter: delimiter,
	      optional: optional,
	      repeat: repeat,
	      partial: partial,
	      asterisk: !!asterisk,
	      pattern: pattern ? escapeGroup(pattern) : (asterisk ? '.*' : '[^' + escapeString(delimiter) + ']+?')
	    })
	  }

	  // Match any characters still remaining.
	  if (index < str.length) {
	    path += str.substr(index)
	  }

	  // If the path exists, push it onto the end.
	  if (path) {
	    tokens.push(path)
	  }

	  return tokens
	}

	/**
	 * Compile a string to a template function for the path.
	 *
	 * @param  {string}             str
	 * @param  {Object=}            options
	 * @return {!function(Object=, Object=)}
	 */
	function compile (str, options) {
	  return tokensToFunction(parse(str, options))
	}

	/**
	 * Prettier encoding of URI path segments.
	 *
	 * @param  {string}
	 * @return {string}
	 */
	function encodeURIComponentPretty (str) {
	  return encodeURI(str).replace(/[\/?#]/g, function (c) {
	    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
	  })
	}

	/**
	 * Encode the asterisk parameter. Similar to `pretty`, but allows slashes.
	 *
	 * @param  {string}
	 * @return {string}
	 */
	function encodeAsterisk (str) {
	  return encodeURI(str).replace(/[?#]/g, function (c) {
	    return '%' + c.charCodeAt(0).toString(16).toUpperCase()
	  })
	}

	/**
	 * Expose a method for transforming tokens into the path function.
	 */
	function tokensToFunction (tokens) {
	  // Compile all the tokens into regexps.
	  var matches = new Array(tokens.length)

	  // Compile all the patterns before compilation.
	  for (var i = 0; i < tokens.length; i++) {
	    if (typeof tokens[i] === 'object') {
	      matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$')
	    }
	  }

	  return function (obj, opts) {
	    var path = ''
	    var data = obj || {}
	    var options = opts || {}
	    var encode = options.pretty ? encodeURIComponentPretty : encodeURIComponent

	    for (var i = 0; i < tokens.length; i++) {
	      var token = tokens[i]

	      if (typeof token === 'string') {
	        path += token

	        continue
	      }

	      var value = data[token.name]
	      var segment

	      if (value == null) {
	        if (token.optional) {
	          // Prepend partial segment prefixes.
	          if (token.partial) {
	            path += token.prefix
	          }

	          continue
	        } else {
	          throw new TypeError('Expected "' + token.name + '" to be defined')
	        }
	      }

	      if (isarray(value)) {
	        if (!token.repeat) {
	          throw new TypeError('Expected "' + token.name + '" to not repeat, but received `' + JSON.stringify(value) + '`')
	        }

	        if (value.length === 0) {
	          if (token.optional) {
	            continue
	          } else {
	            throw new TypeError('Expected "' + token.name + '" to not be empty')
	          }
	        }

	        for (var j = 0; j < value.length; j++) {
	          segment = encode(value[j])

	          if (!matches[i].test(segment)) {
	            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received `' + JSON.stringify(segment) + '`')
	          }

	          path += (j === 0 ? token.prefix : token.delimiter) + segment
	        }

	        continue
	      }

	      segment = token.asterisk ? encodeAsterisk(value) : encode(value)

	      if (!matches[i].test(segment)) {
	        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
	      }

	      path += token.prefix + segment
	    }

	    return path
	  }
	}

	/**
	 * Escape a regular expression string.
	 *
	 * @param  {string} str
	 * @return {string}
	 */
	function escapeString (str) {
	  return str.replace(/([.+*?=^!:${}()[\]|\/\\])/g, '\\$1')
	}

	/**
	 * Escape the capturing group by escaping special characters and meaning.
	 *
	 * @param  {string} group
	 * @return {string}
	 */
	function escapeGroup (group) {
	  return group.replace(/([=!:$\/()])/g, '\\$1')
	}

	/**
	 * Attach the keys as a property of the regexp.
	 *
	 * @param  {!RegExp} re
	 * @param  {Array}   keys
	 * @return {!RegExp}
	 */
	function attachKeys (re, keys) {
	  re.keys = keys
	  return re
	}

	/**
	 * Get the flags for a regexp from the options.
	 *
	 * @param  {Object} options
	 * @return {string}
	 */
	function flags (options) {
	  return options.sensitive ? '' : 'i'
	}

	/**
	 * Pull out keys from a regexp.
	 *
	 * @param  {!RegExp} path
	 * @param  {!Array}  keys
	 * @return {!RegExp}
	 */
	function regexpToRegexp (path, keys) {
	  // Use a negative lookahead to match only capturing groups.
	  var groups = path.source.match(/\((?!\?)/g)

	  if (groups) {
	    for (var i = 0; i < groups.length; i++) {
	      keys.push({
	        name: i,
	        prefix: null,
	        delimiter: null,
	        optional: false,
	        repeat: false,
	        partial: false,
	        asterisk: false,
	        pattern: null
	      })
	    }
	  }

	  return attachKeys(path, keys)
	}

	/**
	 * Transform an array into a regexp.
	 *
	 * @param  {!Array}  path
	 * @param  {Array}   keys
	 * @param  {!Object} options
	 * @return {!RegExp}
	 */
	function arrayToRegexp (path, keys, options) {
	  var parts = []

	  for (var i = 0; i < path.length; i++) {
	    parts.push(pathToRegexp(path[i], keys, options).source)
	  }

	  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

	  return attachKeys(regexp, keys)
	}

	/**
	 * Create a path regexp from string input.
	 *
	 * @param  {string}  path
	 * @param  {!Array}  keys
	 * @param  {!Object} options
	 * @return {!RegExp}
	 */
	function stringToRegexp (path, keys, options) {
	  return tokensToRegExp(parse(path, options), keys, options)
	}

	/**
	 * Expose a function for taking tokens and returning a RegExp.
	 *
	 * @param  {!Array}          tokens
	 * @param  {(Array|Object)=} keys
	 * @param  {Object=}         options
	 * @return {!RegExp}
	 */
	function tokensToRegExp (tokens, keys, options) {
	  if (!isarray(keys)) {
	    options = /** @type {!Object} */ (keys || options)
	    keys = []
	  }

	  options = options || {}

	  var strict = options.strict
	  var end = options.end !== false
	  var route = ''

	  // Iterate over the tokens and create our regexp string.
	  for (var i = 0; i < tokens.length; i++) {
	    var token = tokens[i]

	    if (typeof token === 'string') {
	      route += escapeString(token)
	    } else {
	      var prefix = escapeString(token.prefix)
	      var capture = '(?:' + token.pattern + ')'

	      keys.push(token)

	      if (token.repeat) {
	        capture += '(?:' + prefix + capture + ')*'
	      }

	      if (token.optional) {
	        if (!token.partial) {
	          capture = '(?:' + prefix + '(' + capture + '))?'
	        } else {
	          capture = prefix + '(' + capture + ')?'
	        }
	      } else {
	        capture = prefix + '(' + capture + ')'
	      }

	      route += capture
	    }
	  }

	  var delimiter = escapeString(options.delimiter || '/')
	  var endsWithDelimiter = route.slice(-delimiter.length) === delimiter

	  // In non-strict mode we allow a slash at the end of match. If the path to
	  // match already ends with a slash, we remove it for consistency. The slash
	  // is valid at the end of a path match, not in the middle. This is important
	  // in non-ending mode, where "/test/" shouldn't match "/test//route".
	  if (!strict) {
	    route = (endsWithDelimiter ? route.slice(0, -delimiter.length) : route) + '(?:' + delimiter + '(?=$))?'
	  }

	  if (end) {
	    route += '$'
	  } else {
	    // In non-ending mode, we need the capturing groups to match as much as
	    // possible by using a positive lookahead to the end or next path segment.
	    route += strict && endsWithDelimiter ? '' : '(?=' + delimiter + '|$)'
	  }

	  return attachKeys(new RegExp('^' + route, flags(options)), keys)
	}

	/**
	 * Normalize the given path string, returning a regular expression.
	 *
	 * An empty array can be passed in for the keys, which will hold the
	 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
	 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
	 *
	 * @param  {(string|RegExp|Array)} path
	 * @param  {(Array|Object)=}       keys
	 * @param  {Object=}               options
	 * @return {!RegExp}
	 */
	function pathToRegexp (path, keys, options) {
	  if (!isarray(keys)) {
	    options = /** @type {!Object} */ (keys || options)
	    keys = []
	  }

	  options = options || {}

	  if (path instanceof RegExp) {
	    return regexpToRegexp(path, /** @type {!Array} */ (keys))
	  }

	  if (isarray(path)) {
	    return arrayToRegexp(/** @type {!Array} */ (path), /** @type {!Array} */ (keys), options)
	  }

	  return stringToRegexp(/** @type {string} */ (path), /** @type {!Array} */ (keys), options)
	}


/***/ }),
/* 3 */
/***/ (function(module, exports) {

	module.exports = Array.isArray || function (arr) {
	  return Object.prototype.toString.call(arr) == '[object Array]';
	};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var q_flat_1 = __webpack_require__(5);
	var q_set_1 = __webpack_require__(6);
	var parseReg = /([^=?&]+)=?([^&]*)/g;
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
	function stringify(obj, deep) {
	    if (deep) {
	        obj = q_flat_1.flatten(obj);
	    }
	    var keys = Object.keys(obj);
	    if (!keys.length) {
	        return "";
	    }
	    for (var i = 0, len = keys.length; i < len; i++) {
	        var key = keys[i];
	        keys[i] = encodeURIComponent(key) + "=" + encodeURIComponent(obj[key]);
	    }
	    return keys.join("&");
	}
	exports.stringify = stringify;
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
	function parse(str, deep) {
	    var set = deep ? q_set_1.deep : q_set_1.shallow;
	    var result = {};
	    for (;;) {
	        var part = parseReg.exec(str);
	        if (!part) {
	            break;
	        }
	        var prop = part[1], val = part[2];
	        set(result, decodeURIComponent(prop), decodeURIComponent(val));
	    }
	    return result;
	}
	exports.parse = parse;
	//# sourceMappingURL=index.js.map

/***/ }),
/* 5 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var _a = Object.prototype, toString = _a.toString, hasOwnProperty = _a.hasOwnProperty;
	var OBJECT_TYPE = "[object Object]";
	var ARRAY_TYPE = "[object Array]";
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
	function flatten(obj, path, result) {
	    var type = toString.call(obj);
	    if (result === undefined) {
	        if (type === OBJECT_TYPE) {
	            result = {};
	        }
	        else if (type === ARRAY_TYPE) {
	            result = [];
	        }
	        else {
	            return;
	        }
	    }
	    for (var key in obj) {
	        /* istanbul ignore if */
	        if (!hasOwnProperty.call(obj, key)) {
	            continue;
	        }
	        var val = obj[key];
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
	exports.flatten = flatten;
	/**
	 * Join path keys using query string `a[b]` style syntax.
	 */
	function join(path, key) {
	    return path != null ? path + "[" + key + "]" : key;
	}
	//# sourceMappingURL=index.js.map

/***/ }),
/* 6 */
/***/ (function(module, exports) {

	"use strict";
	Object.defineProperty(exports, "__esModule", { value: true });
	var matchArray = /[^\[\]]+|\[\]/g;
	var matchInteger = /^\d+$/;
	var temp = [];
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
	function deep(obj, path, value) {
	    var keys = path === "" ? [""] : path.match(matchArray);
	    var len = keys.length;
	    var cur = obj;
	    var prev;
	    var key;
	    var exists;
	    for (var i = 0; i < len; i++) {
	        prev = cur;
	        key = keys[i];
	        var next = keys[i + 1];
	        if (key === "[]") {
	            key = cur.length;
	        }
	        // Make path as we go.
	        cur = (exists = typeof cur === "object" && key in cur)
	            ? cur[key]
	            : // Check if the next path is an explicit array.
	                (cur[key] = next === "[]" || matchInteger.test(next) ? [] : {});
	    }
	    prev[key] = exists ? temp.concat(cur, value) : value;
	    return obj;
	}
	exports.deep = deep;
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
	function shallow(obj, key, val) {
	    key = arrayPushIndexes(obj, key);
	    obj[key] = key in obj ? temp.concat(obj[key], val) : val;
	    return obj;
	}
	exports.shallow = shallow;
	/**
	 * Given a qs style key and an object will convert array push syntax to integers.
	 * Eg: a[b][] -> a[b][0]
	 */
	function arrayPushIndexes(obj, key) {
	    var path = key.split("[]");
	    if (path.length === 1) {
	        return key;
	    }
	    var cur = path[0];
	    var keys = Object.keys(obj);
	    for (var i = 1, len = path.length; i < len; i++) {
	        cur += "[" + findLastIndex(keys, cur) + "]" + path[i];
	    }
	    return cur;
	}
	/**
	 * Given a path to push to will return the next valid index if possible.
	 * Eg: a[b][] -> 0 // if array is empty.
	 */
	function findLastIndex(keys, path) {
	    var last = -1;
	    for (var i = keys.length; i--;) {
	        var key = keys[i];
	        if (key.indexOf(path) !== 0) {
	            continue;
	        }
	        var index = Number(key.replace(path, "").slice(1, key.indexOf("]") - 1));
	        if (index > last) {
	            last = index;
	        }
	    }
	    return last + 1;
	}
	//# sourceMappingURL=index.js.map

/***/ }),
/* 7 */
/***/ (function(module, exports) {

	var onChange = function () {};

	var pushStrategy = {
	  init: function( options ){
	    this.basePath = options.basePath || '';
	    if( this.basePath.slice(-1) === '/' ){
	      this.basePath = this.basePath.slice(0, -1);
	    }
	  },
	  start: function(){
	    var me = this;

	    // Register event listener
	    window.onpopstate = function(){
	      me.emit();
	    };

	    // Emit first onChange
	    me.emit();
	  },
	  push: function( location ){
	    history.pushState( {}, '', this.basePath + location );
	    this.emit();
	  },
	  replace: function( location ){
	    history.replaceState( {}, '', this.basePath + location );
	    this.emit();
	  },
	  onChange: function( cb ){
	    onChange = cb;
	  },
	  getLocation: function(){
	    var l = location.pathname + location.search + location.hash,
	      basePathLength = this.basePath.length
	    ;

	    if( l.slice(0, basePathLength) === this.basePath ){
	      l = l.slice( basePathLength );
	    }

	    return l;
	  },
	  emit: function(){
	    onChange && onChange( this.getLocation() );
	  },
		back: function () {
	    window.history.back();
		}
	};

	module.exports = pushStrategy;


/***/ }),
/* 8 */
/***/ (function(module, exports) {

	var onChange = function () {};
	var hashStrategy = {
		init: function (options) {
		},

		start: function () {
			var me = this;

			if (!location.hash) {
				location.hash = '#/';
			}

			// Register event listener
			window.onhashchange = function () {
				me.emit();
			};

			// Emit first onChange
			me.emit();
		},
		push: function (route) {
			window.location.hash = '#' + route;
		},
		replace: function (route) {
			var url = location.protocol + '//' + location.host + location.pathname + '#' + route;

			location.replace(url);
		},
		onChange: function (cb) {
			onChange = cb;
		},
		getLocation: function () {
			if( !location.hash ){
				return '/';
			}
			else if (location.hash[1] !== '/') {
				return '/' + location.hash;
			}
			return location.hash.slice(1);
		},
		emit: function () {
			onChange(this.getLocation());
		},
		back: function () {
	    window.history.back();
		}
	};

	module.exports = hashStrategy;


/***/ })
/******/ ])
});
;