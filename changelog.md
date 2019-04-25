# v0.7.2
* Allow to add a onClick handler to the Link component

# v0.7.1
* The implementation of the method `back` has been moved to the strategy to not fail in node environments.

# v0.7.0
* Adds the nodeStrategy for running the router in the server.
* Updates the urlhub to be run in a node environment.
* Updates testing dependencies.

# v0.6.0
* Adds matchIds to the match object.
* Updates testing dependencies.

## v0.5.1
* Fixes error on routes with parameters.

## v0.5.0
* `match()` now returns an empty a location object with an empty `matches` array if the route is not found.

## v0.4.1
* Removes triggering changes after push or replace in hash strategy.

## v0.4.0
* Normalize pathnames to make it work with IE.

## v0.3.0
* Adds the `refresh` method.
* Updates matching order to give preference to child root routes.

## v0.2.0
* Adds the `onBeforeChange` hook.
* Fixes to the hash strategy.
* Adds tests for the hash strategy.
* Adds `hashStrategy` to the UMD file.

## v0.1.3
* No changes, only fixes npm issues.

## v0.1.2
* Adds hash strategy.

## v0.1.1
* Fixes problems with the basePath.

## v0.1.0
* Refactored relationship between urlhub and strategy.
* Adds basePath option to the pushStrategy.

## v0.0.2
* Add tests, router packed as a UMD module.

## v0.0.1
* First version, main functionality in place.
