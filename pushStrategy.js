var onChange;
var pushStrategy = {
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
    history.pushState({},'',location);
    this.emit();
  },
  replace: function( location ){
    history.replaceState({},'',location);
    this.emit();
  },
  onChange: function( cb ){
    onChange = cb;
  },
  getLocation: function(){
    return location.pathname + location.search + location.hash;
  },
  emit: function(){
    onChange && onChange( this.getLocation() );
  }
};

export default pushStrategy;
