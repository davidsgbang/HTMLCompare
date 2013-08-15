/**
* These classes are used both in the editor and on the user's site
* In edit mode, functionality is added to these classes in bldr.modules.js
* Therefore, this file should only contain SHARED methods
*/

define('webs.modules', ['require', 'jquery', 'ModuleClassLoader', 'log', 'spine', 'tooltip'], function(require, $, ModuleClassLoader, log){
	var Module = Spine.Controller.create({
			init: function(options){
				this.data = options.data;
			},

			oneLoaded: function(){
				// modules should override this
			},

			// We're overriding Spine.Event.trigger so that buggy callbacks don't mess up the call stack
			trigger: function() {
				var args = Spine.makeArray(arguments);
				var ev   = args.shift();

				var list, calls, i, l;
				if (!(calls = this.hasOwnProperty("_callbacks") && this._callbacks)) return false;
				if (!(list  = this._callbacks[ev])) return false;

				for (i = 0, l = list.length; i < l; i++) {
					try {
						if (list[i].apply(this, args) === false)
							return false;
					} catch (error) {
						log.trigger("Modules", "error", "Module:" + this.parent.slug + ", Event:" + ev, error);
					}
				}

				return true;
			}
		}),

		CustomModule = Module.create(),

		CompositeModule = CustomModule.create(),

		WidgetModule = Module.create(),

		IframeModule = Module.create(),

		AppModule = Module.create();

		// Class Methods
		Module.extend({
			styles: []
		});

		CompositeModule.include({
			/**
			 * Subclasses of CompositeModule SHOULD override this method if there is
			 * any submodule *SLUG* where data.*SLUG* is not the module data for the submodule,
			 * it should return an array of objects describing each submodule, e.g.:
			 * [
			 *   {
			 *     name: "unique identifier (within the scope of this composite module) for the submodule",
			 *     el: "root container for the submodule",
			 *     slug: "name of module class",
			 *     data: {data: "for", the: "submodule"},
			 *   },
			 *   {
			 *     ...
			 *   },
			 * ]
			 */
			describeSubmodules: function(){
				var self = this,
					$top = self.el.children(".webs-composite-module").eq(0),
					submoduleContainers = $top.find(".webs-submodule"),
					submoduleDescriptions = [];
				$.each(submoduleContainers, function(index){
					var container = submoduleContainers.eq(index);
					if (container.parents(".webs-composite-module")[0] === $top[0]) {
						var slug = container.attr("webs-submodule-slug");
						submoduleDescriptions.push({
							name: slug,
							el: container,
							slug: container.attr("webs-submodule-slug"),
							data: self.data[slug]
						});
					}
				});
				return submoduleDescriptions;
			},

			bindSubmodules: function(){
				var self = this,
					descriptions = this.describeSubmodules();
				self.submoduleInstances = {};
				$.each(descriptions, function(i) {
					var desc = descriptions[i];
					require('ModuleClassLoader').create(desc.slug, {el: desc.el, data: desc.data}).done(function(submodule){
						self.submoduleInstances[desc.name] = submodule;
						desc.el.data("controller", submodule);
					});
				});
			},

			oneLoaded: function(){
				this.bindSubmodules();
				$.each(this.submoduleInstances, function(name, submodule){
					submodule.oneLoaded();
				});
			}
		});

		webs.modules = {
			Module: Module,
			CustomModule: CustomModule,
			IframeModule: IframeModule,
			WidgetModule: WidgetModule,
			AppModule: AppModule,
			CompositeModule: CompositeModule//,
//			ModuleClassLoader: require('ModuleClassLoader')
		};

		return webs.modules;
});
