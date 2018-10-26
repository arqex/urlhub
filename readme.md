UrlHub: Yet another router library, but the simplest one
======================================================
[![Build Status](https://secure.travis-ci.org/arqex/freezer.svg)](https://travis-ci.org/arqex/urlhub)
[![npm version](https://badge.fury.io/js/urlhub.svg)](http://badge.fury.io/js/urlhub)

Is another new routing library needed? Probably not, UrlHub is a router that make the work like any other javascript routing library. The difference is that **UrlHub is SIMPLE**, it's made to be understood completely just by reading this file.

## Installation

```
npm install urlhub
```

## Translating URLs to other things

Think of UrlHub as **a library to translate URLs into something else** (that's a nice definition for a router). Let's create a test router.

```js
var urlhub = require('urlhub');
var pushStrategy = require('urlhub/pushStrategy');

var routes = [
  {path: '/home', cb: 'Sweet Home'},
  {path: '/users', cb: 'Users screen', children: [
    {path: '/:userId', cb: 'SingleUser'}
  ]}
];

var router = urlhub.create( {strategy: pushStrategy} );
router.setRoutes( routes );
router.start();
```

The router has been defined with 3 routes:
- `/home`
- `/users`
- `/users/:userId` (Child of `/users`)

The `cb` (named after callback) attribute is what the router returns when a url matches one of the defined routes. With the example above we are translate URLs into `strings`.

```js
location = router.match('/home');
// location.matches will be ["Sweet Home"]

location = router.match('/users/937264923');
// location matches will be ["Users screen", "SingleUser"]
```

The `matches` attribute is the translation of the URL. Since we defined the `"/home"` route with the string `"Sweet home"` as its `cb`, we get that same string back when there is a match on that route. Nested routes will match all the parent routes, that's
why the `matches` attribute is an `array`.

`router.match` returns much more useful information from the url:
```js
location = router.match('/users/937264923?foo=bar#my_hash');
/* location value will be:
{
  hash: "#my_hash",
  matches: ["Users screen", "SingleUser"],
  matchIds: ["/users/", "/users/:userId], 
  params: {userId: "937264923"},
  pathname: "/users/937264923",
  query: {foo: 'bar'},
  route: "/users/:userId",
  search: "?foo=bar"
}
*/
```

As you can see, UrlHub does nothing else than parsing and translating URLs. If we give it a string as `cb` it will be returned on a URL match, but you'd probably want to pass a function as `cb` to be executed after the match, or a React component in order to display it after routing.

## Detecting URL changes
The second nice feature that any router must have is detecting changes in browser's location to react properly to them. That's why we need a **routing strategy**: the mechanism to define what is a URL change, and how to navigate without a page refresh.

There are 2 routing strategies shipped with UrlHub, the [HTML5's pushState strategy](https://developer.mozilla.org/en-US/docs/Web/API/History_API), and the Hash strategy, that updates the URL's hash to navigate. Both strategies are used in the same way by urlhub:

We create our router like this:
```js
var urlhub = require('urlhub');
var hashStrategy = require('urlhub/hashStrategy');

var router = urlhub.create( {strategy: hashStrategy} );
router.setRoutes( routes );
router.onChange( function( location ){
  // The location object is the same returned by the `match` method.
  // This will be triggered by any change in the browser's URL.
  // We can load our content here depending on the route match.
});

// Start listening to URL changes
router.start();
```

## Navigating
UrlHub come with some useful methods to let the developers navigate programmatically without hassle.

```js
// Go to the `/users` path
router.push('/users');

// Replace current location in history by `/users/874922`
router.replace('/users/874922')

// It's possible to use partial location objects to update the route
router.push({query: {foo: 'anotherBar'}})
```

## Intercepting route changes
A nice feature in urlhub is the ability of preventing route changes by using the `onBeforeChange` hook. Imagine that our app has some route '/restricted' that can only be accessed for users that are logged in, we can add this restriction easily:
```js
// The hook function receives the next route as a location object
router.onBeforeChange( function(location){
  if( location.pathname === '/restricted' && !userIsLoggedIn() ){
    // In this case we go to the login screen
    return '/login';
  }

  // In any other case, don't intercept the route, re
  return location;
})
```

## What else?
That's basically all the functionality. This is still a work in progress, still need:
* Document the API and options
* There is a `Link` React component shipped. Document it.
* Write an article to make clear all the advantages.


## License
[MIT licensed](LICENSE)
