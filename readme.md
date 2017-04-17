YARL: Yet another router library, but the simplest one
======================================================

Is another new routing library needed? Probably not, YARL is a router that make the work like any other javascript routing library. The difference to others is that this one is made to be understood completely just by reading this.

## Installation

```
npm install yarl
```

## Usage

Think of YARL as a library to translate URLs into something else (that's a nice definition for a router). Let's create a test router.

```js
var yarl = require('yarl');
var pushStrategy = require('yarl/pushStrategy');

var routes = [
  {path: '/home', cb: 'Home'},
  {path: '/users', cb: 'Users', children: [
    {path: '/:userId', cb: 'SingleUser'}
  ]}
];

var router = yarl.create( routes, {strategy: pushStrategy} );
router.start();
```

The router has been defined with 3 routes:
- `/home`
- `/users`
- `/users/:userId` (Child of `/users`)

The `cb` attribute is what the router returns when a url matches one of the defined routes:

```js
var location = router.match('/home');
/* location value will be
{
  hash: "",
  matches: ["Home"],
  params: {},
  pathname: "/home",
  query: {},
  route: "/home",
  search: ""
}
*/
```
The `matches` attribute is the translation of the URL. Since we defined the `"/home"` route with the string `"Home"` as its `cb`, we get that same string back when there is a match on that route.

What about the nested route?

```js
location = router.match('/users/937264923');
/* location value will be:
{
  hash: "",
  matches: ["Users", "SingleUser"],
  params: {userId: "937264923"},
  pathname: "/users/937264923",
  query: {},
  route: "/users/:userId",
  search: ""
}
*/
```
In this case, the URL is matched by a nested route and the `matches` attribute contains the `cb`s of all the parent routes too. That's why the `matches` attributes is an array.

As you can see, YARL does nothing else than translating the URL. If we give it a string as `cb` it will be returned on a URL match, but you'd probably want to pass a function as `cb` to be executed after the match, or a React component in order to display it after routing.

## Detecting URL changes
The second nice feature that any router must have is detecting changes in browser's location to react properly to them. That's why we need a routing strategy, the mechanism to define what is a URL change, and how to navigate without a page refresh. The only one shipped with YARL is the [HTML5's pushState strategy](https://developer.mozilla.org/en-US/docs/Web/API/History_API). If you need a hash strategy you need to build it yourself (pull requests are welcome).

We create our router like this:
```js
var router = yarl.create( routes, {strategy: pushStrategy} );
router.onChange(function( location ){
  // The location object is the same returned by the `match` method.
  // This will be triggered by any change in the browser's URL.
});

// Start listening to URL changes
router.start();
```

## Navigating
YARL come with some useful methods to let the developers navigate programmatically without hassle.

```js
// Go to the `/users` path
router.push('/users');

// Replace current location in history by `/users/874922`
router.replace('/users/874922')
```
