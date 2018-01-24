'use strict'
// This module provides helpers for Boston.gov
// ---------------------------
var Boston = (function () {
  var emailRE = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  var zipRE = /(^\d{5}$)|(^\d{5}-\d{4}$)/;

  // Returns the child element based on selector
  // Parent needs an ID
  function child(el, selector) {
    return document.querySelectorAll('#' + el.id + ' ' + selector);
  }

  // Returns the child element based on selector
  // Parent needs a selector
  function childByEl(parent, selector) {
    return parent.getElementsByClassName(selector);
  }

  function disableButton(form, label) {
    var button = Boston.childByEl(form, 'btn');

    if (button.length > 0) {
      for (var i = 0; i < button.length; i++) {
        button[i].disabled = true;
        button[i].innerHTML = label;
      }
    }
  }

  function enableButton(form, label) {
    var button = Boston.childByEl(form, 'btn');

    if (button.length > 0) {
      for (var i = 0; i < button.length; i++) {
        button[i].disabled = false;
        button[i].innerHTML = label;
      }
    }
  }

  function hasClass(element, cls) {
    return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }

  function invalidateField(field, message) {
    var errors = document.createElement('div');
    errors.className = "t--subinfo t--err m-t100";
    errors.innerHTML = message;
    field.parentElement.appendChild(errors);
  }

  function request(obj, token) {
    var request = new XMLHttpRequest();
    request.open(obj.method, obj.url, true);

    request.onload = function() {
      if (request.status >= 200 && request.status < 400) {
        obj.success(request);
      } else {
        obj.error(request);
      }
    };

    if (token) {
      request.setRequestHeader("Authorization", "Token " + token);
    }

    request.onerror = function() {
      obj.error(request);
    };

    if (obj.data) {
      request.send(obj.data);
    } else {
      request.send();
    }
  }

  return {
    request: request,
    child: child,
    childByEl: childByEl,
    disableButton: disableButton,
    enableButton: enableButton,
    emailRE: emailRE,
    hasClass: hasClass,
    invalidateField: invalidateField,
    zipRE: zipRE
  }
})();

'use strict'
// This module controls the City of Boston video component
// ---------------------------
var BostonContact = (function () {
  var to_address;

  function initEmailLink(emailLink) {
    // Handle the onclick event
    emailLink.addEventListener('click', handleEmailClick);
  }

  function handleEmailClick(ev) {
    ev.preventDefault();

    if (document.getElementById('contactFormTemplate')) {
      document.body.classList.add('no-s');

      var template = document.getElementById('contactFormTemplate');
      var container = document.createElement('div');

      container.id = "contactFormModal";
      container.innerHTML = template.innerHTML;

      document.body.appendChild(container);

      if (ev.target.title && ev.target.title !== '') {
        document.getElementById('contactMessage').innerHTML = ev.target.title;
      }

      var close = Boston.childByEl(container, 'md-cb');
      close[0].addEventListener('click', handleEmailClose);

      var form = document.getElementById('contactForm');
      form.addEventListener('submit', handleFormSubmit);

      // Set the hidden fields
      setBrowser(ev.target);
      setURL(ev.target);
      setToAddress(ev.target);
    }
  }

  function handleEmailClose(ev) {
    ev.preventDefault();
    document.body.classList.remove('no-s');
    document.getElementById('contactFormModal').remove();
  }

  function handleFormSubmit(ev) {
    ev.preventDefault();

    var form = document.getElementById('contactForm');
    var isValid = validateForm(form);
    var formData = new FormData(form);

    if (isValid) {
      Boston.disableButton(form, 'Loading...');

      Boston.request({
        data: formData,
        url: form.getAttribute('action'),
        method: 'POST',
        success: function (response) {
          if (response.status === 200) {
            form.parentElement.innerHTML = "<p>Thank you for contacting us. We appreciate your interest in the City. If you don’t hear from anyone within five business days, please contact BOS:311 at 3-1-1 or 617-635-4500.</p>";
          } else {
            handleError(form);
          }
        },
        error: function() {
          handleError(form);
        }
      }, "c43517a240ee61898c00600eaa775aa0d0e639322c3f275b780f66062f69");
    }
  }

  function handleError(form) {
    Boston.enableButton(form, 'Send Message');
  }

  function validateForm(form) {
    var email = Boston.childByEl(form, 'bos-contact-email');
    var name = Boston.childByEl(form, 'bos-contact-name');
    var subject = Boston.childByEl(form, 'bos-contact-subject');
    var message = Boston.childByEl(form, 'bos-contact-message');
    var address_to = document.getElementById('contactFormToAddress');
    var valid = true;

    if (email[0].value == '' || !Boston.emailRE.test(email[0].value)) {
      Boston.invalidateField(email[0], "Please enter a valid email address");
      valid = false;
    }

    if (name[0].value == '') {
      Boston.invalidateField(name[0], "Please enter your full name");
      valid = false;
    }

    if (subject[0].value == '') {
      Boston.invalidateField(subject[0], "Please enter a subject");
      valid = false;
    }

    if (message[0].value == '') {
      Boston.invalidateField(message[0], "Please enter a message");
      valid = false;
    }

    if (address_to.value !== to_address) {
      valid = false;
    }

    return valid;
  }

  function setBrowser(link) {
    var browserField = document.getElementById('contactFormBrowser');
    browserField.value = navigator.userAgent;
  }

  function setToAddress(link) {
    var toField = document.getElementById('contactFormToAddress');
    toField.value = link.getAttribute('href').replace('mailto:', '');
    to_address = link.getAttribute('href').replace('mailto:', '');
  }

  function setURL(link) {
    var urlField = document.getElementById('contactFormURL');
    urlField.value = window.location.href;
  }

  function start() {
    // The page needs to include a template with id of contactMessage
    if (document.getElementById('contactFormTemplate')) {
      var emailLinks = document.querySelectorAll('a[href^=mailto]:not(.hide-form)');

      if (emailLinks.length > 0) {
        for (var i = 0; i < emailLinks.length; i++) {
          initEmailLink(emailLinks[i]);
        }
      }
    }
  }

  return {
    start: start,
    close: handleEmailClose
  }
})();

