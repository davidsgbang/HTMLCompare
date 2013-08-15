define(['jquery', 'ModuleClassLoader'], function($, ModuleClassLoader){
	var module = {}, extend = {};


		// SubModules

		// Module Styles
		extend.styles = {"default":{"global":{"css":"view.less"},"slug":"default"}};
		if (!extend.styles['default']['global']) {
			extend.styles['default']['global'] = {};
		}
		extend.styles['default']['global']['js'] = null;
		extend.defaultStyle = extend.styles['default'];

		// View JS
		


	ModuleClassLoader.register('button', module, extend);
});