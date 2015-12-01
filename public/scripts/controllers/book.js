'use strict';

angular.module('psJwtApp')
	.controller('BookCtrl', function ($scope, $http, API_URL, alert, authToken) {
		$scope.getAllBooks = function(){
			$http.get(API_URL + "/books").success(function(data){
				$scope.allBooks = data;
				alert("success", "successfully get Polls");
			}).error(function(err){
				alert('danger', 'Sorry', err.message + '!');
			});
		};
		
		$scope.getMyPolls = function(){
			var user_slug = authToken.getSlug();
			$http.get(API_URL + "/user/" + user_slug + "/votes")
			 .success(function(votes){
			 	$scope.votes = votes;
			 })
			 .error(function(err){
				alert('danger', 'Sorry',  err.message + '!');
			 })
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
		$scope.moreOptions = function() {
			var options = angular.element(document.getElementById("options-field"));
			var list = '<input type="text" id="options1" class="form-control" placeholder="next options" ng-model="options'+ i + '">';
			var i = 3;
			options.append(list);
			i++;
		};
		$scope.delete = function(id) {
			$scope.whichView = 'getMyPolls';
			$http.delete(API_URL+"/vote/"+id).success(function(data){
				console.log(data);
				$scope.getPolls();
			}).error(function(err){
				alert('danger', 'Sorry',  err.message + '!');
			});
		};

		$scope.submitBook = function(){
			var bookTitle = angular.element(document.getElementById("bookTitle"));
			var bookImage = angular.element(document.getElementById("uploadImage"));
			console.log(bookImage);
			var fd = new FormData();
			fd.append("file", bookImage[0].files[0]);

			if (bookTitle === ""){
				alert("warning", "Sorry", "Please fill book title");
				return;
			}
			
			var user_slug = authToken.getSlug();
			$.ajax({
				  url: '/upload',
				  data: fd,
				  processData: false,
				  contentType: false,
				  type: 'POST',
				  success: function(bookImage){
				  	var book = {
						bookTitle: bookTitle[0].value,
						bookImage: bookImage._id
					};
				  	console.log(bookImage);
				    $http.post(API_URL+"/book/user/" + user_slug, book)
					 .success(function(data){
						$scope.bookImage = data.bookImage;
						console.log(data);
						alert("success", "successfully added your book");
					}).error(function(err){
						alert('danger', 'Sorry',  err.message + '!');
					});
				  },
				  error: function(err){

				  }
			});			
		};

	
	});