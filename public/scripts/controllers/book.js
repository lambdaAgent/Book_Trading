'use strict';

angular.module('psJwtApp')
	.controller('BookCtrl', function ($scope, $http, API_URL, alert, authToken, $state, $timeout) {
		$scope.test = function(){
			console.log("CHANGED")
		}
		$scope.getAllBooks = function(){
			$http.get(API_URL + "/books").success(function(data){
				$scope.allBooks = data;
				alert("success", "successfully get Books");
			}).error(function(err){
				alert('danger', 'Sorry', err.message + '!');
			});
		};
		
		$scope.getMyBooks = function(){
			var user_slug = authToken.getSlug();
			$http.get(API_URL + "/user/" + user_slug + "/books")
			 .success(function(books){
			 	$scope.books = books;
				alert("success", "successfully get My Books");
			 })
			 .error(function(err){
			 	alert('danger', 'Sorry',  err + '!');
			 });
		};

		$scope.tradeListed = function(id, index){
			var user_slug = authToken.getSlug();
			$http.post(API_URL + "/book/tradeListed/" + id)
			  .success(function(book){
			  	    $scope.books[index].tradeListed = book.tradeListed;
			  })
			  .error(function(err){
     			 	alert('danger', 'Sorry',  "Cannot listed this book" + '!');
			  })
		};	
		// $scope.getOne = function(id){
		// 	$scope.whichView = 'getOnePoll';
		// 	$http.get(API_URL+"/vote/" + id).success(function(data) {
		// 		$scope.oneVote = data;
		// 		$scope.totalVotes = data.voteChoices.map(function(item){
		// 			return item.vote;
		// 		}).reduce(function(prev,next){
		// 			return prev + next;
		// 		});
		// 		data.voteChoices.map(function(item){
		// 			var result = ($scope.totalVotes > 0) ? (item.vote/$scope.totalVotes).toFixed(2) * 100 : 0
		// 			item.votePercentage = result.toFixed(2);
		// 		});
		// 	}).error(function(err){
	
		// 		alert('danger', 'Sorry',  err.message + '!');
		// 	})
		// };
		$scope.moreOptions = function() {
			var options = angular.element(document.getElementById("options-field"));
			var list = '<input type="text" id="options1" class="form-control" placeholder="next options" ng-model="options'+ i + '">';
			var i = 3;
			options.append(list);
			i++;
		};
		$scope.delete = function(id) {
			$http.delete(API_URL+"/book/"+ id + "/" + authToken.getSlug()) 
			.success(function(){
				alert('warning', "deleted" + '!');
           		$state.go('.', {}, { reload: true });
			}).error(function(err){
				alert('danger', 'Sorry',  err + '!');
			});
		};

		$scope.submitBook = function(){
			var bookTitle = angular.element(document.getElementById("bookTitle"))[0].value;
			var bookFile = angular.element(document.getElementById("uploadImage"))[0];
			var bookImage = bookFile.files[0];

			if (bookTitle === "" || !bookTitle){
				return alert("warning", "Sorry", "Please fill book title");
			}
			if (!bookImage){
				return alert("warning", "Sorry", "Please select book cover");				
			}

			var bookImageSize = bookImage.size;
			var bookImageType = bookImage.type;
			var imageWidth = 0;
			var imageHeight = 0;

			var img = new Image();
			var _URL = window.URL || window.webkitURL;
			img.src = _URL.createObjectURL(bookImage);

			img.onload = function(){
				imageWidth = img.width
				imageHeight = img.height
			}

			if (bookImageType.indexOf("image") === -1){
				return alert("warning", "Sorry", "Please make sure to upload image file")
			}
			if (bookImageSize > 250000  || imageWidth > 500 || imageHeight > 500){
				return alert("warning", "Sorry", "image must be lest than 250kb nor bigger than 500 x 500");
			}
			var fd = new FormData();
			fd.append("file", bookImage);

			var user_slug = authToken.getSlug();
			$http({ 
				method: 'POST',
                url: API_URL + "/upload/" + user_slug,
                data: fd,
                headers: {
                        'Content-Type': undefined
                }
            }).success(function(bookImage){
	        	var book = {
					bookTitle: bookTitle,
					bookImage: bookImage._id
				};
			    $http.post(API_URL+"/book/user/" + user_slug, book)
				.success(function(data){
						$scope.bookImage = data.bookImage;
						alert("success", "successfully added your book");
	            		$state.go('books', {}, { reload: true });
					$timeout(function(){
	            		$state.go('myBook', {}, { reload: true });
					},10);					
        		})
				.error(function(err){
						alert('danger', 'Sorry',  err.message + '!');
				});
	        }).error(function(err){
				alert('danger', 'Sorry',  err.responseText + '!');
			});		
		};

	
	});