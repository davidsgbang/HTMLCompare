/// <reference path="../../jQuery/jquery-current.js" />
/// <reference path="./generated_dd/constants.js" />
/*jsl:option explicit*/
/// <reference path="../../common/core/vp.core.js" />
/// <reference path="media_player.js" />
/// <reference path="generated_dd/constants.js" />


var showConfirmationMessage = function(sFormId)
{
    document.getElementById(sFormId + "_confirmation").style.display = "";
    document.getElementById(sFormId + "_error").style.display = "none";
    document.getElementById(sFormId + "_form").style.display = "none";
    if (document.getElementById(sFormId + "_divEmailFootNote") !== null)
    {
        document.getElementById(sFormId + "_divEmailFootNote").style.display = "none";
    }
};

var showErrorMessage = function(sFormId)
{
   document.getElementById(sFormId + "_confirmation").style.display = "none";
   document.getElementById(sFormId + "_error").style.display = "";
	document.getElementById(sFormId + "_form").style.display = "none";
};

if (typeof(vp) == "undefined")
{
    var vp = {};
}

if (!vp.website)
{
    vp.website = {};
}

vp.website.startTime = new Date();

vp.website.VisitorLogInfo = function()
{
    var me = this;
    this.oLogUrl = new vp.web.URL("/visitorinfo.ashx");

    this.LogItem = function(sItemName, sValue)
    {
        //If we're not logging, don't bother to write anything
        if (!vp.website.trackingEnabled)
        {
            return;
        }
        try //Swallow all errors
        {
            if (sValue)
            {
                me.oLogUrl.setItem(sItemName, sValue);
            }
            else //Numeric incrementation
            {
                if (me.oLogUrl.getItem(sItemName))
                {
                    me.oLogUrl.setItem(sItemName, parseInt(me.oLogUrl.getItem(sItemName)) + 1);
                }
                else
                {
                    me.oLogUrl.setItem(sItemName, 1);
                }
            }
        }
        catch (ex)
        { 
        }
    };

    this.toString = function()
    {
        return me.oLogUrl.toString();
    };
};

vp.website.VisitorLog = new vp.website.VisitorLogInfo();

vp.website.trackDownloadDocument = function()
{
    vp.website.VisitorLog.LogItem(WIDGET_QS_UploadedDocument);
};

vp.website.trackShowDirectionClick = function()
{
    vp.website.VisitorLog.LogItem(WIDGET_QS_Map);
};
vp.website.trackEmailMarketingSignup = function()
{
    vp.website.VisitorLog.LogItem(WIDGET_QS_EmailMarketingSignup);
};
vp.website.trackViewLargerClick = function()
{
    vp.website.VisitorLog.LogItem(WIDGET_QS_Image);
};
vp.website.trackTwitterFollowClick = function() 
{
    vp.website.VisitorLog.LogItem(WIDGET_QS_TwitterFollowButton);
};

vp.website.trackImageGalleryClick = function()
{
    vp.website.VisitorLog.LogItem(WIDGET_QS_ImageGallery);
};

vp.website.trackAudioPlayerClick = function(e)
{
    vp.website.VisitorLog.LogItem(WIDGET_QS_MediaPlayer + "_Audio");
};

//Page level tracking query strings
var PAGE_QS_Name = "-pg";
var PAGE_QS_VisitTimeDuration = "-vtd";

vp.website.trackingEnabled = false;

vp.website.recordData = function()
{
    try
    {
        //Figure out the number of seconds elapsed
        var stopTime = new Date();
        var iSecondsDiff = Math.round((stopTime - vp.website.startTime) / 1000);
        if (iSecondsDiff > 43200)
        {
            iSecondsDiff = 43200;
        }
        vp.website.VisitorLog.LogItem(PAGE_QS_VisitTimeDuration, iSecondsDiff);

        //Figure out the current page
        var oCurrentUrl = new vp.web.URL(document.URL);
        vp.website.VisitorLog.LogItem(PAGE_QS_Name, escape(oCurrentUrl.pathname.toString()));
        if (oCurrentUrl.getItem("debugLog"))
        {
            alert('Logging Url: ' + vp.website.VisitorLog.toString());
        }

        if (vp.website.trackingEnabled)
        {
            vp.http.get(vp.website.VisitorLog.toString());
        }
    }
    catch (e) //Anything fails, continue
    {
        $("body").append(navigator.userAgent);
    }
};

vp.website.init = function()
{
    //Only log things that aren't JRCapture
    //JRCapture injects an error suppressor that if we see, we don't bother to do anything
    if (typeof (window.JRCapture) === "undefined" && location.href.indexOf("view_larger.htm") == -1) 
    {
        //Enable tracking
        vp.website.trackingEnabled = true;
        //Dynamic tracking adds
        ///Add Tracking for uploaded documents
        jQuery("a.userlink[href^='/upload']").live("click", vp.website.trackDownloadDocument);

        //Add Tracking for Email Marketing
        jQuery("input[src*='email-sign-up-tool']").live("click", vp.website.trackEmailMarketingSignup);

        var sAltId = vp.web.getQueryString("alt_id");
        if (sAltId)
        {
            vp.cookies.setValue("alt_id", sAltId);
        }
        
        //
        vp.events.addToOnUnload(vp.website.recordData);
    }

};

vp.events.runAfterLoadComplete(vp.website.init);


