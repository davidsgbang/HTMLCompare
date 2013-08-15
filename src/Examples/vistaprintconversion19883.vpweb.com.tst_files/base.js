(function(){

	/* Object.create is native, but not in older browsers */
	if (typeof Object.create !== "function") {
	  Object.create = (function () {
	    function F() {} // created only once
	    return function (o) {
	      F.prototype = o; // reused on each invocation
	      return new F();
	    };
	  })();
	}

	Array.max = function( array ){ return Math.max.apply( Math, array ); };
	Array.min = function( array ){ return Math.min.apply( Math, array ); };

	/* Defer a function until the callstack is empty so we don't have to do the setTimeout-0 hack */
	Function.prototype.deferFn = function() {
	   var __method = this, args = Array.prototype.slice.call(arguments, 0);
	   return window.setTimeout(function() {
	      return __method.apply(__method, args);
	   }, 0.01);
	};

	if(typeof(window.webs) === 'undefined') window.webs = {};

	// Copied into designerChrome.js :(
	// Copied into editAppPage.jsp :( x 2
	webs.showPremiumDialog = function(feature) {
		var popover = new Popover('/s/sitebuilder/requiresPremium?feature=' + feature, {
			heading: 'Upgrade Today!',
			width: 620,
			height: 510
		});
		popover.show();
	};
})();
