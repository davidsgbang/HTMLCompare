/**
* @fileoverview This file contains methods that open a lightbox when images are opened in the Sitebuilder
*/

/*jsl:option explicit*/
/// <reference path="../../common/core/vp.ui.js" />

(function ($j) {

    $j.fn.sw_lightbox = function (options) {
        if(!this.length)
        {
            return this;
        }

        var $self = $j(this);

        var sPlayButtonUrl = "/vp/images/b09/site-builder/widget_skins/sw_lightbox/images/play_button.gif";
        var sPauseButtonUrl = "/vp/images/b09/site-builder/widget_skins/sw_lightbox/images/pause_button.gif";
        //TODO: Map image url's to buttons
        //These are the urls hard coded below
        //        var closeurl = "/vp/images/b09/site-builder/widget_skins/sw_lightbox/images/close_button.png";
        //        var nexturl = "/vp/images/b09/site-builder/widget_skins/sw_lightbox/images/next_button.png";
        //        var prevurl = "/vp/images/b09/site-builder/widget_skins/sw_lightbox/images/prev_button.png";        
        var oSlideshowTimer;
        var iCurrImg = 0;
        var sCurrAlbum = "";
        var aImages = {};

        var defaults = {
            sBoxBackgroundColor: "Black",
            sOverlayColor: "Gray",
            caption_text_color: "White",
            sCaptionOverlayColor: "Black",
            iAnimationSpeed: 300,
            blsAutoplay: false,
            iSlideshowSpeed: 3000
        };

        var sw_settings = $j.extend({}, defaults, options);

        //Prepare html
        var sHtmlShell = ($j('<div class="sw_shell"></div>'));
        var sHtmlOverlay = ($j('<div class="sw_overlay"></div>'));
        var sHtmlContainer = ($j('<div class="sw_container"></div>'));
        var sHtmlImgControlContainer = ($j('<div class="sw_img_control_container"></div>'));
        var sHtmlImgContainer = ($j('<div class="sw_img_container"><img class="sw_image" src="" alt="" usemap="#sw_image_map"></div>'));
        var sHtmlImgMap = $j('<map name="sw_image_map" class="sw_image_map"><area class="sw_image_left" shape="rect" /><area class="sw_image_right" shape="rect" /></map>');
        var sHtmlCloseContainer = ($j('<div class="sw_close_container"><img class="sw_close_button" src="/vp/images/b09/site-builder/widget_skins/sw_lightbox/images/close_button.png" alt="close button"></div>'));
        var sHtmlControlPanel = ($j('<div class="sw_control_panel"></div>'));
        var sHtmlPlayContainer = ($j('<div class="sw_play_button_container"><img class="sw_play_button" src="/vp/images/b09/site-builder/widget_skins/sw_lightbox/images/play_button.gif" alt="play button"></div>'));
        var sHtmlNextArea = ($j('<div class="sw_next_area"><div class="sw_next_button_container"><img class="sw_next_button" src="/vp/images/b09/site-builder/widget_skins/sw_lightbox/images/next_button.png" alt="nextbutton"></div></div>'));
        var sHtmlPrevArea = ($j('<div class="sw_prev_area">&nbsp;<div class="sw_prev_button_container"><img class="sw_prev_button" src="/vp/images/b09/site-builder/widget_skins/sw_lightbox/images/prev_button.png" alt="prevbutton"></div></div>'));
        var sHtmlCaptionContainer = ($j('<div class="sw_caption_container"></div>'));
        var sHtmlDescriptionContainer = ($j('<div class="sw_description_container"></div>'));

        //Inject html
        $j("body").prepend(sHtmlOverlay).prepend(sHtmlShell);
        var $shell = $j(".sw_shell");
        $shell.append(sHtmlContainer);
        var $container = $j(".sw_container");
        $container.append(sHtmlCaptionContainer).append(sHtmlCloseContainer).append(sHtmlImgControlContainer).append(sHtmlControlPanel);

        var $imgControlContainer = $j(".sw_img_control_container");
        $imgControlContainer.append(sHtmlImgContainer).append(sHtmlImgMap);
        
        var $controlPanel = $j(".sw_control_panel");
        $controlPanel.append(sHtmlDescriptionContainer);

        //Setup background colors
        $container.css("background", sw_settings.sBoxBackgroundColor);

        var $overlay = $j(".sw_overlay");
        $overlay.css("background", sw_settings.sOverlayColor);

        var $captionContainer = $j(".sw_caption_container");
        $captionContainer.css("color", sw_settings.caption_text_color);

        var $captionOverlay = $j(".sw_caption_overlay");
        $captionOverlay.css("background", sw_settings.sCaptionOverlayColor);

        //Parse for images to be shown with lightboxes
        $self.each(function (i, n) {
            var $children = $j(n).children();
            var sTempAlbum = $children.attr("album");

            //If it has an album name, check if the album has already been created
            if (sTempAlbum !== "undefined") {
            
                //If the album hasn't been created, create it
                if (!aImages[sTempAlbum]) {
                    aImages[sTempAlbum] = [];
                }

                //Mark the image's position
                $children.attr("position", aImages[sTempAlbum].length);

                //Add the image to the associated album array
                var sTitle = "";
                if ($children.attr("alt")) { sTitle = $children.attr("alt"); }
                var sDescription = "";
                if ($children.attr("description")) { sDescription = $children.attr("description"); }
                aImages[sTempAlbum].push(new SWImage($children.attr("href"), sTitle, sDescription));
            }
        });

        //Make the overlay follow the viewport
        $j(window).scroll(function () {
            if ($container.css("display") === "block") {
                $overlay
                    .css("top", $j(window).scrollTop())
                    .css("left", $j(window).scrollLeft());
            }
        });

        var oPrevPageSize = vp.ui.getPageSize();

        var $closeContainer = $j(".sw_close_container");
        var $nextArea = $j(".sw_next_area");
        var $prevArea = $j(".sw_prev_area");
        var $image = $j(".sw_image");

        //Whenever the container is resized, adjust the lightbox accordingly
        $j(window).resize(function () {
            var oCurPageSize = vp.ui.getViewportSize(); 

            if(oPrevPageSize.height != oCurPageSize.height || oPrevPageSize.width != oCurPageSize.width)
            {                            
                if ($container.css("display") === "block") {
                    $container.addClass("loading");
                    var aSize = new Array();                    

                    aSize.width = $image[0].width;
                    aSize.height = $image[0].height;
                    $controlPanel.add($captionContainer).css("visibility", "visible");

                    $closeContainer
                        .add($controlPanel)
                        .add($captionContainer)
                        .add($nextArea)
                        .add($prevArea)
                        .animate({ opacity: 0.0 }, { duration: sw_settings.iAnimationSpeed, queue: false });

                    $image.fadeOut(sw_settings.iAnimationSpeed,
                    function () {
                        resizeLightbox(aSize);                                                
                    });
                    $container.removeClass("loading");
                }
            }

            oPrevPageSize = oCurPageSize;
        });

        var $closeButton, $playButton, $prevButton, $nextButton, $prevButtonContainer, $nextButtonContainer, $playButtonContainer;

        //Bind click event with link
        $self.click(function (c) {      
            //If there are multiple images to show, inject multi-image gallery html (play/pause, next/previous buttons)
            if ($j(this).children().attr("album")) {
                $imgControlContainer.append(sHtmlNextArea).append(sHtmlPrevArea);
                $controlPanel.append(sHtmlPlayContainer).append(sHtmlDescriptionContainer);
            }
            else {
                $controlPanel.append(sHtmlDescriptionContainer);
            }

            $closeButton = $j(".sw_close_button");
            $playButton = $j(".sw_play_button");
            $prevButton = $j(".sw_prev_button");
            $nextButton = $j(".sw_next_button");
            $prevButtonContainer = $j(".sw_prev_button_container");
            $nextButtonContainer = $j(".sw_next_button_container");
            $playButtonContainer = $j(".sw_play_button_container");
            open(c, this);
        });

        function open(c, img) {

            //Don't open new link
            c.preventDefault();

            //When opening the lightbox the first time, add this class so it fades in correctly
            $container.addClass("opening");

            //If the image is part of a gallery or collection, set the album and position indices of the pre-loaded image array
            //and bind events relevant for albums
            var $imgChildren = $j(img).children();
            if ($imgChildren.attr("album")) {
                sCurrAlbum = $imgChildren.attr("album");
                iCurrImg = $imgChildren.attr("position");
                bindLightboxEvents("album");
            }
            else {
                sCurrAlbum = "";
                bindLightboxEvents("single");
                //Set the caption and description for the new image
                var sTitle = "";
                var sDescription = "";

                if ($imgChildren.attr("alt")&&!($imgChildren.attr("singleimage")==="true")) {
                    sTitle = $imgChildren.attr("alt");
                }
                if ($imgChildren.attr("description")) {
                    sDescription = $imgChildren.attr("description");
                }
                resetCaption(sTitle, sDescription);
            }

            renderImage($imgChildren.attr("href"));
        };

        function SWImage(url, caption, description) {
            this.url = url;
            this.caption = caption;
            this.description = description;
        };

        function bindLightboxEvents(type) {


            //Bind close functionality to close button, overlay
            $overlay.add($closeButton).click(function () {
                close();
            });

            //Bind play/pause functionality
            $playButton.click(function (e) {                       
                //If already playing, pause and turn back into play button
                if ($j(this).hasClass("play_button_playing")) {
                    pauseSlideshow();
                }
                //Otherwise, start playing and turn into pause button
                else {
                    playSlideshow();
                }
            });


            $prevButton.click(function () {
                pauseSlideshow();
                changeImage("prev");
            });


            $nextButton.click(function () {
                pauseSlideshow();
                changeImage("next");
            });


            var sPrevAreaSelector = vp.browser.isIE ? ".sw_image_map .sw_image_left" : ".sw_prev_area";            
            var fnAnimateInSequence = function(oObj, fnAnimate)
            {
                if(!oObj.length || !sCurrAlbum || !aImages[sCurrAlbum].length)
                {
                    return;
                }
                if(oObj.queue("fx").length)
                {
                    oObj.promise().done(fnAnimate);
                }
                else
                {
                    fnAnimate();
                }
            };

            //Bind previous button events
            $j(sPrevAreaSelector).mouseover(function () {                
                var fnAnimate = function()
                {                  
                    $prevButtonContainer.fadeIn(sw_settings.iAnimationSpeed);                    
                };
               fnAnimateInSequence($prevButtonContainer, fnAnimate);
            }).mouseout(function (e) {                         
                var fnAnimate = function()
                {   
                    if(!vp.ui.isPointInRect(e.pageX, e.pageY, vp.ui.getRect($prevButtonContainer.get(0))))
                    {                
                        $prevButtonContainer.fadeOut(sw_settings.iAnimationSpeed);
                    }
                };
                fnAnimateInSequence($prevButtonContainer, fnAnimate);
            });

            var sNextAreaSelector = vp.browser.isIE ? ".sw_image_map .sw_image_right" : ".sw_next_area";            
            //Bind next button events
            $j(sNextAreaSelector).mouseover(function () {              
                var fnAnimate = function()
                {                            
                   $nextButtonContainer.fadeIn(sw_settings.iAnimationSpeed);                    
                };

                fnAnimateInSequence($nextButtonContainer, fnAnimate);
            }).mouseout(function (e) {                
                var fnAnimate = function()
                {
                    if(!vp.ui.isPointInRect(e.pageX, e.pageY, vp.ui.getRect($nextButtonContainer.get(0))))
                    {
                        $nextButtonContainer.fadeOut(sw_settings.iAnimationSpeed);
                    }
                };
                fnAnimateInSequence($nextButtonContainer, fnAnimate);
            });

            //Bind keyboard mappings
            document.onkeydown = function (e) {
                var evt = e || window.event;
                var key = evt.keyCode;

                if(!vp.ui.isCollapsed($shell.get(0)))
                {
                    //Escape
                    if (key == 27) {
                        close();
                        return false;
                    }
                    //If it's an album, map the arrow keys for the album
                    else if ((type == "album") ) {

                        //Left arrow
                        if (key == 37) {
                            if(e)
                            {
                                e.preventDefault();
                            }
                            pauseSlideshow();
                            changeImage("prev");
                            return false;
                        }
                        //Right arrow
                        else if (key == 39) {
                            if(e){
                                e.preventDefault();
                            }
                            pauseSlideshow();
                            changeImage("next");
                            return false;
                        }                    
                    }
                }
                return true;
            };
        };
        
        function close() {
            pauseSlideshow();
            $shell.add($container).add($overlay).fadeOut(sw_settings.iAnimationSpeed, function () {
                //Re-enable scrolling
                if ($j.browser.msie) {
                    //Prevent scrolling
                    $j("html").css("overflow", "auto");
                }
                else {
                    //Prevent scrolling
                    $j("body").css("overflow", "auto");
                }
                $overlay.css("position", "absolute");
                //Reset the container for single images
                $playButtonContainer.add($nextArea).add($prevArea).remove();                
            });

            $prevButtonContainer.add($nextButtonContainer).fadeOut();
        };

        function playSlideshow() {
            //TODO: Add something to show countdown for slideshow
            oSlideshowTimer = setTimeout(changeImageSlideshowLoop, sw_settings.iSlideshowSpeed);
            $playButton.attr("src", sPauseButtonUrl).addClass("play_button_playing");
        };

        function pauseSlideshow() {
            clearTimeout(oSlideshowTimer);
            $playButton.attr("src", sPlayButtonUrl).removeClass("play_button_playing");
        };

        function changeImageSlideshowLoop() {
            oSlideshowTimer = setTimeout(changeImageSlideshowLoop, sw_settings.iSlideshowSpeed);
            changeImage("next");
        };
        
        /*
        Called by slideshow controls, changes the image based on the direction, then renders it
        */
        function changeImage(direction) {                        
            if (!$container.hasClass("loading")) {
                $container.addClass("loading");
                switch (direction) {
                    case "next":
                        iCurrImg++;
                        if (iCurrImg == aImages[sCurrAlbum].length) { iCurrImg = 0; }
                        break;
                    case "prev":
                        iCurrImg--;
                        if (iCurrImg == -1) {
                            iCurrImg = aImages[sCurrAlbum].length - 1;
                        }
                        break;
                    default:
                        iCurrImg++;
                        if (iCurrImg == aImages[sCurrAlbum].length) { iCurrImg = 0; }
                        break;
                }
                $controlPanel.add($captionContainer).css("visibility", "visible");
                $closeContainer.add($controlPanel).add($captionContainer).add($nextArea).add($prevArea).animate({ opacity: 0.0 }, { duration: sw_settings.iAnimationSpeed, queue: false });
                $image.fadeOut(sw_settings.iAnimationSpeed,
                function () {
                    renderImage(aImages[sCurrAlbum][iCurrImg].url);

                });
            }
        };

        var $imgContainer = $j(".sw_img_container");
        /*
        Changes the image in the lightbox, including loading and animations
        */
        function renderImage(src) {
            //Clear css values for width, height, so img loads to its natural size
            //Load the image by clearing the old src attribute, changing to the new src attribute
            $image.attr("src", "");

            if(vp.browser.isIE)
            {
                var fnLoad = function()
                {
                    var oSize = {
                        width: $image[0].naturalWidth || $image[0].width,
                        height: $image[0].naturalHeight || $image[0].height
                    };

                    $imgContainer.append($image[0]);
                    
                    $image.css("display", "none").css("opacity", "0").css("visibility","visible");
                    resizeLightbox(oSize);

                    vp.events.remove($image[0], "load", fnLoad);
                };

                document.body.appendChild($image[0]);

                vp.events.add($image[0], "load", fnLoad);            
            
                $image.css("height","auto").css("width","auto").css("display","block").css("visibility","hidden").attr("src", src);
            }
            else
            {
                $image.attr("src", src);
                vp.ui.getNaturalSize($image[0],resizeLightbox);
            }           
        };

        var $descriptionContainer = $j(".sw_description_container");
        function resetCaption(caption, description) {
            $captionContainer.html(caption);
            $descriptionContainer.html(description);
            $captionContainer.add($descriptionContainer).css("visibility", "visible");
        };

        function resizeLightbox(oSize) {

            if (sCurrAlbum !== "") {
                resetCaption(aImages[sCurrAlbum][iCurrImg].caption, aImages[sCurrAlbum][iCurrImg].description);
            }

            //Put overlay and shell on the screen where the current scroll is'
            $overlay.add($shell)
                .css("top", $j(window).scrollTop())
                .css("left", $j(window).scrollLeft());
            $overlay
                .css("height", "100%")
                .css("width", "100%");

            //Get the image width and the window width
            var iNewImgWidth = oSize.width; //$j(".sw_image")[0].width;
            var iNewImgHeight = oSize.height; //$j(".sw_image")[0].height;
            var iBodyHeight = $j(window).height();
            var iBodyWidth = $j(window).width();

            var iOldWidth = $controlPanel.width();
            var iContainerPadding = 20;
            //Container width is the image width plus padding
            var iContainerWidth = iNewImgWidth + iContainerPadding;
            //Height of the container (without image) is the total padding on the container plus the height of the caption and description
            var iVerticalPadding = iContainerPadding + parseInt($controlPanel.height()) + parseInt($captionContainer.height());

            var iDisplay = $shell.css("display");
            if (iDisplay !== "block") {
                $shell.add($container).css("display", "block");
            }
            var iCtrlPanelHeight = $controlPanel.height();
            var iCaptionHeight = $captionContainer.height();
            var iContainerHeight = iNewImgHeight + iVerticalPadding;
            if (iDisplay !== "block") {
                $shell.add($container).css("display", "none");
            }

            $controlPanel.css("width", iOldWidth);

            //If container is wider than the screen, resize it
            if (iContainerWidth > iBodyWidth) {
                var iRatio = iNewImgHeight / iNewImgWidth;
                //Image Width =  width of the window minus the padding on the container + 10 pixel padding between container and window
                iNewImgWidth = iBodyWidth - iContainerPadding - 20;
                if (iNewImgWidth < 200) {
                    iNewImgWidth = 300;
                }
                //Adjust height according to aspect ratio
                iNewImgHeight = iNewImgWidth * iRatio;
            }

            iVerticalPadding = iContainerPadding + iCtrlPanelHeight + iCaptionHeight + 20;
            iContainerHeight = iNewImgHeight + iVerticalPadding;

            //If container is taller than the screen, resize it
            if (iContainerHeight > iBodyHeight) {
                iRatio = iNewImgWidth / iNewImgHeight;
                //Image Height =  height of the window minus the padding on the container and minus a 10 pixel buffer on either side
                iNewImgHeight = iBodyHeight - iVerticalPadding - 20;
                if (iNewImgHeight < 200) {
                    iNewImgHeight = 300;
                }

                //Adjust width according to aspect ratio
                iNewImgWidth = iNewImgHeight * iRatio;
            }

            //Put the image in the middle of the page
            var iLeftContainer = ((0.5 * iBodyWidth) - (0.5 * (iNewImgWidth + (iContainerPadding)))) + $j(window).scrollLeft();
            var iTopContainer = ((0.5 * iBodyHeight) - (0.5 * (iNewImgHeight + (iVerticalPadding)))) + $j(window).scrollTop();

            if(vp.browser.isIE)
            {
                var $imageLeft = $j(".sw_image_map .sw_image_left");
                var $imageRight = $j(".sw_image_map .sw_image_right");
                var fnRemapImageMap = function()
                {            
                  $imageLeft.attr("coords", "0,0,"+(iNewImgWidth/2)+","+iNewImgHeight);
                  $imageRight.attr("coords", (iNewImgWidth/2) + ",0," + iNewImgWidth+","+iNewImgHeight);
                };
            }

            //When first opening, put the box in the middle of the page so it fades in smoothly            
            if ($container.hasClass("opening")) {
                $container
                    .css("top", iTopContainer)
                    .css("left", iLeftContainer);

                vp.ui.resizeTo($image[0], iNewImgWidth, iNewImgHeight);

                $imgContainer
                    .css("width", iNewImgWidth)
                    .css("height", iNewImgHeight);

                $controlPanel.add($descriptionContainer).add($captionContainer).css("width", iNewImgWidth);

                if(fnRemapImageMap)
                {
                    fnRemapImageMap();
                }

                waitForAnimate();
            }
            else {
                $imgContainer.animate({
                    width: iNewImgWidth,
                    height: iNewImgHeight
                }, { duration: sw_settings.iAnimationSpeed, queue: false, complete: fnRemapImageMap });

                $container.animate({
                    top: iTopContainer,
                    left: iLeftContainer
                }, { duration: sw_settings.iAnimationSpeed, queue: false });

                $captionContainer.add($descriptionContainer).add($controlPanel).animate({
                    width: iNewImgWidth
                }, { duration: sw_settings.iAnimationSpeed, queue: false });

                //Wait until all animation is complete, then finish fade
                var iWaitlonger = sw_settings.iAnimationSpeed + 100;
                setTimeout(waitForAnimate, iWaitlonger);
            }

        };

        function waitForAnimate() {
            //If the lightbox is opening for the first time, set up the box
            if ($container.hasClass("opening")) {
                //Fade in components of the lightbox

                //Fixes IE fade issues
                if ($j.browser.msie) {
                    $overlay.css('filter', 'alpha(opacity=80)');
                }

                $container.css("display", "none");
                $shell.add($container).add($overlay).fadeIn(sw_settings.iAnimationSpeed);

                if (sw_settings.blsAutoplay) {
                    $playButton.click();
                }

               $container.removeClass("opening");
            }

            vp.ui.resizeTo($image[0], parseInt($imgContainer.css("width")), parseInt($imgContainer.css("height")));
            $nextArea.add($prevArea).css('opacity', 1);
            //Fade control panel, caption manually so they are still visible and take up space in the flow

            //$j(".sw_close_container, .sw_control_panel, .sw_caption_container, .sw_next_area, .sw_prev_area, .sw_image, .sw_next_area, .sw_prev_area").css("opacity", 0);
            $image.css("display","block");
            $closeContainer
                .add($controlPanel)
                .add($captionContainer)
                .add($nextArea)
                .add($prevArea)
                .add($image)
                .animate({ opacity: 1.0 }, { duration: sw_settings.iAnimationSpeed, queue: false });
                        
            $container.removeClass("loading");
        }
        return this;
    };
})(jQuery);


