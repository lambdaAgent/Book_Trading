/*
 *   IMPORTANT: after the book being traded, reset all the isTransferListed to false
 */

"use strict";
angular.module('psJwtApp')
	.controller('BookDetailCtrl', 
		function ($scope, $http, API_URL, alert, authToken, $state, $timeout, $stateParams) {
		var unfilteredAllBooks;
		$scope.getOneBook = function(book_id){
			$http.get(API_URL + "/book/" + book_id)
			  .success(function(data){
			  	$scope.bookToGet = data;
			  })
			  .error(function(err){
			  	 //return alert("danger", "could not get the book" + err.message);
			  })
		};
		$scope.getOneBook($stateParams.book_id);

		$scope.getAllMyBooks = function(){
			$scope.whichBook = 'tradeWith';
			var user_slug = authToken.getSlug();
			$http.get(API_URL + "/user/" + user_slug + "/books")
			 .success(function(books){
			 	$scope.modalBooks = books;
				//alert("success", "successfully get My Books");
			 })
			 .error(function(err){
			 	alert('danger', 'Sorry',  err + '!');
			 });
		};
		$scope.getListedBook = function(){
			$scope.whichBook = 'getThis';
			var userName = authToken.getUserName()
			$http.get(API_URL + "/books").success(function(data){
				var filteredbook = data.filter(function(book){
					return (book.userName !== userName && book.tradeListed === true)
				});
				console.log(filteredbook);
				$scope.modalBooks = filteredbook;
				unfilteredAllBooks = data;
			}).error(function(err){
				alert('danger', 'Sorry', err.message + '!');
			});
		}

		$scope.putBook = function(book){
			if ($scope.whichBook === "getThis"){
				$scope.bookToGet = book;
			}else if ($scope.whichBook === 'tradeWith'){
				$scope.bookToGive = book;
			}
			var modal = angular.element(document.getElementById("myModal"));
			modal.modal('hide');
		};

		$scope.tradeBook = function(bookToGet, bookToGive){
			var userName = authToken.getUserName();
			if(!bookToGive){
				return alert("danger", "Please select your book to trade for");
			}
			if(bookToGet.userName === userName ){
			  	$scope.bookToGive = "";
			  	$scope.bookToGet = "";
				return alert("danger", "You cannot trade with your own books");
			}
			//check if both book belongs to same user
			$http.post(API_URL + "/trade/"+ bookToGet.user +'/' + bookToGet._id + "/" + bookToGet.bookImage + 
				"/With/" + authToken.getSlug() + "/" + bookToGive._id + "/" + bookToGive.bookImage)
			  .success(function(newBook){
			  	$scope.bookToGive = "";
			  	$scope.bookToGet = "";
			  	return alert("success", "successfully trade books")
			  })
			  .error(function(err){
			  	alert("danger",  err)
			  })
		}
	});