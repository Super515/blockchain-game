const mongoose = require("mongoose");
const { handleAsync } = require("../helpers/handleAsync");
const Trade = require("../models/Trade");
const Merch = require("../models/Merch");
const Color = require("../models/Color");
const Size = require("../models/Size");
const User = require("../models/User");
const web3 = require("@solana/web3.js");
const Promise = require("bluebird");
let connection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));

const saveTrade = handleAsync(async (req, res) => {
  // const { address, id, value, transactionId } = req.body;
  const {
    address,
    colorId,
    sizeId,
    userId,
    id,
    amount,
    transactionId,
    merchAmount,
    value,
    type,
    fromPubkey,
  } = req.body;
  const toPubkey = "BVmdx6PdToCmGcSPUaFCXzrzbrSzRrecbAXS7xgREdDq";
  const merchData = await Merch.findOne({ _id: id });
  console.log(connection);
  const data = await connection.getParsedTransaction(transactionId);
  // console.log(data);
  if (!data) {
    return res.status(400).json({
      message: "invalid Transaction ID",
    });
  }
  if (type === "sol") {
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

  // res.send({

  //   data,
  // });
  const merch = await Merch.findById(id);
  if (!merch) return res.status(400).json({ message: "Invalid Merch", data: [] });
  const merchTradeExist = await Trade.findOne({ transactionId: transactionId });
  if (merchTradeExist)
    return res.status(400).json({ message: "Invalid Transaction", data: [] });
  
  const soldAt = new Date();
  const trade = new Trade({
    walletAddress: address,
    colorId,
    sizeId,
    merchId: id,
    userId,
    amount: value,
    transactionId,
    soldAt,
    completed: 0,
  });

  const savedTrade = await trade.save();
  if (savedTrade) {
    const sizeData = await Size.findById(sizeId);
    let newSizeData = {...sizeData};
    newSizeData.amount = newSizeData.amount - value * 1;
    const updatedMerch = await Size.updateOne({_id: sizeId}, {$set: {...newSizeData}});
    if (updatedMerch)
      return res.status(201).json({ message: "Success", data: [] });
  }
  return res.status(400).json({ message: "Invalid Request", data: [] });
});

const getAllTrades = handleAsync(async (req, res) => {
  const allTrades = await Trade.find().sort("soldAt");
  if (allTrades) {
    const detailTrades = await Promise.map(allTrades, async trade => {
      const user = await User.findById(trade.userId);
      const merch = await Merch.findById(trade.merchId);
      const color = await Color.findById(trade.colorId);
      const size = await Size.findById(trade.sizeId);
  
      return {
        ...trade._doc,
        firstName: user.firstName,
        lastName: user.lastName,
        title: merch.title,
        country: user.country,
        city: user.city,
        imageUrl: color.imageUrl,
        size: size.size,
        streetName: user.streetName,
        streetNumber: user.streetNumber,
        price: size.merchPrice[0].price,
      }
    })

    return res.status(200).json({ message: "Success", data: detailTrades });
	}
  return res.status(400).json({ message: "Invalid Request", data: [] });
});

const getTradesByUserId = handleAsync(async (req, res) => {
	const { userId } = req.params;
	const trades = await Trade.find({userId}).sort("soldAt");
	if (trades) {
		const detailTrades = await Promise.map(trades, async (trade) => {
			const user = await User.findById(trade.userId);
			const merch = await Merch.findById(trade.merchId);
      const color = await Color.findById(trade.colorId);
      const size = await Size.findById(trade.sizeId);

			return {
				...trade._doc,
				firstName: user.firstName,
				lastName: user.lastName,
				address: user.address,
        title: merch.title,
        imageUrl: color.imageUrl,
        size: size.size,
				price: size.merchPrice[0].price,
			}
		})
		return res.status(200).json({ message: "Success", data: detailTrades });
	}
	return res.status(400).json({ message: "Invalid Request", data: [] });
});

const completeTrade = handleAsync(async (req, res) => {
	const { id } = req.body;

	const result = await Trade.findByIdAndUpdate(id, {completed: 2});
	
	if (result)
		return res.status(200).json({ message: "Success" });
	return res.status(400).json({ message: "Invalid Request" });
});

const deliveryTrade = handleAsync(async (req, res) => {
	const { id, trackNumber } = req.body;
  const deliveryAt = new Date();

	const result = await Trade.findByIdAndUpdate(id, {trackNumber, deliveryAt, completed: 1});
	
	if (result)
		return res.status(200).json({ message: "Success" });
	return res.status(400).json({ message: "Invalid Request" });
});

module.exports = {
  saveTrade,
  getAllTrades,
  getTradesByUserId,
	completeTrade,
  deliveryTrade
};
