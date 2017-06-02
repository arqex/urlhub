// routes are defined globally at ./routeData.js

function createRouter(){
  var r = urlhub.create( routes, {strategy: pushStrategy} );
  r.start();
  return r;
}
var router = urlhub.create( routes, {strategy: pushStrategy} );


describe( 'Basic navigation', function(){
  it('pushing urls', function(){
    router.push('/sub');
    expect( location.pathname ).toBe('/sub');

    router.push('/param/12');
    expect( location.pathname ).toBe('/param/12');

    router.push('/');
    expect( location.pathname ).toBe('/');
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

      done();
    });

    router.replace( path );
  });

  it('basePath test', function( done ){
    var basePath = '/sub/subparam',
      router = urlhub.create( routes, {strategy: pushStrategy, basePath: basePath} ),
      location = router.start()
    ;

    expect( location ).toEqual( {
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

      done();
    });

    router.push('/param/hola');
  })
});
