const mongoose = require("mongoose");

const colorSchema = mongoose.Schema({
  merchId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  imageUrl: [
    {
      type: String,
      required: true,
    },
  ]
});

const Color = mongoose.model("Color", colorSchema);
module.exports = Color;
