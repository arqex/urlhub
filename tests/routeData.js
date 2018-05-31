window.routes = [
  { path: '/', cb: 'root', children: [
    { path: 'sub', cb: 'sub', children: [
      { path: '/', cb: 'rootChild'},
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