//Deprecated, not used anymore.
vp.website.fixColumns = function()
{
    var parentSize = jQuery("td.userContentCell").attr("width");
    var col1Width = jQuery("td.userContentCell div#column-1").parent().attr("width");
    if (!col1Width)
    {
        col1Width = 100;
    }
    var col2Width = jQuery("td.userContentCell div#column-2").parent().attr("width");
    //Only adjust column widths if we have found valid values to do so
    if (parentSize !== null && parentSize !== "" &&
            col1Width !== null && col1Width !== "")
    {
        jQuery("td.userContentCell div#span-top, div#span-bottom").css("width", parentSize).css("word-wrap", "break-word");
        jQuery("td.userContentCell div#column-1").width(parseInt(col1Width) / 100 * parentSize).css("word-wrap", "break-word");
    }
    if (parentSize !== null && parentSize !== "" &&
            col2Width !== null && col2Width !== null)
    {
        jQuery("td.userContentCell div#column-2").width(parseInt(col2Width) / 100 * parentSize).css("word-wrap", "break-word");
    }
};

vp.website.TimeControl = function(sControlId)
{
    var me = this;
    
    this.fieldId = sControlId;
    this.hour = "";
    this.minute = "";
    this.ampm = "";
    
    this.toString = function()
    {
        return me.fieldId;
    };
    
    this.serialize = function()
    {
        var result = "";
        if (me.hour.length > 0)
        {
            result += me.hour;
        }
        
        if (me.hour.length > 0 && me.minute.length > 0)
        {
            result += ":";
        }
        
        if (me.minute.length > 0)
        {
            result += me.minute;
        }

        if (me.ampm.length > 0)
        {
            result += me.ampm;
        }
        
        return result;
    };
};

var submitAjaxForm = function(sFormId)
{
    var oForm = document.getElementById(sFormId);
    var oFormData = {};
    var oTimeFields = {};
    var sFieldData = /^(\d+)_(\d+)_(\d+)_([-]?\d+)_(.+)/;
    var bEmptyForm = true;
    var bRequiredEmpty = false;
    var bDeprecatedForm = false;
    for (var i = 0; i < oForm.elements.length; i++)
    {
        var oElement = oForm.elements[i];
        var oElementData = [];
        if (oElement.name.match(sFieldData))
        {
            oElementData = oElement.name.split("_");
            if (oElementData[1] == "7")
            {
                var timeControl = new vp.website.TimeControl(oElement.id);
                oTimeFields[oElement.id] = timeControl;
            }
        }

        switch (oElement.type)
        {
            case ("select-one"):
                {
                    //Don't save the ones that start with h,m,a because they're time selects
                    if (oElementData.length > 0)
                    {
                        oFormData[oElement.name] = oElement.value;
                    }
                    else
                    {
                        switch (oElement.id.substring(0, 1))
                        {
                            //All Ids start with a number except for time selectors which start with                            
                            //h,m,a                            
                            case ("h"):
                                oTimeFields[oElement.id.substring(2)].hour = oElement.value;
                                break;
                            case ("m"):
                                oTimeFields[oElement.id.substring(2)].minute = oElement.value;
                                break;
                            case ("a"):
                                oTimeFields[oElement.id.substring(5)].ampm = oElement.value;
                                break;
                            default:
                                break;
                        }
                    }
                    break;
                }
                //Handle
            case ("checkbox"):
                {
                    //Initialize the field first.
                    if (typeof oFormData[oElement.name] == "undefined")
                    {
                        oFormData[oElement.name] = "";
                    }
                    if (oElement.checked)
                    {
                        if (oFormData[oElement.name] === "")
                        {
                            oFormData[oElement.name] = oElement.value;
                        }
                        else
                        {
                            oFormData[oElement.name] += ";" + oElement.value;
                        }
                    }
                    break;
                }
            case ("radio"):
                {
                    //Initialize the field first.
                    if (typeof oFormData[oElement.name] == "undefined")
                    {
                        oFormData[oElement.name] = "";
                    }
                    if (oElement.checked)
                    {
                        oFormData[oElement.name] = oElement.value;
                    }
                    break;
                }
            default:
                {
                    oFormData[oElement.name] = oElement.value;
                    break;
                }
        }
        if (oElement.name === "form_type" && oElement.value === "0")
        {
            bDeprecatedForm = true;
        }
        if (bEmptyForm && oElement.name !== "content" && oElement.name !== "email" && oElement.name !== "form_identifier" && oElement.name !== "form_type" && oElement.name !== "submit" && oElement.name !== "empty_form_msg")
        {
            if ((oElement.type === "checkbox" || oElement.type === "radio") && oElement.checked !== oElement.defaultChecked)
            {
                bEmptyForm = false;
            }
            else if (oElement.type !== "checkbox" && oElement.type !== "radio" && 
				oElement.value.replace(/ /g, '') !== "")	// replace white space with empty string: make sure the field is not only flooded with space
            {
                bEmptyForm = false;
            }
        }
        if (oElement.attributes !== null && oElement.attributes["required"])
        {
            if (oElement.attributes["required"].value === "true" && oElement.value === "")
            {
                bRequiredEmpty = true;
            }
        }
    }

    if (bRequiredEmpty && !bDeprecatedForm)
    {
        bEmptyForm = true;
    }

    if (bEmptyForm)
    {
        var msg = 'Please fill in something before submitting';
        if (oFormData && oFormData["empty_form_msg"])
        {
            msg = oFormData["empty_form_msg"];
        }
        alert(msg);
        return false;
    }

    for (var sFieldId in oTimeFields)
    {
        var oTimeControl = oTimeFields[sFieldId];
        oFormData[oTimeControl.fieldId] = oTimeControl.serialize();
    }


    var sEncodedFormData = vp.web.createQueryString(oFormData);

    var fnSuccess = function()
    {
        showConfirmationMessage(sFormId);
        var sFormIdSplits = sFormId.split("_");
        vp.website.getGuestBookMessages(sFormIdSplits[sFormIdSplits.length - 1], 0);
        var submissionType = WIDGET_QS_Form; //Default to generic form
        if (document.getElementById('divGuestBookMessages_' + sFormIdSplits[2]))
        {
            submissionType = WIDGET_QS_GuestBook;
        }
        vp.website.VisitorLog.LogItem(submissionType);
    };
    var fnError = function() { showErrorMessage(sFormId); };

    var oSubmit = document.getElementById(sFormId + "_submit");
    oSubmit.value = oSubmit.getAttribute("submitmessage");
    oSubmit.disabled = true;

    vp.http.postAsync(oForm.action, sEncodedFormData, fnSuccess, fnError, 1);

    return false;
};

