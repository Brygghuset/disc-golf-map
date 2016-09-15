var dgc = (function () {
    'use strict';
    var map,
        locationButton,
        recordButton,
        geolocation,
        isRecording,
        currentLocationOverlay,
        currentTrack, // Current recording
        tracks, // Array of all tracks
        trackFeatures; // Array of all visible tracks

    function init () {
        tracks = []; // FIXME Load previously recorded tracks?!
        trackFeatures = new ol.Collection ();
//            [new ol.Feature (new ol.geom.Point ([1687300, 8238180], "XY")),
//             new ol.Feature (new ol.geom.LineString ([[1687305, 8238185], [1687315, 8238195]], "XY"))]);
        map = new ol.Map ({
            target: 'map',
            layers: [new ol.layer.Tile ({
                        source: new ol.source.OSM ()
                    }),
                    new ol.layer.Vector ({
                        source: new ol.source.Vector ({
                            features : trackFeatures
                        })
                    })],
            view: new ol.View ({
                center: ol.proj.transform([15.15633, 59.26628],
                                          'EPSG:4326', 'EPSG:3857'),
                zoom: 16
            })
        });
        locationButton = document.getElementById ('geolocation');
        locationButton.addEventListener ('click', toggleLocation);

        recordButton = document.getElementById ('record');
        recordButton.addEventListener ('click', toggleRecording);

        geolocation = new ol.Geolocation ({
            projection: map.getView ().getProjection ()
//            trackingOptions: {
//                maximumAge: 10000,
//                enableHighAccuracy: true,
//                timeout: 600000
//            }
        });

        initCurrentLocationMarker ();
        isRecording = false;
    }

    function initCurrentLocationMarker () {
        var markerElement = document.getElementById ('location_marker');
        currentLocationOverlay = new ol.Overlay ({
            positioning : 'center-center',
            element : markerElement,
            stopEvent : false,
            autoPan : true,
            autoPanMargin : 40
        });
        map.addOverlay (currentLocationOverlay);
    }

    function toggleLocation () {
        // FIXME first turn off if ongoing
        fakeLocation ();
        // FIXME change button css
        // FIXME start geolocation if not active
        // FIXME stop geolocation if active
        // FIXME enable record button if location started ok
        // FIXME disable record button if location stopped
    }

    function toggleRecording () {
        // FIXME quick return if location not active
        // FIXME change button css
        isRecording ? stopRecording () : startRecording ();
    }

    function startRecording () {
        currentTrack = new Track (trackFeatures);
//        trackFeatures.extend (currentTrack.getFeatures ());
//        trackFeatures = currentTrack.getFeatures ();
        isRecording = true;
    }

    function stopRecording () {
        isRecording = false;
        //FIXME Need to clone, else will the saved track be the same as all the others (null, by reference)?
        //var clone = JSON.parse (JSON.stringify (currentTrack)); // FIXME Faster eith clone function in Track returning new JSON?
        //tracks.push (clone);
        tracks.push (currentTrack);
        currentTrack = null;
    }

    function fakeLocation () {
        var maxIterations = 100;
        var start = [1687305, 8238185];
        for (var i = 0; i < maxIterations ; i++) {
            var fakeEvent = {
                position : [start[0] + i,
                            start[1] + i * 0.5],
                heading : -Math.PI / 3,
                accuracy : 10 * Math.random ()
            };
            setTimeout (handleNewLocation, i * 1000, fakeEvent);
        }
        setTimeout (window.alert, maxIterations * 1000,
                    "Fake location stopped!");
    }

    function startLocation () {
        geolocation.on ('change', handleNewLocation (event));
    }

    function handleNewLocation (event) {
        var location = new Location (event);
        if (isRecording)
            currentTrack.saveLocation (location);

        displayCurrentLocation (location);
    }

    function displayCurrentLocation (location) {
        map.getView ().rotate (location.heading, location.position);
        currentLocationOverlay.setPosition (location.position);
    }

    function Location (properties) {
        this.position = properties.position;
        this.heading = properties.heading;
        this.accuracy = properties.accuracy;

        // FIXME set method on prototype instead
        this.asFeature = function () {
            return new ol.Feature ({
                geometry : new ol.geom.Point (this.position, "XY")
                // FIXME Set style here? Id?
            });
        };
    };

    function Track (features, trackNumber, defaultDelay) {
        this.trackNumber = trackNumber;
        this.defaultDelay = typeof defaultDelay === 'number' ? defaultDelay : 10;
        this.locations = [];
        this.simplifiedFeature = new ol.Feature ({id : "TEST"});
        features.push (this.simplifiedFeature);

        /*
         * @param location {Location} The new location to save.
         * @param delaySimplified The number of saved locations to wait before
         * computing and displaying the simplified feature.
         */
        this.saveLocation = function (location, delaySimplified) {
            var delay = typeof delay === 'number' ? delaySimplified : this.defaultDelay;
            this.locations.push (location);

            // FIXME filter out duplicate locations (within accuracy buffer)?
            // FIXME style simplified and locations
            // FIXME location points -> LineString?
            features.push (location.asFeature ());

            // FIXME Compute simplified for ongoing recording
            // FIXME Animate using delay and heading
            if ((this.locations.length - delay) >= 2) {
                features.removeAt (1); // Should be the eldest location...
                this.simplifiedFeature.setGeometry (
                    new ol.geom.LineString (
                        [this.locations[0].position,
                         this.locations[this.locations.length - delay - 1].position], "XY"));
            }
        };
    };

    return init;
}) ();
