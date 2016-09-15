(function() {
    'use strict';

    angular
    .module('discGolfMap')
    .controller('mapController',
    ['$scope', 'mapService',
    function ($scope, mapService) {
        mapService.init({
            //FIXME what props?
        });
        $scope.features = mapService.getFeatures();
    }]);
})();