vp.ui.splitStyle = function(sStyle)
{
    var returnArray = {};
    if (sStyle)
    {
        var sSplitString = sStyle.split(";");
        returnArray = new Array(sSplitString.length);
        for (var i = 0; i < sSplitString.length; i++)
        {
            returnArray[i] = new Array(2);
            var sSplitStyle = sSplitString[i].split(":");
            if (sSplitStyle.length === 2)
            {
                returnArray[i][0] = sSplitStyle[0];
                returnArray[i][1] = sSplitStyle[1];
            }
        }
    }
    return returnArray;
};

vp.website.getGuestBookMessages = function(iFormId, number)
{
    if (!number)
    {
        number = 0;
    }
    var fnSuccess = function(sResponse)
    {
        if (document.getElementById('divGuestBookMessages_' + iFormId) !== null)
        {
            document.getElementById('divGuestBookMessages_' + iFormId).innerHTML = sResponse;
            jQuery(".posted-date").each(function()
            {
                var fullDate = new Date(this.innerHTML);
                var localDate = new Date(fullDate.toLocalFormattedString('MM/d/yyyy h:mm tt'));
                this.innerHTML = localDate.format('mon dd, yyyy hh:mm meridian');
            });
        }
    };
    var fnError = function() { };
    var sUrl = "/Active/Forms/GuestBookViewer.aspx?form_instance_id=" + iFormId + "&number=" + number;
    vp.http.getAsync(sUrl, fnSuccess, fnError);
    return false;
};

function preloadImages(aImages) 
{
    for (var i = 0; i < aImages.length; i++) 
    {
        var img = new Image();
        img.src = aImages[i];
    }
}

function fixPngImages()
{
    if (navigator.userAgent.indexOf("MSIE") > -1) 
    {
        //get the version (concatenates to just one decimal point, so 1.5.1 becomes 1.5)
        (new RegExp("MSIE (\\d+(?:\\.\\d*)*)")).test(navigator.userAgent);
        var fVersion = parseFloat(RegExp["$1"]);
        
        if (fVersion < 7)
        {
            var aImages = document.getElementsByTagName("IMG");
            for (var i=0; i<aImages.length; i++)
            {
                var sPngSrc = aImages[i].getAttribute("pngsrc");
                if (sPngSrc)
                {
                    //Preload PNG images to avoid the AlphaImageLoader deadlock
                    var oImg = aImages[i];
                    var fnAfterPreload = function()
                    {
                        oImg.src = vp.ui.imageUrl("/vp/images/s.gif");
                        oImg.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + sPngSrc + "',sizingMethod='scale');";
                    };

                    var oTemp = document.createElement("IMG");
                    oTemp.onload = fnAfterPreload;
                    oTemp.src = sPngSrc;
                }
            }
            return;
        }   
    }
}

var getLargerImageUrl = function(oImage)
{
    var sUrl;
    
    if (oImage.getAttribute("viewlargersrc"))
    {
        
        sUrl = oImage.getAttribute("viewlargersrc");
    }
    else
    {
        sUrl = oImage.src;
        
        //support the PNG hack in IE6
        if (oImage.getAttribute("pngsrc"))
        {
            sUrl = oImage.getAttribute("pngsrc");
        }
        
        var aMatch = sUrl.match(/([^\?]*)(\..*)/);
        var sPrefix = aMatch[1];
        var sSuffix = aMatch[2];
        sUrl = sPrefix + "_large" + sSuffix;
    }
    
    var oTemp = document.createElement("IMG");
    oTemp.src = sUrl;
    return oTemp.src;
};

var viewLargerImage = function(oLink)
{
    var oImage = oLink;
    if (oImage.firstChild && oImage.firstChild.tagName == "IMG")
    {
        oImage = oImage.firstChild;
    }

    var sLargeSrc = getLargerImageUrl(oImage);
    vp.website.trackViewLargerClick();
    vp.win.openCentered('/vp/JS-Lib/CustomerSites/Common/view_larger.htm?src=' + vp.web.urlEncode(sLargeSrc), '_blank', 600, 400, true, true);
    return false;
};



