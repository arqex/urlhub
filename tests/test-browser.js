var urlhub = require('../urlhub');
var test = require('tape');

require('jsdom-global')();

test('testing browser', t => {
  console.log( document.location );
  t.end();
});
