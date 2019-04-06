/*! flip - v1.1.1 - 2016-05-25
* https://github.com/nnattawat/flip
* Copyright (c) 2016 Nattawat Nonsung; Licensed MIT */
(function( $ ) {
  /*
   * Private attributes and method
   */

  // Function from David Walsh: http://davidwalsh.name/css-animation-callback licensed with http://opensource.org/licenses/MIT
  var whichTransitionEvent = function() {
    var t, el = document.createElement("fakeelement"),
    transitions = {
      "transition"      : "transitionend",
      "OTransition"     : "oTransitionEnd",
      "MozTransition"   : "transitionend",
      "WebkitTransition": "webkitTransitionEnd"
    };

    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  };

  /*
   * Model declaration
   */
  var Flip = function($el, options, callback) {
    // Define default setting
    this.setting = {
      axis: "y",
      reverse: false,
      trigger: "click",
      speed: 500,
      forceHeight: false,
      forceWidth: false,
      autoSize: true,
      front: '.front',
      back: '.back'
    };

    this.setting = $.extend(this.setting, options);

    if (typeof options.axis === 'string' && (options.axis.toLowerCase() === 'x' || options.axis.toLowerCase() === 'y')) {
      this.setting.axis = options.axis.toLowerCase();
    }

    if (typeof options.reverse === "boolean") {
      this.setting.reverse = options.reverse;
    }

    if (typeof options.trigger === 'string') {
      this.setting.trigger = options.trigger.toLowerCase();
    }

    var speed = parseInt(options.speed);
    if (!isNaN(speed)) {
      this.setting.speed = speed;
    }

    if (typeof options.forceHeight === "boolean") {
      this.setting.forceHeight = options.forceHeight;
    }

    if (typeof options.forceWidth === "boolean") {
      this.setting.forceWidth = options.forceWidth;
    }

    if (typeof options.autoSize === "boolean") {
      this.setting.autoSize = options.autoSize;
    }

    if (typeof options.front === 'string' || options.front instanceof $) {
      this.setting.front = options.front;
    }

    if (typeof options.back === 'string' || options.back instanceof $) {
      this.setting.back = options.back;
    }

    // Other attributes
    this.element = $el;
    this.frontElement = this.getFrontElement();
    this.backElement = this.getBackElement();
    this.isFlipped = false;

    this.init(callback);
  };

  /*
   * Public methods
   */
  $.extend(Flip.prototype, {

    flipDone: function(callback) {
      var self = this;
      // Providing a nicely wrapped up callback because transform is essentially async
      self.element.one(whichTransitionEvent(), function() {
        self.element.trigger('flip:done');
        if (typeof callback === 'function') {
          callback.call(self.element);
        }
      });
    },

    flip: function(callback) {
      if (this.isFlipped) {
        return;
      }

      this.isFlipped = true;

      var rotateAxis = "rotate" + this.setting.axis;
      this.frontElement.css({
        transform: rotateAxis + (this.setting.reverse ? "(-180deg)" : "(180deg)"),
        "z-index": "0"
      });

      this.backElement.css({
        transform: rotateAxis + "(0deg)",
        "z-index": "1"
      });
      this.flipDone(callback);
    },

    unflip: function(callback) {
      if (!this.isFlipped) {
        return;
      }

      this.isFlipped = false;

      var rotateAxis = "rotate" + this.setting.axis;
      this.frontElement.css({
        transform: rotateAxis + "(0deg)",
        "z-index": "1"
      });

      this.backElement.css({
        transform: rotateAxis + (this.setting.reverse ? "(180deg)" : "(-180deg)"),
        "z-index": "0"
      });
      this.flipDone(callback);
    },

    getFrontElement: function() {
      if (this.setting.front instanceof $) {
        return this.setting.front;
      } else {
        return this.element.find(this.setting.front);
      }
    },

    getBackElement: function() {
      if (this.setting.back instanceof $) {
        return this.setting.back;
      } else {
        return this.element.find(this.setting.back);
      }
    },

    init: function(callback) {
      var self = this;

      var faces = self.frontElement.add(self.backElement);
      var rotateAxis = "rotate" + self.setting.axis;
      var perspective = self.element["outer" + (rotateAxis === "rotatex" ? "Height" : "Width")]() * 2;
      var elementCss = {
        'perspective': perspective,
        'position': 'relative'
      };
      var backElementCss = {
        "transform": rotateAxis + "(" + (self.setting.reverse ? "180deg" : "-180deg") + ")",
        "z-index": "0"
      };
      var faceElementCss = {
        "backface-visibility": "hidden",
        "transform-style": "preserve-3d",
        "position": "absolute",
        "z-index": "1"
      };

      if (self.setting.forceHeight) {
        faces.outerHeight(self.element.height());
      } else if (self.setting.autoSize) {
        faceElementCss.height = '100%';
      }

      if (self.setting.forceWidth) {
        faces.outerWidth(self.element.width());
      } else if (self.setting.autoSize) {
        faceElementCss.width = '100%';
      }

      // Back face always visible on Chrome #39
      if ((window.chrome || (window.Intl && Intl.v8BreakIterator)) && 'CSS' in window) {
        //Blink Engine, add preserve-3d to self.element
        elementCss["-webkit-transform-style"] = "preserve-3d";
      }

      self.element.css(elementCss);
      self.backElement.css(backElementCss);
      faces.css(faceElementCss).find('*').css({
        "backface-visibility": "hidden"
      });

      // #39
      // not forcing width/height may cause an initial flip to show up on
      // page load when we apply the style to reverse the backface...
      // To prevent self we first apply the basic styles and then give the
      // browser a moment to apply them. Only afterwards do we add the transition.
      setTimeout(function() {
        // By now the browser should have applied the styles, so the transition
        // will only affect subsequent flips.
        var speedInSec = self.setting.speed / 1000 || 0.5;
        faces.css({
          "transition": "all " + speedInSec + "s ease-out"
        });

        // This allows flip to be called for setup with only a callback (default settings)
        if (typeof callback === 'function') {
          callback.call(self.element);
        }

        // While this used to work with a setTimeout of zero, at some point that became
        // unstable and the initial flip returned. The reason for this is unknown but we
        // will temporarily use a short delay of 20 to mitigate this issue. 
      }, 20);

      self.attachEvents();
    },

    clickHandler: function(event) {
      if (!event) { event = window.event; }
      if (this.element.find($(event.target).closest('button, a, input[type="submit"]')).length) {
        return;
      }

      if (this.isFlipped) {
        this.unflip();
      } else {
        this.flip();
      }
    },

    hoverHandler: function() {
      var self = this;
      self.element.off('mouseleave.flip');

      self.flip();

      setTimeout(function() {
        self.element.on('mouseleave.flip', $.proxy(self.unflip, self));
        if (!self.element.is(":hover")) {
          self.unflip();
        }
      }, (self.setting.speed + 150));
    },

    attachEvents: function() {
      var self = this;
      if (self.setting.trigger === "click") {
        self.element.on($.fn.tap ? "tap.flip" : "click.flip", $.proxy(self.clickHandler, self));
      } else if (self.setting.trigger === "hover") {
        self.element.on('mouseenter.flip', $.proxy(self.hoverHandler, self));
        self.element.on('mouseleave.flip', $.proxy(self.unflip, self));
      }
    },

    flipChanged: function(callback) {
      this.element.trigger('flip:change');
      if (typeof callback === 'function') {
        callback.call(this.element);
      }
    },

    changeSettings: function(options, callback) {
      var self = this;
      var changeNeeded = false;

      if (options.axis !== undefined && self.setting.axis !== options.axis.toLowerCase()) {
        self.setting.axis = options.axis.toLowerCase();
        changeNeeded = true;
      }

      if (options.reverse !== undefined && self.setting.reverse !== options.reverse) {
        self.setting.reverse = options.reverse;
        changeNeeded = true;
      }

      if (changeNeeded) {
        var faces = self.frontElement.add(self.backElement);
        var savedTrans = faces.css(["transition-property", "transition-timing-function", "transition-duration", "transition-delay"]);

        faces.css({
          transition: "none"
        });

        // This sets up the first flip in the new direction automatically
        var rotateAxis = "rotate" + self.setting.axis;

        if (self.isFlipped) {
          self.frontElement.css({
            transform: rotateAxis + (self.setting.reverse ? "(-180deg)" : "(180deg)"),
            "z-index": "0"
          });
        } else {
          self.backElement.css({
            transform: rotateAxis + (self.setting.reverse ? "(180deg)" : "(-180deg)"),
            "z-index": "0"
          });
        }
        // Providing a nicely wrapped up callback because transform is essentially async
        setTimeout(function() {
          faces.css(savedTrans);
          self.flipChanged(callback);
        }, 0);
      } else {
        // If we didnt have to set the axis we can just call back.
        self.flipChanged(callback);
      }
    }

  });

  /*
   * jQuery collection methods
   */
  $.fn.flip = function (options, callback) {
    if (typeof options === 'function') {
      callback = options;
    }

    if (typeof options === "string" || typeof options === "boolean") {
      this.each(function() {
        var flip = $(this).data('flip-model');

        if (options === "toggle") {
          options = !flip.isFlipped;
        }

        if (options) {
          flip.flip(callback);
        } else {
          flip.unflip(callback);
        }
      });
    } else {
      this.each(function() {
        if ($(this).data('flip-model')) { // The element has been initiated, all we have to do is change applicable settings
          var flip = $(this).data('flip-model');

          if (options && (options.axis !== undefined || options.reverse !== undefined)) {
            flip.changeSettings(options, callback);
          }
        } else { // Init
          $(this).data('flip-model', new Flip($(this), (options || {}), callback));
        }
      });
    }

    return this;
  };

}( jQuery ));
;
/**
 * @file
 * flip-behavior.js
 *
 * Script used to manage the flip widgets responsiveness.
 */

