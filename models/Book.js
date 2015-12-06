var mongoose = require("mongoose");

var bookSchema = mongoose.Schema({
	bookTitle: {type: String, required: true},
	bookImage: {type: mongoose.Schema.Types.ObjectId},
	user: String,
	created_at: {type: Date, default: Date.now}
});
var Book = mongoose.model("Book", bookSchema);

Book.getAll = function (cb, limit) {
	Book.find(cb).limit(limit).osrt([['created_at', 'ascending']])
};
Book.getById = function(id, cb){
	Book.findById(id, cb);
};
Book.add = function(Book_obj, cb){
	Book.create(Book_obj, cb);
};
Book.update = function(id, update_obj, options, cb){
	var query = {_id: id};
	Book.findOneAndUpdate(query, update_obj, options, cb);
};
Book.remove = function(id, cb){
	Book.findOneAndRemove(id, cb);
};
