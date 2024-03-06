const mongoose = require("mongoose");

const merchSchema = mongoose.Schema({
  brand: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  addedAt: {
    type: Date,
    required: true,
  }
});

const Merch = mongoose.model("Merch", merchSchema);
module.exports = Merch;
