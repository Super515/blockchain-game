const mongoose = require("mongoose");

const entrySchema = mongoose.Schema({
  walletAddress: {
    type: String,
    required: true,
  },
  nftId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "nft",
  },
  amount: {
    type: Number,
    required: true,
  },
  transactionId: {
    type: String,
    required: true,
  },
});

const Entry = mongoose.model("Entry", entrySchema);
module.exports = Entry;
