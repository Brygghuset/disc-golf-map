(function() {
    'use strict';

    angular
    .module('discGolfMap')
    .factory('mapService',
    [function() {
        var map, // ol.Map
            trackFeatures, // ol.Collection
            defaults = {
                startPoint: [15.15633, 59.26628]
            };

        // exported public api
        var api = {
            init: init
        };

        return api;

        function init (config) {
            var config = angular.extend(defaults, config);
            trackFeatures = new ol.Collection();
            map = new ol.Map({
                target: 'map',
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.OSM()
                    }),
                    new ol.layer.Vector({
                        features: trackFeatures
                    })
                ],
                view: new ol.View({
                    center: ol.proj.transform(config.startPoint,
                                              'EPSG:4326', 'EPSG:3857'),
                    zoom: 16
                })
            });
        }
    }]);
})();