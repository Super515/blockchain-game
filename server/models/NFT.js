const mongoose = require("mongoose");

const nftSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  portValue: {
    type: Number,
    required: true,
  },
  titleLink: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },

  endTime: {
    type: Date,
    required: true,
  },
  startTime: {
    type: Date,
    required: true,
  },
  ticketPrice: [
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
  ticketSolds: {
    type: Number,
    required: true,
    default: 0,
  },
  soldCount: {
    type: Number,
    required: false,
  },
});

const NFT = mongoose.model("NFT", nftSchema);
module.exports = NFT;
