angular.module('uploadApp')
    .factory('Auth', function($window, $q, $rootScope) {
	var db = null;

	function init() {
	    var deferred = $q.defer();
	    var request = $window.indexedDB.open("oCStore", 1.0);
	    
	    request.onerror = function(e) {
		console.log("Error opening IndexedDB");
		console.dir(e);
		deferred.reject(e.toString());
	    };

	    // The database did not previously exist, so create object stores and indexes
	    request.onupgradeneeded = function() {
		db = request.result;
		var store = db.createObjectStore("auth", {keyPath: "id"});
		console.log("successfully created objectStore");
	    };

	    request.onsuccess = function(event) {
		$rootScope.$apply(function() {
		    db = event.target.result;
		    deferred.resolve(true);
		});
	    };
	    return deferred.promise;
	}
	
	function store(credentials) {
	    var deferred = $q.defer();
	    if(db === null){
		deferred.reject("IndexedDB is not currently open.");
	    }
	    credentials.id = 0;
	    var tx = db.transaction("auth", "readwrite");
	    var objectStore = tx.objectStore("auth");
	    var request = objectStore.put(credentials);
	    request.onsuccess = function(e) {
		deferred.resolve(true);
	    };
	    request.onerror = function() {
		deferred.reject(request.error);
	    };
	    tx.onabort = function() {
		deferred.reject(tx.error);
	    };
	    return deferred.promise;
	}

	function retrieve() {
	    var deferred = $q.defer();
	    var tx = db.transaction("auth", "readonly");
	    var store = tx.objectStore("auth");

	    var request = store.openCursor();
	    request.onsuccess = function() {
		var cursor = request.result;
		var authObjs = [];
		if (cursor) {
		    // This returns a cursor result; we will want the "value"
		    authObjs.push(this.result.value);
		    $rootScope.$apply(function () {
			deferred.resolve(authObjs[0]);
		    });
		}
		else {
		    deferred.reject();
		}
	    };
	    return deferred.promise;
	}
    
	function encodeBasic() {
	    var deferred = $q.defer();
	    retrieve().then(function (credentials) {
		deferred.resolve("Basic " + $window.btoa(credentials.username+":"+credentials.password));
	    }, function(error) {
		deferred.reject(error);
	    });
	    return deferred.promise;
	}
	return {
	    encodeBasic: encodeBasic,
	    store: store,
	    retrieve: retrieve,
	    init: init
	};
    });
