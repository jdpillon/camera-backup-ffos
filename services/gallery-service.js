angular.module('uploadApp')
    .factory('Gallery', function($window, $q) {
	return {		
	getDeviceMedia: function() {
	    var deferred = $q.defer();	
	    var photos = [];	
	    var files = $window.navigator.getDeviceStorage('pictures');
	    //for testing purpose, use gaia folder as a storage folder
	    var cursor = files.enumerate();
	    console.log(cursor);
		cursor.onsuccess = function() {
		    if (this.done) {
			console.log("done");
			photos.forEach(function(photo) {
			    photo.src = $window.URL.createObjectURL(photo);
			    photo.onServer = false;
			});
			deferred.resolve(photos);
		    }
		    else {
			console.log(this.result);
			photos.push(this.result);
			this.continue();
		    }
		};

		cursor.onerror = function() {
		    deferred.reject("Error browsing the file system.");
		};
		return deferred.promise;
	    },
	    // this needs a refactor! perhaps with Underscore?
	    getMediaList: function(xml) {
		var parser = new DOMParser();
		var doc = parser.parseFromString(xml, "text/html");
		var result = [];
		var strippedArray = [];
		var links = doc.links;
		var imagePattern = new RegExp(".*(png|gif|jpg|jpeg|bmp)");
		for (var i=0; i<links.length; i++) {
		    match = links[i].getAttribute("href").match(imagePattern);
		    // strip to filename before pushing to array
		    if (match) { // probably unsafe
			result.push(decodeURIComponent(match[0].replace(/^.*(\\|\/|\:)/, '')));
		    }
		}
		strippedArray = result.filter(function(elem, pos) {
		    return result.indexOf(elem) == pos;
		});
		return strippedArray;
	    },
	    findNewElements: function (newArray, oldArray) {
		return newArray.filter(function(x) {
		    return (oldArray.indexOf(x) < 0);
		});
	    }
	};
    });
