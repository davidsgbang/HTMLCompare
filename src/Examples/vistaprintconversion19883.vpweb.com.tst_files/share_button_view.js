require(['jquery'], function($){
	var module = {}, extend = {};


	// Module Styles
	extend.styles = {"default":{"global":{"css":"view.less"},"slug":"default"}};
	if (!extend.styles['default']['global']) {
		extend.styles['default']['global'] = {};
	}
	extend.styles['default']['global']['js'] = null;
	extend.defaultStyle = extend.styles['default'];

	// View JS
	module.oneLoaded = function(){
	require(["http://s7.addthis.com/js/300/addthis_widget.js#domready=1&pubid=webs"]);
};

	webs.modules.ModuleClassLoader.register('share_button', module, extend);
});