/**
 * @file
 * Cfn-revision.js.
 */

(function ($) {

    var isDraft = false;

    (window.onpopstate = function () {

        var url = window.location.pathname;
        var pattern = /(draft__)(.*)/g;
        var page_path, match;

        match = pattern.exec(url);

        if (match != null) {
            isDraft = true;
        }
        else {
            isDraft = false;
        }

    })();

    $(document).ready(function(){

        $('body').on('click', '#panels-ipe-customize-page-get-draft', cfn_revision_edit_page);
        $('body').on('click', '#panels-ipe-customize-edit-draft', cfn_revision_redirect_edit_draft);

    });

    function cfn_revision_add_loader_to_button($btn) {
        $btn.prepend('<i style="position: inherit;" class="fa-li fa fa-spinner fa-spin"></i>');
        $btn.attr('disabled', 'disabled').addClass('btn-disabled');
    }

    function cfn_revision_redirect_edit_draft(event) {

        var $btn = $(event.target);
        var isDisabled = $btn.attr('disabled') == 'disabled' ? true : false;

        if (isDisabled) {
            return;
        }

        cfn_revision_add_loader_to_button($btn);
    }

    function cfn_revision_edit_page(event) {

        if (isDraft == true) {
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        var $btn = $(event.target);
        var isDisabled = $btn.attr('disabled') == 'disabled' ? true : false;

        if (isDisabled) {
            return;
        }

        cfn_revision_add_loader_to_button($btn);

        var path_name = window.location.pathname;
        if (path_name == '' || path_name == '/') {
          path_name = '/__home';
        }

        $.ajax({
            url: '/revision/get-draft' + path_name,
            type: 'GET',
            success: function(data){

                if (typeof data.url == 'undefined' || data.url == null) {
                    alert('woops! invalid response');
                    return;
                }

                window.location = data.url;
            },
            error: function(data) {
                alert('woops! request error');
            }
        });
    }

}(jQuery));
;
(function ($) {

 Drupal.behaviors.panopolyMagic = {
   attach: function (context, settings) {

     /**
      * Title Hax for Panopoly
      *
      * Replaces the markup of a node title pane with
      * the h1.title page element
      */
     if ($.trim($('.pane-node-title .pane-content').html()) == $.trim($('h1.title').html())) {
       $('.pane-node-title .pane-content').html('');
       $('h1.title').hide().clone().prependTo('.pane-node-title .pane-content');
       $('.pane-node-title h1.title').show();
     }

   }
 }

})(jQuery);

(function ($) {

  /**
   * Improves the Auto Submit Experience for CTools Modals
   */
  Drupal.behaviors.panopolyMagicAutosubmit = {
    attach: function (context, settings) {
      // Replaces click with mousedown for submit so both normal and ajax work.
      $('.ctools-auto-submit-click', context)
      // Exclude the 'Style' type form because then you have to press the
      // "Next" button multiple times.
      // @todo: Should we include the places this works rather than excluding?
      .filter(function () { return $(this).closest('form').attr('id').indexOf('panels-edit-style-type-form') !== 0; })
      .click(function(event) {
        if ($(this).hasClass('ajax-processed')) {
          event.stopImmediatePropagation();
          $(this).trigger('mousedown');
          return false;
        }
      });

      // 'this' references the form element
      function triggerSubmit (e) {
        var $this = $(this), preview_widget = $('.widget-preview', context);
        if (!preview_widget.hasClass('panopoly-magic-loading')) {
          preview_widget.addClass('panopoly-magic-loading');
          $this.find('.ctools-auto-submit-click').click();
        }
      }

      // e.keyCode: key
      var discardKeyCode = [
        16, // shift
        17, // ctrl
        18, // alt
        20, // caps lock
        33, // page up
        34, // page down
        35, // end
        36, // home
        37, // left arrow
        38, // up arrow
        39, // right arrow
        40, // down arrow
         9, // tab
        13, // enter
        27  // esc
      ];

      // Special handling for link field widgets. This ensures content which is ahah'd in still properly autosubmits.
      $('.field-widget-link-field input:text', context).addClass('panopoly-textfield-autosubmit').addClass('ctools-auto-submit-exclude');

      // Handle text fields and textareas.
      var timer;
      $('.panopoly-textfield-autosubmit, .panopoly-textarea-autosubmit', context)
      .once('ctools-auto-submit')
      .bind('keyup blur', function (e) {
        var $element;
        $element = $('.widget-preview .pane-title', context);

        clearTimeout(timer);

        // Filter out discarded keys.
        if (e.type !== 'blur' && $.inArray(e.keyCode, discardKeyCode) > 0) {
          return;
        }

        // Special handling for title elements.
        if ($element.length && $(e.target).parent('.form-item-title,.form-item-widget-title').length) {

          // If all text was removed, remove the existing title markup from the dom.
          if (!$(e.target).val().length) {
            $('.widget-preview .pane-title', context).remove();
          }
          // Insert as link title text if the title is a link.
          else if ($('a', $element).length) {
            $('a', $element).html($(e.target).val());
          }
          // Otherwise just insert the form value as-is.
          else {
            $element.html($(e.target).val());
          }
        } 
        // Automatically submit the field on blur. This won't happen if title markup is already present.
        else if (e.type == 'blur') {
          triggerSubmit.call(e.target.form)
        }
        // If all else fails, just trigger a timer to submit the form a second after the last activity.
        else {
          timer = setTimeout(function () { triggerSubmit.call(e.target.form); }, 1000);
        }
      });
  
      // Handle autocomplete fields.
      $('.panopoly-autocomplete-autosubmit', context)
      .once('ctools-auto-submit')
      .blur(function (e) {
        triggerSubmit.call(e.target.form);
      });

      // Prevent ctools auto-submit from firing when changing text formats.
      $(':input.filter-list').addClass('ctools-auto-submit-exclude');

    }
  }
})(jQuery);
;
(function ($) {

 Drupal.behaviors.PanelsAccordionStyle = {
   attach: function (context, settings) {
     for ( region_id in Drupal.settings.accordion ) {
    		var accordion = Drupal.settings.accordion[region_id] ;
		    jQuery('#'+region_id).accordion(accordion.options);
  	 }
   }
  }

})(jQuery);
;
