
angular.module('psJwtApp')
	.controller('SettingCtrl', function ($scope, authToken, alert, $state, $http, API_URL) {
		$scope.changeDetails = function(){
			if (!$scope.first_name || !$scope.last_name || !$scope.street || !$scope.state || !$scope.city){
				return alert("danger", "please fill out all the required field")
			}
			var user = {
				firstName: $scope.first_name,
				lastName: $scope.last_name,
				street: $scope.street,
				state: $scope.state,
				city: $scope.city,
				// currentPassword: $scope.current_password,
				// newPassword: $scope.new_password,
				user_slug: authToken.getSlug()
			};

			$http.post(API_URL+"/changeDetails/" + authToken.getSlug() , user).success(function(){		
           		$state.go('.', {}, { reload: true });
			}).error(function(err){
				alert("danger", "failed", err.message);
			});
		}

	});