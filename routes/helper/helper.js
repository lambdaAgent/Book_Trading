var jwt = require("jwt-simple");
var EMAIL_SECRET = process.env.EMAIL_SECRET;

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

module.exports = {
	createSendToken: createSendToken,
	authenticateJWT: authenticateJWT
}