$(window).on("load", function () {
    $(window).scroll(function () {
        if ($(window).width() > 1080) {
            var windowBottom = $(this).scrollTop() + $(this).innerHeight();
            $(".fade1").each(function () {
                /* Check the location of each desired element */
                var objectBottom = $(this).offset().top + $(this).outerHeight();

                /* If the element is completely within bounds of the window, fade it in */

                if (objectBottom < windowBottom) { //object comes into view (scrolling down)
                    if ($(this).css("opacity") == 0) { $(this).fadeTo(750, 1); }
                } else { //object goes out of view (scrolling up)
                    if ($(this).css("opacity") == 1) { $(this).fadeTo(750, 0); }
                }
            });
        }
        else if ($(window).width() < 480) {
            var windowBottom = $(this).scrollTop() + $(this).innerHeight();
            $(".fade1").each(function () {
                /* Check the location of each desired element */
                var objectBottom = $(this).offset().top + $(this).outerHeight();

                /* If the element is completely within bounds of the window, fade it in */

                if (objectBottom < windowBottom + 500) { //object comes into view (scrolling down)
                    if ($(this).css("opacity") == 0) { $(this).fadeTo(750, 1); }
                } else { //object goes out of view (scrolling up)
                    if ($(this).css("opacity") == 1) { $(this).fadeTo(750, 0); }
                }
            });
        }
        else {
            var windowBottom = $(this).scrollTop() + $(this).innerHeight();
            $(".fade1").each(function () {
                /* Check the location of each desired element */
                var objectBottom = $(this).offset().top + $(this).outerHeight();

                /* If the element is completely within bounds of the window, fade it in */

                if (objectBottom < windowBottom) { //object comes into view (scrolling down)
                    if ($(this).css("opacity") == 0) { $(this).fadeTo(750, 1); }
                } else { //object goes out of view (scrolling up)
                    if ($(this).css("opacity") == 1) { $(this).fadeTo(750, 0); }
                }
            });
        }
    }).scroll(); //invoke scroll-handler on page-load
});