(function ($) {
  var rtime;
  var timeout = false;
  var delta = 200;
  var bigger = new Array();
  $(document).ready(function(){
    // After the document is ready, the ajax is still not completed.
    $(document).ajaxComplete(function() {
      // So wait for it to be completed.
      // Even after it's completed the panels are not completely loaded.
      setTimeout(function() {
        // So set a timeout and trigger the load event.
        $(window).trigger('load');
      }, 500);
    });
    $(window).resize(function() {
      // Since doing complex things in the resize is 'expensive'
      // we do it only when the resize ends.
      rtime = new Date();
      if (timeout === false) {
        timeout = true;
        setTimeout(resizeend, delta);
      };
    });

    // This is used in the reports page
    $('.report-table .cursor-pointer').click(function() {
      setTimeout(function() {
        $(window).trigger('load');
      }, 1);
    });
  });

  function resizeend() {
    if (new Date() - rtime < delta) {
      setTimeout(resizeend, delta);
    } else {
      timeout = false;
      bigger = new Array();
      $('.flip-widget').each(function() {
        // Set the back and front position to absolute to
        // get the real height and width.
        $(this).find('.back').css('position', 'absolute');
        $(this).find('.front').css('position', 'absolute');
        var widget = $(this);
        // Sets the max-width for the .flip-widget .front and .back.
        setMaxWidth(widget);
        // Fill the array with the sides with biggest height.
        getBiggers(widget);
      });
      // Sets the height and make it visible.
      resizeFlipWidget();
    }
  }

  $(window).load(function() {
    $('.flip-widget').css('width', 'auto');
    // Reset the array with bigger sides.
    bigger = new Array();
    // Starts the flip widget and make it happen on hover instead of click.
    $('.flip-widget').flip({
      trigger: 'hover',
    });
    $('.flip-widget').each(function() {
      var element = $(this);
      // Sets the max-width for all widgets.
      setMaxWidth(element);
    });
    setTimeout(function() {
      $('.flip-widget').each(function() {
        var widget = $(this);
        getBiggers(widget);
      });
    }, 250)
    setTimeout(function() {
      resizeFlipWidget();
    }, 500);
  });

  function resizeFlipWidget() {
    $('.flip-widget').each(function() {
      var current = $(this);
      // Cycle through the sides with the biggest height.
      bigger.forEach(function(value) {
        $(value).css('height', 'auto');
        if (current.find('.' + $(value).attr('class')).get(0) == $(value).get(0)) {
          // Set the height of the opposite side accordingly.
          current.find('.' + $(value).attr('class')).siblings().height($(value).outerHeight());
          //$(value).css('position', 'relative');
          current.find('.' + $(value).attr('class')).siblings().css('position', 'relative');
          current.find('.' + $(value).attr('class')).css('top', 0);
        }
      });
    });
    $('.flip-widget').css('visibility', 'visible');
  }

  function setMaxWidth(widget) {
    // Gets the float property.
    var float = widget.css('float');
    // Sets some css properties to get sizes without any css interfering.
    widget.css('height', 'auto');
    widget.css('float', 'none');
    widget.find('.back, .front').css('max-width', 'none');
    widget.find('.back, .front').css('max-height', widget.css('max-height'));
    widget.find('img').each(function() {
      if ($(this).hasClass('hero-image')) {
        // Sets the image heights to auto.
        $(this).css('height', 'auto');
      }
    });
    
    widget.find('img').each(function() {
      // This will adjust the margins depending on the alignment.
      if ($(this).attr('style') != undefined) {
        if ($(this).attr('style').indexOf('float') != -1 || $(this).attr('style').indexOf('margin') != -1) {
          // If the image has a float or margin property.
          var element = $(this);
          $(this).attr('style').split(';').forEach(function(value) {
            if (value.indexOf('margin-right') != -1) {
              element.parent().css('margin-right', value.split(':')[1].substr(1, 10));
            }
            if (value.indexOf('margin-left') != -1) {
              element.parent().css('margin-left', value.split(':')[1].substr(1, 10));
            }
          });
        }
      }
      $(this).parent().css('float', widget.css('float'));
      $(this).parent().css('display', widget.css('display'));
    });
    
    // Resets more css properties to get original sizes.
    widget.find('.back').css('position', 'absolute');
    widget.find('.front').css('position', 'absolute');
    widget.find('.front').css('height', 'auto');
    widget.find('.back').css('height', 'auto');
    widget.find('.front').css('width', 'auto');
    widget.find('.back').css('width', 'auto');

    // This is perform some calculations to identify the biggest element in the widget sides.
    var element = widget.find('.back').width() > widget.find('.front').width() ? widget.find('.back') : widget.find('.front');
    var biggestPBack = 0;
    element.parent().find('.back p').each(function() {
      if ($(this).width() > biggestPBack) {
        biggestPBack = $(this).width();
      }
    });
    var biggestImgBack = 0;
    widget.find('.back img').each(function() {
      if ($(this).width() > biggestImgBack) {
        biggestImgBack = $(this).width();
      }
    });
    // Compares the biggest p size with the biggest img size.
    if (biggestPBack > biggestImgBack) {
      element.parent().find('.back').css('max-width', biggestPBack + 11);
    }
    else {
      element.parent().find('.back').css('max-width', biggestImgBack);
    }

    // Same as above.
    var biggestPFront = 0;
    element.parent().find('.front p').each(function() {
      if ($(this).width() > biggestPFront) {
        biggestPFront = $(this).width();
      }
    });
    var biggestImgFront = 0;
    widget.find('.front img').each(function() {
      if ($(this).width() > biggestImgFront) {
        biggestImgFront = $(this).width();
      }
    });
    // Same as above.
    if (biggestPFront > biggestImgFront) {
      element.parent().find('.front').css('max-width', biggestPFront + 11);
    }
    else {
      element.parent().find('.front').css('max-width', biggestImgFront);
    }

    // This compares the max-widths of both sides
    if (parseInt(element.parent().find('.front').css('max-width').split('px')[0]) > parseInt(element.parent().find('.back').css('max-width').split('px')[0])) {
      // If the front side is bigger, we should set the back max-width.
      element.parent().find('.back').css('max-width', parseInt(element.parent().find('.front').css('max-width').split('px')[0]) + 11);
      // This if is used when there is text in one side and only an image on the other one.
      if (biggestImgFront < biggestPFront) {
        element.css('max-width', parseInt(element.parent().find('.front').css('max-width').split('px')[0]) + 11);
      }
      if (parseInt(element.parent().css('max-width').split('px')[0]) > parseInt(element.parent().find('.front').css('max-width').split('px')[0])) {
        element.parent().css('max-width', parseInt(element.parent().find('.front').css('max-width').split('px')[0]) + 11);
      }
    }
    else {
      // Same as above.
      element.parent().find('.front').css('max-width', parseInt(element.parent().find('.back').css('max-width').split('px')[0]) + 11);
      if (biggestImgBack < biggestImgFront) {
        element.css('max-width', parseInt(element.parent().find('.back').css('max-width').split('px')[0]) + 11);
      }

      if (parseInt(element.parent().css('max-width').split('px')[0]) > parseInt(element.parent().find('.back').css('max-width').split('px')[0])) {
        element.parent().css('max-width', parseInt(element.parent().find('.back').css('max-width').split('px')[0]) + 11);
      }
    }

    // Finally, set the float extracted at the beginning of the function.
    widget.css('float', float);
    // And make the width of the sides 100%;
    widget.find('.front').css('width', '100%');
    widget.find('.back').css('width', '100%');
    widget.css('width', '100%');
  }

  function getBiggers(widget) {
    var biggerElement = widget.find('.back').outerHeight() > widget.find('.front').outerHeight() ? widget.find('.back') : widget.find('.front');
    bigger.push(biggerElement);
  }
}(jQuery));
;
(function ($) {

Drupal.behaviors.initColorbox = {
  attach: function (context, settings) {
    if (!$.isFunction($.colorbox)) {
      return;
    }

    if (settings.colorbox.mobiledetect && window.matchMedia) {
      // Disable Colorbox for small screens.
      mq = window.matchMedia("(max-device-width: " + settings.colorbox.mobiledevicewidth + ")");
      if (mq.matches) {
        return;
      }
    }

    $('.colorbox', context)
      .once('init-colorbox')
      .colorbox(settings.colorbox);
  }
};

{
  $(document).bind('cbox_complete', function () {
    Drupal.attachBehaviors('#cboxLoadedContent');
  });
}

})(jQuery);
;
(function ($) {

Drupal.behaviors.initColorboxDefaultStyle = {
  attach: function (context, settings) {
    $(document).bind('cbox_complete', function () {
      // Only run if there is a title.
      if ($('#cboxTitle:empty', context).length == false) {
        $('#cboxLoadedContent img', context).bind('mouseover', function () {
          $('#cboxTitle', context).slideDown();
        });
        $('#cboxOverlay', context).bind('mouseover', function () {
          $('#cboxTitle', context).slideUp();
        });
      }
      else {
        $('#cboxTitle', context).hide();
      }
    });
  }
};

})(jQuery);
;
/**
 * @file
 * panels-edit-mode.js
 *
 * Enter automatically in edit mode (panels) in pages with 'edit-mode=1' parameter (Query String).
 */

