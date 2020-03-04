const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TradeSchema = new Schema({
  fromAddress: { type: String, required: true },
  toAddress: { type: String, required: true },
  tradeIndex: { type: Number, required: true }
});

const Trade = mongoose.model('trade', TradeSchema);

module.exports = Trade;