var onSubmitPayPalButtonFormHandler = function (sFormId) {
    var form = document.getElementById(sFormId);

    //TODO- Why not use new Date().getValue()?
    var sId = ((new Date()).getTime() % 1000000000).toString();

    //TODO- Why not document.location.protocol + "//" + document.location.host?
    var sDomain = document.location.href.match(/http(s?)\:\/\/[^\/]+/)[0];

    var sTrackingUrl = "/active/paypal/tracking.aspx";

    var aTrackingData = {};
    aTrackingData["event"] = 1;
    aTrackingData["alt_site_id"] = form.alt_site_id.value;
    aTrackingData["account"] = form.business.value;
    aTrackingData["txn"] = sId;
    var submissionType;

    var purposeId = 1;
    switch (form.cmd.value) {
        case "_donations":
            purposeId = 2;
            break;
        case "_cart":
            purposeId = form.add ? 3 : 4;
            break;
        default:
            // assume buy now button by default
            purposeId = 1;
            break;
    }

    aTrackingData["purpose"] = purposeId;

    if (purposeId !== 4) //View Cart
    {
        aTrackingData["amount"] = form.amount ? form.amount.value : -1;
        aTrackingData["currency"] = form.currency_code.value;

        //Do some specialized per purpose type operation
        switch (purposeId) {
            case 1:
                submissionType = WIDGET_QS_PayPalButton;
                break;
            case 2:
                submissionType = WIDGET_QS_PayPalButton;
                break;
            case 3:
                aTrackingData["item"] = "itemName: " + form.item_name.value;
                submissionType = WIDGET_QS_ProductCatalog;
                break;
            default:
                break;
        }
    }

    // do a get to track that the visitor is now going to paypal
    var sOutgoingTrackingUrl = sDomain + sTrackingUrl + '?' + vp.web.createQueryString(aTrackingData);
    try {
        var sResponse = vp.http.get(sOutgoingTrackingUrl);
    }
    catch (oError) {
        // do nothing and continue
    }

    if (purposeId === 1 || purposeId === 2) {
        // only need to config return urls when it is a purchase or donation button
        // cart does not support return urls
        if (form.cancel_return) {
            form.removeChild(form.cancel_return);
        }

        // set up return url when customer cancel events
        var field = document.createElement("INPUT");
        field.type = "hidden";
        field.name = "cancel_return";
        aTrackingData["event"] = 3;
        aTrackingData["target"] = document.location.href;
        field.value = sDomain + sTrackingUrl + '?' + vp.web.createQueryString(aTrackingData);
        form.appendChild(field);

        if (form.elements["return"]) {
            form.removeChild(form.elements["return"]);
        }

        field = document.createElement("INPUT");
        field.type = "hidden";
        field.name = "return";
        aTrackingData["event"] = 2;
        field.value = sDomain + sTrackingUrl + '?' + vp.web.createQueryString(aTrackingData);
        form.appendChild(field);

        // add the return method parameter to ensure that our params come back    
        field = document.createElement("INPUT");
        field.type = "hidden";
        field.name = "rm";
        field.value = "2"; // post with params
        form.appendChild(field);

        // add the tracking data as a custom parameter because donations don't return it
        field = document.createElement("INPUT");
        field.type = "hidden";
        field.name = "custom";
        field.value = vp.web.createQueryString(aTrackingData);
        form.appendChild(field);
    }

    field = document.createElement("INPUT");
    field.type = "hidden";
    field.name = "shopping_url";
    field.value = window.location.href;
    form.appendChild(field);

    if (submissionType) {
        vp.website.VisitorLog.LogItem(submissionType);
    }
    return true;
};

function changeFilmstripImage(oSmallImage, sLargeImageId) 
{
    var oPreviewImage = document.getElementById(sLargeImageId);
    oPreviewImage.src = oSmallImage.getAttribute("previewsrc");
    oPreviewImage.title = oSmallImage.title;
}



vp.website.createSlideShow = function(
    sElementID,
    bAutoPlay,
    iPlayRateSeconds,
    bCaptionsAsTooltips,
    bIsCaptureMode,
    aData)
{
    if (bIsCaptureMode)
    {
        vp.website.trackingEnabled = false;
    }
    try
    {
        window.JRCapture.NotifyStarted();
    }
    catch (ex) { }

    jQuery(document).ready(function()
    {
        var oSlideShow = new vp.website.SlideShow(sElementID, aData);
        oSlideShow.playRateSeconds = iPlayRateSeconds;
        oSlideShow.captionsAsTooltips = bCaptionsAsTooltips;
        oSlideShow.autoPlay = bAutoPlay;
        oSlideShow.isCaptureMode = bIsCaptureMode;

        var fnComplete = function()
        {
            try
            {
                window.JRCapture.NotifyComplete();
            }
            catch (ex) { }
        };

        oSlideShow.oninitialloadcomplete.addHandler(fnComplete);
        try
        {
            oSlideShow.render();
        }
        catch (ex)
        {
            try
            {
                window.JRCapture.NotifyComplete();
            }
            catch (ex) { }
        }
    });
};

