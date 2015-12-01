
angular.module('psJwtApp')
	.controller('SettingCtrl', function ($scope, authToken, alert, $state, $http, API_URL) {
		$scope.changePassword = function(){
			var user = {
				currentPassword: $scope.current_password,
				newPassword: $scope.new_password,
				user_slug: authToken.getSlug()
			};
			console.log(user);
			$http.post(API_URL+"/changePassword", user).success(function(){
				
				$state.go("main");
			}).error(function(err){
				alert("danger", "failed", err.message);
			});
		}

	});