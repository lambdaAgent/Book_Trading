var express = require("express");
var router = express.Router();
var debug = require("debug");
var mongoose = require("mongoose");
var User = mongoose.model("User");
var Book = mongoose.model("Book");
var fs = require("fs");
var Grid = require("gridfs-stream");
Grid.mongo = mongoose.mongo;
var gfs = new Grid(mongoose.connection.db);
var conn = mongoose.connection;
var helper = require("./helper/helper.js");

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
	var slug = JSON.stringify({slug: req.params.user_slug})
	//get the Book number too.
	helper.authenticateJWT(req,res, function(err){
		if (err)  return res.status(404).send(err); 
		User.findOne(slug, function(err, user){
			if (err)  return res.status(404).send(err); 
			var userId = JSON.stringify({user: user._id});
			Book.find(userId, function(err, Books){
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

router.post('/upload/:user_slug', function(req, res) {
	var slug = JSON.stringify({slug: req.params.user_slug});
	//helper.authenticateJWT(req,res, function(err){
		var part = req.files.file;
		User.findOne(slug, function(err ,user){
			if (err)  return res.status(400).send(err); 
			helper.createImageBook(req,res, gfs, user, part, function(err, bookImage){
				if (err)  return res.status(400).send(err); 
				res.status(200).json(bookImage);
			});
		});
	//});
});

router.post('/book/user/:user_slug', function(req, res) {
 	helper.authenticateJWT(req,res, function(err){
	//create the bookImage first then create book with it's ID
	var bookTitle = req.body.bookTitle;
	var	bookImage = req.body.bookImage;
	console.log(bookTitle);
		var Book_obj = {
  			bookTitle: bookTitle,
  			bookImage: bookImage
  		};
		var slug = JSON.stringify({slug: req.params.user_slug})
  		Book.create(Book_obj, function(err, Book_added){
  			if(err) return res.status(401).send(err);
			User.findOneAndUpdate(slug,{$set: {Book:[Book_added]}}, {}, function(err ,user){
 				Book.update(Book_added._id, {$set: {user: user._id}}, {}, function(err, book) {
 					console.log(book);
 					console.log(bookImage);
					if (err)  return res.status(404).send(err); 
 					return res.status(200).json(bookImage);
 				});
 			});
  		});
    
	});
});

router.get("/book/:book_id/:bookImage_id", function(req,res){
	helper.authenticateJWT(req,res, function(err){
		helper.getImageGridFs(req,res, gfs, req.params.bookImage_id, function(data){
				Book.getById(book_id, function(err, Book){
		    		var book_obj = {
		    			bookImage: data,
		    			bookTitle: book.bookTitle
		    		};
					if (err) return res.status(404).send(err); 
					res.status(200).json(book_obj);
				});
		});
    });//helper authenticate
});
//must do deep delete the image book too.
router.delete("/book/:id", function(req,res){
	helper.authenticateJWT(req,res, function(err){
		Book.findById(req.params.id, function(err, book){
			if(err) return res.status(404).send(err);
			gfs.remove({_id: book.bookImage}, function(){
				if(err) return res.status(404).send(err);
				Book.remove(req.params.id, function(err){
					if(err) return res.status(404).send(err);
					res.status(200).send("successfully deleted Book");
				});
			});
		});
    });
});

module.exports = router;

