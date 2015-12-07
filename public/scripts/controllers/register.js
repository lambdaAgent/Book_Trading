'use strict';

angular.module('psJwtApp').controller('RegisterCtrl', 
	function (API_URL, $scope, $http, authToken, alert, $state) {
	$scope.submit = function () {
		if($scope.password_confirm !== $scope.password){
			alert("danger", "password does not match")
		}
		var url = API_URL + "/register";
		var user = {
			userName: $scope.userName,
			email: $scope.email,
			password: $scope.password
		};
		$http.post(url, user)
		     .success(function(result){
		    	authToken.setToken(result.token);
		    	authToken.setSlug(result.user_slug);
		    	authToken.setUserName(result.user_name);
		    	$state.go('main');
		     })
		     .error(function(err){
		     	alert("danger", "error", err.message);
		     });
	};
});