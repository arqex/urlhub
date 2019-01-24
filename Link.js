import React from 'react';

export default function Link( props ){
  var attrs = {};
  for( var prop in props ){
    if( prop === 'to' ){
      attrs.href = translate( props.to );
    }
    else if( prop === 'children' ){
      // Nothing, children are passed to the createElement method directly
    }
    else {
      attrs[prop] = props[prop];
    }
  }

  attrs.onClick = function(e){ onClick(e, props.to, props.onClick) };

  return React.createElement('a', attrs, props.children);
}

function isHash(){
  return document.location.hash.slice(0,2) === '#/';
}
function translate( path ){
  if( isHash() ){
    return '#' + path;
  }
  return path;
}

function onClick( e, to, onClick ){
  if ( onClick ) onClick(e);

  if ( !e.defaultPrevented ){
    e.preventDefault();

    if( isHash() ){
      document.location.hash = '#' + to;
    }
    else {
      history.pushState({},'',to);
      window.onpopstate();
    }
  }

}
