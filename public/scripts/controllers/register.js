'use strict';

angular.module('psJwtApp').controller('RegisterCtrl', 
	function (API_URL, $scope, $http, authToken, alert, $state) {
	$scope.submit = function () {
		var url = API_URL + "/register";
		var user = {
			firstName: $scope.firstName,
			lastName: $scope.lastName,
			email: $scope.email,
			password: $scope.password
		};
		console.log(user);
		$http.post(url, user)
		     .success(function(result){
		    	authToken.setToken(result.token);
		    	authToken.setSlug(result.user_slug);
		    	$state.go('main');
		     })
		     .error(function(err){
		     	alert("danger", "error", err.message);
		     });
	};
});