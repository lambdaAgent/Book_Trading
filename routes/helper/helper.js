var jwt = require("jwt-simple");
var EMAIL_SECRET = process.env.EMAIL_SECRET;
var events = require('events');
var eventEmitter = new events.EventEmitter();

var createSendToken = function  (req,res, user, next) {
	var payload = {
		iss: req.hostname, 
		sub: user.id
	};
	var user_slug = user.slug;
	var token = jwt.encode(payload, EMAIL_SECRET);
	res.status(200).send({
		user_slug: JSON.stringify(user_slug),
		token: token
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
	console.log("GETTING BOOK getImageGridFs")
		gfs.files.find({ 
			_id: bookImage_id 
		}).toArray(function (err, files) {
 			if(err) {
 				console.log("ERROR")
 				console.log(err)
 				return next(err);
 			}
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
			getImageGridFs(req,res, gfs, book.bookImage, function(err, data){
			console.log(err)	
				book_arr.push({
					bookTitle: book.bookTitle,
					bookImageBase64: data,
					created_at: book.created_at,
					_id: book._id
				});
				if(index === (Books.length-1)) { eventEmitter.emit("bookImageDone"); }
			});
		} else {
			book_arr.push({	bookTitle: book.bookTitle });
			if(index === (Books.length-1)) { eventEmitter.emit("bookImageDone"); }
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
			next(undefined, bookImage);
 		});	  		
    writeStream.write(part.data);
    writeStream.end();//close write stream
}

module.exports = {
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