vp.website.SlideShow = function(sElementID, aData)
{
    var me = this;
    var PHOTOS_PER_PAGE = 0;
    var THUMB_CONTAINER_WIDTH = 67;
    var THUMB_CONTAINER_HEIGHT = 60;
    var CAPTION_WIDTH = 200;
    var CONTROLS_WIDTH = 60;
    var CONTROLS_HEIGHT = 45;

    var _aData = aData;
    var _sElementID = sElementID;

    var _iCurrentPage = 0;
    var _iCurrentPageStartIndex = -1;
    var _iCurrentPageEndIndex = -1;
    var iTotalPages = 0;

    var _oSelectedDataItem = null;
    var _iHideControlsTimer = -1;

    var _oElements = {};

    this.autoPlay = false;
    this.playRateSeconds = 5;
    this.captionsAsTooltips = false;
    this.isCaptureMode = false;

    this.oninitialloadcomplete = new vp.events.CustomEvent(this, "oninitialloadcomplete");

    var collectElements = function(oElement)
    {
        if (oElement.nodeType == 1)
        {
            var sExtendedID = oElement.getAttribute("xid");
            if (sExtendedID)
            {
                _oElements[sExtendedID] = oElement;
            }

            for (var i = 0; i < oElement.childNodes.length; i++)
            {
                collectElements(oElement.childNodes[i]);
            }
        }
    };

    var _iInitialImageLoadCount = 0;

    var getBorderColor = function()
    {
        //for backwards compatibility with published sites
        //background area element was added more recently
        return _oElements.backgroundArea ?
                _oElements.root.style.backgroundColor :
                _oElements.root.style.borderColor;
    };

    var getBackgroundColor = function()
    {
        //for backwards compatibility with published sites
        //background area element was added more recently
        return _oElements.backgroundArea ?
                _oElements.backgroundArea.style.backgroundColor :
                _oElements.root.style.backgroundColor;
    };

    this.render = function()
    {
        _oElements.root = document.getElementById(_sElementID);

        collectElements(_oElements.root);

        PHOTOS_PER_PAGE = Math.floor(_oElements.thumbnailContainer.offsetWidth / THUMB_CONTAINER_WIDTH);
        iTotalPages = Math.floor(_aData.length / PHOTOS_PER_PAGE) + (_aData.length % PHOTOS_PER_PAGE >= 1 ? 1 : 0);

        //Track the initial images loading for IECapture
        //Add one to include the large image
        _iInitialImageLoadCount = Math.min(_aData.length, PHOTOS_PER_PAGE) + 1;

        for (var i = 0; i < _aData.length; i++)
        {
            var oImageContainer = document.createElement("DIV");
            oImageContainer.style.height = (document.all ? THUMB_CONTAINER_HEIGHT - 2 : THUMB_CONTAINER_HEIGHT) + "px";
            oImageContainer.style.width = (document.all ? THUMB_CONTAINER_WIDTH - 2 : THUMB_CONTAINER_WIDTH) + "px";
            oImageContainer.style.border = "1px white solid";

            oImageContainer.style.borderColor = getBackgroundColor();

            oImageContainer.style.textAlign = "center";
            vp.ui.setStyleValue(oImageContainer, "float", "left");

            var oImage = document.createElement("IMG");
            oImage.galleryIndex = i;

            oImageContainer.appendChild(oImage);

            //Track the initial images loading for IECapture
            if (i < PHOTOS_PER_PAGE)
            {
                vp.events.add(oImage, "load", imageLoadHandler);
                //even if the image errors, it shouldnt hold up the rest of the rendering
                vp.events.add(oImage, "error", imageLoadHandler);
            }

            vp.events.add(oImage, "load", thumbnailImageLoadHandler);

            oImage.src = _aData[i].small;
            vp.ui.setStyleValue(oImage, "cursor", "pointer");

            vp.events.add(oImage, "click", selectImage);

            if (_aData[i].caption)
            {
                oImage.setAttribute("alt", _aData[i].caption + (_aData[i].description ? " : " + _aData[i].description : ""));
                oImage.setAttribute("title", _aData[i].caption + (_aData[i].description ? " : " + _aData[i].description : ""));
            }

            _aData[i].element = oImageContainer;
            _aData[i].index = i;
        }

        movePage(true);

        if (_oElements.inlineCaptionContainer && !me.captionsAsTooltips)
        {
            formatCaptionContainer(_oElements.inlineCaptionContainer);
            _oElements.inlineCaptionContainer.style.display = "block";
            _oElements.inlineCaptionContainer.style.overflowY = "auto";
            _oElements.inlineCaptionContainer.style.height = "40px";
            _oElements.inlineCaptionContainer.style.marginBottom = "3px";
        }

        selectImageFromDataItem(_aData[0], imageLoadHandler, imageLoadHandler);

        vp.ui.setStyleValue(_oElements.previousPageButton, "cursor", "pointer");
        vp.ui.setStyleValue(_oElements.nextPageButton, "cursor", "pointer");

        vp.events.add(_oElements.previousPageButton, "click", previousPageButtonHandler);
        vp.events.add(_oElements.nextPageButton, "click", nextPageButtonHandler);

        vp.events.add(_oElements.previewImage, "mouseover", showSlideShowControls);
        vp.events.add(_oElements.previewImage, "mouseout", hideSlideShowControls);
    };

    var _bInited = false;

    var imageLoadHandler = function(e)
    {
        e = vp.events.getEvent(e);

        //Once the first page of thumbnails is loaded, fire the initialloadcomplete event
        _iInitialImageLoadCount--;

        if (!_bInited && _iInitialImageLoadCount <= 0)
        {
            if (!me.isCaptureMode)
            {
                showSlideShowControls();

                if (me.autoPlay)
                {
                    setTimeout(play, 100);
                }
            }

            _bInited = true;
            me.oninitialloadcomplete.fire();
        }
    };


    var thumbnailImageLoadHandler = function(e)
    {
        e = vp.events.getEvent(e);

        positionImage(e.target);
    };

    var positionImage = function(oImage)
    {
        if (oImage.offsetHeight > 0)
        {
            oImage.style.marginTop = ((55 - oImage.offsetHeight) / 2) + "px";
        }
    };

    var showSlideShowControls = function()
    {
        if (_iHideControlsTimer != -1)
        {
            window.clearTimeout(_iHideControlsTimer);
            _iHideControlsTimer = -1;
        }

        refreshSlideShowControls();

        _oElements.controlsRoot.style.display = "block";

        if (_oElements.captionContainer)
        {
            var bShow = _oElements.captionContainer.innerHTML.trim() !== "";
            _oElements.captionContainer.style.display = bShow ? "block" : "none";
        }

        _bControlsVisible = true;
    };

    var refreshSlideShowControls = function()
    {
        if (!_oElements.controlsRoot)
        {
            _oElements.controlsRoot = document.createElement("DIV");
            _oElements.controlsRoot.style.backgroundColor = "white";
            _oElements.controlsRoot.style.width = CONTROLS_WIDTH + "px";
            _oElements.controlsRoot.style.height = CONTROLS_HEIGHT + "px";
            _oElements.controlsRoot.style.textAlign = "center";
            _oElements.controlsRoot.style.position = "absolute";
            _oElements.controlsRoot.style.zIndex = 20;
            _oElements.controlsRoot.style.border = "1px #CCCCCC solid";
            _oElements.controlsRoot.style.display = "none";
            vp.ui.setOpacity(_oElements.controlsRoot, 0.7);

            document.body.appendChild(_oElements.controlsRoot);

            _oElements.playButton = document.createElement("IMG");
            _oElements.playButton.style.margin = "auto";
            _oElements.playButton.style.marginTop = 10 + "px";
            _oElements.playButton.title = _oElements.root.getAttribute("playbuttontitle");

            vp.events.add(_oElements.playButton, "click", togglePlayPause);

            pause();

            vp.ui.setStyleValue(_oElements.playButton, "cursor", "pointer");

            _oElements.controlsRoot.appendChild(_oElements.playButton);

            vp.events.add(_oElements.controlsRoot, "mouseover", showSlideShowControls);
            vp.events.add(_oElements.controlsRoot, "mouseout", hideSlideShowControls);
        }

        var oRect = vp.ui.getRect(_oElements.previewImage);

        _oElements.controlsRoot.style.top = Math.round((oRect.bottom - CONTROLS_HEIGHT) - 2) + "px";
        _oElements.controlsRoot.style.left = Math.round(oRect.left + (oRect.width / 2) - (CONTROLS_WIDTH / 2)) + "px";

        if (me.captionsAsTooltips)
        {
            if (!_oElements.captionContainer)
            {
                _oElements.captionContainer = document.createElement("DIV");
                _oElements.captionContainer.style.position = "absolute";
                _oElements.captionContainer.style.width = CAPTION_WIDTH + "px";
                _oElements.captionContainer.style.zIndex = 21;
                _oElements.captionContainer.style.display = "none";
                _oElements.captionContainer.style.border = "1px #CCCCCC solid";

                formatCaptionContainer(_oElements.captionContainer);

                document.body.appendChild(_oElements.captionContainer);

                vp.ui.setOpacity(_oElements.captionContainer, 0.75);

                vp.events.add(_oElements.captionContainer, "mouseover", showSlideShowControls);
                vp.events.add(_oElements.captionContainer, "mouseout", hideSlideShowControls);
            }


            _oElements.captionContainer.innerHTML = getFormattedCaption(_oSelectedDataItem);

            _oElements.captionContainer.style.left = Math.round(oRect.left + (oRect.width / 2) - (CAPTION_WIDTH / 2)) + "px";

            _oElements.captionContainer.style.display = "block";
            _oElements.captionContainer.style.top = Math.round(oRect.bottom - (_oElements.captionContainer.offsetHeight + 60)) + "px";

            if (_oElements.captionContainer.innerHTML.trim() !== "")
            {
                _oElements.captionContainer.style.display = _bControlsVisible ? "block" : "none";
            }
            else
            {
                _oElements.captionContainer.style.display = "none";
            }
        }
    };

    var formatCaptionContainer = function(oElement)
    {
        oElement.style.padding = "5px";

        if (me.captionsAsTooltips)
        {
            oElement.style.backgroundColor = "white";
        }
        oElement.style.fontFamily = "Arial";
        oElement.style.fontSize = "11px";
    };

    var getFormattedCaption = function(oDataItem)
    {
        var sRet = "";
        if (oDataItem.caption)
        {
            sRet += "<B>" + oDataItem.caption + "</B>";

            if (oDataItem.description)
            {
                sRet += "<BR>";
            }
        }

        sRet += oDataItem.description;
        return sRet;
    };

    var hideSlideShowControls = function()
    {
        _iHideControlsTimer = window.setTimeout(hideSlideShowControlsImmediate, 1000);
    };

    var _bControlsVisible = false;

    var hideSlideShowControlsImmediate = function()
    {
        _oElements.controlsRoot.style.display = "none";

        if (_oElements.captionContainer)
        {
            _oElements.captionContainer.style.display = "none";
        }

        _bControlsVisible = false;
    };

    var _iPlaybackTimer = -1;

    var togglePlayPause = function()
    {
        if (_iPlaybackTimer != -1)
        {
            pause();
        }
        else
        {

            play();
        }
        vp.website.trackImageGalleryClick();
    };

    var play = function()
    {
        if (_oSelectedDataItem.index >= _aData.length - 1)
        {
            //if the last item is selected, go to the first
            selectImageFromDataItem(_aData[0]);
        }
        //        else
        //        {
        //            previewNextImage();
        //        }

        _oElements.playButton.src = "/vp/images/nns/site_builder/buttons_icons/slideshow_pause.gif";
        _iPlaybackTimer = window.setInterval(previewNextImage, me.playRateSeconds * 1000);

        hideSlideShowControls();
    };

    var pause = function()
    {
        _oElements.playButton.src = "/vp/images/nns/site_builder/buttons_icons/slideshow_play.gif";

        if (_iPlaybackTimer != -1)
        {
            window.clearInterval(_iPlaybackTimer);
            _iPlaybackTimer = -1;
        }

        refreshSlideShowControls();
    };

    var previewNextImage = function()
    {
        var oDataItem;
        //Loop back to the beginning
        if (_oSelectedDataItem.index >= _aData.length - 1)
        {
            oDataItem = _aData[0];
        }
        else
        {
            oDataItem = _aData[_oSelectedDataItem.index + 1];
        }

        selectImageFromDataItem(oDataItem);

        //pause when the last item is reached
        if (!me.autoPlay && _oSelectedDataItem.index >= _aData.length - 1)
        {
            pause();
        }
    };

    var nextPageButtonHandler = function()
    {
        pause();
        movePage(true);

    };

    var previousPageButtonHandler = function()
    {
        pause();
        movePage();
    };

    var movePage = function(bForward)
    {
        var iRequestedPage = _iCurrentPage + (bForward ? 1 : -1);

        if (iRequestedPage > iTotalPages)
        {
            return;
        }

        if (iRequestedPage < 1)
        {
            return;
        }

        _iCurrentPage = iRequestedPage;
        _iCurrentPageStartIndex = (PHOTOS_PER_PAGE * _iCurrentPage) - PHOTOS_PER_PAGE;
        _iCurrentPageEndIndex = (_iCurrentPageStartIndex + PHOTOS_PER_PAGE) - 1;

        if (_iCurrentPageEndIndex >= _aData.length - 1)
        {
            _iCurrentPageEndIndex = _aData.length - 1;
        }

        //remove all thumbnails
        while (_oElements.thumbnailContainer.childNodes.length > 0)
        {
            _oElements.thumbnailContainer.removeChild(_oElements.thumbnailContainer.childNodes[0]);
        }

        //add the thumbnails for the current page
        for (var i = _iCurrentPageStartIndex; i <= _iCurrentPageEndIndex; i++)
        {
            _oElements.thumbnailContainer.appendChild(_aData[i].element);
            positionImage(_aData[i].element.firstChild);
        }

        _oElements.previousPageButton.style.visibility = _iCurrentPageStartIndex === 0 ? "hidden" : "visible";
        _oElements.nextPageButton.style.visibility = _iCurrentPageEndIndex == _aData.length - 1 ? "hidden" : "visible";
        vp.website.trackImageGalleryClick();
    };

    var selectImage = function(e)
    {
        e = vp.events.getEvent(e);
        selectImageFromDataItem(_aData[e.target.galleryIndex]);
        pause();
        vp.website.trackImageGalleryClick();
    };

    var selectImageFromDataItem = function(oDataItem, fnCallback, fnErrorCallback)
    {

        while (oDataItem.index > _iCurrentPageEndIndex)
        {
            movePage(true);
        }

        while (oDataItem.index < _iCurrentPageStartIndex)
        {
            movePage(false);
        }

        if (fnCallback)
        {
            var fnCallbackWrapper = function(e)
            {
                fnCallback(e);
                vp.events.remove(_oElements.previewImage, "load", fnCallbackWrapper);
            };

            vp.events.add(_oElements.previewImage, "load", fnCallbackWrapper);
        }

        if (fnErrorCallback)
        {
            var fnErrorCallbackWrapper = function(e)
            {
                fnErrorCallback(e);
                vp.events.remove(_oElements.previewImage, "error", fnErrorCallbackWrapper);
            };

            vp.events.add(_oElements.previewImage, "error", fnErrorCallbackWrapper);
        }

        _oElements.previewImage.src = oDataItem.large;
        if (oDataItem.caption)
        {
            _oElements.previewImage.setAttribute("alt", oDataItem.caption + (oDataItem.description ? " : " + oDataItem.description : ""));
            _oElements.previewImage.setAttribute("title", oDataItem.caption + (oDataItem.description ? " : " + oDataItem.description : ""));
        }

        if (!me.captionsAsTooltips)
        {
            _oElements.inlineCaptionContainer.innerHTML = getFormattedCaption(oDataItem);
        }

        if (_oSelectedDataItem)
        {
            _oSelectedDataItem.element.style.border = "1px white solid";
            _oSelectedDataItem.element.style.borderColor = getBackgroundColor();
        }

        oDataItem.element.style.border = "1px #FFFFFF solid";
        oDataItem.element.style.borderColor = getBorderColor();

        _oSelectedDataItem = oDataItem;
        refreshSlideShowControls();

    };
};

