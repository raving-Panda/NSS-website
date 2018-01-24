
(function($) {"use strict";

	$(document).ready(function() {

		// SiteOrigin
		$('div[id^="pl"]').parent('.page-content').addClass('has-siteorigin-panels');
		$('.panel-row-style').parent('.panel-grid').addClass('has-panel-row-style');
		$('.siteorigin-panels-stretch').parent('.panel-grid').addClass('has-panels-stretch');

		// Slicknav - Mobile Menu
		$('.hornav .container').slicknav();
		
		// Smoothscroll
		$('.scrollto').click(function() {
		  if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
		    var target = $(this.hash);
		    target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
		    if (target.length) {
		      $('html,body').animate({
		        scrollTop: target.offset().top -60
		      }, 800);
		      return false;
		    }
		  }
		});

		// Add class - top menu
		$('.hornav li').hover(function () {
			$(this).addClass('parent-hover');
			}, function () {
			$(this).removeClass('parent-hover');
		});

		// Search & Filter
	    $('.searchandfilter h4').click(function(j) {
	        var dropDown = $(this).closest('li').find('ul');

	        $(this).closest('.searchandfilter').find('.searchandfilter > ul').not(dropDown).slideUp();

	        if ($(this).hasClass('active')) {
	            $(this).removeClass('active');
	        } else {
	            $(this).closest('.searchandfilter').find('.active').removeClass('active');
	            $(this).addClass('active');
	        }

	        dropDown.stop(false, true).slideToggle();

	        j.preventDefault();
	    });

	    $( ".sf-field-taxonomy-transition label" ).wrapInner(function() {
		  return "<span></span>";
		});

	});
})(jQuery);

