var onChange = function () {};
var hashStrategy = {
	init: function (options) {
		this.basePath = options.basePath || '';
		if (this.basePath.slice(-1) === '/') {
			this.basePath = this.basePath.slice(0, -1);
		}
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
	push: function (location) {
		window.location.hash = '#' + location;
		this.emit();
	},
	replace: function (location) {
		var loc = location,
			url = loc.protocol + '//' + loc.host + loc.pathname + '#' + location
		;

		loc.replace(url);
		this.emit();
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
