var test = require('tape');
var Url = require('url');

global.parseUrl = function( url ){
  var parsed = Url.parse( url );
  parsed.search = parsed.search || '';
  parsed.hash = parsed.hash || '';
  return parsed;
}

var urlhub = require('../urlhub');

var routes = [
  { path: '/', cb: 'root', children: [
    { path: 'sub', cb: 'sub', children: [
      { path: 'subsub', cb: 'subsub' },
      { path: 'subparam/:pn', cb: 'subparam'},
      { path: ':starting/param', cb: 'substarting'},
      { path: '*', cb: 'innerNotfound'},
    ]}
  ]},
  { path: 'second', cb: 'second' },
  { path: 'param/:pn', cb: 'param' },
  { path: 'multi/:param/route/:param2', cb: 'multiparam'},
  { path: '*', cb: 'notfound' }
];

var router = urlhub.create( routes, {strategy: {}} );


test('join routes test', t => {
  t.equal( urlhub.joinUrls(), '/' );
  t.equal( urlhub.joinUrls('/'), '/' );
  t.equal( urlhub.joinUrls('/', ''), '/' );
  t.equal( urlhub.joinUrls('', ''), '/' );
  t.equal( urlhub.joinUrls('', '/'), '/' );

  t.equal( urlhub.joinUrls('/', '/test'), '/test' );

  t.equal( urlhub.joinUrls('test'), '/test' );
  t.equal( urlhub.joinUrls('test/'), '/test' );
  t.equal( urlhub.joinUrls('/test'), '/test' );
  t.equal( urlhub.joinUrls('', 'test'), '/test' );

  t.equal( urlhub.joinUrls('test', 'path'), '/test/path' );
  t.equal( urlhub.joinUrls('test/', 'path'), '/test/path' );
  t.equal( urlhub.joinUrls('test/', '/path'), '/test/path' );
  t.equal( urlhub.joinUrls('/test/', '/path/'), '/test/path' );

  t.end();
})


test('route match test', t => {
  t.deepEqual( router.match('/').matches, ['root'], 'Root route match' );
  t.deepEqual( router.match('/sub').matches, ['root', 'sub'], 'Subroute match' );
  t.deepEqual( router.match('sub').matches, ['root', 'sub'], 'Relatative match' );

  t.deepEqual( router.match('/sub/subsub').matches, ['root', 'sub', 'subsub'], 'Subsubroute match' );
  t.deepEqual( router.match('/sub/subparam/param').matches, ['root', 'sub', 'subparam'], 'Subparam match' );
  t.deepEqual( router.match('/sub/12/param').matches, ['root', 'sub', 'substarting'], 'Subroute starting with a param' );
  t.deepEqual( router.match('/sub/whatever/weird').matches, ['root', 'sub', 'innerNotfound'], 'Inner not found' );

  t.deepEqual( router.match('/second').matches, ['second'], 'Second route' );
  t.deepEqual( router.match('/param/12').matches, ['param'], 'Route with params match' );

  t.deepEqual( router.match('/multi/12/route/10').matches, ['multiparam'], 'Route with multiple inner params' );

  t.deepEqual( router.match('/undefined/whatever/more').matches, ['notfound'], 'Not found routes');
  t.end();
});

