const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  walletAddress: {
      type: String,
      required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  streetName: {
    type: String,
    required: true,
  },
  streetNumber: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
});

const Entry = mongoose.model("User", userSchema);
module.exports = Entry;
