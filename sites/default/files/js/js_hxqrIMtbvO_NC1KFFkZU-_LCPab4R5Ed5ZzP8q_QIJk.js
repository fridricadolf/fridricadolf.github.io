/**
 * @file
 * A JavaScript file for the theme.
 *
 * In order for this JavaScript to be loaded on pages, see the instructions in
 * the README.txt next to this file.
 */


(function ($, Drupal, window, document) {

  'use strict';


  Drupal.behaviors.my_custom_behavior = {
    attach: function (context, settings) {

        $(document).ready(function () {
            console.clear();

            var body = $('body');

            // HAMBURGER MENU
            $('#hamburgerMenu #hamburger').on('click', function(){
                body.toggleClass('showMenu');
            });
            $('#mainMenu .expanded').on('click', function(){
                $(this).toggleClass('showSubMenu');
            });

            // SCROLL TO ANCHOR
            var offsetSize = $("header.header").innerHeight() - 20;

            // alert(offsetSize);
            // $('a[href^="#"]').on('click', function (e) {
            // 	e.preventDefault();
            //
            //     $('html, body').animate({
            //         scrollTop: $($.attr(this, 'href')).offset().top - offsetSize
            //     }, 1000);
            // });

            // if(window.location.hash) {
            //     $('html, body').animate({
            //         scrollTop: $(window.location.hash).offset().top - offsetSize
            //     }, 1000);
            // }
            if (window.location.hash) {
                $('html, body').animate({
                    scrollTop: $(window.location.hash).position().top - offsetSize
                }, 1000);
            }

            $('.pane-system-main-menu a[href*=#]:not([href=#])').click(function() {
              // var offsetSize = $("header.header").innerHeight() - 20;
              // alert(location.pathname.replace(/\//g,'') + ' ' + this.pathname.replace(/\//g,''));

              if (location.pathname.replace(/\//g,'') == this.pathname.replace(/\//g,'') && location.hostname == this.hostname) {
                var target = $(this.hash);
                target = target.length ? target : $('[id=' + this.hash.slice(1) +']');
                if (target.length) {
                  $('html,body').animate({
                    scrollTop: target.position().top - offsetSize
                }, 1000);
                  window.location.hash = this.hash;
                  return false;
                }
              }
            });


            // SHOW SEARCH
            $('#search-block-form').click(function(){
                $(this).addClass('open');
                $('#search-block-form .form-text').focus();
            });

            // HIDE SEARCH
            $('#search-block-form').focusout(function(){
                // ...if no search terms are entered
                if ($('.form-submit').is(':active') && ($('.form-text').val().length == 0)) {
                    $(this).removeClass('open');
                } else
                // ...clicked elsewhere on the page
                if (!$('.form-submit').is(':active')) {
                    $(this).removeClass('open');
                    $("#search-block-form").removeClass('open');
                }
            });

            // HOMEPAGE
            if (body.hasClass('front')) {
                // Init banner carousel
                $('#carousel .view-content').owlCarousel({
                    items: 1,
                    loop: true,
                    nav: false,
                    dots: true,
                    autoplay: true,
                    autoplayTimeout: 10000,
                    autoplaySpeed: 2000
                });


                function cix() {
                    if (!$('#cixInfo .qmod-quote-0').length){
                        window.requestAnimationFrame(cix);
                    } else {
                        $('#cixInfo .cixQuote').owlCarousel({
                            autoplay:true,
                            autoplaySpeed:2000,
                            autoplayTimeout:10000,
                            responsiveClass:true,
                            responsive:{
                                0:{
                                    dots:false,
                                    items:1,
                                    loop:true,
                                    margin:15,
                                    nav:true
                                },
                                1024:{
                                    dots:false,
                                    items:5,
                                    loop:false,
                                    mouseDrag:false,
                                    nav:false
                                }
                            }
                        });
                    }
                }
                cix();

                function markets() {
                    if (!$('#markets .qmod-quote-0').length){
                        window.requestAnimationFrame(markets);
                    } else {
                        $('#markets .qmod-miniquotes').owlCarousel({
                            autoplay:true,
                            autoplaySpeed:2000,
                            autoplayTimeout:10000,
                            dots:false,
                            loop:true,
                            nav:true,
                            responsiveClass:true,
                            responsive:{
                                0:{
                                    items:1,
                                    margin:15
                                },
                                365:{
                                    items:2,
                                    margin:15
                                },
                                540:{
                                    items:3,
                                    margin:15
                                },
                                820:{
                                    items:4,
                                    margin:30
                                },
                                980:{
                                    items:5,
                                    margin:30
                                },
                                1170:{
                                    items:6,
                                    margin:30
                                }
                            }
                        });
                    }
                };
                markets();


                 // fix for the stretched homepage banner in ie
                 var ua = window.navigator.userAgent;
                 var is_ie = /MSIE|Trident/.test(ua);

                 if ( is_ie ) {
                   $('.owl-item img').each(function(){
                     var t = $(this),
                     s = 'url(' + t.attr('src') + ')',
                     p = t.parent(),
                     d = $('<div></div>');
                     t.hide();
                     p.append(d);
                     d.css({
                       'height'                : 500,
                       'background-size'       : 'cover',
                       'background-repeat'     : 'no-repeat',
                       'background-position'   : 'center',
                       'background-image'      : s
                     });
                   });
                  }

            }

            // ABOUT US
            if (body.hasClass('page-about-us')) {

                // OUR LOCATIONS

                //set toronto to open on page load
                $(document).ready(function() {
                  setTimeout(function() {
                    $('#our-locations .view-content .views-row-13').addClass('active');
                  }, 500);
                });

                $('#our-locations .view-content .views-row').on('click',function(){
                    $('#our-locations .view-content .views-row').removeClass('active');
                    $(this).addClass('active');
                });
                $(document).on("click", function(e) {
                  if ($(e.target).is("#our-locations .view-content .views-row") === false) {
                    $("#our-locations .view-content .views-row").removeClass("active");
                  }
                });

                // OUR BUSINESSES

                // $('#businesses .view-content li:first-child').addClass('active');
                $('#our-businesses .view-content li .company-logo').on('click',function(e){
                  e.preventDefault();
                    $(this).closest('li').toggleClass('active').siblings().removeClass('active');
                });


                // BOARD & MANAGEMENT
                $('#bam-btn').on('click',function(){
                    $('#bam-menu').toggleClass('expand');
                });

                $('#bam-menu button.dropdown-item').on('click',function(){
                    $('#bam-menu button.dropdown-item').removeClass('active');
                    $('#execs .panel-pane').removeClass('active');

                    $(this).addClass('active');
                    $('#execs #' + $(this).attr('id').substring(5)).addClass('active');

                    $("#bam-btn").html($(this).text());
                    $('#bam-menu').removeClass('expand');
                });

                $('#execs a').on('click',function(){
                    window.location.hash = '';
                });

                //CORPORATE RESPONSIBILITY/GOVERANCE
                $("#responsibility").click(function() {
                  window.location = $(this).find("a").attr("href");
                  return false;
                });

                $("#governance").click(function() {
                  window.location = $(this).find("a").attr("href");
                  return false;
                });


            }

            // CORPORATE SOCIAL RESPONSIBILITY
            if (body.hasClass('page-corporate-social-responsibility')) {

                // COMMUNITY SUPPORT
                $('#cs-btn').on('click',function(){
                    $('#cs-menu').toggleClass('expand');
                });

                $('#cs-menu button.dropdown-item').on('click',function(){
                    $('#cs-menu button.dropdown-item').removeClass('active');
                    $('#csr-comm-supp #tab-content .tab-pane').removeClass('active');

                    $(this).addClass('active');
                    $('#' + $(this).attr('id').substring(5)).addClass('active');

                    $("#cs-btn").html($(this).text());
                    $('#cs-menu').removeClass('expand');
                });
            }

            // Press Release node
            if (body.hasClass('node-type-press-release')) {

                var related = $("div[class*='pane-node-field-related-information']");

                if (related.length){

                    $('.pane-press-release-sidebar').remove();

                }

                $('#pr-related-info').prepend('<div class="related-box"><img src="/sites/default/files/corp-goverance-banner.jpg"/></div>');
               


            }

            // SHARE INFORMATION
            if (body.hasClass('page-share-information')) {

                $('.views-table tr:gt(3)').hide(); // only show the first 3 rows on load


                // DIVIDEND HISTORY
                $('#dividend-btn').on('click',function(e){
                    $('#dividend-menu').toggleClass('expand');
                    e.preventDefault();
                });

                $('#dividend-menu a.dropdown-item').on('click',function(e){

                    var selText = $(this).text();

                    $("#dividend-btn").html(selText);
                    $('#dividend-menu').removeClass('expand');

                    if ($(selText == "Next 3 Payments").length > 0) {

                        $('.views-table').find('tr.row').hide();
                        $('.views-table tr.row-0').show();
                        $('.views-table tr.row-1').show();
                        $('.views-table tr.row-2').show();

                    }
                    if ($(selText == "Last 3 Payments").length > 0){

                        $('.views-table').find('tr.row').hide();
                        $('.views-table tr.row-3').show();
                        $('.views-table tr.row-4').show();
                        $('.views-table tr.row-5').show();


                    }
                    if ($(selText == "Last 12 Payments").length > 0){

                        $('.views-table').find('tr.row').hide();
                        $('.views-table tr.row-3').show();
                        $('.views-table tr.row-4').show();
                        $('.views-table tr.row-5').show();
                        $('.views-table tr.row-6').show();
                        $('.views-table tr.row-7').show();
                        $('.views-table tr.row-8').show();
                        $('.views-table tr.row-9').show();
                        $('.views-table tr.row-10').show();
                        $('.views-table tr.row-11').show();
                        $('.views-table tr.row-12').show();
                        $('.views-table tr.row-13').show();
                        $('.views-table tr.row-14').show();

                    }

                    e.preventDefault();

                });

                // MARKETS
                function markets() {
                    if (!$('#markets .qmod-quote-0').length){
                        window.requestAnimationFrame(markets);
                    } else {
                        $('#markets .qmod-miniquotes').owlCarousel({
                            autoplay:true,
                            autoplaySpeed:2000,
                            autoplayTimeout:10000,
                            dots:false,
                            loop:true,
                            nav:true,
                            responsiveClass:true,
                            responsive:{
                                0:{
                                    items:1,
                                    margin:15
                                },
                                365:{
                                    items:2,
                                    margin:15
                                },
                                540:{
                                    items:3,
                                    margin:15
                                },
                                820:{
                                    items:4,
                                    margin:30
                                },
                                980:{
                                    items:5,
                                    margin:30
                                },
                                1170:{
                                    items:6,
                                    margin:30
                                }
                            }
                        });
                    }
                };
                markets();

                // Share price history


                $('#cix-date-range-picker').daterangepicker({
                    ranges: {
                        'Last 7 Days': [moment().subtract(6, 'days'), moment()],
                        'Last 30 Days': [moment().subtract(29, 'days'), moment()],
                        'Last 3 Month': [moment().subtract(3, 'month').endOf('month'),moment() ]
                    },
                    "alwaysShowCalendars": true,
                    "startDate": moment().subtract(6, 'days'),
                    "endDate": moment(),
                    autoclose: true,
                    maxDate: new Date()
                });


                $.ajax({
                        url: 'api/v1/sharedhistory/start/' + moment().subtract(6, 'days').format('YYYY-MM-DD')  +'/end/' + moment().format('YYYY-MM-DD'),
                        data: {
                            format: 'json'
                        },
                        dataType: 'json',
                        success: function(data){
                            $('#sharepricehistory .content-layout').empty();

                            $('#sharepricehistory .content-layout').append(data.data);
                        },

                    type: 'GET'

                });

                $('#cix-date-range-picker').on('apply.daterangepicker', function(ev, picker) {

                    $.ajax({
                        url: 'api/v1/sharedhistory/start/' + picker.startDate.format('YYYY-MM-DD')  +'/end/' + picker.endDate.format('YYYY-MM-DD'),
                        data: {
                            format: 'json'
                        },
                        dataType: 'json',
                        beforeSend: function () {
                            $('#sharepricehistory .content-layout').empty();
                            $('#sharepricehistory .content-layout').text("Loading...");
                        },
                        success: function(data){
                            $('#sharepricehistory .content-layout').empty();

                            $('#sharepricehistory .content-layout').append(data.data);
                        },

                        type: 'GET'

                    });

                });

            }

            //News & Events page

            if (body.hasClass('page-news-events')) {
              // DIVIDEND HISTORY
              $('#year-pr-btn').on('click',function(e){
                  $('#year-pr-menu').toggleClass('expand');
                  e.preventDefault();
              });
            }

            //Financial information
            if (body.hasClass('page-financial-information')) {

                function fr_table() {
                    if (!$('#financial-results .theTabs').length){
                        window.requestAnimationFrame(fr_table);
                    } else {
                        $('#financial-results .theTabs').owlCarousel({
                            autoplay:true,
                            autoplaySpeed:2000000,
                            autoplayTimeout:10000000,
                            dots:false,
                            loop:false,
                            nav:true,
                            responsiveClass:true,
                            responsive:{
                                0:{
                                    items:2,
                                    margin:5
                                },
                                512:{
                                    items:4,
                                    margin:5
                                },
                                768:{
                                    items:6,
                                    margin:10
                                },
                                1024:{
                                    items:9,
                                    margin:10
                                }
                            }
                        });
                    }
                }
                fr_table();

                $('#financial-results .theTabs li a').on('click',function(){
                    $('#financial-results .theTabs li a').removeClass('active');
                    $(this).addClass('active');
                });

                $.ajax({
                    url: 'api/v1/financial/report/2018',
                    data: {
                        format: 'json'
                    },
                    dataType: 'json',
                    success: function(data) {

                        var $quarter_1 ='';
                        if (data.quarter_1!='N/A'){
                             $quarter_1 = '<a href='+data.quarter_1+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                        }else{
                             $quarter_1 = data.quarter_1;
                        }
                        $('#report_q1').append($quarter_1);

                        var $quarter_2 ='';
                        if (data.quarter_2!='N/A'){
                             $quarter_2 = '<a href='+data.quarter_2+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                        }else{
                             $quarter_2 = data.quarter_2;
                        }
                        $('#report_q2').append($quarter_2);

                        var $quarter_3 ='';
                        if (data.quarter_3!='N/A'){
                             $quarter_3 = '<a href='+data.quarter_3+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                        }else{
                             $quarter_3 = data.quarter_3;
                        }
                        $('#report_q3').append($quarter_3);

                        var $quarter_4 ='';
                        if (data.quarter_4!='N/A'){
                             $quarter_4 = '<a href='+data.quarter_4+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                        }else{
                             $quarter_4 = data.quarter_4;
                        }
                        $('#report_q4').append($quarter_4);


                    },
                    type: 'GET'
                });

                $.ajax({
                    url: 'api/v1/financial/ewebcast/2018',
                    data: {
                        format: 'json'
                    },
                    dataType: 'json',
                    success: function(data) {

                        var $quarter_1 ='';
                        if (data.quarter_1!='N/A'){
                            $quarter_1 = '<a href='+data.quarter_1+' target="_blank"><img src="sites/default/files/playcircle.svg" alt="icon-box"/></a>';
                        }else{
                            $quarter_1 = data.quarter_1;
                        }
                        $('#earnings_q1').append($quarter_1);

                        var $quarter_2 ='';
                        if (data.quarter_2!='N/A'){
                            $quarter_2 = '<a href='+data.quarter_2+' target="_blank"><img src="sites/default/files/playcircle.svg" alt="icon-box"/></a>';
                        }else{
                            $quarter_2 = data.quarter_2;
                        }
                        $('#earnings_q2').append($quarter_2);

                        var $quarter_3 ='';
                        if (data.quarter_3!='N/A'){
                            $quarter_3 = '<a href='+data.quarter_3+' target="_blank"><img src="sites/default/files/playcircle.svg" alt="icon-box"/></a>';
                        }else{
                            $quarter_3 = data.quarter_3;
                        }
                        $('#earnings_q3').append($quarter_3);

                        var $quarter_4 ='';
                        if (data.quarter_4!='N/A'){
                            $quarter_4 = '<a href='+data.quarter_4+' target="_blank"><img src="sites/default/files/playcircle.svg" alt="icon-box"/></a>';
                        }else{
                            $quarter_4 = data.quarter_4;
                        }
                        $('#earnings_q4').append($quarter_4);

                    },
                    type: 'GET'
                });

                $.ajax({
                    url: 'api/v1/financial/webcastp/2018',
                    data: {
                        format: 'json'
                    },
                    dataType: 'json',
                    success: function(data) {

                        var $quarter_1 ='';
                        if (data.quarter_1!='N/A'){
                            $quarter_1 = '<a href='+data.quarter_1+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                        }else{
                            $quarter_1 = data.quarter_1;
                        }
                        $('#webcastp_q1').append($quarter_1);

                        var $quarter_2 ='';
                        if (data.quarter_2!='N/A'){
                            $quarter_2 = '<a href='+data.quarter_2+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                        }else{
                            $quarter_2 = data.quarter_2;
                        }
                        $('#webcastp_q2').append($quarter_2);

                        var $quarter_3 ='';
                        if (data.quarter_3!='N/A'){
                            $quarter_3 = '<a href='+data.quarter_3+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                        }else{
                            $quarter_3 = data.quarter_3;
                        }
                        $('#webcastp_q3').append($quarter_3);

                        var $quarter_4 ='';
                        if (data.quarter_4!='N/A'){
                            $quarter_4 = '<a href='+data.quarter_4+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                        }else{
                            $quarter_4 = data.quarter_4;
                        }
                        $('#webcastp_q4').append($quarter_4);

                    },
                    type: 'GET'
                });

                $.ajax({
                    url: 'api/v1/financial/webcastt/2018',
                    data: {
                        format: 'json'
                    },
                    dataType: 'json',
                    success: function(data) {

                        var $quarter_1 ='';
                        if (data.quarter_1!='N/A'){
                            $quarter_1 = '<a href='+data.quarter_1+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                        }else{
                            $quarter_1 = data.quarter_1;
                        }
                        $('#webcastt_q1').append($quarter_1);

                        var $quarter_2 ='';
                        if (data.quarter_2!='N/A'){
                            $quarter_2 = '<a href='+data.quarter_2+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                        }else{
                            $quarter_2 = data.quarter_2;
                        }
                        $('#webcastt_q2').append($quarter_2);

                        var $quarter_3 ='';
                        if (data.quarter_3!='N/A'){
                            $quarter_3 = '<a href='+data.quarter_3+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                        }else{
                            $quarter_3 = data.quarter_3;
                        }
                        $('#webcastt_q3').append($quarter_3);

                        var $quarter_4 ='';
                        if (data.quarter_4!='N/A'){
                            $quarter_4 = '<a href='+data.quarter_4+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                        }else{
                            $quarter_4 = data.quarter_4;
                        }
                        $('#webcastt_q4').append($quarter_4);

                    },
                    type: 'GET'
                });

                $.ajax({
                    url: 'api/v1/financial/report_cover/2018',
                    data: {
                        format: 'json'
                    },
                    dataType: 'json',
                    success: function(data) {
                        $('#img-cover .image').css('background-image','url('+data.cover+')');




                    },
                    type: 'GET'
                });

            }


        });

    }
  };

})(jQuery, Drupal, this, this.document);
;
/**
 * @file
 * A JavaScript file for the theme.
 *
 * In order for this JavaScript to be loaded on pages, see the instructions in
 * the README.txt next to this file.
 */

// JavaScript should be made compatible with libraries other than jQuery by
// wrapping it with an "anonymous closure". See:
// - https://drupal.org/node/1446420
// - http://www.adequatelygood.com/2010/3/JavaScript-Module-Pattern-In-Depth
(function ($, Drupal, window, document) {

    'use strict';

    // To understand behaviors, see https://drupal.org/node/756722#behaviors
    Drupal.behaviors.my_financial_results = {
        attach: function (context, settings) {

            $(document).ready(function () {
                var body = $('body');
                if (body.hasClass('page-financial-information')) {

                    $('#financial-results .theTabs li a').click(function () {

                        emptyCells();

                        $.ajax({
                            url: 'api/v1/financial/report/'+$(this).data("year"),
                            data: {
                                format: 'json'
                            },
                            dataType: 'json',
                            success: function(data) {

                                var $quarter_1 ='';
                                if (data.quarter_1!='N/A'){
                                    $quarter_1 = '<a href='+data.quarter_1+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_1 = data.quarter_1;
                                }
                                $('#report_q1').append($quarter_1);

                                var $quarter_2 ='';
                                if (data.quarter_2!='N/A'){
                                    $quarter_2 = '<a href='+data.quarter_2+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_2 = data.quarter_2;
                                }
                                $('#report_q2').append($quarter_2);

                                var $quarter_3 ='';
                                if (data.quarter_3!='N/A'){
                                    $quarter_3 = '<a href='+data.quarter_3+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_3 = data.quarter_3;
                                }
                                $('#report_q3').append($quarter_3);

                                var $quarter_4 ='';
                                if (data.quarter_4!='N/A'){
                                    $quarter_4 = '<a href='+data.quarter_4+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_4 = data.quarter_4;
                                }
                                $('#report_q4').append($quarter_4);


                            },
                            type: 'GET'
                        });

                        $.ajax({
                            url: 'api/v1/financial/ewebcast/'+$(this).data("year"),
                            data: {
                                format: 'json'
                            },
                            dataType: 'json',
                            success: function(data) {

                                var $quarter_1 ='';
                                if (data.quarter_1!='N/A'){
                                    $quarter_1 = '<a href='+data.quarter_1+' target="_blank"><img src="sites/default/files/playcircle.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_1 = data.quarter_1;
                                }
                                $('#earnings_q1').append($quarter_1);

                                var $quarter_2 ='';
                                if (data.quarter_2!='N/A'){
                                    $quarter_2 = '<a href='+data.quarter_2+' target="_blank"><img src="sites/default/files/playcircle.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_2 = data.quarter_2;
                                }
                                $('#earnings_q2').append($quarter_2);

                                var $quarter_3 ='';
                                if (data.quarter_3!='N/A'){
                                    $quarter_3 = '<a href='+data.quarter_3+' target="_blank"><img src="sites/default/files/playcircle.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_3 = data.quarter_3;
                                }
                                $('#earnings_q3').append($quarter_3);

                                var $quarter_4 ='';
                                if (data.quarter_4!='N/A'){
                                    $quarter_4 = '<a href='+data.quarter_4+' target="_blank"><img src="sites/default/files/playcircle.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_4 = data.quarter_4;
                                }
                                $('#earnings_q4').append($quarter_4);

                            },
                            type: 'GET'
                        });

                        $.ajax({
                            url: 'api/v1/financial/webcastp/'+$(this).data("year"),
                            data: {
                                format: 'json'
                            },
                            dataType: 'json',
                            success: function(data) {

                                var $quarter_1 ='';
                                if (data.quarter_1!='N/A'){
                                    $quarter_1 = '<a href='+data.quarter_1+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_1 = data.quarter_1;
                                }
                                $('#webcastp_q1').append($quarter_1);

                                var $quarter_2 ='';
                                if (data.quarter_2!='N/A'){
                                    $quarter_2 = '<a href='+data.quarter_2+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_2 = data.quarter_2;
                                }
                                $('#webcastp_q2').append($quarter_2);

                                var $quarter_3 ='';
                                if (data.quarter_3!='N/A'){
                                    $quarter_3 = '<a href='+data.quarter_3+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_3 = data.quarter_3;
                                }
                                $('#webcastp_q3').append($quarter_3);

                                var $quarter_4 ='';
                                if (data.quarter_4!='N/A'){
                                    $quarter_4 = '<a href='+data.quarter_4+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_4 = data.quarter_4;
                                }
                                $('#webcastp_q4').append($quarter_4);

                            },
                            type: 'GET'
                        });

                        $.ajax({
                            url: 'api/v1/financial/webcastt/'+$(this).data("year"),
                            data: {
                                format: 'json'
                            },
                            dataType: 'json',
                            success: function(data) {

                                var $quarter_1 ='';
                                if (data.quarter_1!='N/A'){
                                    $quarter_1 = '<a href='+data.quarter_1+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_1 = data.quarter_1;
                                }
                                $('#webcastt_q1').append($quarter_1);

                                var $quarter_2 ='';
                                if (data.quarter_2!='N/A'){
                                    $quarter_2 = '<a href='+data.quarter_2+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_2 = data.quarter_2;
                                }
                                $('#webcastt_q2').append($quarter_2);

                                var $quarter_3 ='';
                                if (data.quarter_3!='N/A'){
                                    $quarter_3 = '<a href='+data.quarter_3+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_3 = data.quarter_3;
                                }
                                $('#webcastt_q3').append($quarter_3);

                                var $quarter_4 ='';
                                if (data.quarter_4!='N/A'){
                                    $quarter_4 = '<a href='+data.quarter_4+' target="_blank"><img src="sites/default/files/akrobat-grey.svg" alt="icon-box"/></a>';
                                }else{
                                    $quarter_4 = data.quarter_4;
                                }
                                $('#webcastt_q4').append($quarter_4);

                            },
                            type: 'GET'
                        });

                        $.ajax({
                            url: 'api/v1/financial/report_cover/'+$(this).data("year"),
                            data: {
                                format: 'json'
                            },
                            dataType: 'json',
                            success: function(data) {
                                $('#img-cover .image').css('background-image','url('+data.cover+')');


                            },
                            type: 'GET'
                        });


                    });


                }

            });
            function emptyCells() {
                $('#report_q1').empty();
                $('#report_q2').empty();
                $('#report_q3').empty();
                $('#report_q4').empty();
                $('#earnings_q1').empty();
                $('#earnings_q2').empty();
                $('#earnings_q3').empty();
                $('#earnings_q4').empty();
                $('#webcastp_q1').empty();
                $('#webcastp_q2').empty();
                $('#webcastp_q3').empty();
                $('#webcastp_q4').empty();
                $('#webcastt_q1').empty();
                $('#webcastt_q2').empty();
                $('#webcastt_q3').empty();
                $('#webcastt_q4').empty();
            }
        }
    }
})(jQuery, Drupal, this, this.document);
;
(function ($, Drupal, window, document) {

    'use strict';


    Drupal.behaviors.press_releases_block_behaviour= {
        attach: function (context, settings) {

            $(document).ready(function () {


               var body = $('body');

                if (body.hasClass('page-news-events')) {

                    var currentYear = new Date().getFullYear();

                    $.ajax({
                        url: '/api/v1/press/' + currentYear + '/1',
                        data: {
                            format: 'json'
                        },
                        dataType: 'json',
                        success: function(data){
                            $('#press-releases .view-id-press_releases .view-content').empty();
                            $('#press-releases .view-id-press_releases .view-content').append(data.data);

                        },

                        type: 'GET'

                    });


                    setTimeout(function () {
                        $('#press-releases .view-id-press_releases ul li a').on('click',function() {
                             var year = $(this).data("year");

                            $.ajax({
                                url: '/api/v1/press/' + year + "/" + $(this).data("page"),
                                data: {
                                    format: 'json'
                                },
                                dataType: 'json',
                                beforeSend: function () {

                                    $('#press-releases .view-id-press_releases .view-content').empty();
                                    $('#press-releases .view-id-press_releases .view-content').append('<div class="loader active"><div class="rect1"></div><div class="rect2"></div> <div class="rect3"></div><div class="rect4"></div><div class="rect5"></div> </div>');

                                },
                                success: function(data){
                                    $('#press-releases .view-id-press_releases .view-content').empty();
                                    $('#press-releases .view-id-press_releases .view-content').append(data.data);
                                    $('#year-pr-btn').text(year);
                                    $('#year-pr-menu').removeClass('expand');


                                },

                                type: 'GET'

                            });


                        });




                    }, 2000);



                }



            });

        }
    };

})(jQuery, Drupal, this, this.document);


function changepage(year,page){


        jQuery.ajax({
            url: '/api/v1/press/' + year + "/" + page,
            data: {
                format: 'json'
            },
            dataType: 'json',
            beforeSend: function () {

                jQuery('#press-releases .view-id-press_releases .view-content').empty();
                jQuery('#press-releases .view-id-press_releases .view-content').append('<div class="loader active"><div class="rect1"></div><div class="rect2"></div> <div class="rect3"></div><div class="rect4"></div><div class="rect5"></div> </div>');

            },
            success: function(data){
                jQuery('#press-releases .view-id-press_releases .view-content').empty();
                jQuery('#press-releases .view-id-press_releases .view-content').append(data.data);
                jQuery('#year-pr-btn').text(year);

            },

            type: 'GET'

        });


}
;
