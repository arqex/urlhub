var routes = require('../tests/routeData');
var urlhub = require('../urlhub');
var nodeStrategy = require('../nodeStrategy');

function createRouter( options ){
  var r = urlhub.create( options || {strategy: nodeStrategy} );
  r.setRoutes(routes);
  r.start();
  return r;
}

describe( 'Node - Basic navigation', function() {

	it( 'pushing urls', function(){
    var router = createRouter();

    router.push('/sub');
    expect( router.location.pathname ).toBe('/sub');

    router.push('/param/12');
    expect( router.location.pathname ).toBe('/param/12');

    router.push('/');
    expect( router.location.pathname ).toBe('/');

    router.stop();
  })
  
  it('Listen to replace changes', function( done ){
    var router = createRouter();
    var path = '/sub/subparam/second';

    router.onChange( function( location ){
      expect( location ).toEqual( {
        hash: '',
        matches: ['root', 'sub', 'subparam'],
        matchIds: [ '/', '/sub', '/sub/subparam/:pn' ],
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