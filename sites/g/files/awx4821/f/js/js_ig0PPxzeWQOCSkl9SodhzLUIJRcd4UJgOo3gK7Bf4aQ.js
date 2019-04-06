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
(function ($) {

/**
 * Attaches sticky table headers.
 */
Drupal.behaviors.tableHeader = {
  attach: function (context, settings) {
    if (!$.support.positionFixed) {
      return;
    }

    $('table.sticky-enabled', context).once('tableheader', function () {
      $(this).data("drupal-tableheader", new Drupal.tableHeader(this));
    });
  }
};

/**
 * Constructor for the tableHeader object. Provides sticky table headers.
 *
 * @param table
 *   DOM object for the table to add a sticky header to.
 */
Drupal.tableHeader = function (table) {
  var self = this;

  this.originalTable = $(table);
  this.originalHeader = $(table).children('thead');
  this.originalHeaderCells = this.originalHeader.find('> tr > th');
  this.displayWeight = null;

  // React to columns change to avoid making checks in the scroll callback.
  this.originalTable.bind('columnschange', function (e, display) {
    // This will force header size to be calculated on scroll.
    self.widthCalculated = (self.displayWeight !== null && self.displayWeight === display);
    self.displayWeight = display;
  });

  // Clone the table header so it inherits original jQuery properties. Hide
  // the table to avoid a flash of the header clone upon page load.
  this.stickyTable = $('<table class="sticky-header"/>')
    .insertBefore(this.originalTable)
    .css({ position: 'fixed', top: '0px' });
  this.stickyHeader = this.originalHeader.clone(true)
    .hide()
    .appendTo(this.stickyTable);
  this.stickyHeaderCells = this.stickyHeader.find('> tr > th');

  this.originalTable.addClass('sticky-table');
  $(window)
    .bind('scroll.drupal-tableheader', $.proxy(this, 'eventhandlerRecalculateStickyHeader'))
    .bind('resize.drupal-tableheader', { calculateWidth: true }, $.proxy(this, 'eventhandlerRecalculateStickyHeader'))
    // Make sure the anchor being scrolled into view is not hidden beneath the
    // sticky table header. Adjust the scrollTop if it does.
    .bind('drupalDisplaceAnchor.drupal-tableheader', function () {
      window.scrollBy(0, -self.stickyTable.outerHeight());
    })
    // Make sure the element being focused is not hidden beneath the sticky
    // table header. Adjust the scrollTop if it does.
    .bind('drupalDisplaceFocus.drupal-tableheader', function (event) {
      if (self.stickyVisible && event.clientY < (self.stickyOffsetTop + self.stickyTable.outerHeight()) && event.$target.closest('sticky-header').length === 0) {
        window.scrollBy(0, -self.stickyTable.outerHeight());
      }
    })
    .triggerHandler('resize.drupal-tableheader');

  // We hid the header to avoid it showing up erroneously on page load;
  // we need to unhide it now so that it will show up when expected.
  this.stickyHeader.show();
};

/**
 * Event handler: recalculates position of the sticky table header.
 *
 * @param event
 *   Event being triggered.
 */
Drupal.tableHeader.prototype.eventhandlerRecalculateStickyHeader = function (event) {
  var self = this;
  var calculateWidth = event.data && event.data.calculateWidth;

  // Reset top position of sticky table headers to the current top offset.
  this.stickyOffsetTop = Drupal.settings.tableHeaderOffset ? eval(Drupal.settings.tableHeaderOffset + '()') : 0;
  this.stickyTable.css('top', this.stickyOffsetTop + 'px');

  // Save positioning data.
  var viewHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  if (calculateWidth || this.viewHeight !== viewHeight) {
    this.viewHeight = viewHeight;
    this.vPosition = this.originalTable.offset().top - 4 - this.stickyOffsetTop;
    this.hPosition = this.originalTable.offset().left;
    this.vLength = this.originalTable[0].clientHeight - 100;
    calculateWidth = true;
  }

  // Track horizontal positioning relative to the viewport and set visibility.
  var hScroll = document.documentElement.scrollLeft || document.body.scrollLeft;
  var vOffset = (document.documentElement.scrollTop || document.body.scrollTop) - this.vPosition;
  this.stickyVisible = vOffset > 0 && vOffset < this.vLength;
  this.stickyTable.css({ left: (-hScroll + this.hPosition) + 'px', visibility: this.stickyVisible ? 'visible' : 'hidden' });

  // Only perform expensive calculations if the sticky header is actually
  // visible or when forced.
  if (this.stickyVisible && (calculateWidth || !this.widthCalculated)) {
    this.widthCalculated = true;
    var $that = null;
    var $stickyCell = null;
    var display = null;
    var cellWidth = null;
    // Resize header and its cell widths.
    // Only apply width to visible table cells. This prevents the header from
    // displaying incorrectly when the sticky header is no longer visible.
    for (var i = 0, il = this.originalHeaderCells.length; i < il; i += 1) {
      $that = $(this.originalHeaderCells[i]);
      $stickyCell = this.stickyHeaderCells.eq($that.index());
      display = $that.css('display');
      if (display !== 'none') {
        cellWidth = $that.css('width');
        // Exception for IE7.
        if (cellWidth === 'auto') {
          cellWidth = $that[0].clientWidth + 'px';
        }
        $stickyCell.css({'width': cellWidth, 'display': display});
      }
      else {
        $stickyCell.css('display', 'none');
      }
    }
    this.stickyTable.css('width', this.originalTable.outerWidth());
  }
};

})(jQuery);
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
