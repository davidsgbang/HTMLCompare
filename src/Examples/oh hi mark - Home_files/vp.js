/*jsl:option explicit*/

function inlineLoadScript(sSrc)
{
    var sPrefix = "";
    if (window.hostedSiteRoot)
    {
        sPrefix = window.hostedSiteRoot;
    }
    document.write("<script language=\"JavaScript\" src=\"" + sPrefix + sSrc + "?automin=1\"></script>");
}

/*
This indirection allows us to easily change the scripts that are included in customer's sites
without re-publishing.
*/

inlineLoadScript("/vp/JS-Lib/HostedServices/common/generated/hosted_sites.js");

inlineLoadScript("/vp/JS-Lib/CustomerSites/Common/generated_dd/constants.js");
inlineLoadScript("/vp/JS-Lib/CustomerSites/Common/provisioned.js");

inlineLoadScript("/vp/JS-Lib/CustomerSites/SiteBuilder/sw_lightbox.js");
inlineLoadScript("/vp/JS-Lib/CustomerSites/SiteBuilder/sw_lightbox.init.js");
inlineLoadScript("/vp/JS-Lib/CustomerSites/SiteBuilder/jquery.tn3.min.js");

function encodeBlogPost()
{
    jQuery('.action .userlink').attr('href', 'javascript:void(0);');
    var $comment = jQuery('textarea.comment');
    
    var $mask = $comment.clone();
    $mask.insertAfter($comment);
    $mask.val($comment.val());
    $mask.attr('id', '');
    $mask.attr('name', '');
    $comment.css('display', 'none');

    $comment.val(encodeURIComponent($comment.val()));    
};

