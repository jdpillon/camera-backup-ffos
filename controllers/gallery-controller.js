angular.module("uploadApp")
    .controller("galleryController", function ($scope, $log, $q, Gallery, webDAV, Auth) {
	$scope.$log = $log;
	$scope.photos = [];

	function bindMedia(storageType) { 
	    var photoStorage = Gallery.getDeviceMedia(storageType);
	    photoStorage.then(function (result) {
		for (var i = 0; i < result.length; ++i) {
		    $scope.photos.push(result[i]);
		}
	    }, function (reason) {
		$log.error('Failed: ' + reason);
	    }, function (update) {
		$log.info('Notification: ' + update);
	    });
	}
	
	$scope.markNewImages = function () {
	    webDAV
		.get(serverURL)
		.then(function (response) {
		    var serverArray = Gallery.getMediaList(response);
		    _.map($scope.photos, function (elt) {
			if (_.contains(serverArray, elt.name)) {
			    elt.onServer = true;
			}
		    });
		});
	};
	$scope.upload = function () {
	    var deferred = $q.defer();
	    var promises = [];

	    function summarize() {
		$log.message("Finished with upload attempts.");
		defer.resolve();
	    }

	    angular.forEach($scope.photos, function(photo) {
		// TODO: rewrite with new Auth API
		/*  promises.push(webDAV.put(Auth.getLocation() + "/photos/" + photo.name,
		    photo)); */
	    });

	    $q.all(promises).then(summarize);
	};
	bindMedia('pictures');
	bindMedia('sdcard');
	//   $scope.markNewImages();
    });