BostonContact.start();

'use strict'
// This module controls the City of Boston newsletter component
// ---------------------------
var BostonHeader = (function () {
  var guideTitle;
  var headerGuideTitle;
  var header;
  var searchIcon;

  function handleGuideTitleTrigger(show) {
    if (show) {
      headerGuideTitle.classList.add('h-gt--active');
    } else {
      headerGuideTitle.classList.remove('h-gt--active');
    }
  }

  function setupGuideTitle() {
    headerGuideTitle = document.createElement('div');

    headerGuideTitle.className = 'h-gt';
    headerGuideTitle.innerHTML = guideTitle.innerHTML;

    header.appendChild(headerGuideTitle);
  }

  function start() {
    guideTitle = document.getElementById('topicTitle');
    header = document.getElementById('main-menu');

    if (guideTitle) {
      setupGuideTitle();
    }
  }

  return {
    start: start,
    handleGuideTitleTrigger: handleGuideTitleTrigger
  }
})();

BostonHeader.start();

'use strict'
// This module controls the City of Boston newsletter component
// ---------------------------
var BostonMap = (function () {
  var map = [];

  function createPopup (p) {
    return function (layer) { return L.Util.template(p, layer.feature.properties); };
  }

  function createLegend(d) {
    return function (map) { return d; };
  }

  function toggleMap(e, mapContainer) {
    e.preventDefault();

    var isActive = Boston.hasClass(mapContainer, 'is-active');

    if (isActive) {
      mapContainer.className = 'mp';
    } else {
      mapContainer.className = 'mp is-active';
    }
  }

  function initMap(mapContainer) {
    var mapEl = Boston.childByEl(mapContainer, 'map')[0];
    var buttonEl = Boston.childByEl(mapContainer, 'mp-v')[0];
    var closeEl = Boston.childByEl(mapContainer, 'mp-e')[0];

    if (buttonEl && closeEl) {
      // Toggle the view
      buttonEl.addEventListener('click', function (e) {
        toggleMap(e, mapContainer);
      });

      // Toggle the view
      closeEl.addEventListener('click', function (e) {
        toggleMap(e, mapContainer);
      });
    }

    // Set the Map ID used to create a unique canvas for each map.
    var mapID = mapEl.id;
    // Get array of map objects from Drupal.
    var mapJSON = mapData[mapID];

    // Convert JSON into javascript object.
    var mapObj = JSON.parse(mapJSON);
    // Set ESRI Feed title, url, and color info.
    var feeds = mapObj.feeds;
    // Set Custom Pins title, desc, latitude and longitude info.
    var points = mapObj.points;
    // Set Map Options (0 = Static, 1 = Zoom).
    var mapOptions = mapObj.options;
    // Set Basemap URL.
    var basemapUrl = mapObj.basemap;
    // Set Latitude to component value if it exists, if not set to ESRI Lat, if nothing exists set hardcoded value.
    var latitude = mapObj.componentLat ? mapObj.componentLat : mapObj.esriLat ? mapObj.esriLat : 42.357004;
    // Set Longitude to component value if it exists, if not set to ESRI Lat, if nothing exists set hardcoded value.
    var longitude = mapObj.componentLong ? mapObj.componentLong : mapObj.esriLong ? mapObj.esriLong : -71.062309;
    // Set Zoom to component value if it exists, if not set to ESRI Lat, if nothing exists set hardcoded value.
    var zoom = mapObj.componentZoom ? mapObj.componentZoom : mapObj.esriZoom ? mapObj.esriZoom : 14;

    // Apply default coordinates and zoom level.
    var map = L.map(mapID, {zoomControl: false}).setView([latitude, longitude], zoom);

    if (mapOptions == 1) {
      // Add zoom control to bottom right.
      L.control.zoom({
        position:'bottomright'
      }).addTo(map);
    }

    // Add custom pins created in Map component.
    for (var j = 0; j < points.length; j++) {
      var customPin = L.marker([points[j].lat, points[j].long]).addTo(map);
      customPin.bindPopup(
        '<a class="title" href="' + points[j].url + '" target="_blank">' +
          '<b>' +
            points[j].name +
          '</b>' +
        '</a>' +
        '<p class="times">' +
          points[j].desc +
        '</p>'
      );
    }

    // Add mapbox basemap.
    L.tileLayer(basemapUrl).addTo(map);

    // Set the legend position.
    var legend = L.control({position: 'topleft'});
    var div = L.DomUtil.create('div', 'info legend');

    // Add layer for ESRI feed(s) and add item for legend.
    for (var k = 0; k < feeds.length; k++) {
      // Check if pins should be clustered.
      var baseObj = (feeds[k].cluster == 1) ? L.esri.Cluster : L.esri;
      var layerObj = baseObj.featureLayer({
        url: feeds[k].url,
        style: {
          "color": feeds[k].color,
          "weight": 3
        }
      }).addTo(map);
      // Create popups for pin markers
      layerObj.bindPopup(createPopup(feeds[k].popup));
      // Add item to legend.
      div.innerHTML += '<i style="background:' + feeds[k].color + '"></i> ' + feeds[k].title + '<br>';
    }

    // Add "div" variable created in loop to legend.
    legend.onAdd = createLegend(div);
    // Add legend to map.
    legend.addTo(map);
  }

  function start() {
    var mapContainers = document.querySelectorAll('.mp');

    if (mapContainers.length > 0) {
      for (var i = 0; i < mapContainers.length; i++) {
        initMap(mapContainers[i]);
      }
    }
  }

  return {
    start: start
  }
})();

