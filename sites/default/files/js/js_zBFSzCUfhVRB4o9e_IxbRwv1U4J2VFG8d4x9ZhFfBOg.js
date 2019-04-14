function initMap() {
    var lat = parseFloat(jQuery('#mapEvent').attr('data-lat')),
        lng = parseFloat(jQuery('#mapEvent').attr('data-lon')),
        info = jQuery('#mapEvent').attr('data-inf').replace(/\n/g, "<br>"),
        title = jQuery('#mapEvent').attr('data-tit');







//        var image = {
//
//            // url: window.location.origin + '/wp-content/themes/omgi/assets/images/marker.svg',
//            // scaledSize: new google.maps.Size(60, 60)
//
//
//            path: 'M33.5,16.7C33.5,7.5,26,0,16.7,0S0,7.5,0,16.7C0,23.9,4.5,30,10.8,32.4l6,21.2l4.7-20.8C28.4,30.7,33.5,24.3,33.5,16.7z',
//            fillColor: pinColor,
//            strokeColor: pinColor,
//            strokeWeight: 1,
//            fillOpacity: 1,
//            scale: 1,
//            anchor: new google.maps.Point(23,58),
//            scaledSize: new google.maps.Size(60,60)
//
//        }
    var latlng = new google.maps.LatLng(lat, lng);


    var contentString = '<div id="contentMap" class="contentMap p-header">' +
        '<p id="firstHeading" class="firstHeading">' + title + '</p></div>' +
        '<div class="contentMapDescription"><p class="bodyContent"> ' + info + ' </p>' +
        '</div>';

    var infowindow = new google.maps.InfoWindow({
        content: contentString
    });


    var styles = [


//            {
//                "elementType": "geometry",
//                "stylers": [
//                    {
//                        "color": "#f5f5f5"
//                    }
//                ]
//            },
        {
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
//            {
//                "elementType": "labels.text.fill",
//                "stylers": [
//                    {
//                        "color": "#616161"
//                    }
//                ]
//            },
//            {
//                "elementType": "labels.text.stroke",
//                "stylers": [
//                    {
//                        "color": "#f5f5f5"
//                    }
//                ]
//            },
        {
            "featureType": "administrative",
            "elementType": "geometry",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
        {
            "featureType": "administrative.land_parcel",
            "elementType": "labels",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
//            {
//                "featureType": "administrative.land_parcel",
//                "elementType": "labels.text.fill",
//                "stylers": [
//                    {
//                        "color": "#bdbdbd"
//                    }
//                ]
//            },
        {
            "featureType": "poi",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
//            {
//                "featureType": "poi",
//                "elementType": "geometry",
//                "stylers": [
//                    {
//                        "color": "#eeeeee"
//                    }
//                ]
//            },
        {
            "featureType": "poi",
            "elementType": "labels.text",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
//            {
//                "featureType": "poi",
//                "elementType": "labels.text.fill",
//                "stylers": [
//                    {
//                        "color": "#757575"
//                    }
//                ]
//            },
//            {
//                "featureType": "poi.park",
//                "elementType": "geometry",
//                "stylers": [
//                    {
//                        "color": "#e5e5e5"
//                    }
//                ]
//            },
//            {
//                "featureType": "poi.park",
//                "elementType": "labels.text.fill",
//                "stylers": [
//                    {
//                        "color": "#9e9e9e"
//                    }
//                ]
//            },
//            {
//                "featureType": "road",
//                "elementType": "geometry",
//                "stylers": [
//                    {
//                        "color": "#ffffff"
//                    }
//                ]
//            },
        {
            "featureType": "road",
            "elementType": "labels.icon",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
//             {
//                 "featureType": "road.arterial",
//                 "stylers": [
//                     {
//                         "visibility": "off"
//                     }
//                 ]
//             },
//            {
//                "featureType": "road.arterial",
//                "elementType": "labels.text.fill",
//                "stylers": [
//                    {
//                        "color": "#757575"
//                    }
//                ]
//            },
//            {
//                "featureType": "road.highway",
//                "elementType": "geometry",
//                "stylers": [
//                    {
//                        "color": "#dadada"
//                    }
//                ]
//            },
//             {
//                 "featureType": "road.highway",
//                 "elementType": "labels",
//                 "stylers": [
//                     {
//                         "visibility": "off"
//                     }
//                 ]
//             },
//            {
//                "featureType": "road.highway",
//                "elementType": "labels.text.fill",
//                "stylers": [
//                    {
//                        "color": "#616161"
//                    }
//                ]
//            },
//             {
//                 "featureType": "road.local",
//                 "stylers": [
//                     {
//                         "visibility": "off"
//                     }
//                 ]
//             },
//             {
//                 "featureType": "road.local",
//                 "elementType": "labels",
//                 "stylers": [
//                     {
//                         "visibility": "off"
//                     }
//                 ]
//             },
//            {
//                "featureType": "road.local",
//                "elementType": "labels.text.fill",
//                "stylers": [
//                    {
//                        "color": "#9e9e9e"
//                    }
//                ]
//            },
        {
            "featureType": "transit",
            "stylers": [
                {
                    "visibility": "off"
                }
            ]
        },
//            {
//                "featureType": "transit.line",
//                "elementType": "geometry",
//                "stylers": [
//                    {
//                        "color": "#e5e5e5"
//                    }
//                ]
//            },
//            {
//                "featureType": "transit.station",
//                "elementType": "geometry",
//                "stylers": [
//                    {
//                        "color": "#eeeeee"
//                    }
//                ]
//            },
//            {
//                "featureType": "water",
//                "elementType": "geometry",
//                "stylers": [
//                    {
//                        "color": "#c9c9c9"
//                    }
//                ]
//            },
//            {
//                "featureType": "water",
//                "elementType": "labels.text.fill",
//                "stylers": [
//                    {
//                        "color": "#9e9e9e"
//                    }
//                ]
//            }

    ]

    var myOptions = {
        zoom: 10,
        center: latlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        disableDefaultUI: true,
        styles: styles,
    };


    var mapEvent = new google.maps.Map(document.getElementById('mapEvent'), {
        scrollwheel: false,
//            icon: image,
        styles: myOptions
    });

    mapEvent = new google.maps.Map(document.getElementById("mapEvent"), myOptions);

    var marker = new google.maps.Marker({
        position: latlng,
        map: mapEvent,
//            icon: image,
        optimized: false
    });

    marker.addListener('click', function () {
        infowindow.open(mapEvent, marker);
    });


}

window.onload = function () {
    var body = jQuery('body');
    if (body.hasClass('page-contact-us')) {
        initMap();
    }
};;
