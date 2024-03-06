const mongoose = require("mongoose");

const currencySchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  }
});

const Currency = mongoose.model("Currency", currencySchema);
module.exports = Currency;