BostonMap.start();

'use strict'

var BostonMenu = (function () {
  // Set height
  var secondaryNavs;
  var secondaryTriggers;
  var listItems;
  var secondaryNavItems;
  var backTriggers;
  var burger;
  var placeholder;
  var nav;

  function handleBurgerChange(ev) {
    document.body.classList.toggle('no-s');
  }

  function handleTrigger(ev, method) {

    var backTrigger;
    var secondaryNav;
    var trigger = ev.target;
    var parentItem = method === 'reset' ? trigger.parentNode.parentNode.parentNode : trigger.parentNode;
    var title = document.getElementById('nv-m-h-t');

    // Find the secondary nav and trigger
    for (var i = 0; i < parentItem.childNodes.length; i++) {
      if (parentItem.childNodes[i].classList && parentItem.childNodes[i].classList.contains('nv-m-c-l-l')) {
        secondaryNav = parentItem.childNodes[i];
      }

      if (parentItem.childNodes[i].classList && parentItem.childNodes[i].classList.contains('nv-m-c-a')) {
        trigger = parentItem.childNodes[i];
      }
    }

    // Find the backTrigger
    for (var i = 0; i < secondaryNav.childNodes.length; i++) {
      if (secondaryNav.childNodes[i].classList && secondaryNav.childNodes[i].classList.contains('nv-m-c-bc')) {
        backTrigger = secondaryNav.childNodes[i];
      }
    }

    if (method === 'nav') {
      for (var i = 0; i < listItems.length; i++) {
        if (parentItem != listItems[i]) {
          listItems[i].classList.add('nv-m-c-l-i--h');
        }
      }

      // Hide the trigger
      trigger.classList.add('nv-m-c-a--h');

      // Show the secondary nav
      secondaryNav.classList.remove('nv-m-c-l-l--h');

      // Show the back button
      backTrigger.classList.remove('nv-m-c-b--h');

      // Update the title
      title.innerHTML = trigger.innerHTML;
    } else {
      for (var i = 0; i < listItems.length; i++) {
        if (parentItem != listItems[i]) {
          listItems[i].classList.remove('nv-m-c-l-i--h');
        }
      }

      // Hide the trigger
      trigger.classList.remove('nv-m-c-a--h');

      // Show the secondary nav
      secondaryNav.classList.add('nv-m-c-l-l--h');

      // Show the back button
      backTrigger.classList.add('nv-m-c-b--h');

      // Update the title
      title.innerHTML = placeholder;
    }
  }

  function start() {
    nav = document.querySelectorAll('.nv-m');
    burger = document.getElementById('brg-tr');
    listItems = document.querySelectorAll('.nv-m-c-l-i');
    backTriggers = document.querySelectorAll('.nv-m-c-b');
    secondaryTriggers = document.querySelectorAll('.nolink');
    secondaryNavs = document.querySelectorAll('.nv-m-c-l-l');
    secondaryNavItems = document.querySelectorAll('.nv-m-c-a--s');

    var title = document.getElementById('nv-m-h-t');
    placeholder = title ? title.innerHTML : '';

    for (var i = 0; i < nav.length; i++) {
      nav[i].addEventListener('focusin', function() {
        burger.checked = true;
      });
    }

    // Set the secondary navigation menus to hidden
    for (var i = 0; i < secondaryNavs.length; i++) {
      secondaryNavs[i].classList.add('nv-m-c-l-l--h');
    }

    // Get the secondary navigation triggers ready
    for (var i = 0; i < secondaryTriggers.length; i++) {
      // Set to active
      secondaryTriggers[i].classList.add('nolink--a');

      // Handle clicks
      secondaryTriggers[i].addEventListener('click', function(ev) {
        ev.preventDefault();
        handleTrigger(ev, 'nav');
      });
    }

    // Get the secondary navigation triggers ready
    for (var i = 0; i < backTriggers.length; i++) {
      backTriggers[i].addEventListener('click', function(ev) {
        ev.preventDefault();

        handleTrigger(ev, 'reset');
      });
    }

    // Set the secondary navigation menus to hidden
    for (var i = 0; i < secondaryNavItems.length; i++) {
      secondaryNavItems[i].classList.remove('nv-m-c-a--s');
      secondaryNavItems[i].classList.add('nv-m-c-a--p');
    }

    if (burger) {
      burger.addEventListener('change', handleBurgerChange);
    }
  }

  return {
    start: start
  }
})()

