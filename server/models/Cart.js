const mongoose = require("mongoose");

const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "user"
    },
    merchId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "merch",
    },
    colorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "color",
    },
    sizeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "size",
    },
    tokenIndex: {
        type: Number,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
});

const Cart = mongoose.model("Cart", cartSchema);
module.exports = Cart;
