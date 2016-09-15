(function() {
    'use strict';

    angular
    .module('discGolfMap')
    .controller('MapController',
    ['$scope', 'mapService',
    function ($scope, mapService) {
        mapService.init();
        //$scope.features = mapService.getFeatures();
    }]);
})();