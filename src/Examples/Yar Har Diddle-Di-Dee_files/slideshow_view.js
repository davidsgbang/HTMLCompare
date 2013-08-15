define(['jquery', 'ModuleClassLoader'], function($, ModuleClassLoader){
	var module = {}, extend = {};


		// SubModules

		// Module Styles
		extend.styles = {"base":{"global":{"js":"base.view.js"},"slug":"base"},"white":{"name":"White","inherit":"base","global":{"css":"white.view.less","js":"white.view.js"},"default":true,"slug":"white"}};
		extend.styles['base']['global']['js'] = (function(module, extend){
			

/* base.view.js */
$.extend(module, {
	initBase: function() {
		if(this.data.side === "none") return;
		this.thumbsWidth =           this.thumbsUl.outerWidth();
		this.thumbsLeft =            this.thumbsUl.position().left;
		this.thumbsContainerWidth  = this.thumbsContainer.width();
		this.thumbsContainerOffset = this.thumbsContainer.offset().left;

		if(this.initStyle) this.initStyle();
	},
	scrollThumbs: function(e){
		if(this.data.side === "none") return;

		var
		midPoint = this.data.width/2,
		pos = (e.clientX-this.thumbsContainerOffset),
		velocity = (pos - midPoint)/midPoint; // percent of mouse position from midpoint (which direction)

		this.thumbsWidth =           this.thumbsUl.outerWidth();
		this.thumbsLeft =            this.thumbsUl.position().left;
		this.thumbsContainerWidth  = this.thumbsContainer.width();
		this.thumbsContainerOffset = this.thumbsContainer.offset().left;

		if(this.thumbsWidth > this.thumbsContainerWidth) {
			var scrollable = this.thumbsContainerWidth - this.thumbsWidth;

			// Edge cases
			if(velocity < 0 && this.thumbsLeft >= 0) this.thumbsUl.css('left', 0);
			else if(velocity > 0 && this.thumbsLeft <= scrollable) this.thumbsUl.css('left', scrollable);
			else {
				// move slideshow at most .02% of scrollable (if cursor is at edge)
				this.thumbsUl.css('left', this.thumbsLeft + velocity*(scrollable*0.02));
			}
		}
	}
});
			return module;
		});
		extend.styles['white']['global']['js'] = (function(module, extend){
			

/* white.view.js */
$.extend(module, {
	initStyle: function() {
		/*
		this.$timerBar = $("<div/>").addClass("w-slideshow-timerbar").appendTo(this.el.find(".w-slideshow-nav"));
		this.$progress = $("<div/>").addClass("w-slideshow-progress").appendTo(this.$timerBar);
		this.timerWidth = 76;
		*/
	},
	onPlay: function(restart, duration) {
		//this.$progress.animate({"width": this.timerWidth}, duration);
	},
	onPause: function(stop) {
		//this.$progress.stop(false, !!stop);
	},
	onReset: function() {
		//this.$progress.width(0);
	}
});
			return module;
		});
		extend.defaultStyle = extend.styles['white'];

		// View JS
		require([webs.props.staticServer + "/static/projects/finch/js/transitions.js"]);

/* TODO:
 *
 * Replace every setTimeout we use to get around zero-size image bugs with some browser-normalizing wrapper, like
 *     $img.updateSource(url, callback);
 * That looks something like this:
 *     jquery.fn.updateSource = function(url, callback) {
 *         this.bind("load", function(){ setTimeout(callback, 1)});
 *         this.attr("src", url);
 *         if (this.complete)
 *             setTimeout(callback, 1);
 *     };
 */

$.extend(module, {

	/**
	 * Init function
	 */
	oneLoaded: function() {
		var self = this;

		$(function(){
			self.preloadImages();
		});

		this.currentSlide =    this.el.find(".w-slideshow-current");
		this.thumbsContainer = this.el.find(".w-slideshow-thumbnails");
		this.thumbsUl =        this.el.find(".w-slideshow-thumbnails-ul");
		this.thumbsLi =        this.el.find(".w-slideshow-thumbnails-li");
		this.navContainer =    this.el.find(".w-slideshow-nav");
		this.playButton =      this.el.find(".w-slideshow-play");

		this.maxWidth =              null;
		this.scrollThumbsTimer =     0;        // timer for thumbnail hover scrolling

		this.scrollTimer =           0;        // timer for the overall slideshow
		this.remainingTime =         0;        // stores remaining time during a pause
		this.startTime =             0;        // stores start time of slide scroll

		this.transitioning =         false;    // are we in the middle of a transition?
		this.playing =               false;    // is the slideshow playing?
		this.slides =                [];       // array reference to figures

		this.thumbsLi.eq(0).addClass('selected');
		this.loadSlides();
		if(this.initBase) this.initBase();
		if(this.data.autoplay && this.slides.length > 1) this.play(true);

		this.ready =                 true;     // bc oneLoaded gets fired after envent binding
	},


	/**
	 * DOM events
	 */
	events: {
		"click .w-slideshow-play":            "playClick",
		"click .w-slideshow-prev":            "prevClick",
		"click .w-slideshow-next":            "nextClick",
		"click .w-slideshow-thumbnails .w-slideshow-image_container":   "thumbsClick",
		"mousemove .w-slideshow-thumbnails":  "thumbsMousemove",
		"mouseleave .w-slideshow-thumbnails": "thumbsMouseleave"
	},

	prevClick: function(e) {
		if(this.ready)
			this.prev();
		e.preventDefault();
		return false;
	},
	nextClick: function(e) {
		if(this.ready)
			this.next();
		e.preventDefault();
		return false;
	},
	playClick: function(e) {
		if(this.ready)
			this[this.scrollTimer > 0 ? "pause" : "play"]();
		e.preventDefault();
		return false;
	},

	thumbsClick: function(e) {
		if(this.ready) {
			this.stop();
			this.select($(e.target).parents(".w-slideshow-figure"));
		}
	},
	thumbsMouseleave: function(){
	    if(this.ready) {
		clearInterval(this.scrollThumbsTimer);
		delete this.scrollThumbsTimer;
	    }
	},
	thumbsMousemove: function(e){
		if(this.ready) {
			var self = this;
			if(this.scrollThumbsTimer) clearInterval(this.scrollThumbsTimer);
			this.scrollThumbsTimer = setInterval(function(){ self.scrollThumbs(e); }, 10);
		}
	},

	loadSlides: function() {
		var self = this;
		if (this.data.images.length === 0) {
		    this.resizePlaceholder();
		    return;
		}
		this.slides = [];
		this.thumbsLi.each(function(i, li) {
			var
			$fig = i===0 ? self.currentSlide.children() : $(li).children().clone(),
			$img = $fig.find("img");

			self.getImageDimension($img.data("srcLarge") || $img.attr("src"), function(w, h) {
				self.postloadProcess($img, w, h);
			});
			if ($img.data("srcLarge")) {
				$img.attr("src",$img.data("srcLarge"));
			}

			self.slides[i] = $fig.data("img",$img);
		});
	},

	resizePlaceholder: function() {
		var	$elm = this.el.find(".w-slideshow-resize .bldr-placeholder-element"),
			height = $elm.parent().height(),
			padding = $elm.outerHeight() - $elm.height(),
			self = this;
		if(height < 1) return setTimeout(function(){ self.resizePlaceholder(); }, 1000);
		$elm.css({width: "auto", height: (height - padding) + "px"});
	},

	getImageDimension: function(src, fn) {
		var image = $("<img/>");
		image.load(function(){
			if(typeof fn === "function") fn(this.width, this.height);
		}).attr("src",src);
		if (image[0].complete && typeof fn === "function") {
			setTimeout(function(){
				fn(image[0].width, image[0].height);
			},1);
		};
	},

	postloadProcess: function($img, _width, _height) {
		var _ratio = _width/_height;

		var paddingNode = this.currentSlide.find(".w-slideshow-image_container");
		var widthPadding = paddingNode.outerWidth() - paddingNode.width();
		var heightPadding = paddingNode.outerHeight() - paddingNode.height();
		if(!this.maxWidth) {
			var sizeNode = this.el.find(".w-slideshow-resize");
			this.maxWidth = this.data.width - widthPadding;
			this.maxHeight = this.data.height - heightPadding;
		}
		var slideRatio = this.maxWidth/this.maxHeight;

		$img.data("width", _width).data("height", _height).data("ratio", _ratio);

		var cssObj = {};
		if (_width < this.maxWidth && _height < this.maxHeight) {
			cssObj.display = "inline-block";
			cssObj.top = parseInt((this.maxHeight - _height) / 2, 10);
		} else if(slideRatio > _ratio) {
			cssObj.display = "block";
			cssObj.height = this.maxHeight;
			cssObj.width = parseInt(this.maxHeight * _ratio, 10);
		} else {
			cssObj.display = "block";
			cssObj.width = "auto";//this.maxWidth;
			cssObj.height = "auto";//parseInt(this.maxWidth/_ratio, 10);
			cssObj.top = parseInt((this.maxHeight - parseInt(this.maxWidth/_ratio, 10))/2, 10);
		}
		$img.parent().css(cssObj);
	},

	scrollThumbs: function(e){ },

	select: function(fig, callback) {
		var self = this, newThumb = fig.parent();

		callback = callback || function(){};

		if(this.playing) this.stop(); // Stop the slideshow (and set the timer to 0).
		if(this.transitioning || newThumb.hasClass('selected')) { callback(); return false; }
		
		this.currentSlide = this.el.find(".w-slideshow-current");


		var
		oldThumb = this.el.find('.w-slideshow-thumbnails .selected'),
		oldI = oldThumb.index(),
		oldFig = this.slides[oldI],
		slen = oldThumb.siblings().length,

		newI = newThumb.index(),
		newFig = this.slides[newI].appendTo(this.currentSlide),

		// grab dimension information
		$img = newFig.data("img"),
		$imgContainer = newFig.find(".w-slideshow-image_container"),
		w = $img.data("width"), h = $img.data("height"), r = $img.data("ratio"),

		// grab transition information
		transition = webs.transitions[this.data.transition] || webs.transitions['none'],
		invertTransition = (newI < oldI && !(newI === 0 && oldI === slen)) || (newI === slen && oldI === 0);

		// setting class for transition and state
		oldThumb.removeClass("selected");
		oldFig.addClass("outgoing");
		newThumb.addClass("selected");
		newFig.addClass("incoming");

		this.transitioning = true;
		transition(oldFig, newFig, 400, invertTransition, function(){
			self.transitioning = false;
			oldFig.detach().removeClass("outgoing");
			newFig.removeClass('incoming').css('z-index', '');
			callback();
		});

		// make sure thumbs are in view, unless the user is scrolling through the thumbs
		if (!this.scrollThumbsTimer) {
			var	figLI = fig.parent(),
				width = this.thumbsContainer.width(),
				edgeLeft = this.thumbsContainer.offset().left,
				edgeRight = edgeLeft + width,
				figLeft = figLI.offset().left,
				figRight = figLeft + figLI.outerWidth();

			if(figRight > edgeRight) {
				this.thumbsUl.animate({'left': '-=' + (figRight-edgeRight) }, 100);
			} else if(figLeft < edgeLeft) {
				this.thumbsUl.animate({'left': '+=' + (edgeLeft-figLeft) }, 100);
			}
		}
	},

	prev: function(cb) {
		var fig = this.el.find('.selected').prev().children(".w-slideshow-figure");
		if(fig.length === 0) {
			fig = this.el.find('.w-slideshow-thumbnails li:last-child .w-slideshow-figure');
		}
		this.select(fig, cb);
	},
	next: function(cb) {
		var fig = this.el.find('.selected').next().children(".w-slideshow-figure");
		if(fig.length === 0) {
			fig = this.el.find('.w-slideshow-thumbnails li:first-child .w-slideshow-figure');
		}
		this.select(fig, cb);
	},
	play: function(restart) {
		var self = this;

		this.el.find('.w-slideshow-play').addClass('w-slideshow-pause').attr('title', 'Pause');
		this.playing = true;

		// If coming from a pause, remainingTime should be > 0, use this as duration
		this.startTime = new Date();
		this.remainingTime = this.remainingTime > 0 ? this.remainingTime : this.data.duration;

		this.scrollTimer = setTimeout(function() {
			var wasPlaying = self.playing;
			self.playing = false; // Set playing to false so our 'select' logic doesn't pause the slideshow.
			self.remainingTime = 0;
			self.next(function(){
				if(wasPlaying) self.play(true);
			});
		}, this.remainingTime);

		if(restart) this.reset();
		if(this.onPlay) this.onPlay(restart, this.remainingTime);
	},
	pause: function(stop) {
		this.el.find('.w-slideshow-play').removeClass('w-slideshow-pause').attr('title', 'Play');
		this.playing = false;

		// When pausing, store the remaining time in the queue
		clearTimeout(this.scrollTimer);
		this.scrollTimer = 0;
		this.remainingTime -= new Date() - this.startTime;

		if(stop) {
			this.remainingTime = 0;
			this.reset();
		}
		if(this.onPause) this.onPause(stop);
	},
	stop: function() { return this.pause(true); }, 
	reset: function() {
		if(this.onReset) this.onReset();
	},

	preloadImages: function(){
		this.el.find('.w-slideshow-thumbnails-li img').each(function(){
			new Image().src = $(this).data('src-large');
		});
	}
});



	ModuleClassLoader.register('slideshow', module, extend);
});