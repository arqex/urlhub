require('jsdom-global')();

var urlhub = require('../urlhub');
var pushStrategy = require('../pushStrategy');
var test = require('tape');

var routes = [
  { path: '/route1', cb: 'Route1' },
  { path: '/route2', cb: 'Route2' },
];

var router = urlhub.create( routes, {strategy: pushStrategy} );

test('testing browser', t => {
  document.location.href = 'http://localhost';
  console.log( document.location.href );
  t.end();
});