(function ($) {

  var urlParams;
  (window.onpopstate = function () {
    var match,
    pl     = /\+/g,  // Regex for replacing addition symbol with a space.
    search = /([^&=]+)=?([^&]*)/g,
    decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
    query  = window.location.search.substring(1);

    urlParams = {};

    while (match = search.exec(query)) {
      urlParams[decode(match[1])] = decode(match[2]);
    }

  })();

  $(document).ready(function(){

    var editMode = urlParams["edit-mode"];

    if (editMode != 1) {
      return;
    }

    var $btnEdit = $('#panels-ipe-customize-page');

    if (typeof $btnEdit.attr("id") === 'undefined' || $btnEdit == null) {
      $btnEdit = $('#panels-ipe-customize-page-get-draft');

      if (typeof $btnEdit.attr("id") === 'undefined' || $btnEdit == null) {
        return;
      }
    }

    // Enter in edit-mode
    $btnEdit.click();

  });

  Drupal.behaviors.cfnAdvisorSite = {
    attach: function (context, settings) {
      
      if($('#edit-view-mode-info').length > 0) {
        $('#edit-view-mode-info').css('display','none');
      }

      if ($('.panels-choose-layout').length > 0 || $('body').hasClass('panels-ipe')) {

        if ($('#modalContent').length > 0) {
          // Webform.
          if ($('#webform-panels-webform-panels-edit-form').length > 0) {
            $('h4#modal-title', context).html(Drupal.t('Select a Form'));
          }
          // Slideshow.
          else if ($('#cfn-slideshow-panel-pane-custom-pane-edit-form').length > 0) {
            $('h4#modal-title', context).html(Drupal.t('Select a Slideshow'));
          }
          // Content
          else if ($('#fieldable-panels-panes-fieldable-panels-pane-content-type-edit-form').length > 0) {
            $('h4#modal-title', context).html(Drupal.t('Add Content to This Page'));
          }
          // Widget
          else if ($('#cfn-advisor-site-content-panel-pane-custom-pane-edit-form').length > 0) {
            $('h4#modal-title', context).html(Drupal.t('Select a Widget'));
          }
          // Add Content - Categories
          else if ($('div.panels-section-column-categories').length > 0) {
            $('h4#modal-title', context).html(Drupal.t('Add Content'));
          }
          // Page Layout
          else {
            $('h4#modal-title', context).html(Drupal.t('Select a Page Layout'));
          }
        }
      }

      $('button.add-text-cancel-button', context).click(function() {
        if (typeof CKEDITOR != 'undefined') {
          for (var ck in CKEDITOR.instances) {
            CKEDITOR.instances[ck].destroy(true);
          }
          $('form#fieldable-panels-panes-fieldable-panels-pane-content-type-edit-form fieldset').hide();
        }
      });

    }
  };

}(jQuery));
;
/**
 * @file
 * site-design-menu.js
 *
 * Set the click event for 'Site Design' menu so it toggle Sweaver tabs.
 */

