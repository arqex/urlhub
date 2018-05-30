// routes are defined globally at ./routeData.js

function createHashRouter( options ){
  var r = urlhub.create( options || {strategy: hashStrategy} );
  r.setRoutes(routes);
  r.start();
  return r;
}

var router = urlhub.create({strategy: hashStrategy});
router.setRoutes(routes);


describe( 'Hash - Basic navigation', function(){
  it('pushing urls', function(){
    router.push('/sub');
    expect( location.hash ).toBe('#/sub');

    router.push('/param/12');
    expect( location.hash ).toBe('#/param/12');

    router.push('/');
    expect( location.hash ).toBe('#/');

    router.stop();
  });
});

describe( 'Hash - Listening to changes', function(){

  it('Listen to push changes', function( done ){
    var router = createHashRouter();
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
    var router = createHashRouter();
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
});
