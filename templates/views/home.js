$(window).on("load", function () {
    $(window).scroll(function () {
        var windowBottom = $(this).scrollTop() + $(this).innerHeight();
        $(".fade1").each(function () {
            /* Check the location of each desired element */
            var objectBottom = $(this).offset().top + $(this).outerHeight();

            /* If the element is completely within bounds of the window, fade it in */

            if ($(window).width() > 1080) {
                if (objectBottom < windowBottom) { //object comes into view (scrolling down)
                    if ($(this).css("opacity") == 0) { $(this).fadeTo(750, 1); }
                } else { //object goes out of view (scrolling up)
                    if ($(this).css("opacity") == 1) { $(this).fadeTo(750, 0); }
                }
            }
            else if ($(window).width() < 480) {
                if (objectBottom < windowBottom) { //object comes into view (scrolling down)
                    if ($(this).css("opacity") == 0) { $(this).fadeTo(10, 1); }
                } else { //object goes out of view (scrolling up)
                    if ($(this).css("opacity") == 1) { $(this).fadeTo(10, 0); }
                }
            }
            else {
                if (objectBottom < windowBottom) { //object comes into view (scrolling down)
                    if ($(this).css("opacity") == 0) { $(this).fadeTo(200, 1); }
                } else { //object goes out of view (scrolling up)
                    if ($(this).css("opacity") == 1) { $(this).fadeTo(200, 0); }
                }
            }
        });
    }).scroll(); //invoke scroll-handler on page-load
});