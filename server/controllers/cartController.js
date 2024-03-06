const mongoose = require("mongoose");
const web3 = require("@solana/web3.js");
let connection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));
const { handleAsync } = require("../helpers/handleAsync");
const Cart = require("../models/Cart");
const Merch = require("../models/Merch");
const Color = require("../models/Color");
const Size = require("../models/Size");
const Trade = require("../models/Trade");
const Promise = require("bluebird");

const getCart = handleAsync(async (req, res) => {
    const { userId } = req.params;

    const cartResult = await Cart.find({userId});
    if (cartResult) {
        const detailResult = await Promise.map(cartResult, async cart => {
            const merch = await Merch.findById(cart.merchId);
            const color = await Color.findById(cart.colorId);
            const size = await Size.findById(cart.sizeId);

            return {
                ...cart._doc,
                title: merch.title,
                description: merch.description,
                imageUrl: color.imageUrl,
                size: size.size,
                totalAmount: size.amount,
                price: size.merchPrice
            }
        });
        return res.status(200).json({ message: "Success", data: detailResult });
    }
    return res.status(400).json({ message: "Invalid Request", data: [] });
});

const getCartNum = handleAsync(async (req, res) => {
    const { userId } = req.body;

    const cartResult = await Cart.find({userId});
    if (cartResult) {
        return res.status(200).json({ message: "Success", data: cartResult.length });
    }
    return res.status(400).json({ message: "Invalid Request", data: [] });
});

const addMerch = handleAsync(async (req, res) => {
    const cart = new Cart(req.body);
    const result = await Cart.findOne({userId: cart.userId, sizeId: cart.sizeId, tokenIndex: cart.tokenIndex});
    let saveCart;
    if (result) {
        let newResult = {...result._doc};
        newResult.amount++;
        saveCart = await Cart.updateOne({_id: result._id}, { $set: {...newResult}});
    } else {
        saveCart = await cart.save();
    }
    if (saveCart) {
        return res.status(200).json({ message: "Success", data: [] });
    }
    return res.status(400).json({ message: "Invalid Request", data: [] });
});

const increaseAmount = handleAsync(async (req, res) => {
    const { _id, amount } = req.body;

    const result = await Cart.findByIdAndUpdate(_id, {$set: { amount }});
    if (result) {
        return res.status(200).json({ message: "Success", data: [] });
    }
    return res.status(400).json({ message: "Invalid Request", data: [] });
});

const removeMerch = handleAsync(async (req, res) => {
    const { sizeId, userId } = req.query;

    const result = await Cart.deleteMany({userId, sizeId});
    if (result) {
        return res.status(200).json({ message: "Success", data: [] });
    }
    return res.status(400).json({ message: "Invalid Request", data: [] });
});

const buyAll = handleAsync(async (req, res) => {
    const { userId, address, transactionId, type, tokenIndex } = req.body;
    const toPubkey = "BVmdx6PdToCmGcSPUaFCXzrzbrSzRrecbAXS7xgREdDq";
    const data = await connection.getParsedTransaction(transactionId);

    if (!data) {
        return res.status(400).json({
          message: "invalid Transaction ID",
        });
    }

    if (type === "Sol") {
        if (data.transaction.message.instructions[0].parsed.info) {
            const info = data.transaction.message.instructions[0].parsed.info;
            let isValid = false;
            merchData.merchPrice.forEach(element => {
                if(info.destination.toLowerCase() === toPubkey.toLowerCase() && info.lamports*0.000000001 == element.price){
                    isValid = true
                }
            });
            if (!isValid) {
              res.status(400).json({ message: "Invalid type of transaction" });
            }
        }
    } else if (type === "spl-token") {
        if (data.transaction.message.instructions[0].parsed.info) {
          const info = data.meta.preTokenBalances;
          const transaction = data.transaction.message.instructions[0].parsed.info;
          let isValid = false;
          merchData.merchPrice.forEach(element => {
            if( info[0].owner.toLowerCase() === toPubkey.toLowerCase() &&
            info[0].mint.toLowerCase() === element.token.toLowerCase() &&
            transaction.tokenAmount.amount*0.000000001 == element.token){
              isValid = true
            }
          })
          if (!isValid){
            res.status(400).json({ message: "Invalid type of transaction" });
          }
        }
      } else {
        res.status(400).json({ message: "Invalid type of transaction" });
      }


    const soldAt = new Date();

    const cartResult = await Cart.find({userId, tokenIndex});
    if (cartResult) {
        await Promise.map(cartResult, async cart => {
            const merch = await Merch.findById(cart.merchId);
            const color = await Color.findById(cart.colorId);
            const size = await Size.findById(cart.sizeId);

            const trade = new Trade({
                walletAddress: address,
                colorId: color._id,
                sizeId: size._id,
                merchId: merch._id,
                userId,
                amount: cart.amount,
                transactionId,
                soldAt,
                completed: 0,
            });

            const savedTrade = await trade.save();
            if (savedTrade) {
                const sizeData = await Size.findById(size._id);
                let newSizeData = {...sizeData};
                newSizeData.amount = newSizeData.amount - cart.amount * 1;
                await Size.updateOne({_id: size._id}, {$set: {...newSizeData}});
                await Cart.findByIdAndRemove(cart._id)
            }
        });
        return res.status(200).json({ message: "Success" });
    }
    return res.status(400).json({ message: "Invalid Request", data: [] });
});

module.exports = {
    getCart,
    addMerch,
    removeMerch,
    buyAll,
    increaseAmount,
    getCartNum
};