//
// Begin streaming meadia functions
// These functions are used to ensure that we stop "pinging" the server in a timely fashion
// They are meant to address to separate issues:
// 1) When a player pauses it will by default continue to ping the server many times a second for 60 secs
// 2) When a player completes is will continue to ping server indefinitely (until the browser leaves the page)
//
vp.website.mediaSendStopSignal = function(playerId) {
    var oPlayer = document.getElementById(playerId);
    oPlayer.sendEvent("STOP");
};

var mediaPausedPlayers = [];
vp.website.mediaStateTracker = function(obj) {
	if (obj) {
	    if (obj.newstate == "COMPLETED") {
	        var oPlayer = document.getElementById(obj.id);
	        oPlayer.sendEvent("STOP");
	    }
	    if (obj.newstate == "PAUSED") {
	        mediaPausedPlayers[obj.id] = setTimeout("vp.website.mediaSendStopSignal('" + obj.id + "')", 10000);
	    }
	    else {
	        if (mediaPausedPlayers[obj.id] !== undefined) {
	            clearTimeout(mediaPausedPlayers[obj.id]);
	            delete mediaPausedPlayers[obj.id];
	        }
	    }
	}
};

vp.website.mediaSeekTracker = function(obj) {
	if (obj) {
	    if (mediaPausedPlayers[obj.id] !== undefined) {
	        clearTimeout(mediaPausedPlayers[obj.id]);
	        delete mediaPausedPlayers[obj.id];
	    }
    }
};

