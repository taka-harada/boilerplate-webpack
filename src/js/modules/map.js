import $ from 'jquery';
import loadGoogleMapsAPI from 'load-google-maps-api';

/* global google */

export function addGoogleMap (option) {
  loadGoogleMapsAPI().then(function (googleMaps) {
    var conf = $.extend({
      selector: ' ',
      latlngX: 0,
      latlngY: 0
    }, option);

    var latlng = new google.maps.LatLng(conf.latlngX, conf.latlngY);

    var myOptions = {
      zoom: 18,
      center: latlng,
      streetview: true,
      mapTypeControl: true,
      streetViewControl: true,
      scrollwheel: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    var map = new google.maps.Map(document.getElementById(conf.selector), myOptions);

    var markerOptions = {
      position: latlng,
      map: map,
      title: 'Hivelocity'
      // icon: flagIcon_front
      // shadow: flagIcon_shadow
    };

    var marker = new google.maps.Marker(markerOptions);

    // console.log(latlng);
    /*
    var stylez = [{
      featureType: "all",
      elementType: "geometry",
      visibility: "on",
      stylers: [
        {"hue": "#0066ff" }
      ]
    }];

    var styledMapOptions = {};
    var setMapType =  new google.maps.StyledMapType(stylez,styledMapOptions);

    map.mapTypes.set('park', setMapType);
    map.setMapTypeId('park');
    */

    markerEvent(marker);

    function markerEvent (elm) {
      elm.addListener('click', function () {
        location.href = 'http://maps.google.com/maps?q=東京都港区西麻布三丁目21番20号 霞町コーポ';
        return false;
      });
    }
  }).catch((err) => {
    console.error(err);
  });
}
