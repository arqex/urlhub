// routes are defined globally at ./routeData.js
var router = urlhub.create( {strategy: {}} );
router.setRoutes(routes);

describe( 'Route match test', function(){
  it('join routes test', function() {
    expect( urlhub.joinUrls() ).toBe( '/' );
    expect( urlhub.joinUrls('/') ).toBe( '/' );
    expect( urlhub.joinUrls('/', '') ).toBe( '/' );
    expect( urlhub.joinUrls('', '') ).toBe( '/' );
    expect( urlhub.joinUrls('', '/') ).toBe( '/' );

    expect( urlhub.joinUrls('/', '/test') ).toBe( '/test' );

    expect( urlhub.joinUrls('test') ).toBe( '/test' );
    expect( urlhub.joinUrls('test/') ).toBe( '/test' );
    expect( urlhub.joinUrls('/test') ).toBe( '/test' );
    expect( urlhub.joinUrls('', 'test') ).toBe( '/test' );

    expect( urlhub.joinUrls('test', 'path') ).toBe( '/test/path' );
    expect( urlhub.joinUrls('test/', 'path') ).toBe( '/test/path' );
    expect( urlhub.joinUrls('test/', '/path') ).toBe( '/test/path' );
    expect( urlhub.joinUrls('/test/', '/path/') ).toBe( '/test/path' );
  })


  it('route match test', function() {
    expect( router.match('/').matches, 'Root route match' ).toEqual(['root']);
    expect( router.match('/sub').matches, 'Subroute match' ).toEqual(['root', 'sub']);
    expect( router.match('sub').matches, 'Relatative match' ).toEqual(['root', 'sub']);

    expect( router.match('/sub/subsub').matches, 'Subsubroute match' ).toEqual(['root', 'sub', 'subsub']);
    expect( router.match('/sub/subparam/param').matches, 'Subparam match' ).toEqual(['root', 'sub', 'subparam']);
    expect( router.match('/sub/12/param').matches, 'Subroute starting with a param' ).toEqual(['root', 'sub', 'substarting']);
    expect( router.match('/sub/whatever/weird').matches, 'Inner not found' ).toEqual(['root', 'sub', 'innerNotfound']);

    expect( router.match('/second').matches, 'Second route' ).toEqual(['second']);
    expect( router.match('/param/12').matches, 'Route with params match' ).toEqual(['param']);

    expect( router.match('/multi/12/route/10').matches, 'Route with multiple inner params' ).toEqual(['multiparam']);

    expect( router.match('/undefined/whatever/more').matches, 'Not found routes').toEqual(['notfound'])
  });

  it('query parsing test', function() {
    expect( router.match('/').query, 'No query in root' ).toEqual({});
    expect( router.match('/sub').query, 'No query in subroute' )
			.toEqual({});
    expect( router.match('/sub/12/param').query, 'No query with params' )
			.toEqual({});

    expect( router.match('/?').query, 'Empty query in root' )
			.toEqual({});
    expect( router.match('/sub?').query, 'Empty query in subroute' )
			.toEqual({});
    expect( router.match('/sub/12/param?').query, 'Empty query with params' )
			.toEqual({});

    expect( router.match('/?#').query, 'Empty query in root with hash' )
			.toEqual({});
    expect( router.match('/sub?#').query, 'Empty query in subroute with hash' )
			.toEqual({});
    expect( router.match('/sub/12/param?#').query, 'Empty query with params with hash' )
			.toEqual({});

    expect( router.match('/?foo=bar').query, 'Foobar in root' )
			.toEqual({foo: 'bar'});
    expect( router.match('/sub?foo=bar').query, 'Foobar in subroute' )
			.toEqual({foo: 'bar'});
    expect( router.match('/sub/12/param?foo=bar').query, 'Foobar with params' )
			.toEqual({foo: 'bar'});

    expect( router.match('/#?foo=bar').query, 'No queries after hash' )
			.toEqual({});

    expect( router.match('/?foo=bar&second=ok').query, 'Compound query in root' )
			.toEqual({foo: 'bar', second: 'ok'});
    expect( router.match('/sub?foo=bar&second=ok').query, 'Compound query in subroute' )
			.toEqual({foo: 'bar', second: 'ok'});
    expect( router.match('/sub/12/param?foo=bar&second=ok').query, 'Compound query with params' )
			.toEqual({foo: 'bar', second: 'ok'});

    expect( router.match('/unknown?foo=bar&second=ok').query, 'Query in not found route' )
			.toEqual({foo: 'bar', second: 'ok'});
  });

  it('Params parsing test', function() {
    expect( router.match('/').params, 'No params in root' )
			.toEqual({});
    expect( router.match('/?foo=bar').params, 'No params in root with query' )
			.toEqual({});
    expect( router.match('/#hash').params, 'No params in root with hash' )
			.toEqual({});

    expect( router.match('/sub/subparam/10').params, 'Deep params' )
			.toEqual({pn: '10'});
    expect( router.match('/multi/12/route/10').params, 'Multiple inner params' )
			.toEqual({param: '12', param2: '10'});
    expect( router.match('/sub/foobar/param').params, 'Inner param' )
			.toEqual({starting: 'foobar'});
  });

  it('Pathname test', function() {
    expect( router.match('/').pathname, 'Pathname in root' )
			.toEqual( '/' );
    expect( router.match('/?foo=bar').pathname, 'Pathname in root with query' )
			.toEqual( '/' );
    expect( router.match('/#hash').pathname, 'Pathname in root with hash' )
			.toEqual( '/' );

    expect( router.match('/sub?foo=bar#hash').pathname, 'Pathname with query and hash' )
			.toEqual( '/sub' );

    expect( router.match('/sub/subparam/10').pathname, 'Pathname with params' )
			.toEqual( '/sub/subparam/10' );
    expect( router.match('/multi/12/route/10').pathname, 'Pathname with multiple params' )
			.toEqual( '/multi/12/route/10' );
  });

  it('Hash test', function() {
    expect( router.match('/').hash, 'No hash' )
			.toEqual( '' );
    expect( router.match('/sub').hash, 'No hash in subroute' )
			.toEqual( '' );

    expect( router.match('/#hash').hash, 'Hash in route' )
			.toEqual( '#hash' );
    expect( router.match('/sub#hash').hash, 'Hash in subroute' )
			.toEqual( '#hash' );

    expect( router.match('/sub#hash?foo=bar').hash, 'Query in hash' )
			.toEqual( '#hash?foo=bar' );

    expect( router.match('/sub?foo=bar#hash').hash, 'Hash with queries' )
			.toEqual( '#hash' );

    expect( router.match('/sub/subparam/10#hash').hash, 'Hash with params' )
			.toEqual( '#hash' );
  });

  it('Route test', function() {
    expect( router.match('/').route, 'Root route' )
			.toEqual( '/' );
    expect( router.match('/sub').route, 'Sub route' )
			.toEqual( '/sub' );
    expect( router.match('/sub?foo=bar#hash').route, 'Sub route with query and hash' )
			.toEqual( '/sub' );
    expect( router.match('/sub/subparam/hello').route, 'Sub route with params' )
			.toEqual( '/sub/subparam/:pn' );
    expect( router.match('/sub/notfound').route, 'Sub route notfound' )
			.toEqual( '/sub/*' );
    expect( router.match('/multi/12/route/10').route, 'Sub route with params' )
			.toEqual( '/multi/:param/route/:param2' );
    expect( router.match('/notfound').route, 'Not found' )
			.toEqual( '/*' );
  })
});
