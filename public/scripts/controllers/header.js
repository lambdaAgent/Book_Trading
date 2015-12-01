'use strict';

angular.module('psJwtApp')
	.controller('HeaderCtrl', function ($scope, authToken,$http, alert,API_URL, $window) {
		$scope.isAuthenticated = authToken.isAuthenticated;
		$scope.getPolls = function(){
			$http.get(API_URL + "/votes").success(function(data){
				$scope.allVotes = data;
				// data.map(function(item,index){
				// 	var key = "votes"+String(index);
				// 	$scope.allVotes[key] = item;
				// });	
				// console.log($scope.allVotes);
				alert("success", "successfully get Polls");
			}).error(function(err){
				alert('danger', 'Sorry', err.message + '!');
			});
		};
		
		$scope.getOne = function(id){
			$scope.whichView = 'getOnePoll';
			$http.get(API_URL+"/vote/" + id).success(function(data) {
				$scope.oneVote = data;
				$scope.totalVotes = data.voteChoices.map(function(item){
					return item.vote;
				}).reduce(function(prev,next){
					return prev + next;
				});
				data.voteChoices.map(function(item){
					var result = ($scope.totalVotes > 0) ? (item.vote/$scope.totalVotes).toFixed(2) * 100 : 0
					item.votePercentage = result.toFixed(2);
				});
			}).error(function(err){
				alert('danger', 'Sorry',  err.message + '!');
			})
		};
		$scope.plusOne = function(vote_id, eachOptions_id){
			var cachedVoted = authToken.getVoted();
			var user_vote;
			var isVoted = false;
			if(cachedVoted){
				user_vote = cachedVoted.split(' ');
				user_vote.map(function(item){
					if(item === vote_id){ isVoted = true; }
				});
			} 
			if(isVoted) {
				return alert('danger', 'You have already voted for this poll!');
			}
			$http.put(API_URL+"/vote/" + vote_id + "/options/" + eachOptions_id)
			  .success(function(data){
			  		authToken.setVoted(vote_id);
			  		$scope.getOne(vote_id);
			  }).error(function(err){
				alert('danger', 'Sorry',  err.message + '!');
			});
					
		};
	});

