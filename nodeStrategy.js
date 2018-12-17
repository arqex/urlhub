var onChange = function () {};

var nodeStrategy = {
  init: function( options ){
    this.basePath = options.basePath || '';
    if( this.basePath.slice(-1) === '/' ){
      this.basePath = this.basePath.slice(0, -1);
		}
		this.history = [ this.basePath + (options.initialLocation || '/') ];
  },
  start: function(){
    me.emit();
  },
  push: function( location ){
		this.history.push( this.basePath + location );
    this.emit();
  },
  replace: function( location ){
		this.history[ this.history.length ] = this.basePath + location;
    this.emit();
  },
  onChange: function( cb ){
    onChange = cb;
  },
  getLocation: function(){
    var l = this.history[ this.history.length ],
      basePathLength = this.basePath.length
    ;

    if( l.slice(0, basePathLength) === this.basePath ){
      l = l.slice( basePathLength );
    }

    return l;
  },
  emit: function(){
    onChange && onChange( this.getLocation() );
  }
};

module.exports = nodeStrategy;