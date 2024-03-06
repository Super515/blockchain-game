const mongoose = require("mongoose");

const sizeSchema = mongoose.Schema({
  colorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  merchPrice: [
    {
      currency: {
        type: String,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
      token: {
        type: String,
        required: true,
      },
    },
  ],
  amount: {
    type: Number,
    required: false,
  }
});

const Size = mongoose.model("Size", sizeSchema);
module.exports = Size;
