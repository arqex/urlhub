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

	module.exports = {urlhub: __webpack_require__(1)};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {var parser = __webpack_require__(2);
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
	    return new Urlhub( routes, options );
	  },
	  joinUrls: joinUrls // just for testing never used, see helpers at bottom
	}


	// The class
	var Urlhub = function( routes, options ){
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

	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

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

	'use strict'

	var parseReg = /([^=?&]+)=?([^&]*)/g
	var qFlat = __webpack_require__(5)
	var qSet = __webpack_require__(6)

	/**
	 * Converts an object to a query string and optionally flattens it.
	 * @param  {Object} obj - the object to convert.
	 * @return {String}
	 */
	exports.stringify = function stringify (obj, flat) {
	  if (flat) obj = qFlat(obj)
	  var keys = Object.keys(obj)
	  if (!keys.length) return ''

	  for (var i = 0, len = keys.length, key; i < len; i++) {
	    key = keys[i]
	    keys[i] = encodeURIComponent(key) + '=' + encodeURIComponent(obj[key])
	  }

	  return keys.join('&')
	}

	/**
	 * Parses a query string and optionally unflattens it.
	 * @param  {String} str - the query string to parse.
	 * @param  {Boolean} [deep] - if true the query will be unflattened.
	 * @return {Object}
	 */
	exports.parse = function (str, deep) {
	  var set = deep ? qSet : qSet.flat
	  var result = {}
	  var part

	  while ((part = parseReg.exec(str))) {
	    set(result, decodeURIComponent(part[1]), decodeURIComponent(part[2]))
	  }

	  return result
	}


/***/ }),
/* 5 */
/***/ (function(module, exports) {

	var toString       = Object.prototype.toString;
	var hasOwnProperty = Object.prototype.hasOwnProperty;

	/**
	 * @description
	 * Go from regular object syntax to a querystring style object.
	 *
	 * @example
	 * var result = unflatten({ a: { b: 1 }, c: { d: 1 } });
	 * result; //-> { "a[b]": 1, "c[d]": 2 }
	 *
	 * @param {Object} obj
	 */
	function qFlat (obj, path, result) {
		var type = toString.call(obj);
		if (result == null) {
			if (type === "[object Object]") result = {};
			else if (type === "[object Array]") result = [];
			else return;
		}

		for (var key in obj) {
			var val = obj[key];
			if (val === undefined || !hasOwnProperty.call(obj, key)) continue;
			switch (toString.call(val)) {
				case "[object Array]":
				case "[object Object]":
					qFlat(val, join(path, key), result);
					break;
				default:
					result[join(path, key)] = val;
					break;
			}
		}

		return result;
	}

	function join (path, key) {
		return path != null
			? path + "[" + key + "]"
			: key;
	}

	module.exports = qFlat;


/***/ }),
/* 6 */
/***/ (function(module, exports) {

	"use strict";

	var matchArray   = /[^\[\]]+|\[\]/g;
	var matchInteger = /^\d+$/;
	var temp         = [];

	/*
	 * @description
	 * A setter for querystring style fields like "a[b][c]".
	 * The setter will create arrays for repeat keys.
	 *
	 * @param {Object} obj
	 * @param {String} path
	 * @param {*} val
	 */
	function qSet (obj, path, val) {
		var keys = path === "" ? [""] : path.match(matchArray);
		var len  = keys.length;
		var cur  = obj;
		var key, prev, next, exist;

		for (var i = 0; i < len; i++) {
			prev = cur;
			key  = keys[i];
			next = keys[i + 1];
			if (key === "[]") key = cur.length;
			// Make path as we go.
			cur = (exist = typeof cur === "object" && key in cur)
				? cur[key]
				// Check if the next path is an explicit array.
				: cur[key] = (next === "[]" || matchInteger.test(next))
					? []
					: {};
		}

		prev[key] = exist ? temp.concat(cur, val) : val;

		return obj;
	};

	/**
	 * Like qset but doesn't resolve nested params such as a[b][c].
	 *
	 * @param {Object} obj
	 * @param {String} key
	 * @param {*} val
	 */
	function fSet (obj, key, val) {
		key = arrayPushIndexes(obj, key);
		obj[key] = key in obj
			? temp.concat(obj[key], val)
			: val;
		return obj;
	}

	/**
	 * Given a qs style key and an object will convert array push syntax to integers.
	 * Eg: a[b][] -> a[b][0]
	 *
	 * @param {Object} obj
	 * @param {String} key
	 * @return {String}
	 */
	function arrayPushIndexes (obj, key) {
		var path = key.split("[]");
		if (path.length === 1) return key;
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
	 *
	 * @param {Array} keys
	 * @param {String} path
	 * @return {Number}
	 */
	function findLastIndex (keys, path) {
		var last = -1;

		for (var key, i = keys.length; i--;) {
			key = keys[i];
			if (key.indexOf(path) !== 0) continue;
			key = key.replace(path, "");
			key = key.slice(1, key.indexOf("]"));
			if (key > last) last = Number(key);
		}

		return last + 1;
	}

	qSet.flat      = fSet;
	module.exports = qSet;


/***/ })
/******/ ])
});
;