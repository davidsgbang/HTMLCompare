define(['jquery', 'ModuleClassLoader'], function($, ModuleClassLoader){
	var module = {}, extend = {};


		// SubModules

		// Module Styles
		extend.styles = {"default":{"global":{"css":"view.less"},"instance":{"css":"view.each.less"},"slug":"default"}};
		if (!extend.styles['default']['global']) {
			extend.styles['default']['global'] = {};
		}
		extend.styles['default']['global']['js'] = null;
		extend.defaultStyle = extend.styles['default'];

		// View JS
		module.oneLoaded = function() {};


	ModuleClassLoader.register('header_editor', module, extend);
});