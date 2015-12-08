var express = require("express");
var router = express.Router();
var debug = require("debug");
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Book = mongoose.model("Book");
var TradeForm = mongoose.model("TradeTransaction");
var fs = require("fs");
var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;
var gfs = new Grid(mongoose.connection.db);
var conn = mongoose.connection;
var helper = require("./helper/helper.js");

// if you need to search/update by ID, use find() or update()
// for other need use findOneAndUpdate() or findOne()

router.get('/books', function(req, res){
	Book.find({}, function(err, Books){
		if (err) return res.status(404).send(err); 
		var book_arr = [];
		helper.loopBookAndImage(req,res, Books, gfs, book_arr, function(){
			res.status(200).header("Content-Type", "image/jpeg").json(book_arr);	
		});
	});
		
});

//get all Books by the user only
router.get("/user/:user_slug/books", function(req, res){
	var slug = {"slug": req.params.user_slug};
	//get the Book number too.
	helper.authenticateJWT(req,res, function(err){
		if (err)  return res.status(404).send(err); 
		User.findOne(slug, function(err, user){
			if (err)  return res.status(404).send(err); 
			var userId = JSON.stringify({user: user._id});
			Book.find({user: user._id}, function(err, Books){
				if (err)  return res.status(404).send(err); 
				var book_arr = [];
				helper.loopBookAndImage(req,res, Books, gfs, book_arr, function(err, base64Image){
					if(err) res.status(400).send({ message: 'File not found' });
					res.status(200).header("Content-Type", "image/jpeg").json(book_arr);	
				});
			});
		});
	});
});

/*
 *  getOneBook and it's detail to be traded
 */
router.get("/book/:book_id", function(req,res){
	var book_obj = {}
	helper.authenticateJWT(req,res, function(err){
		helper.getImageGridFs(req,res, gfs, req.params.bookImage_id, function(data){
			Book.getById(req.params.book_id, function(err, book){				
				if (err) return res.status(404).send(err); 
				helper.getImageGridFs(req,res, gfs, book.bookImage, function(err, base64Image){
					if(err) res.status(400).send({ message: 'File not found' });
					var book_obj = {
						bookTitle: book.bookTitle,
						bookImageBase64: base64Image,
						created_at: book.created_at,
						tradeListed: book.tradeListed,
						userName: book.userName,
						user: book.user,
						_id: book._id,
						bookImageBase64: base64Image
					}
					res.status(200).json(book_obj);
				})
			});
		});
    });//helper authenticate
});

/*
 *  trade listed
 */
router.post("/book/tradeListed/:id", function(req, res){
	var bookId = req.params.id;
	var isTraded = false;
 	helper.authenticateJWT(req,res, function(err){
		Book.findById(bookId, function(err, book){
			if(book.tradeListed === false) { isTraded = true; }
			else { isTraded = false; }
			Book.update(book._id, {$set: {tradeListed: isTraded}},{new:true}, function(err, book){
				res.status(200).json(book);
			});
		});
	});		
});

/*
 *  to submit book, post to "/upload/:user_slug", to submit image
 *  and then post to "/book/user/user_slug" to create book and update the imageID
 */
router.post('/upload/:user_slug', function(req, res) {
	var slug = {"slug": req.params.user_slug};
	helper.authenticateJWT(req,res, function(err){
		var part = req.files.file;
		User.findOne(slug, function(err ,user){
			if (err)  return res.status(400).send(err); 
			helper.createImageBook(req,res, gfs, user, part, function(err, bookImage){
				if (err)  return res.status(400).send(err); 
				res.status(200).json(bookImage);
			});
		});
	});
});
router.post('/book/user/:user_slug', function(req, res) {
 	helper.authenticateJWT(req,res, function(err){
	//create the bookImage first then create book with it's ID
	var bookTitle = req.body.bookTitle;
	var	bookImage = req.body.bookImage;
		var Book_obj = {
  			bookTitle: bookTitle,
  			bookImage: bookImage
  		};
		var slug = {"slug": req.params.user_slug};
  		Book.create(Book_obj, function(err, Book_added){
  			if(err) return res.status(401).send(err);
			User.findOneAndUpdate(slug,{$push: {book:Book_added}}, {}, function(err ,user){
				var bookUser = {
					user: user._id, userName: user.userName
				}
 				Book.update(Book_added._id, {$set: bookUser }, {}, function(err, book) {
					if (err)  return res.status(404).send(err); 
 					return res.status(200).json(bookImage);
 				});
 			});
  		});
    
	});
});


//must do deep delete the image book too, and update the user books.
router.delete("/book/:id/:user_slug", function(req,res){
	helper.authenticateJWT(req,res, function(err){
		var slug = {"slug": req.params.user_slug};
		Book.findById(req.params.id, function(err, book){
			if(err) return res.status(404).send(err);
			User.findOneAndUpdate(slug, {$pull : {book: {$in: [book._id]} } }, function(err, user){
				gfs.remove({_id: book.bookImage}, function(err){
					if(err) return res.status(404).send(err);
					book.remove(function(err){
						if(err) return res.status(404).send(err);
						res.status(200).send("successfully deleted Book");
					});
				});
			});
		});
    });
});

/*
 *  swap the book
 *  1. swapBookOwnership
 *  2. swapUser's book, $push and $pull book's id, return 200 and book here
 *  3. create TradeForm, no need to return anything, just fill out the Form
 *  4.
 */
router.post("/trade/:bookToGet_user/:bookToGet_id/:bookToGet_image/With/:user_slug/:bookToGive_id/:bookToGive_image", function(req, res){
	helper.authenticateJWT(req, res,function(err){
		var tradeFor_userId = req.params.tradeFor_user;
		var slug = {"slug": req.params.user_slug};
		User.findOne(slug, function(err, my_user){
			if(err) return res.status(400).send(err);
			User.findById(req.params.bookToGet_user, function(err, userTradeFor){
				if(err) return res.status(400).send(err);
				/*1*/helper.swapBooksOwnership(req, res, Book, User, req.params.bookToGet_id, req.params.bookToGive_id, userTradeFor, my_user, function(err, newBook){
					if(err) return res.status(400).send(err);
					/*2*/helper.swapUserTradeBook(req, res, Book, User, req.params.bookToGet_id, req.params.bookToGive_id, userTradeFor, my_user, function(){
						if(err) return res.status(400).send(err);
						res.status(200).json(newBook);
						/*3 Create tradeForm*/

					});
				});
			});

		
			
 
		});
		// create book based on the details 
		// put the image_id
		// search User by user_slug update $push the book, $pull old book,
		// update the form

		// do the same with the tradee user.
		// don't forget to create form too
	});
});
module.exports = router;

