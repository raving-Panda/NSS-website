/**
 * @file
 * Custom Javascript for Neighborhood Lookup Form.
 *
 * This javascript is loaded on all pages due to issues with shortcodes caching.
 */

(function ($, Drupal, window, document) {
  // Run this code whenever the DOM is fully loaded, regardless of whether or
  // not this script is included in the header or footer scripts.
  $(document).ready(function() {
    function validate_address(address) {
      return address && address !== '';
    }

    $("#bos-neighborhood-lookup-form").submit(function (event) {
      $error = $("div.address-error");
      $error.text('');
      event.preventDefault();
      var address = $("input#edit-street-address").val();
      var success = validate_address(address);
      if (success) {
        window.open(
          'https://www.cityofboston.gov/myneighborhood/?q=' + address,
          '_blank'
        );
        $("#edit-street-address").removeClass('error');
        $error.removeClass('input-error-mssg');
      }
      else {
        $("#edit-street-address").addClass('error');
        $error.addClass('input-error-mssg');
        $error.text('Please enter a valid street address.');
      }
    });
  });

})(jQuery, Drupal, this, this.document);
;
/**
 * @file
 * Custom Javascript for Towing Lookup Form.
 *
 * This javascript is loaded on all pages due to issues with shortcodes caching.
 */

(function ($, Drupal, window, document) {
  // Run this code whenever the DOM is fully loaded, regardless of whether or
  // not this script is included in the header or footer scripts.
  $(document).ready(function() {

    function license_plate_validate(plate) {
      var regx = /^[A-Za-z0-9]+$/;
      if (!regx.test(plate) || plate.length < 3 || plate.length > 8) {
        return false;
      }
      return true;
    }

    $("#bos-towing-lookup-form").submit(function (event) {
      $error = $("div.license-plate-error");
      $error.text('');
      event.preventDefault();
      var plate = $("input#edit-license-plate").val();
      var success = license_plate_validate(plate);
      if (success) {
        window.open(
          'http://www.cityofboston.gov/towing/search/?plate=' + plate,
          '_blank'
        );
        $("#edit-license-plate").removeClass('error');
        $error.removeClass('input-error-mssg');
      }
      else {
        $("#edit-license-plate").addClass('error');
        $error.addClass('input-error-mssg');
        $error.text('Error: Valid Plate Required (3 to 8 letters and digits, no spaces or dashes).');
      }
    });
  });

})(jQuery, Drupal, this, this.document);
;
(function($) {
    Drupal.behaviors.bosContentTypeEmergencyAlert = {
        'attach': function(context) {
            $('#statusHeader').once("emergency-override", function() {
                $.get( "/emergency-alert?" + Math.round(new Date().getTime() / 1000), null, callback);
            });
        }
    };

    var callback = function(response) {
        if(response.emergency) {
            var element = $('#statusHeader');
            element.html(response.html);
        }
    }
})(jQuery);
;
