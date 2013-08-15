// Load Airbrake before the 1st error, so that we don't need to require() it and lose the stack trace.
if (top && top.webs && top.webs.mode && (top.webs.mode == "bldr" || top.webs.mode == "dsnr")) {
	if (typeof(require) == "function") require(["airbrakeNotifier"], function log_notifyAirbrake_loadHoptoad(){
		Hoptoad.setKey('d6f560c3b67ba3ef7b364d75750f06ca');
		Hoptoad.setEnvironment((webs && webs.props && webs.props.environment) || "development");
		Hoptoad.setErrorDefaults({
			url: window.location,
			component: "SiteBuilder"
		});
	});
}

if(!window.webs) window.webs = {};
window.webs.log = (function create_webs_log(){
	var methods = ["log", "debug", "dir", "info", "warn", "error", "group", "groupEnd"],
		log = {},
		i, method,

	inArray = function log_inArray( elem, array ) {
		if (!array) return -1;
		if (typeof array.indexOf === "function") return array.indexOf(elem);
		for (var i = 0, length = array.length; i < length; i++ ) if (array[i] === elem) return i;
		return -1;
	},
	getURLParam = function log_getURLParam( name ) {
		name = name.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
		var regexS = "[\\?&]"+name+"=([^&#]*)",
			regex = new RegExp( regexS ),
			results = regex.exec( window.location.href );
		return results === null ? "" : results[1];
	},
	notifyAirbrake = function(params, category){
		if(window.Hoptoad){
			var msg;
			if(params && params.length) {
				msg = params[0] ? params[0].toString() : params[0];
				for(var i=1,len=params.length;i<len;i++) {
					msg += ', ' + (params[i] ? params[i].toString() : params[i]);
				}
			} else {
				msg = '[no log params]';
			}

			var hoptoadOpts = {
				errorType: 'log',
				message: msg
			};
			if(category) hoptoadOpts.action = category;
			Hoptoad.notify(hoptoadOpts);
		}
	};

	// enable logging of certain category
	log.enabled = getURLParam("log") || [];
	log.enable = function log_enable(type) {
		if(inArray(type, log.enabled) === -1) {
			log.enabled.push(type);
		}
	};

	log.trigger = function log_trigger(category, type){
		var params = Array.prototype.slice.call(arguments, 2);
		params.splice(0,0, "[LOGGING \"" + category + "\"]");

		if(log.enabled.length === 0 || inArray(category, log.enabled) !== -1) {
			if(typeof(log[type]) === "function")
				log[type].apply(log, params);

            if(type === "error"){
                notifyAirbrake(params, category);
            }
		}
	};

	for(i=0; i<methods.length; i++){
		method = methods[i];

		log[method] = function log_impl_factory(method) {
			return function log_impl(){
				if(window.console && typeof(console[method]) === "function") {
					console[method].apply(console, Array.prototype.slice.call(arguments));
				}
				if(method == 'error') notifyAirbrake(Array.prototype.slice.call(arguments));
			};
		}(method);
	}

	return log;
})();

if(typeof(define) !== 'undefined' && define.amd) define('log', [], function define_log(){return webs.log;});
