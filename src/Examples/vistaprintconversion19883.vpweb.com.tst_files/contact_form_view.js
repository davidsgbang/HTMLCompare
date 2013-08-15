define(['jquery', 'ModuleClassLoader'], function($, ModuleClassLoader){
	var module = {}, extend = {};


		// SubModules
			extend.submodules = {"button":{"moduleType":"button"}};

		// Module Styles
		extend.styles = {"default":{"global":{"css":"view.less","js":"view.js"},"default":true,"slug":"default"}};
		extend.styles['default']['global']['js'] = (function(module, extend){
			

/* view.js */
module.oneLoaded = function() {
	this.parent.parent.fn.oneLoaded.call(this);
	var self = this;

	requirejs(['labelBlackList','levenshtein'],function(labelBlackList,levenshtein) {
		var form = self.el.find("form"),
			submitButton = self.el.find(".w-button"),
			submitLabel = submitButton.parents("label"),
			resubmit_link = self.el.find(".resubmit_form_link"),
			prohibitedLabels = [],
			maxEditDistance = 2,
			tokens = [];
		
		// IE 8 and below doesn't like this label wrapping button to trigger form idea
		// Manually attaching form submit call to button
		submitButton.click(function(){ form.submit(); return false; });
		submitLabel.click(function(){ return false; });

		// Compare each label against the blacklist, splitting the label on 
		// spaces to check individual words
		form.find("label").each(function(index,label) {
			var $label = $(label);
			if (~$label.attr('for').indexOf('w-form-')) {
				tokens = $label.text().toLowerCase().split(/\s+/);
				for(var t = 0; t < tokens.length; t++) {
					for (var i = 0; i < labelBlackList.length; i++) {
						if (levenshtein(tokens[t],labelBlackList[i].toLowerCase()) <= maxEditDistance) {
							prohibitedLabels.push($label.text());
							break;
						}
					}
				}
			}
		});

		// Handle old forms with prohibited labels or
		// malicious forms that circumvented dialog validation
		if (false && prohibitedLabels.length > 0) {
			form.removeAttr('action');
			form.submit(function(e){
                e = e || window.event;
                alert('This form is disabled and cannot be submitted.');
				e.preventDefault();
				return false;
			});
		} else {
	
			form.submit(function(){
				var missingFields = [];

				form.find(".required").each(function(index,label) {
					var label = $(label).attr("for"), 
					    formItem = form.find("[name='" + label + "']"),
					    formItemContainer = formItem.closest('.w-contact_form-li');

					if (!formItem.length)
						formItem = form.find("#" + label);
					if (!formItem.length) {
						missingFields.push({"labelFor": label, "reason": "missing"});
						return;
					}
					switch (formItem[0].nodeName.toLowerCase()) {
					case "input":
						switch (formItem.attr("type")) {
						case "text":
							if (formItem.val().match(/^\s*$/) || formItemContainer.hasClass("error-item"))
								missingFields.push({"labelFor": label, "reason": "blank"});
							break;
						case "email":
							if (!formItem.val().match(/^\s*([A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4})\s*$/))
								missingFields.push({"labelFor": label, "reason": "invalidEmail"});
							break;
						case "checkbox":
						case "radio":
							if (form.find("[name='" + label + "']:checked").length === 0)
								missingFields.push({"labelFor": label, "reason": "noCheck"});
							break;
						}
						break;
					case "textarea":
						if (formItem.val().match(/^\s*$/) || formItemContainer.hasClass("error-item"))
							missingFields.push({"labelFor": label, "reason": "blank"});
						break;
					case "select":
						// Is there any way to check this, without some placeholder option that's considered a non-answer?
						break;
					}
				});
				if (missingFields.length === 0) {
					$.ajax({
						"url": webs.props.membersServer + form.attr("action"),
						"type": form.attr("method"),
						"data": form.serialize(),
						"dataType": "jsonp",
						"contentType": 'application/json;charset=UTF-8',
						"success": function(data) {
							if (data.success) {
								var success = self.el.find(".success-message");
								var padding = (form.height() - success.height()) / 2;
								var newHeight = form.height();
								if (newHeight < success.height()) newHeight = success.height();
								if (padding < 0) padding = 0;
								success.css({"padding-top": padding + "px","padding-bottom": padding + "px"});
								self.el.find(".w-contact_form-container").height(form.height()).addClass("success");
							} else {
								var failure = self.el.find(".error-message");
								var padding = (form.height() - failure.height()) / 2;
								var newHeight = form.height();
								if (newHeight < failure.height()) newHeight = failure.height();
								if (padding < 0) padding = 0;
								failure.css({"padding-top": padding + "px","padding-bottom": padding + "px"});
								self.el.find(".w-contact_form-container").height(newHeight).addClass("failure");
							}
						}
					});
				} else {
					form.addClass("error");

					$.each(missingFields, function(i, missing) {
						var label = self.el.find("label[for='" + missing.labelFor + "']"),
								labelContainer = label.closest('.w-contact_form-li'),
								input;

						labelContainer.addClass("error-item");

						switch (self.el.find("[name='" + missing.labelFor + "']").attr("type")) {
						    case "checkbox":
						    case "radio":
								self.el.find("[name='" + missing.labelFor + "']").bind("focus click change", function(){
									labelContainer.removeClass("error-item");
									if (!form.find(".error-item").length) form.removeClass("error");
								});
								break;
						    default:
								input = form.find("#" + missing.labelFor);
								input.val(form.find("label[for='" + missing.labelFor + "']").text() + (missing.reason === "invalidEmail" ? " must be a valid email address" : " can't be blank"));
								input.bind("focus click keydown cut paste change", function(){
									input.unbind("focus click keydown cut paste change");
									input.val("");
									labelContainer.removeClass("error-item");
									if (!form.find(".error-item").length) form.removeClass("error");
								});
						}
					});
				}
				return false;
			});
			resubmit_link.click(function(){
				self.el.find(".w-contact_form-container").removeClass("success").removeClass("failure");
			});
		}
	});
};
			return module;
		});
		extend.defaultStyle = extend.styles['default'];

		// View JS
		


	ModuleClassLoader.register('contact_form', module, extend);
});