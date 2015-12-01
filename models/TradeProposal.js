var mongoose = require("mongoose");

var tradeSchema = mongoose.Schema({
	status: {type:String, required: true},
	//pending, accept, false
	bookToTrade: [{type: mongoose.Schema.Types.ObjectId, ref:"Book"}],
	userTradedWith: {type: mongoose.Schema.Types.ObjectId, ref:"User"},
	bookTradedWith:[{type: mongoose.Schema.Types.ObjectId, ref:"Book"}],
	trade_at: Date,
	created_at: {type:Date, default: Date.now}
});

mongoose.model("TradeProposal", tradeSchema);