test('query parsing test', t => {
  t.deepEqual( router.match('/').query, {}, 'No query in root' );
  t.deepEqual( router.match('/sub').query, {}, 'No query in subroute' );
  t.deepEqual( router.match('/sub/12/param').query, {}, 'No query with params' );

  t.deepEqual( router.match('/?').query, {}, 'Empty query in root' );
  t.deepEqual( router.match('/sub?').query, {}, 'Empty query in subroute' );
  t.deepEqual( router.match('/sub/12/param?').query, {}, 'Empty query with params' );

  t.deepEqual( router.match('/?#').query, {}, 'Empty query in root with hash' );
  t.deepEqual( router.match('/sub?#').query, {}, 'Empty query in subroute with hash' );
  t.deepEqual( router.match('/sub/12/param?#').query, {}, 'Empty query with params with hash' );

  t.deepEqual( router.match('/?foo=bar').query, {foo: 'bar'}, 'Foobar in root' );
  t.deepEqual( router.match('/sub?foo=bar').query, {foo: 'bar'}, 'Foobar in subroute' );
  t.deepEqual( router.match('/sub/12/param?foo=bar').query, {foo: 'bar'}, 'Foobar with params' );

  t.deepEqual( router.match('/#?foo=bar').query, {}, 'No queries after hash' );

  t.deepEqual( router.match('/?foo=bar&second=ok').query, {foo: 'bar', second: 'ok'}, 'Compound query in root' );
  t.deepEqual( router.match('/sub?foo=bar&second=ok').query, {foo: 'bar', second: 'ok'}, 'Compound query in subroute' );
  t.deepEqual( router.match('/sub/12/param?foo=bar&second=ok').query, {foo: 'bar', second: 'ok'}, 'Compound query with params' );

  t.deepEqual( router.match('/unknown?foo=bar&second=ok').query, {foo: 'bar', second: 'ok'}, 'Query in not found route' );

  t.end();
});

test('Params parsing test', t => {
  t.deepEqual( router.match('/').params, {}, 'No params in root' );
  t.deepEqual( router.match('/?foo=bar').params, {}, 'No params in root with query' );
  t.deepEqual( router.match('/#hash').params, {}, 'No params in root with hash' );

  t.deepEqual( router.match('/sub/subparam/10').params, {pn: '10'}, 'Deep params' );
  t.deepEqual( router.match('/multi/12/route/10').params, {param: '12', param2: '10'}, 'Multiple inner params' );
  t.deepEqual( router.match('/sub/foobar/param').params, {starting: 'foobar'}, 'Inner param' );

  t.end();
});

test('Pathname test', t => {
  t.deepEqual( router.match('/').pathname, '/', 'Pathname in root' );
  t.deepEqual( router.match('/?foo=bar').pathname, '/', 'Pathname in root with query' );
  t.deepEqual( router.match('/#hash').pathname, '/', 'Pathname in root with hash' );

  t.deepEqual( router.match('/sub?foo=bar#hash').pathname, '/sub', 'Pathname with query and hash' );

  t.deepEqual( router.match('/sub/subparam/10').pathname, '/sub/subparam/10', 'Pathname with params' );
  t.deepEqual( router.match('/multi/12/route/10').pathname, '/multi/12/route/10', 'Pathname with multiple params' );

  t.end();
});

test('Hash test', t => {
  t.deepEqual( router.match('/').hash, '', 'No hash' );
  t.deepEqual( router.match('/sub').hash, '', 'No hash in subroute' );

  t.deepEqual( router.match('/#hash').hash, '#hash', 'Hash in route' );
  t.deepEqual( router.match('/sub#hash').hash, '#hash', 'Hash in subroute' );

  t.deepEqual( router.match('/sub#hash?foo=bar').hash, '#hash?foo=bar', 'Query in hash' );

  t.deepEqual( router.match('/sub?foo=bar#hash').hash, '#hash', 'Hash with queries' );

  t.deepEqual( router.match('/sub/subparam/10#hash').hash, '#hash', 'Hash with params' );

  t.end()
});

test('Route test', t => {
  t.deepEqual( router.match('/').route, '/', 'Root route' );
  t.deepEqual( router.match('/sub').route, '/sub', 'Sub route' );
  t.deepEqual( router.match('/sub?foo=bar#hash').route, '/sub', 'Sub route with query and hash' );
  t.deepEqual( router.match('/sub/subparam/hello').route, '/sub/subparam/:pn', 'Sub route with params' );
  t.deepEqual( router.match('/sub/notfound').route, '/sub/*', 'Sub route notfound' );
  t.deepEqual( router.match('/multi/12/route/10').route, '/multi/:param/route/:param2', 'Sub route with params' );
  t.deepEqual( router.match('/notfound').route, '/*', 'Not found' );

  t.end();
})