BostonMenu.start()

'use strict'
// This module controls the City of Boston newsletter component
// ---------------------------
var BostonNewsletter = (function () {
  function initForm(form) {
    form.addEventListener('submit', function (ev) {
      ev.preventDefault();

      // Reset the form
      resetForm(form);

      // Test the form for valid
      var isValid = validateForm(form);
      var formData = new FormData(form);

      if (isValid) {
        Boston.disableButton(form, 'Loading...');

        Boston.request({
          data: formData,
          url: form.getAttribute('action'),
          method: 'POST',
          success: function (response) {
            var response = JSON.parse(response.response);

            if (response.subscriber) {
              form.parentElement.innerHTML = "<div class='t--info'>Great. You'll get your first email soon.</div>";
            } else {
              handleError();
            }
          },
          error: function() {
            Boston.enableButton(form, 'Sign up')
            handleError();
          }
        });
      }
    });
  }

  function handleError() {
  }

  function validateForm(form) {
    var email = Boston.childByEl(form, 'bos-newsletter-email');
    var zip = Boston.childByEl(form, 'bos-newsletter-zip');
    var valid = true;

    if (email[0].value == '' || !Boston.emailRE.test(email[0].value)) {
      var errors = document.createElement('div');
      errors.className = "t--subinfo t--err m-t100";
      errors.innerHTML = "Please enter a valid email address";
      email[0].parentElement.appendChild(errors);
      valid = false;
    }

    if (zip[0].value !== '' && !Boston.zipRE.test(zip[0].value)) {
      var errors = document.createElement('div');
      errors.className = "t--subinfo t--err m-t100";
      errors.innerHTML = "Please enter a valid zip code";
      zip[0].parentElement.appendChild(errors);
      valid = false;
    }

    return valid;
  }

  function resetForm(form) {
    var errors = Boston.childByEl(form, 't--err');

    for (var i = 0; i < errors.length; i++) {
      errors[i].remove();
    }
  }

  function start() {
    var forms = document.querySelectorAll('.bos-newsletter');

    if (forms.length > 0) {
      for (var i = 0; i < forms.length; i++) {
        initForm(forms[i]);
      }
    }
  }

  return {
    start: start
  }
})();

