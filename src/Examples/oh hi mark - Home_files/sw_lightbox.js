(function ($j)
{
    $j(document).ready(function ()
    {
        // if ($j("a[rel^='sw_lightbox']") !== false) {
        $j("a[rel^='sw_lightbox']").sw_lightbox({

            box_background_color: "Black",
            overlay_color: "Gray",
            caption_text_color: "White",
            caption_overlay_color: "Black",
            animation_speed: 400,
            autoplay: false,
            slideshow_speed: 3000
        });
    });
})(jQuery);