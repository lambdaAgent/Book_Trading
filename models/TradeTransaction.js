// This Form is used to track the trade transaction
// the form will be auto filled by the system, 
// the form will record one book to one book transaction
// when the transaction happen, this form will be created twice, for both user
var mongoose = require("mongoose");

var tradeSchema = mongoose.Schema({
	//pending, accept, false
	User: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
	bookToTrade: {type: mongoose.Schema.Types.ObjectId, ref:"Book"},
	userTradedWith: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
	bookTradedWith:{type: mongoose.Schema.Types.ObjectId, ref:"Book"},
	trade_at: Date,
	created_at: {type:Date, default: Date.now}
});

mongoose.model("TradeTransaction", tradeSchema);