BostonNewsletter.start();

'use strict'
// This module controls the City of Boston seal
// ---------------------------
// On scroll, the seal will hide or show depending on the
// position of the page.
var BostonSeal = (function () {
  // Set height
  var elHeight = 245;

  // A place for some debounce
  var timerEl;

  // Get the seal
  var theSeal = document.querySelectorAll('.s')

  // Check for topic titles
  var isTopic = document.querySelectorAll('.node-type-topic-page').length > 0

  function scrolling() {
    // Let's not do anything if we're still scrolling
    if (timerEl) {
      clearTimeout(timerEl);
    }

    // Trigger event, if we're not scrolling anymore
    timerEl = setTimeout(processScroll, 75);
  }

  function processScroll() {
    // Contains the position of the window.
    var scrollPos = (window.pageYOffset !== undefined) ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;

    // Figure out which class to use
    var className  = isTopic ? 's--h' : 's--u'
    var hide = scrollPos > elHeight;

    if (hide) {
      // Add the class
      theSeal[0].classList.add(className);
    } else {
      // Add the class
      theSeal[0].classList.remove(className);
    }

    if (isTopic) {
      BostonHeader.handleGuideTitleTrigger(hide);
    }
  }

  function start() {
    // Make sure the seal exists, or punt
    if (theSeal.length > 0 && theSeal[0]) {
      // If we scroll the page, trigger event
      window.addEventListener('scroll', scrolling);

      // Trigger it here, just once
      scrolling();
    }
  }

  return {
    start: start
  }
})()

BostonSeal.start()