// this function MUST be called playerReady()
// it is invoked by name by the media player control
function playerReady(obj) {
    var player = document.getElementById(obj.id);
    if (player) {
    	player.addModelListener("STATE", "vp.website.mediaStateTracker");
    	player.addControllerListener("SEEK", "vp.website.mediaSeekTracker");
    }
};



vp.website.createMediaPlayer = function(playerId, width, bAutoStart, bLoop)
{
    var oPlayer = new SWFObject("/media/player.swf", "player_" + playerId, width, "20", "9", "#ffffff");
    oPlayer.addParam("allowfullscreen", "false");
    oPlayer.addParam("wmode", "opaque");
    var sFlashVars = '&file={0}&autostart={1}&repeat={2}'.format(
        eval('mediaPlayerSong_' + playerId),
        bAutoStart.toString(),
        bLoop ? "always" : "none");
    oPlayer.addParam('flashvars', sFlashVars);
    oPlayer.write('mediaPlayer_' + playerId);
};

vp.website.audioPlayerReady = function(oPlayer)
{
    var oPlayerElement = document.getElementById(oPlayer.id);
    oPlayerElement.addControllerListener("PLAY", "vp.website.trackAudioPlayerClick");
    oPlayerElement.addViewListener("ITEM", "vp.website.trackAudioPlayerClick");
    oPlayerElement.addControllerListener("ITEM", "vp.website.newPlaylistItemHandler");
};

