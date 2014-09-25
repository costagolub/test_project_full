/* ==========================================================================

    Project: Test Project
    Author:
    Last updated: @@timestamp

   ========================================================================== */

(function($) {

  'use strict';

  var App = {

    /**
     * Init Function
     */
    init: function() {
      App.autoSlideShow();
      // App.feature2();
    },

    /**
     * Custom feature 1
     */
    autoSlideShow: function() {
      var linkToImage = $(".group-1"),
          currentPos = 0,
          next,
          once = false,
          totalImages = linkToImage.length;

      // init colorbox
      linkToImage.colorbox({
        rel:'group-1',
        open: true,
        onLoad: function() {
          var _this = $(this);
          currentPos += _this.index();
        },
      });

      // triggers when the transition has completed and the newly loaded content has been revealed
      $(document).bind('cbox_complete', function(){
        if (!once) {
          if (currentPos == totalImages) {
            setTimeout($.colorbox.close, 2000);
            once = true;
          } else {
            next = setTimeout($.colorbox.next, 2000);
          }
        }
      });

      // triggers as the close method begins
      $(document).bind('cbox_cleanup', function(){
          clearTimeout(next);
          currentPos = 0;
          once = true;
      });
    },

    /**
     * Custom feature 2
     */
    feature2: function() {

    }

  };

  $(function() {
    App.init();
  });

})(jQuery);
