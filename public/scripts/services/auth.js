'use strict';

angular.module('psJwtApp').service('auth', function auth($http, API_URL, authToken, $state, $window, $q) {

	function authSuccessful(res) {
		//show loading screen
		authToken.setToken(res.token);
		$state.go('main');
	}

	var urlBuilder = [];
	var clientId = '823250290560-vc2dt216dtnkmj7kjrb2r5fc22g8ibg4.apps.googleusercontent.com';
	var urlBuilder = [];
	urlBuilder.push( 'response_type=code',
		'client_id=' + clientId,
		'redirect_uri=' + window.location.origin,
		'scope=profile+email')

	this.googleAuth = function () {
		var url = "https://accounts.google.com/o/oauth2/auth?" + urlBuilder.join("&");

		var options = 'width=500,height=500,left=' + ($window.outerWidth - 500) / 2 + ',top=' + ($window.outerHeight - 500) / 2.5;

		var deferred = $q.defer();

		var popup = $window.open(url, '', options);
		$window.focus();

		$window.addEventListener('message', function (event) {
			if (event.origin === $window.location.origin) {
				var code = event.data;
				popup.close();

				$http.post(API_URL + '/auth/google', {
					code: code,
					clientId: clientId,
					redirectUri: window.location.origin
				}).success(function (jwt) {
					authSuccessful(jwt);
					deferred.resolve(jwt);
				});
			}
		});

		return deferred.promise;
	}

	this.facebookAuth = function () {
		var url = "https://accounts.google.com/o/oauth2/auth?" + urlBuilder.join("&");

		var options = 'width=500,height=500,left=' + ($window.outerWidth - 500) / 2 + ',top=' + ($window.outerHeight - 500) / 2.5;

		var deferred = $q.defer();

		var popup = $window.open(url, '', options);
		$window.focus();

		$window.addEventListener('message', function (event) {
			if (event.origin === $window.location.origin) {
				var code = event.data;
				popup.close();

				$http.post(API_URL + '/auth/google', {
					code: code,
					clientId: clientId,
					redirectUri: window.location.origin
				}).success(function (jwt) {
					authSuccessful(jwt);
					deferred.resolve(jwt);
				});
			}
		});

		return deferred.promise;
	}
});