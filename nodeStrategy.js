var qs = require('mini-querystring');
var onChange = function () {};

var nodeStrategy = {
  init: function( options ){
		this.history = [ options.initialLocation || '/' ];
  },
  start: function(){
    this.emit();
  },
  push: function( location ){
		this.history.push( location );
    this.emit();
  },
  replace: function( location ){
		this.history[ this.history.length ] = location;
    this.emit();
  },
  onChange: function( cb ){
    onChange = cb;
  },
  getLocation: function(){
    return this.history[ this.history.length - 1 ];
  },
  emit: function(){
    onChange && onChange( this.getLocation() );
	},
	parseUrl: function( str ){
		var parts = str.split('?')
		var searchParts = parts[1] ? parts[1].split('#') : [];
		return {
			pathname: parts[0],
			search: searchParts[0] ? '?' + searchParts[0] : '',
			hash: searchParts[1] ? '#' + searchParts[1] : '',
			query: searchParts[0] ? qs.parse( searchParts[0] ) : {}
		}
	}
};

module.exports = nodeStrategy;