(function ($) {
  $(document).ready(function(){
    $('a.site-design').click(function(){
      // Test if the sweaver have unsaved changes.
      if ( $( '#panels-ipe-save' ).length || $('#modalContent').length ) {
        alert(Drupal.t('There are unsaved layout changes. You must save them before you leave this page.'));
      }else{
        if($('#sweaver').length > 0){
          Drupal.Sweaver.toggleBar($('#sweaver'));
        }
      }
      return false;
    });
  });

}(jQuery));
;
(function($) {
  $(document).ready(function () {
    preventMenuDragging();
  });

  function preventMenuDragging() {
    $('body').on('mouseleave', '#menu-overview-form .tabledrag-handle', function () {
      // Gets the indentation divs for the current tabledrag.
      var $indent = $(this).closest('td').find('.indentation');
      var $element = $(this);
      var rightPrev = null;
      var rightPrevOutside = null;
      if ($indent.length > 1) {
        // Removes all the indentations but one.
        for (var i = 0; i < $indent.length - 1; i++)
          $indent.closest('td').get(0).removeChild($indent.get(i));

        // Cycles through all draggables and find the one wich has only one
        // indentation.
        $('.menu-enabled.draggable').each(function() {
          if ($(this).find('.indentation').length == 1) {
            rightPrev = $(this);
            return false;
          }
        });
        // Then set the current tabledrag plid to match the draggable found.
        setTimeout(function() {
          // We must use setTimeout for the script the execute after the
          // Drupal's tabledrag script.
          $element.closest('.draggable').find('.menu-plid').val(rightPrev.find('.menu-plid').val());
        }, 500);
      }
      // See if there is any element with more than 1 indentation.
      // If there is any then we
      // Trigger the mouseleave to adjust the indentation in case the
      // current item is dragging more items with it.
      // I.e.: The menu you're currently dragging is father of another menu
      // item.
      $('.menu-enabled.draggable').each(function() {
        if ($(this).find('.indentation').length > 1) {
          rightPrevOutside = $(this);
          return false;
        }
      });
      if (rightPrevOutside != null) {
        setTimeout(function() {
          $('.tabledrag-handle').trigger('mouseleave');
        }, 25);
      }
    });
  }
})(jQuery);
;
/**
 * @file
 * recaptcha-scale.js
 *
 * Adjust reCaptcha scale to make it responsive.
 */

(function ($) {
  $(document).ready(function () {

    var $gRecaptcha = $('.g-recaptcha');
    var parentWidht = $gRecaptcha.parent().width();
    var gRecaptchaWidht = 304;

    if (parentWidht < gRecaptchaWidht) {
      var scale = parentWidht / gRecaptchaWidht;
      $gRecaptcha.css('transform', 'scale(' + scale + ')');
      $gRecaptcha.css('-webkit-transform', 'scale(' + scale + ')');
      $gRecaptcha.css('transform-origin', '0 0');
      $gRecaptcha.css('-webkit-transform-origin', '0 0');
    }

    // Fix for 'Blocks (for homepage)' page layout.
    var $captchaFieldset = $('.col-sm-6 .pane-webform-panels fieldset:has(.g-recaptcha)', '.blocks-home-page');

    // Get the captcha content div padding.
    var captchaContentPadding = $captchaFieldset.parents('.content').css('padding-left');

    // Set content padding as a negative margin to accomodate a larger captcha fieldset.
    // Since recaptcha is not responsive, we need a bigger fieldset for this particular column.
    $captchaFieldset.css('margin-left', '-' + captchaContentPadding);
  });
}(jQuery));
;
/**
 * @file
 * Linkit ckeditor dialog helper.
 */
(function ($) {

// Abort if Drupal.linkit is not defined.
if (typeof Drupal.linkit === 'undefined') {
  return ;
}

Drupal.linkit.registerDialogHelper('ckeditor', {
  init : function() {},

  /**
   * Prepare the dialog after init.
   */
  afterInit : function () {
     var editor = Drupal.settings.linkit.currentInstance.editor;
     var element = CKEDITOR.plugins.link.getSelectedLink( editor );

    // If we have selected a link element, lets populate the fields in the
    // modal with the values from that link element.
    if (element) {
      link = {
        path: element.data('cke-saved-href') || element.getAttribute('href') || '',
        attributes: {}
      },
      // Get all attributes that have fields in the modal.
      additionalAttributes = Drupal.linkit.additionalAttributes();

      for (var i = 0; i < additionalAttributes.length; i++) {
        link.attributes[additionalAttributes[i]] = element.getAttribute(additionalAttributes[i]);
      }

      // Populate the fields.
      Drupal.linkit.populateFields(link);
    }
  },

  /**
   * Insert the link into the editor.
   *
   * @param {Object} link
   *   The link object.
   */
  insertLink : function(link) {
    var editor = Drupal.settings.linkit.currentInstance.editor;
    CKEDITOR.tools.callFunction(editor._.linkitFnNum, link, editor);
  }
});

})(jQuery);;
/**
 * @file
 * Fix issues on Bootstrap Carousel plugin.
 */

var obj_slide_rotation = new Array();

