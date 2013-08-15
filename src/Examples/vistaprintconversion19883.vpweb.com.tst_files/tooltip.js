define('tooltip', ['jquery', 'link!../css/tooltip'], function($) {

	$.tooltip = $.fn.tooltip = function tooltip(opts) {

		if (this.jquery) {
			var tooltips = $([]);
			this.each(function(i,e){tooltips.push(tooltip($.extend({}, opts, {"anchor": e}))[0]);});
			return tooltips;
		}

		opts = $.extend({}, {
			"content": "&nbsp;",
			"style": "info",
			"position": "southeast",
			"offset": [5, 5],
			"anchor": "cursor"
		}, opts);

		if (typeof opts.anchor == "string" && opts.anchor != "cursor")
			return $(opts.anchor).tooltip(opts);

		if (opts.anchor.nodeType) // if anchor is a DOM Element
			opts.anchor = $(opts.anchor);

		var $tt = $("<div></div>").addClass("w-tooltip").html(opts.content).appendTo($("body"));


		if (opts.style) {
			$tt.addClass("w-tooltip-" + opts.style);
		}

		if (opts.hideicon) {
			$tt.addClass("w-tooltip-noicon");
		}


		if (opts.anchor == "cursor") {
			$tt.css({"position": "fixed"});
			$("body").bind("mousemove", function(e) {
				if (!$tt.hasClass("active")) return;

				// First, check if we should change position.
				var tooltipRightEdge = parseInt(e.clientX + $tt.width());

				// If this tooltip will go off the right of the screen, change its direction.
				// Give a decent buffer amount based on the width of the tooltip so it isn't
				// right up against the egde of the screen.
				if (tooltipRightEdge > $("body").width() - $tt.width()*1.5) {
					opts.position = "southwest";
				}

				if (opts.position.match(/(top|north)/i))
					$tt.css("bottom", ($(window).height() - e.clientY + opts.offset[1]) + "px");
				else
					$tt.css("top", (e.clientY + opts.offset[1]) + "px");
				if (opts.position.match(/(left|west)/i))
					$tt.css("right", ($(window).width() - e.clientX + opts.offset[0]) + "px");
				else
					$tt.css("left", (e.clientX + opts.offset[0]) + "px");
			});
		}

		$tt.reposition = function reposition() {
			var $tooltipPoint = $("<span class=\"tooltip-tip\">&nbsp;</span>");
			var newPosition = 0;
			var oldPosition = 0;

			if (opts.anchor == "cursor") {
				// nothing to do
			} else if (opts.anchor && opts.anchor.constructor == Array) {
				$tt.css({"position": "absolute"});
				if (opts.position.match(/(top|north)/i))
					$tt.css("bottom", ($("body").height() - opts.anchor[1] + opts.offset[1]) + "px");
				else
					$tt.css("top", (opts.anchor[1] + opts.offset[1]) + "px");
				if (opts.position.match(/(left|west)/i))
					$tt.css("right", ($("body").width() - opts.anchor[0] + opts.offset[0]) + "px");
				else
					$tt.css("left", (opts.anchor[0] + opts.offset[0]) + "px");
			} else if (opts.anchor && opts.anchor.jquery) {
				$tt.css({"position": "absolute"});
				var anchorPosition = opts.anchor.position();
				if (opts.position.match(/(top|north)/i))
					$tt.css("bottom", ($("body").height() - anchorPosition.top + opts.offset[1]) + "px");
				else
					$tt.css("top", (anchorPosition.top + opts.anchor.outerHeight() + opts.offset[1]) + "px");
				if (opts.position.match(/(left|west)/i)) {
					newPosition = $("body").width() - anchorPosition.left + opts.offset[0];
					$tt.css("right", newPosition + "px");
				} else {
					// Define minimum and maximum pixel location for bubble left.
					var minLeft = Math.abs(parseInt($tt.css("margin-left")));
					var maxLeft = $("body").width()  - minLeft;

					// Calculate the new position of the tooltip and save a copy for later.
					newPosition = anchorPosition.left + opts.anchor.outerWidth() + opts.offset[0];
					oldPosition = newPosition;

					// If need be, reposition.
					if (newPosition < minLeft) {
						newPosition = minLeft;
					} else if (newPosition > maxLeft) {
						newPosition = maxLeft;
					}

					var ttWidth = $tt.width();
					var ttPaddingLeft = parseInt($tt.css("padding-left"));

					// Calculate where the tip of the bubble will be based on how much it was shifted.
					var tipPosition = ((ttWidth/2) - (newPosition - oldPosition) + ttPaddingLeft);

					// If the tooltip is too far to the right, make it point on the corner.
					if (tipPosition > ttWidth + ttPaddingLeft) {
						tipPosition = ttWidth + ttPaddingLeft;
					}

					// Apply the positioning to the tooltip and the tip.
					$tooltipPoint.css("left", tipPosition + "px");
					$tt.css("left", newPosition + "px");
					$tt.append($tooltipPoint);
				}
			} else throw (["Unsupported tooltip definition", opts]);

		};


		var windowResizeHandler = function(){
			$tt.reposition();
		};

		$(window).resize(windowResizeHandler);

		$tt.reposition();

		return $tt;
	};

	return $.tooltip;
});
