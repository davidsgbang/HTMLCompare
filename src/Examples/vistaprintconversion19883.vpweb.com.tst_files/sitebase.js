if(!window.webs) window.webs = {};

require(['jquery'], function($){
	/**
	 * Put extra navbar elements in a "More" dropdown, if necessary.
	 */
	webs.fixNavWrap = function(jQuery){
		if(typeof(jQuery) === 'undefined') jQuery = $;
		$ = jQuery;
		if($('body').hasClass('webs-allow-nav-wrap')) return false;

		$('ul.webs-nav').each(function(){
			var nav = $(this),
				items = nav.children('li');
			if(items.length <= 0 || (items.css('display') == 'block' && items.first().css('float') == 'none')) return false;

			var top = items.eq(0).position().top + Math.min(items.eq(0).height(), 10),
				maxWidth = nav.parent().width(),
				more,
				checkFunc,
				addMore = function(){
					var more = nav.children('.webs-nav-more');
					if(more.length === 0) {
						more = $('<li class="webs-nav-more has-children"><a href="#" onclick="return false;"><span class="title">More</span><span class="after"></span></a><ul></ul></li>');
						nav.append(more);
					}
					return more.find('ul');
				},
				addToMore = function(item, test){
					if(!item.hasClass('webs-home')) { // Never put "Home" in the more dropdown
						var lvl3item = item.find('ul ul'); // Themes can't support the extra level, so move lvl3 up into lvl2
						if(lvl3item.length > 0)
							lvl3item.children('li').prependTo(lvl3item.parents('ul')[0]);
						item.prependTo(more);
						lvl3item.remove();
						return true;
					}
					return false;
				};

			if(nav.width() > maxWidth) {
				// Nav overflows
				more = addMore();
				checkFunc = function(){return nav.width() > maxWidth;};
			} else if(items.eq(items.length-1).position().top > top) {
				// Nav wraps
				more = addMore();
				var moreLi = more.parent(),
					// If the more is display: none, use it's sibling's position
					// It's very important that is(':visible') here returns false for visibility:hidden
					reference = moreLi.is(':visible') ? moreLi : moreLi.prev();

				checkFunc = function(){
					if(reference.length > 0) {
						return reference.position().top > top;
					} else {
						return false;
					}
				};
			}

			if(more && typeof(checkFunc) === 'function') {
				for(var i=items.length-1;i>0 && checkFunc();i--) {
					addToMore(items.eq(i));
				}
			}
		});

		// May not 100% belong here, but...
		// Ancestor pages need child-active class
		$('ul.webs-nav .has-children .active').parents('.has-children').addClass('child-active');
	};


	/**
	* webs.siteLoginPopover from webs_common.js
	* Modified to require websover
	*/
	webs.siteLoginPopover = function(server, email, siteID) {
		return new Popover(server + '/s/login/siteLoginPopover?id=' + email + '&site=' + siteID, {
			width: 430,
			height: (typeof acsLink !== "undefined" ? 300 : 175),
			heading: 'Manage Website'
		}).show();
	};


	/**
	 * Creative Commons Attribution
	 * Modules simply need to call webs.page.addCCImage,
	 * passing in a creative commons image object consisting of:
	 *   url - URL where the source image can be found
	 *   artist - Name of the original artist
	 */
	webs.page = webs.page || {};
	webs.page.addCCImage = function(ccImage){
		var ccImages = webs.page.ccImages;
		if(!ccImages) {
			ccImages = webs.page.ccImages = [];

			$(function(){
				var createAttributionLink = function(img) {
					return '<a target="_blank" href="' + img.url + '">' + img.artist + '</a>';
				},
					/**
					* Based on Rails's Array.to_sentence
					*/
					toSentence = function(list, opts){
						opts = $.extend({
							wordsConnector: ', ',
							twoWordsConnector: ' and ',
							lastWordConnector: ', and '
						}, opts || {});

						if(list.length === 0) {
							return '';
						} if(list.length === 1) {
							return list[0];
						} else if(list.length === 2) {
							return list[0] + opts.twoWordsConnector + list[1];
						} else {
							var i = 0,
								ret = list[i];
							for(i=1;i<ccImages.length-1;i++) {
								ret += opts.wordsConnector + list[i];
							}
							ret += opts.lastWordConnector + list[i];
							return ret;
						}
					};

				$('<div/>')
					.attr('id', 'webs-cc')
					.html('<div id="webs-cc-mark">Creative Commons Attributions</div>')
					.appendTo('body')
					.mouseenter(function(){
						if($('#webs-cc-full').length === 0) {
							var attrList = toSentence($.map(ccImages, createAttributionLink)),
								html = '<p>Some photos on this website are available under a <br/><a target="_blank" href="http://creativecommons.org/licenses/by/2.0/">Creative Commons Attribution license</a>.</p>';
							html += '<p>Photos by ' + attrList + '.</p>';
							$('<div/>')
								.attr('id', 'webs-cc-full')
								.html(html)
								.appendTo('#webs-cc');
						}
					});
			});
		}

		ccImages.push(ccImage);
	};

	$(function($){

		// Open links in new window
		// in edit mode or where we want this function disabled, simply set the disableLink data key on the anchor
		$("body").delegate(".w-link-new-window, .fw_link_newWindow", "click", function() {
			var $node = $(this);
			if(!$node.data("disableLink")) {
				var href = $(this).attr("href");
				window.open(href, "_blank");
				return false;
			}
		});

		// Sign-out tab for social sites
		if(!webs.visitor) return false;

		$('<div/>').attr('id', 'fw-member-presence')
			.append($('<a/>').addClass('fw-display-name').attr('href', webs.site.url + 'apps/profile').html(webs.visitor.displayName))
			.append($('<a/>').addClass('fw-signout').attr('href', webs.site.url + 'apps/auth/logout').html('Sign Out'))
			.appendTo('body');
	});
});