(function ($) {
  Drupal.behaviors.cfnSlideshowInit = {
    attach: function (context, settings) {
      $('.carousel').once(function () {
        // The current carousel.
        var $carousel = $(this);
        // Get the current window inner width value.
        var windowInnerWidth = window.innerWidth;

        slideshowInit();
        fixNavigationArrowsClickCfnOnPage();
        carouselSlideRotationsLimit();
        slideshowFullscreenAdjustWidth(windowInnerWidth);
        slideshowFullscreenAdjustTopMargin();
        slideshowFullscreenAdjustTopMarginCustomPages();
        slideshowResponsiveBehavior(windowInnerWidth);

        // Handle the transition between slides, but we also need to call this
        // when the carousel loads.
        handleCarouselSlideTransition(undefined, $carousel);
      });
    }
  };

  // Init Slideshow.
  function slideshowInit() {
    $('.carousel').carousel();
  }

  // Control limit of slideshow rotations.
  function carouselSlideRotationsLimit() {

    $('.carousel').on('slid.bs.carousel', function () {
      var slide_id = $(this).attr('id');
      var rotation_limit = $(this).data('rotation-limit');

      if (rotation_limit == 0 || rotation_limit == '') {
        return;
      }

      if (typeof obj_slide_rotation[slide_id] === 'undefined') {

        var item_count = $(this).find('.item').length;

        obj_slide_rotation[slide_id] = {
          'rotation_count' : 0,
          'rotation_image_count' : 1,
          'rotation_limit' : rotation_limit,
          'item_count': item_count
        };
      }
      else {
        obj_slide_rotation[slide_id].rotation_image_count = obj_slide_rotation[slide_id].rotation_image_count + 1;

        if (obj_slide_rotation[slide_id].rotation_image_count == obj_slide_rotation[slide_id].item_count) {
          obj_slide_rotation[slide_id].rotation_count = obj_slide_rotation[slide_id].rotation_count + 1;
          obj_slide_rotation[slide_id].rotation_image_count = 0;
        }
      }

      // Stop slideshow if image is the last of limit rotations.
      if ((obj_slide_rotation[slide_id].rotation_limit - 1) == obj_slide_rotation[slide_id].rotation_count &&
          (obj_slide_rotation[slide_id].item_count - 1) == obj_slide_rotation[slide_id].rotation_image_count) {
        $(this).carousel('pause');
        obj_slide_rotation[slide_id].rotation_count = 0;
        obj_slide_rotation[slide_id].rotation_image_count = 0;
      }
    });
  }

  /**
   * The navigation arrows don't work when authenticated as employee.
   *
   * This function fix this issue.
   *
   * This issue is related to: https://www.drupal.org/node/2162165
   */
  function fixNavigationArrowsClickCfnOnPage() {
      $('.carousel-control.right').click(function (e) {
          e.preventDefault();
          e.stopPropagation();
          $(e.target).closest('.carousel').carousel('next');
      });
      $('.carousel-control.left').click(function (e) {
          e.preventDefault();
          e.stopPropagation();
          $(e.target).closest('.carousel').carousel('prev');
      });
  }

 /**
  * This fix (+ fixNavigationArrowsClickCfnOnPage) allow more than one slideshow
  * on same page.
  */
  function fixNavigationBulletsClickCfnOnPage() {
    $('.carousel-indicators li').click(function (e) {
      e.preventDefault();
      e.stopPropagation();

      var $bullet = $(e.target);
      var destination_slide = parseInt($bullet.attr('data-slide-to'));

      if (destination_slide == null) {
          destination_slide = 0;
      }

      $bullet.closest('.carousel').carousel(destination_slide);
    });
  }

  /**
   * Adjust fullscreen slideshow shape for pages.
   *
   * @param int windowInnerWidth
   *    Window inner width value.
   */
  function slideshowFullscreenAdjustWidth(windowInnerWidth) {
    var $slide = $('.cfn-slideshow.carousel.carousel-shape-fullscreen', '.ipe-wide-box');

    if ($slide.length == 0) {
      return;
    }

    var fullscreenOffset = 0;

    // Removing theme 2 menu from offset and width.
    var menuWidth = $('#sidebar-wrapper').innerWidth();
    if ($.isNumeric(menuWidth)) {
      fullscreenOffset = menuWidth;
      windowInnerWidth = windowInnerWidth - menuWidth;
    }

    // Display slideshow that was hidden by css until this functions is called.
    $('.carousel-shape-fullscreen', '.node-cfn-slideshow').show();

    // Set new offset for fullscreen slideshow.
    $slide.offset({ left: fullscreenOffset });
    // Remove max widht used for smaller blocks.
    $slide.css({ 'max-width' : '' });
    // Set new fullscreen width.
    $slide.innerWidth(windowInnerWidth);
  }

  /**
   * Remove top paddings when fullscreen slideshow is the first block.
   *
   * And the page have no title.
   */
  function slideshowFullscreenAdjustTopMargin() {

    // Check if the page have title.
    var $pageTitle = $('#page-title');
    var pageTitleExists = $pageTitle.length;
    var isPageTitleVisible = $pageTitle.is(":visible");

    if ($('span', $pageTitle).length > 0) {
      isPageTitleVisible = $('span', $pageTitle).is(":visible");
    }

    if (!pageTitleExists || !isPageTitleVisible) {

      // Get the first block of content.
      var $panelFirstBlock = $('.panel-display > div > div').eq(0);

      // If it is a fullscreen slideshow, remove top paddings.
      // So there is no space between menu and slideshow.
      if ($panelFirstBlock.hasClass('ipe-wide-box')) {

        // Get the first content in this block region.
        var $panelFirstContent = $('.pane-content', $panelFirstBlock).eq(0);
        var $slide = $('.cfn-slideshow.carousel.carousel-shape-fullscreen', $panelFirstContent);

        // Check if the first content in this block region is a slideshow.
        if ($slide.length === 0) {
          return;
        }

        // Theme 1 and 4.
        $('div.main-container').css({'padding-top' : '0px'});

        // Theme 2.
        $('.region.region-content').css({'padding-top' : '0px'});

        // Theme 3.
        $('#page-title-container').hide();

        // All themes.
        $('.l-edge', $panelFirstBlock).css({'padding-top' : '0px'});
        $('.r-edge', $panelFirstBlock).css({'padding' : '0px 0px'});
      }
    }
  }

  /**
   * Remove top paddings when fullscreen slideshow is Articles Archive page.
   *
   * And the page have no title.
   */
  function slideshowFullscreenAdjustTopMarginCustomPages() {

    // Check if it is an Articles Archive or team page.
    if (($('body.page-articles-archive').length === 0) &&
      ($('#team-page-layout').length === 0)) {
      return;
    }

    // Check if the page have title.
    var $pageTitle = $('#page-title');
    var pageTitleExists = $pageTitle.length;
    var isPageTitleVisible = $pageTitle.is(":visible");

    if ($('span', $pageTitle).length > 0) {
      isPageTitleVisible = $('span', $pageTitle).is(":visible");
    }

    if (!pageTitleExists || !isPageTitleVisible) {

      // Check if slideshow is enabled in the page and remove top margins.
      // So there is no space between menu and slideshow.
      if ($('.carousel-shape-fullscreen').length > 0) {

        // Theme 1, 2 and 4.
        $('.node-cfn-slideshow').css({'padding-top' : '0px'});
        $('div.main-container').css({'padding-top' : '0px'});

        // Theme 3.
        // Requires an extra validation as the title may be replaced by the
        // breadcrumb bar.
        var $pageTitleContainer = $('#page-title-container');
        var $breadcrumb = $('.breadcrumb', $pageTitleContainer);
        // If the title is hidden on the page properties, the breadcrumb won't
        // be rendered on the page.
        if ($breadcrumb.length == 0) {
          // Hide the entire page title container.
          $pageTitleContainer.hide();
        }
      }
    }
  }

  // Store the current breakpoint to be used by slideshowResponsiveBehavior().
  var currentBreakpoint,
      isCurrentBreakpointDesktop;

  /**
   * Check the current breakpoint and update the slides behaviors.
   *
   * @param int windowInnerWidth
   *    Window inner width value.
   */
  function slideshowResponsiveBehavior(windowInnerWidth) {
    // List of all slides on the page.
    var $slides = $('.carousel-shape-wrapper');
    // List of breakpoints.
    var breakpointMobile = 'mobile';
    var breakpointDesktop = 'desktop';

    // Defaults to Desktop.
    currentBreakpoint = breakpointDesktop;
    // In case of Phone and Tablet.
    if (windowInnerWidth < 992) {
      currentBreakpoint = breakpointMobile;
    }

    // Check if the current breakpoint is Desktop.
    isCurrentBreakpointDesktop = (currentBreakpoint == breakpointDesktop);

    // Update all slides on this page.
    $slides.each(function () {
      // Current slide object.
      var $this = $(this);
      // Inner "image wrapper" DOM element.
      var $wrapper = $('.slideshow-image-wrapper', $this);
      // Minimum height that will be used for mobile breakpoints.
      var minHeight = 200;
      // Default dimensions for shapes "Homepage Hero" and "Landscape".
      var shapeWidth = 1200;
      var shapeHeight = 400;
      // Current slide width.
      var slideWidth = $this.innerWidth();
      // Used to parse integer values with the correct number system.
      var decimal = 10;
      // The event we will listen from the carousel.
      var carouselEventName = 'slide.bs.carousel';

      // Remove previows events added here to prevent multiple calls.
      $this.off(carouselEventName);
      // Attach an event listener to run when the slide changes.
      $this.on(carouselEventName, function (event) {
        // Pass the event and the current slideshow as parameter.
        handleCarouselSlideTransition(event, $this);
      });

      // If the height is not stored on the data attribute:
      if ($this.data('height') === undefined) {
        // Store the height on the data attribute for later use.
        $this.data('height', $this.css('height'));

        // If the width is not stored on the data attribute:
        if ($this.data('width') === undefined) {
          // Store the width on the data attribute for later use.
          $this.data('width', $this.css('width'));
        }
      }

      // If this shape is fullscreen, we just need the user defined height.
      if ($this.hasClass('carousel-shape-fullscreen')) {
        // Get the height value from the data attribute.
        minHeight = $this.data('height');
      }
      // For all other shapes, we need to calculate the proportional height.
      else {
        // Get the dimensions based on the shape.
        if ($this.hasClass('carousel-shape-portrait')) {
          shapeWidth = 370;
          shapeHeight = 450;
        }
        else if ($this.hasClass('carousel-shape-square')) {
          shapeWidth = 750;
          shapeHeight = 750;
        }
        else if ($this.hasClass('carousel-shape-custom')) {
          shapeWidth = parseInt($this.css('max-width'), decimal);
          shapeHeight = parseInt($this.css('max-height'), decimal);
        }

        // Calculate current min-height based on shape dimensions.
        minHeight = ((slideWidth / shapeWidth) * shapeHeight) + 'px';
      }

      // If we are on desktop size, remove the behavior class.
      if (isCurrentBreakpointDesktop) {
        // Remove the mobile override class.
        $this.removeClass('force-mobile');
        // Recover the height value from the data attribute.
        $this.css('height', minHeight);
        // Also recover to the image wrapper.
        $wrapper.css('height', minHeight);
      }
      // If we are on mobile size, add the behavior class.
      else {
        // Add the mobile override class.
        $this.addClass('force-mobile');
        // Remove the height style attribute.
        $this.css('height', '');
        // Also remove from the image wrapper.
        $wrapper.css('height', '');
      }

      // Apply the min-height for the slide and the image wrapper class.
      $this.css('min-height', minHeight);
      $wrapper.css('min-height', minHeight);
    });
  }

  function handleCarouselSlideTransition(event, $carousel) {
    // Get the slide being displayed or all visible slides inside a carousel.
    var $visibleSlide = $('.slideshow-image-wrapper.item:visible', $carousel);

    // If we have an event being dispatched:
    if ((event !== undefined) && (event.relatedTarget !== undefined)) {
      // We need to use the targeted slide instead of the generic visible.
      $visibleSlide = $(event.relatedTarget);
    }

    // List of all text boxes on the current slide.
    var $textboxes = $('.slideshow-text-box', $visibleSlide);

    // Update all text boxes on the page to avoid overflow content to disappear.
    $textboxes.each(function () {
      // Reference to the current textbox being checked and updated.
      var $textbox = $(this);

      // Execute this code after 1/10 of second so the browser will have
      // calculated the dimensions values.
      setTimeout(function () {
        // Call the function to update this textbox.
        adjustTextBoxesToVisibleArea($textbox, $visibleSlide, isCurrentBreakpointDesktop);
      }, 100);
    });
  }

  function hasInlineStyle($element, styleName, strict) {
    // Get the current inline styles.
    var inlineStyle = $element.attr('style');
    // Generate the regular expression.
    var regex = new RegExp(styleName, 'g');

    // Adds validation to regex for strict property name.
    if (strict === true) {
      var regex = new RegExp('([ ;:]' + styleName + ')|(^' + styleName + ')', 'g');
    }

    // Look for the style name at the inline styles.
    var result = inlineStyle.match(regex);
    // If we did not find any results:
    if (result === null) {
      // Return the failure.
      return false;
    }
    // Flag that we found something.
    return true;
  }

  /**
   * Check if custom button have a fixed width.
   *
   * @param Object $customButton
   *
   * @returns bool
   */
  function hasCustomButtonFixedWidth($customButton) {
    var inlineStyle = $customButton.attr('style');
    // Generate the regular expression.
    var regex = new RegExp('width: 100%', 'g');

    var result = inlineStyle.match(regex);

    if (result === null) {
      // Return the failure.
      return false;
    }

    return true;
  }

  /**
   * Check if a custom button exists in a textbox.
   *
   * @param object $textbox
   *
   * @returns boolean
   */
  function hasCustomButtons($textbox) {
    return $('.cfn-button-main-wrapper', $textbox).length;
  }

  function adjustTextBoxesToVisibleArea($textbox, $visibleSlide, isDesktop) {
    // Find anything that is not a number or a dot (float support).
    var regexNotNumber = new RegExp('[^0-9.]', 'g');
    // Check if the percentage character is present.
    var regexIsPercent = new RegExp('%', 'g');
    // Get the reference to the text-box-wrapper element.
    var $textBoxWrapper = $('.slideshow-text-box-wrapper', $visibleSlide);
    // Get the maximum width for the text box wrapper as it may be smaller than
    // the slideshow itself. This value always exists.
    var boxWrapperWidth = $textBoxWrapper[0].style.maxWidth;
    // Get the original slide width so we may apply the font-size variation.
    var slideWidth = String($visibleSlide.data('slide-width')).replace(regexNotNumber, '');
    // Get the current slide witdh to compare.
    var currentWidth = $visibleSlide.width();
    // Define the element size range to apply a multiplier on values.
    var elementSizeMin = 0.75;
    var elementSizeMax = 1;
    // Initialize with the maximum value from the range to the multiplier.
    var elementSizeModifier = elementSizeMax;
    // Select all first level childs from the text box.
    var $firstLevelChilds = $('> *', $textbox);
    // Get the border width, if available.
    var borderWidth = String($textbox.css('border-width')).replace(regexNotNumber, '') || 0;
    // Get the padding width.
    var padding = String($textbox.css('padding')).replace(regexNotNumber, '') || 0;
    // Check if we have a defined width inline.
    var hasWidth = hasInlineStyle($textbox, 'width', true);
    // Check if we have a defined height inline.
    var hasHeight = hasInlineStyle($textbox, 'height', false);
    // Raw percentage value used by conversion math.
    var percentage;

    // Check for custom buttons.
    if (hasCustomButtons($textbox)) {

      $customButtonWrapper = $('.cfn-button-main-wrapper', $textbox);
      $customButton = $('a', $customButtonWrapper);

      // Check if custom buttons have responsive behavior marked.
      var isCustomButtonResponsive = hasInlineStyle($customButton, 'width: 100%');

      if (isCustomButtonResponsive) {
        var customButtonWidth = $customButton.css('max-width').replace(regexNotNumber, '');
        // If textbox is smaller, increase width.
        if ($textbox.width() < customButtonWidth) {
          $textbox.css('width', customButtonWidth);
        }
      }
    }

    // Check the text box wrapper width value. If its percentage:
    if (boxWrapperWidth === '100%') {
      // Get the slide width and use it instead.
      boxWrapperWidth = slideWidth;
    }
    else {
      // Otherwise, convert to number.
      boxWrapperWidth = +(boxWrapperWidth.replace(regexNotNumber, ''));
    }

    // Calculate the element size multiplier to adapt to the current width.
    elementSizeModifier = (currentWidth / Math.min(slideWidth, boxWrapperWidth)).toFixed(3);

    // Double the values to match both sides width.
    borderWidth *= 2;
    padding *= 2;

    // Set a minimum value for size multiplier.
    elementSizeModifier = Math.max(elementSizeMin, elementSizeModifier);
    // Set a maximum value for size multiplier.
    elementSizeModifier = Math.min(elementSizeMax, elementSizeModifier);

    /*
     * Check original values and store them using the format we need.
     */

    // If we do not have the original TOP value stored:
    if ($textbox.data('top') === undefined) {
      // Store the initial value for this property.
      $textbox.data('top', $textbox.css('top'));
    }

    // If we do not have the original LEFT value stored:
    if ($textbox.data('left') === undefined) {
      // Store the initial value for this property.
      $textbox.data('left', $textbox.css('left'));
    }

    // If we do not have the original width value stored:
    if (($textbox.data('width') === undefined) && (hasWidth)) {
      // Store the initial value for this property.
      $textbox.data('width', $textbox.width());
    }

    // If we do not have the original height value stored:
    if (($textbox.data('height') === undefined) && (hasHeight)) {
      // Store the initial value for this property.
      $textbox.data('height', $textbox.height());
    }

    /*
     * Store original values.
     */

    // If we do not have the original TOP value stored:
    if ($textbox.data('top-original') === undefined) {
      // Store the initial value for this property.
      $textbox.data('top-original', ($textbox[0].style.top));
    }

    // If we do not have the original LEFT value stored:
    if ($textbox.data('left-original') === undefined) {
      // Store the initial value for this property.
      $textbox.data('left-original', ($textbox[0].style.left));
    }

    // If we do not have the original width value stored:
    if (($visibleSlide.data('width') === undefined)) {
      // Store the initial value for this property.
      $visibleSlide.data('width', currentWidth);
    }

    // If we do not have the original height value stored:
    if (($visibleSlide.data('height') === undefined)) {
      // Store the initial value for this property.
      $visibleSlide.data('height', $visibleSlide.height());
    }

    /*
     * Convert percentage values into actual pixel metrics.
     */

    // If we have a top percentage value:
    if (String($textbox.data('top')).match(regexIsPercent) !== null) {
      // The raw percentage value.
      percentage = +(String($textbox.data('top')).replace(regexNotNumber, '') / 100);
      // We need to convert this value in pixels to apply the moving calcs.
      $textbox.data('top', +($textbox.css('top') * percentage).toFixed(2));
    }

    // If we have a left percentage value:
    if (String($textbox.data('left')).match(regexIsPercent) !== null) {
      // The raw percentage value.
      percentage = +(String($textbox.data('left')).replace(regexNotNumber, '') / 100);
      // We need to convert this value in pixels to apply the moving calcs.
      $textbox.data('left', +($textbox.css('left') * percentage).toFixed(2));
    }

    /*
     * Remove any non-numeric values from stored originals.
     */

    if (String($textbox.data('top')).match(regexNotNumber) !== null) {
      $textbox.data('top', (String($textbox.data('top')).replace(regexNotNumber, '')));
    }

    if (String($textbox.data('left')).match(regexNotNumber) !== null) {
      $textbox.data('left', String($textbox.data('left')).replace(regexNotNumber, ''));
    }

    /*
     * Reset original values for mobile devices and extra small screens.
     */

    // Restore the original values. This is required on resizing to bigger
    // screens and breakpoint adjustments.
    $textbox.css({
      'top': $textbox.data('top-original'),
      'left': $textbox.data('left-original')
    });

    // If we are not working with a desktop:
    if (isDesktop === false) {
      // If there is a width to restore:
      if (hasWidth) {
        $textbox.css('width', $textbox.data('width'));
      }

      // If there is a height to restore:
      if (hasHeight) {
        $textbox.css('height', $textbox.data('height'));
      }

      // Restore all childs font-size value to the originally intended.
      $firstLevelChilds.each(function () {
        var $child = $(this);

        // Avoid inheriting in titles, so wont make font size smaller.
        if (!isElementTitle($child)) {
          $child.css('font-size', 'inherit');
        }
      });

      // End this adjustment execution.
      return false;
    }

    /*
     * We need to calculate the font-size as this changes the required
     * box space.
     */

    // Update all childs font-size value to the proportional value.
    $firstLevelChilds.each(function () {
      var $child = $(this);
      // As default, we do not need to scale up font-sizes, so we reset it.
      var propertyValue = 'inherit';

      // If we need to scale down the font-size:
      if (elementSizeModifier < 1) {
        // Set the specific multiplier value.
        propertyValue = elementSizeModifier + 'em';
      }

      // Avoid inheriting in titles, so wont make font size smaller.
      if (!isElementTitle($child)) {
        // Apply the defined property value to the font-size.
        $child.css('font-size', propertyValue);
      }
    });

    /*
     * If we have a size modifier applyied on fonts, we need to change the
     * current width and height of the box.
     */

    // If there is a size multiplier value:
    if (elementSizeModifier < 1) {

      // If the box has a defined width:
      if (hasWidth) {
        // Adjust the width of the current box.
        $textbox.css('width', Math.ceil(($textbox.data('width') * elementSizeModifier) + padding));
      }

      // If the box has a defined height:
      if (hasHeight) {
        // Adjust the height of the current box.
        $textbox.css('height', Math.ceil(($textbox.data('height') * elementSizeModifier) + padding));
      }
    }

    /*
     * Box movement to avoid going outside the slide area.
     */

    // Flags to check if we really need to move the box around.
    var moveUp = false;
    var moveLeft = false;

    // Get the current text box position.
    var top = +(String($textbox.position().top).replace(regexNotNumber, ''));
    var left = +(String($textbox.position().left).replace(regexNotNumber, ''));

    // Copy the original box position values to use with Math.
    var origintalTop = +(String($textbox.data('top-original')).replace(regexNotNumber, '') / 100).toFixed(4);
    var origintalLeft = +(String($textbox.data('left-original')).replace(regexNotNumber, '') / 100).toFixed(4);

    // Check if the box is flowing down:
    if ((top + $textbox.height() + borderWidth + padding) > $visibleSlide.height()) {
      // Flag to move the box up.
      moveUp = true;
      // Calculate the new position for the box height.
      top = Math.max(0, $visibleSlide.height() - $textbox.height() - borderWidth - padding);
      // Convert this pixel position to percentage.
      top = +((origintalTop * top) / +(String($textbox.position().top).replace(regexNotNumber, '')));
      // Format the value.
      top = String((top * 100).toFixed(2)) + '%';
    }

    // Check if the box is flowing to the right.
    if ((left + $textbox.width() + borderWidth + padding) > currentWidth) {
      // Flag to move the box up.
      moveLeft = true;
      // Move the box to the right until it stop flowing.
      left = Math.max(0, currentWidth - $textbox.width() - borderWidth - padding);
      // Convert this pixel position to percentage.
      left = +((origintalLeft * left) / +(String($textbox.position().left).replace(regexNotNumber, '')));
      // Format the value.
      left = String((left * 100).toFixed(2)) + '%';
    }

    // If we need to move the box up:
    if (moveUp) {
      $textbox.css('top', top);
    }

    // If we need to move the box left:
    if (moveLeft) {
      $textbox.css('left', left);
    }
  }

  /**
   * Handle the onResize event.
   */
  $(window).resize(function () {
    // Get the current window inner width value.
    var windowInnerWidth = window.innerWidth;
    // List of all slides on the page.
    var $carousel = $('.carousel-shape-wrapper');

    // Adjust the fullscreen slideshow whenever the window is resized or
    // reoriented on devices.
    slideshowFullscreenAdjustWidth(windowInnerWidth);
    slideshowFullscreenAdjustTopMargin();

    slideshowResponsiveBehavior(windowInnerWidth);

    // Update all slides on this page.
    $carousel.each(function () {
      // Current slide object.
      var $slide = $(this);
      // Handle the transition between slides, but we also need to call this
      // when the carousel loads.
      handleCarouselSlideTransition(undefined, $slide);
    });
  });

}(jQuery));

