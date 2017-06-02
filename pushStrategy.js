var onChange;
var pushStrategy = {
  init: function( options ){
    this.basePath = options.basePath || '';
    if( this.basePath.slice(-1) === '/' ){
      this.basePath = this.basePath.slice(0, -1);
    }
  },

  start: function(){
    var me = this;

    // Register event listener
    window.onpopstate = function(){
      me.emit();
    };

    // Emit first onChange
    me.emit();
  },
  push: function( location ){
    history.pushState( {}, '', this.basePath + location );
    this.emit();
  },
  replace: function( location ){
    history.replaceState( {}, '', this.basePath + location );
    this.emit();
  },
  onChange: function( cb ){
    onChange = cb;
  },
  getLocation: function(){
    var l = location.pathname + location.search + location.hash,
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

module.exports = pushStrategy;
