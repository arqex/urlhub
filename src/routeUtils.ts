import { MatchInfo, RegexRoute, UrlhubLocation, UrlhubLocationWithMatches, UrlhubRoute } from "./urlhub.types";
import { pathToRegexp } from './vendor/path-to-regexp';
import { parse as parseQuery } from "./vendor/mini-querystring";

export function toRegexRoutes<T>( routes: UrlhubRoute<T>[], parent?: string ): RegexRoute<T>[] {
  const parsedRoutes: RegexRoute<T>[] = [];
  routes.forEach( route => {
    if( route.path === '/*' ) {
      return parsedRoutes.push({
        regex: /(.*)/,
        id: '/*',
        cb: route.cb,
        params: []
      });
    }
    const path = joinUrls(parent, route.path);
    const params:any[] = [];
    const parsed:RegexRoute<T> = {
      regex: pathToRegexp( path, params ),
      id: path,
      cb: route.cb,
      params: []
    }

    parsed.params = params.map( param => param.name );
    if( route.children?.length ) {
      parsed.childRegex = pathToRegexp( path, [], {end: false} );
      parsed.children = toRegexRoutes( route.children, path );
    }

    parsedRoutes.push( parsed );
  });

  return parsedRoutes;
}


function joinUrls( one?: string, two?: string ){
  var first = sanitizeUrl(one),
    second = sanitizeUrl(two)
  ;

  if( !one ) return second;
  if( !two ) return first;

  if( first === '/'){
    return second;
  }
  else if( second === '/' ){
    return first;
  }
  else {
    return first + second;
  }
}

function sanitizeUrl( url?: string){
  if( !url ) return '/';
  var sanitized = url;
  if( sanitized[ sanitized.length - 1 ] === '/' ){
    sanitized = sanitized.slice(0, sanitized.length - 1);
  }
  if( sanitized[0] !== '/' ){
    sanitized = '/' + sanitized;
  }
  return sanitized;
}

export function matchPathname<T>( pathname: string, candidates: RegexRoute<T>[] ): MatchInfo<T> | undefined {
  let i = 0;

  while( i < candidates.length ) {
    const candidate = candidates[i];

    if( candidate.childRegex && candidate.childRegex.test( pathname ) ){
      const childMatch = matchPathname( pathname, candidate.children! );
      if( childMatch ) {
        return {
          matches: [candidate.cb].concat( childMatch.matches ),
          matchIds: [candidate.id].concat( childMatch.matchIds )
        }
      }
    }

    const match = candidate.regex.exec( pathname );
    if( match ) {
      return {
        matches: [candidate.cb],
        matchIds: [candidate.id]
      }
    }

    i++;
  }
}

export function createLocation<T>( fullpath: string, routes: RegexRoute<T>[] ): UrlhubLocation<T> | undefined {
  const { pathname, search, hash } = new URL( fullpath, 'ftp://x' );
  const matchInfo = matchPathname( pathname, routes! );
  if(!matchInfo) return;

  const [route] = matchInfo?.matchIds.slice(-1);
  return {
    pathname,
    search,
    hash,
    query: parseQuery( search ),
    ...matchInfo,
    route,
    params: parseRouteParams( pathname, route ),
    fullpath
  };
}

function parseRouteParams( pathname: string, route: string ) {
  const params: any = {};
  const routeSegments = route.split('/');
  const pathSegments = pathname.split('/');

  routeSegments.forEach( (segment, i) => {
    if( segment[0] === ':' ) {
      params[ segment.slice(1) ] = pathSegments[i];
    }
  });

  return params;
}

export function getFullpath( location: any ){
  return location.pathname + location.search + location.hash;
}
