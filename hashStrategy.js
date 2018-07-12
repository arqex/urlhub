var onChange = function () {};
var hashStrategy = {
	init: function (options) {
	},

	start: function () {
		var me = this;

		if (!location.hash) {
			location.hash = '#/';
		}

		// Register event listener
		window.onhashchange = function () {
			me.emit();
		};

		// Emit first onChange
		me.emit();
	},
	push: function (route) {
		window.location.hash = '#' + route;
	},
	replace: function (route) {
		var url = location.protocol + '//' + location.host + location.pathname + '#' + route;

		location.replace(url);
	},
	onChange: function (cb) {
		onChange = cb;
	},
	getLocation: function () {
		if( !location.hash ){
			return '/';
		}
		else if (location.hash[1] !== '/') {
			return '/' + location.hash;
		}
		return location.hash.slice(1);
	},
	emit: function () {
		onChange(this.getLocation());
	}
};

module.exports = hashStrategy;