/**
 * Follow a link triggered by onclick events programatically.
 *
 * @param string url
 *    The URL used as value for the href attribute.
 * @param string target
 *    Empty or new, in case it should open on another window.
 */
function followSlideLinkTo(url, target, event, object) {

  // Firefox and Chrome.
  var $element = jQuery(event.target);
  // Retrieve object being clicked on.
  if (window.event) {
    // IE.
    $element = jQuery(window.event.srcElement);
  }

  // Check if the target element is the slide or a link inside of slide.
  var hasSlideClass = (($element.hasClass('slideshow-text-box-wrapper')) ||
    ($element.hasClass('slideshow-image-wrapper')));

  // Check if the current target is or has a parent <a> until it reaches the
  // slideshow container.
  var $elementParents = $element.parentsUntil('.cfn-slideshow', 'a');
  var hasParentLink = (($elementParents.length > 0) || ($element.is('a')));

  var isSlideLink = (hasSlideClass || !hasParentLink);

  if (!isSlideLink) {
    // Prevent this function from running because is a link inside of a slide.
    return;
  }

  // A string that specifies the type of element to be created. The nodeName
  // property.
  var qualifiedName = 'a';
  // Creates an element with the specified qualified name.
  var link = document.createElement(qualifiedName);

  // Set the link destination.
  link.setAttribute('href', url);

  // If this link is meant to open a new window/tab.
  if (target == 'new') {
    // Set the "blank window" attribute.
    link.setAttribute('target', '_blank');
  }

  document.body.appendChild(link);

  // Clone the event dispatched by the user action so we can dispatch it again.
  // This is true only for IE,firefox.
  if (document.createEvent) {
    // To create a mouse event , first we need to create an event and then initialize it.
    // Refence for polyfill: https://msdn.microsoft.com/library/dn905219(v=vs.85).aspx
    var event = document.createEvent("MouseEvent");
    event.initMouseEvent("click",true,true,window,0,0,0,0,0,false,false,false,false,0,null);
  }
  else {
  var event = new MouseEvent('click', {
      'view': window,
      'bubbles': true,
      'cancelable': true
    });
  }

  // Dispatch the event on the element, triggering the link action.
  link.dispatchEvent(event);
}

/**
 * Check if an element is a title.
 *
 * @param {object} $element
 *
 * @returns {Boolean}
 */
function isElementTitle($element) {
  var nodeName = $element.prop('nodeName');
  var allTitlesName = [ 'H1', 'H2', 'H3', 'H4', 'H5', 'H6' ];

  if (allTitlesName.indexOf(nodeName) !== -1) {
    return true;
  }

  return false;
}
;
/**
 * @file
 */

(function ($, Drupal) {
  Drupal.behaviors.staticContentAsyncLoad = {
    attach: function (context, settings) {
      for (var uuid in settings.staticContent) {
        staticContentAsyncLoadHandler(settings, uuid, context);
      }
    }
  };

  function staticContentAsyncLoadHandler(settings, uuid, context) {
    $.ajax(settings.staticContent[uuid].path)
      .done(function (data) {
        var $target = $('.async-content-wrapper[data-source="' + uuid + '"]', context);

        // Returns if We don't find the async wrapper.
        if (!$target.length) {
          return;
        }

        // Replace selector with response data.
        $target.replaceWith(data);
        Drupal.attachBehaviors($target);
      });
  }
}) (jQuery, Drupal);
;
