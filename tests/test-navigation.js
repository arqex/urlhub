// routes are defined globally at ./routeData.js

function createRouter( options ){
  var r = urlhub.create( options || {strategy: pushStrategy} );
  r.setRoutes(routes);
  r.start();
  return r;
}

describe( 'Basic navigation', function(){
  it('pushing urls', function(){
    var router = createRouter();
    router.push('/sub');
    expect( location.pathname ).toBe('/sub');

    router.push('/param/12');
    expect( location.pathname ).toBe('/param/12');

    router.push('/');
    expect( location.pathname ).toBe('/');
    router.stop()
  });
});

describe( 'Listening to changes', function(){

  it('Listen to push changes', function( done ){
    var router = createRouter();
    var path = '/multi/a/route/b';

    router.onChange( function( location ){
      expect( location ).toEqual( {
        hash: '',
        matches: ['multiparam'],
        params: {param: 'a', param2: 'b'},
        pathname: path,
        query: {},
        route: '/multi/:param/route/:param2',
        search: ''
      });
      router.stop();
      done();
    });

    router.push( path );
  });

  it('Listen to replace changes', function( done ){
    var router = createRouter();
    var path = '/sub/subparam/second';

    router.onChange( function( location ){
      expect( location ).toEqual( {
        hash: '',
        matches: ['root', 'sub', 'subparam'],
        params: {pn: 'second'},
        pathname: path,
        query: {},
        route: '/sub/subparam/:pn',
        search: ''
      });

      router.stop();
      done();
    });

    router.replace( path );
  });

  it('basePath test', function( done ){
    var basePath = '/sub/subparam',
      router = createRouter({strategy: pushStrategy, basePath: basePath})
    ;

    expect( router.location ).toEqual( {
      hash: '',
      matches: ['second'],
      params: {},
      pathname: '/second',
      query: {},
      route: '/second',
      search: ''
    });

    expect( window.location.pathname ).toBe( basePath + '/second' );

    var path = '/param/hola';
    router.onChange( function( location ){
      expect( location ).toEqual( {
        hash: '',
        matches: ['param'],
        params: {pn: 'hola'},
        pathname: path,
        query: {},
        route: '/param/:pn',
        search: ''
      });

      expect( window.location.pathname ).toBe( basePath + path );

      router.stop();
      done();
    });

    router.push('/param/hola');
  })
});
