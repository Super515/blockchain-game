const mongoose = require("mongoose");
const { handleAsync } = require("../helpers/handleAsync");
const Entry = require("../models/Entry");
const NFT = require("../models/NFT");
const web3 = require("@solana/web3.js");
let connection = new web3.Connection(web3.clusterApiUrl("mainnet-beta"));

const saveEntry = handleAsync(async (req, res) => {
  // const { address, id, value, transactionId } = req.body;
  const {
    address,
    id,
    value,
    transactionId,
    type,
  } = req.body;
  const toPubkey = "BVmdx6PdToCmGcSPUaFCXzrzbrSzRrecbAXS7xgREdDq";
  const nftData = await NFT.findOne({ id });
  // console.log(connection);
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
      nftData.ticketPrice.forEach(element => {
        if(info.destination.toLowerCase() === toPubkey.toLowerCase() &&
        info.lamports*0.000000001 == element.price){
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
      nftData.ticketPrice.forEach(element => {
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
  const nft = await NFT.findById(id);
  if (!nft) return res.status(400).json({ message: "Invalid NFT", data: [] });
  const nftEntryExist = await Entry.findOne({ transactionId: transactionId });
  if (nftEntryExist)
    return res.status(400).json({ message: "Invalid Transaction", data: [] });
  

  const entry = new Entry({
    walletAddress: address,
    nftId: id,
    amount: value,
    transactionId,
  });

  const savedEntry = await entry.save();
  if (savedEntry) {
    nft.ticketSolds = nft.ticketSolds + value;
    const updatedNFT = await nft.save();
    if (updatedNFT)
      return res.status(201).json({ message: "Success", data: [] });
  }
  return res.status(400).json({ message: "Invalid Request", data: [] });
});

const getAll = handleAsync(async (req, res) => {
  const { discord, twitter } = req.body;

  if (!discord && !twitter)
    return res
      .status(400)
      .json({ mesage: "All fields are required", data: [] });

  const user = User.findOne({ _id: req.user._id });
  if (twitter) user.twitter = twitter;
  if (discord) user.discord = discord;
  const updatedUser = await user.save();
  if (updatedUser)
    return res.status(200).json({ message: "Success", data: [] });
  return res.status(400).json({ message: "Invalid Request", data: [] });
});

const getMyProjects = handleAsync(async (req, res) => {
  const projects = await User.findOne({ _id: req.user._id })
    .select("+registeredProjects")
    .populate("registeredProjects");
  if (projects)
    return res.status(200).json({ message: "Success", data: projects });
  return res.status(400).json({ message: "Invalid Request", data: [] });
});

const registerToProject = handleAsync(async (req, res) => {
  const { projectId } = req.body;
  const _id = req.user._id;

  const user = await User.findOne({ _id }).select("+registeredProjects");
  //  if project already registered
  const projectAlreadyExists = await user.registeredProjects?.find(
    (i) => i === projectId
  );

  if (projectAlreadyExists)
    return res.status(400).json({
      message: "User have already registered to this project",
      data: [],
    });

  // valid project id
  const validProject = await Project.findOne({ _id: projectId });
  console.log(req.user);
  if (validProject) {
    user.registeredProjects.push(projectId);
    const updatedUser = await user.save();
    if (updatedUser)
      return res.status(200).json({ message: "Success", data: [] });
  }
  return res.status(400).json({ message: "Invalid Request", data: [] });
});

const getMyTickets = handleAsync(async (req, res) => {
  const { walletAddress, nftId } = req.body;
  const myTicket = await Entry.aggregate([
    {
      $match: {
        nftId: new mongoose.Types.ObjectId(nftId),
        walletAddress,
      },
    },
    {
      $group: {
        _id: `$walletAddress`,
        totalTickets: { $sum: "$amount" },
      },
    },
    {
      $project: { _id: 0, totalTickets: 1 },
    },
  ]);
  return res.status(200).json({ message: "Success", data: myTicket[0] });
});

const pickWinner = handleAsync(async (req, res) => {
  const id = req.params.id;
  const entries = await Entry.find({ projectId: id });
  const newArray = entries.map((item) =>
    [...Array(item.amount)].fill(item.walletAddress)
  );
  if (entries && entries.length > 0) {
    const randomAddress = Math.floor(
      0 + Math.random() * (newArray.length - 0 + 1)
    );
    return res
      .status(200)
      .json({ message: "Success", data: newArray.flat()[randomAddress] });
  }

  return res
    .status(400)
    .json({ message: "NFT doesn't have enought entires", data: [] });
});

module.exports = {
  saveEntry,
  pickWinner,
  getMyTickets,
};