vp.website.createMediaPlayerWithPlaylist = function(sPlayerId, sFileName, width, bAutoStart, bLoop, bShowPlaylist, iPlaylistHeight, sPlaylistFrontColor, sPlaylistBackColor)
{
    var iPlayerHeight = 20;
    if (bShowPlaylist)
    {
        iPlayerHeight += iPlaylistHeight;
    }

    var oPlayer = new SWFObject("/media/player.swf", sPlayerId, width, iPlayerHeight, "9", "#ffffff");
    oPlayer.addParam("allowfullscreen", "false");
    oPlayer.addParam("wmode", "opaque");
    var sFlashVars = "&file={0}&autostart={1}&repeat={2}&playerready={3}".format(
        sFileName, bAutoStart.toString(), bLoop ? "always" : "list", "vp.website.audioPlayerReady");
    if (sPlaylistFrontColor)
    {
        //sFlashVars += "&frontcolor=" + sPlaylistFrontColor;
    }
    if (sPlaylistBackColor)
    {
        //sFlashVars += "&backcolor=" + sPlaylistBackColor;
    }

    if (bShowPlaylist)
    {
        sFlashVars += "&playlist=bottom&playlistsize=" + iPlaylistHeight.toString();
    }
    else
    {
        sFlashVars += "&playlist=none";
    }
    oPlayer.addParam("flashvars", sFlashVars);

    oPlayer.write(sPlayerId + "_cell");
};

vp.website.newPlaylistItemHandler = function(e)
{
    var oTitleContainer = document.getElementById(e.id + "_title");
    if (oTitleContainer)
    {
        oTitleContainer.innerHTML = eval("{0}_playlist[{1}].title".format(e.id, e.index));
    }
    
    var oDescContainer = document.getElementById(e.id + "_desc");
    if (oDescContainer)
    {
        oDescContainer.innerHTML = eval("{0}_playlist[{1}].description".format(e.id, e.index));
    }
};

vp.website.trackVideoPlayerClick = function(iStateChange)
{
    if (iStateChange === 1)
    {
        vp.website.VisitorLog.LogItem(WIDGET_QS_MediaPlayer + "_Video");
    }
};


function onYouTubePlayerReady(sPlayerId)
{
    var oPlayerElement = document.getElementById(vp.web.urlDecode(sPlayerId));
    oPlayerElement.addEventListener("onStateChange", "vp.website.trackVideoPlayerClick");
};


vp.website.createVideoPlayer = function(sPlayerId, sUrl, iWidth, iHeight, bAutoPlay)
{

    if (bAutoPlay)
    {
        sUrl += "&autoplay=1";
    }
    else
    {
        sUrl += "?enablejsapi=1&playerapiid=" + sPlayerId;
    }

    // calculate the rendered height of the text to get the real size of the player
    var iTextHeight = document.getElementById(sPlayerId + "_title").offsetHeight +
        document.getElementById(sPlayerId + "_desc").offsetHeight;

    var oPlayer = new SWFObject(sUrl, sPlayerId, iWidth, iHeight - iTextHeight, "9", "#ffffff");
    oPlayer.addParam("AllowScriptAccess", "Always");
    oPlayer.addParam("wmode", "opaque");
    oPlayer.write(sPlayerId + "_cell");
};


