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
			res.status(200).json(Books)
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
			Book.find({user: user}, function(err, Books){
				if (err)  return res.status(404).send(err); 
				res.status(200).json(Books);
			})
		});
	})
});

// //get one
// router.get("/book/:id", function(req, res){
// 	//get the Book number too.
// 	//helper.authenticateJWT(req,res, function(err){
// 		// if (err)  return res.status(404).send(err); 
// 		Book.getById(req.params.id, function(err, Book){
// 			if (err)  return res.status(404).send(err); 
// 			res.status(200).json(Book);
// 		});
// 	//})
// });
router.post('/upload', function(req, res) {
	//helper.authenticateJWT(req,res, function(err){
		console.log(req.files);
		var part = req.files.file;
		var writeStream = gfs.createWriteStream({
			filename: part.name,
			mode: "w",
			content_type: part.mimetype
		});
		writeStream.on('close', function(bookImage) {
			//get the bookImage'id and attached here
	  		res.status(200).send(bookImage);
  	    });

	    writeStream.write(part.data);
	    writeStream.end();//close write stream
	//});
});

router.post('/book/user/:user_slug', function(req, res) {
 	helper.authenticateJWT(req,res, function(err){

	//create the bookImage first then create book with it's ID
	var bookTitle = req.body.bookTitle;
	var	bookImage = req.body.bookImage;
	//attach listener, 
		var Book_obj = {
  			bookTitle: bookTitle,
  			bookImage: bookImage
  		};
		var slug = JSON.stringify({slug: req.params.user_slug})
  		Book.create(Book_obj, function(err, Book_added){
  			if(err) return res.status(401).send(err);
			User.findOneAndUpdate(slug,{$set: {Book:[Book_added]}}, {}, function(err ,user){
 				Book.update(Book_added._id, {$set: {user: user._id}}, {}, function(err, Book) {
 					return res.status(200).json(bookImage);
 				});
 			});
  		});
    
	});
});

router.delete("/Book/:id", function(req,res){
	helper.authenticateJWT(req,res, function(err){
		Book.remove(req.params.id, function(err){
			if(err) return res.status(404).send(err);
			res.status(200).send("successfully deleted Book");
		});
    });
});

// exports.read = function(req, res) {
 
// 	gfs.files.find({ filename: req.params.filename }).toArray(function (err, files) {
 
//  	    if(files.length===0){
// 			return res.status(400).send({
// 				message: 'File not found'
// 			});
//  	    }
	
// 		res.writeHead(200, {'Content-Type': files[0].contentType});
		
// 		var readstream = gfs.createReadStream({
// 			  filename: files[0].filename
// 		});
 
// 	    readstream.on('data', function(data) {
// 	        res.write(data);
// 	    });
	    
// 	    readstream.on('end', function() {
// 	        res.end();        
// 	    });
 
// 		readstream.on('error', function (err) {
// 		  console.log('An error occurred!', err);
// 		  throw err;
// 		});
// 	});
 
// };

module.exports = router;