'use strict'
// This module controls the City of Boston table component
// ---------------------------
var BostonTable = (function () {

  function transposeTable(tables, reset) {
    // Loop through all vertical tables on the page.
    for (var i = 0, length = tables.length; i < length; i++) {
      // If going back to a large screen, use original vertical table style.
      if (reset) {
        // Get all the tables as currently displayed.
        var updatedTables = document.querySelectorAll('.responsive-table--vertical');
        // Loop through all tables.
        for (var j = 0, length = updatedTables.length; j < length; j++) {
          // Make sure you replace the current table with the correct original table.
          if (i == j) {
            // Actually replace the table HTML.
            updatedTables[j].replaceWith(tables[i]);
          }
        }
        // Exit so the transpose code does not run.
        return;
      }
      // Create an empty table element.
      var newTable = document.createElement('table');
      // Set the classes on the empty table.
      newTable.setAttribute('class', 'responsive-table responsive-table--vertical');
      // Initialize the maximum number of columns to loop through.
      var maxColumns = 0;
      // Find the max number of columns
      for(var r = 0; r < tables[i].rows.length; r++) {
        if(tables[i].rows[r].cells.length > maxColumns) {
          maxColumns = tables[i].rows[r].cells.length;
        }
      }
      for(var c = 0; c < maxColumns; c++) {
        newTable.insertRow(c);
        for(var r = 0; r < tables[i].rows.length; r++) {
          if(tables[i].rows[r].length <= c) {
            newTable.rows[c].insertCell(r);
            newTable.rows[c].cells[r] = '-';
          }
          else if (tables[i].rows[r].cells[c].tagName != 'TH') {
            newTable.rows[c].insertCell(r);
            // Set the table data value.
            newTable.rows[c].cells[r].innerHTML = tables[i].rows[r].cells[c].innerHTML;
            // Set the table data attributes used by pseudo class.
            newTable.rows[c].cells[r].setAttribute('data-label', tables[i].rows[r].cells[c].getAttribute('data-label'));
          }
        }
      }
      tables[i].replaceWith(newTable);
    }
  }

  function start() {
    // Check for vertical tables.
    var tables = document.querySelectorAll('.responsive-table--vertical');

    var onResizing = function(event) {
      // Get the current window size.
      var width = window.innerWidth
        || document.documentElement.clientWidth
        || document.body.clientWidth;

      // If there are vertical tables, and we're on a mobile screen, run...
      if (tables.length > 0 && width <= 768) {
        transposeTable(tables);
      }
      else {
        transposeTable(tables, "reset");
      }
    };
    window.onresize = onResizing;
    window.onload = onResizing;
  }
  return {
    start: start
  }
})();

BostonTable.start();

'use strict'
// This module controls the City of Boston tabs
// ---------------------------
var BostonTabs = (function () {
  var tabs;
  var menuToggle;

  function listenToTabs(tabs) {
    for (var i = 0; i < tabs.length; i++) {
      tabs[i].addEventListener('click', function (ev) {
        var path = ev.target.getAttribute('data-href');

        if (path) {
          location.hash = path;
          menuToggle.checked = false;
        }
      });
    }
  }

  function checkForHash() {
    var controls = document.querySelectorAll('.tab-ctrl');

    for (var i = 0; i < controls.length; i++) {
      if (controls[i].getAttribute('data-href') == location.hash) {
        controls[i].checked = true;
      }
    }
  }

  function hideCloseButton() {
    var closeButton = document.querySelectorAll('.tab-li-close');
    closeButton[0].style.display = "none";
  }

  function start() {
    // Check for tabs
    tabs = document.querySelectorAll('.tab-li-a');

    // If there are tabs, run...
    if (tabs.length > 0) {
      listenToTabs(tabs);
      hideCloseButton();
      checkForHash();

      // Set the menu
      menuToggle = document.getElementById('tabMenuCTRL');
    }
  }

  return {
    start: start
  }
})()

BostonTabs.start();

'use strict'
// This module controls the City of Boston video component
// ---------------------------
var BostonVideo = (function () {
  // Set height
  var video = {};
  var trigger;
  var container;
  var video_id;
  var video_channel;

  function getURL(video_id, video_channel) {
    if (video_channel == 'true') {
      return "https://www.youtube.com/embed/live_stream?autoplay=1&channel=" + video_id;
    } else {
      return "https://www.youtube.com/embed/" + video_id + "?autoplay=1";
    }
  }

  function handleTrigger(video) {
    var embed_url = getURL(video.el.getAttribute('data-vid-id'), video.el.getAttribute('data-vid-channel'));

    video.container.innerHTML = '<iframe src="' + embed_url + '" class="vid-v"></iframe>'
  }

  function initVideo(video) {
    video[video.id] = {
      el: video,
      container: Boston.child(video, '.vid-c')[0],
      trigger: Boston.child(video, '.vid-cta')[0]
    };

    // Set click events on each
    video[video.id].el.addEventListener('click', function(ev) {
      ev.preventDefault();
      ev.stopPropagation();

      handleTrigger(video[video.id]);
    });
  }

  // Pass the ID of the video
  function start(video_id) {
    var videos = document.querySelectorAll('.vid');

    if (videos.length > 0) {
      for (var i = 0; i < videos.length; i++) {
        initVideo(videos[i]);
      }
    }
  }

  return {
    start: start
  }
})();

BostonVideo.start();
