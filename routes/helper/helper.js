var jwt = require("jwt-simple");
var EMAIL_SECRET = process.env.EMAIL_SECRET;
var events = require('events');
var eventEmitter = new events.EventEmitter();
var mongoose = require("mongoose");
var createSendToken = function  (req,res, user, next) {
	var payload = {
		iss: req.hostname, 
		sub: user.id
	};
	var user_slug = user.slug;
	var token = jwt.encode(payload, EMAIL_SECRET);
	res.status(200).send({
		user_slug: user_slug,
		token: token,
		user_name: user.userName
	});
	next();
}


var authenticateJWT = function(req,res, next){
	if(!req.headers.authorization) return res.status(401).send({ message: "You are not authorized"});
	
	var token = req.headers.authorization.split(' ')[1];
	var payload = jwt.decode(token, EMAIL_SECRET);
	if(!payload.sub){
		return res.status(401).send({
			message: "Authentication failed"
		});
	}
	if(!req.headers.authorization){
		return res.status(401).send({
			message: "You are not authorized"
		});
	}
	next();
}

var getImageGridFs = function(req, res, gfs, bookImage_id, next){
		gfs.files.find({ 
			_id: bookImage_id 
		}).toArray(function (err, files) {
 			if(err) { return next(err);	}
	 	    if(files.length === 0) return next({ message: 'File not found' });
	 	 	var readstream = gfs.createReadStream({
				  filename: files[0].filename
			});
	 
		    readstream.on('data', function(data) {
		    	var base64Image = new Buffer(data, 'binary').toString("base64");
		    	//nextTo loopBookAndImage(err, base64Image);
		    	next(undefined, base64Image);
		    });

			readstream.on('error', function (err) {
			  console.log('AN ERROR OCCURED!');
			  res.send(err);
			});
		});//toArray
}

var loopBookAndImage = function(req,res, Books, gfs, book_arr, next){
	Books.map(function(book, index){
		if(book.bookImage){
			getImageGridFs(req,res, gfs, book.bookImage, function(err, base64Image){
				book_arr.push({
					bookTitle: book.bookTitle,
					bookImage: book.bookImage,
					bookImageBase64: base64Image,
					created_at: book.created_at,
					tradeListed: book.tradeListed,
					userName: book.userName,
					user: book.user,
					_id: book._id
				});
				if(book_arr.length === Books.length) { eventEmitter.emit("bookImageDone"); }
			});
		} else {
			book_arr.push({	bookTitle: book.bookTitle });
			if(book_arr.length === Books.length) { eventEmitter.emit("bookImageDone"); }
		}
	});
	eventEmitter.once("bookImageDone", function(){
		next();	
	});	
}

var createImageBook = function(req, res, gfs, user, part, next){
	if(!part) return next("Please select book cover");
	var writeStream = gfs.createWriteStream({
			filename: part.name,
			belong_to:"hello",
			user: user._id,
			mode: "w",
			content_type: part.mimetype
		});
		writeStream.on('close', function(bookImage) {
			// the first argument is error, to match the pattern.
			// one argument === error, which is managed by if(!part) above
			next(undefined, bookImage);
 		});	  		
    writeStream.write(part.data);
    writeStream.end();//close write stream
};

var swapBooksOwnership = function(req, res, Book, User, bookTradeFor_id, bookTradeWith_id, userTradeFor, my_user, next){
	Book.update(
		bookTradeFor_id,
		{
			$set: {
				//tradeListed: false,
				user: my_user._id,
				userName: my_user.userName
			}
		},
		function(err, newBookTradeFor){
			if(err) return res.status(400).send(err);
			Book.update(
				bookTradeWith_id,
				{
					$set: {
						//tradeListed: false, 
						user: userTradeFor._id,
						userName: userTradeFor.userName,
					}
				},
				function(err, newBookTradeWith){
					var newBook = {
						newBook1: newBookTradeFor,
						newBook2: newBookTradeWith
					}
					if(err) return res.status(400).send(err);
					next(undefined, newBook);
				});
	});
};

//mongodb cannot $push and $pull at the same time!!! sucks
var swapUserTradeBook = function(req, res, Book, User, bookTradeFor_id, bookTradeWith_id, userTradeFor, my_user, next){
	User.update(userTradeFor._id, { $push: {book: bookTradeWith_id} }, function(){
		User.update(userTradeFor._id, {	$pull: {book: bookTradeFor_id }	}, function(err, newUserTradeFor){
		//end of push and pull
		if(err) return res.status(400).send({"message": "Cannot update the user"});
		User.update(my_user._id, { $push: {book: bookTradeFor_id } }, function(){
			User.update(my_user._id, { $pull: {book: bookTradeWith_id }	}, function(err, newMy_user){
			//end of push and pull
			if(err) return res.status(400).send({"message": "Cannot update the user"});
			next();
		});
		});
	});
	});
};

module.exports = {
	swapUserTradeBook: swapUserTradeBook,
	swapBooksOwnership: swapBooksOwnership,
	createImageBook: createImageBook,
	loopBookAndImage: loopBookAndImage,
	getImageGridFs: getImageGridFs,
	createSendToken: createSendToken,
	authenticateJWT: authenticateJWT
}


// var getImageGridFs = function(req, res, gfs, bookImage_id, next){

// 		gfs.files.find({ 
// 			_id: bookImage_id 
// 		}).toArray(function (err, files) {
 
// 	 	    if(files.length === 0) return res.status(400).send({ message: 'File not found' });
	 	    
// 	 	    //res.writeHead(200, {'Content-Type': files[0].contentType});
			
// 			var readstream = gfs.createReadStream({
// 				  filename: files[0].filename
// 			});
	 
// 		    readstream.on('data', function(data) {
// 		  //   	Book.getById(book_id, function(err, Book){
// 		  //   		var book_obj = {
// 		  //   			bookImage: data,
// 		  //   			bookTitle: book.bookTitle
// 		  //   		};
// 				// 	if (err) return res.status(404).send(err); 
// 				// 	res.status(200).json(book_obj);
// 				// });
// 		    	next(data);
// 		    });
		    
// 		    readstream.on('end', function() {
// 		        res.end();        
// 		    });
	 
// 			readstream.on('error', function (err) {
// 			  console.log('An error occurred!', err);
// 			  res.send(err);
// 			});
// 		});//toArray
// }