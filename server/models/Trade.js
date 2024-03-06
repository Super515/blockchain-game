const mongoose = require("mongoose");

const tradeSchema = mongoose.Schema({
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
    amount: {
        type: Number,
        required: true,
    },
    transactionId: {
        type: String,
        required: true,
    },
    soldAt: {
        type: Date,
        required: true,
    },
    trackNumber: {
        type: String,
    },
    deliveryAt: {
        type: Date
    },
    completed: {
        type: Number,
        required: true,
    }
});

const Trade = mongoose.model("Trade", tradeSchema);
module.exports = Trade;
