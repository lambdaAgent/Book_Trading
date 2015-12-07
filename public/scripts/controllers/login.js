'use strict';

angular.module('psJwtApp').controller('LoginCtrl', 
	function ($scope, alert, authToken, $http, API_URL, $state, $window, auth) {
	$scope.submit = function () {
		var url = API_URL + "/login";
		var user = {
			email: $scope.email,
			password: $scope.password
		}
		$http.post(url, user)
		    .success(function(res){
		    	authToken.setToken(res.token);
		    	authToken.setSlug(res.user_slug);
		    	authToken.setUserName(res.user_name);
				$state.go('main');
		    }).error(function(err){
		    	alert("danger", "message", err.message)
		    })

	}

	$scope.googleAuth = function(){
		auth.googleAuth().then(function (res) {
			alert('success', 'Welcome', 'Thanks for coming back ' + res.user.displayName + '!');
		}, handleError);
	}
	$scope.facebookAuth = function(){
		auth.facebookAuth().then(function (res) {
			alert('success', 'Welcome', 'Thanks for coming back ' + res.user.displayName + '!');
		}, handleError);
	}
		function handleError(err){
		alert("warning", "Something went wrong", err.message);
	}
});