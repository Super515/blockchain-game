const { handleAsync } = require("../helpers/handleAsync");
const NFT = require("../models/NFT");

const saveNFT = handleAsync(async (req, res) => {
  var {
    title,
    titleLink,
    ticketPrice,
    portValue,
    imageUrl,
    endTime,
    startTime,
  } = req.body;
  if (
    !title ||
    !titleLink ||
    !ticketPrice ||
    !portValue ||
    !endTime ||
    !startTime ||
    !imageUrl
  )
    return res.status(400).json({
      message: "All fields are required",
      fields: [
        "title",
        "titleLink",
        "ticketPrice",
        "portValue",
        "endTime",
        "startTime",
        "imageUrl",
      ],
      data: [],
    });

  if (new Date(endTime).getTime() < new Date(startTime).getTime())
    return res
      .status(400)
      .json({ message: "Start Time should be smaller than endDate", data: [] });

  const nft = new NFT({
    title,
    titleLink,
    ticketPrice,
    portValue,
    endTime,
    startTime,
    imageUrl,
  });
  const savedNFT = await nft.save();
  if (savedNFT) return res.status(201).json({ message: "Success", data: [] });
  return res.status(400).json({ message: "Invalid Request", data: [] });
});

const getAllNFTs = handleAsync(async (req, res) => {
  const nfts = await NFT.find().sort("endTime");
  // .skip(1)
  if (nfts) return res.status(200).json({ message: "Success", data: nfts });
});

const getAllFeaturedNFT = handleAsync(async (req, res) => {
  const nfts = await NFT.find().sort("endTime").limit(1);

  if (nfts) return res.status(200).json({ message: "Success", data: nfts[0] });
});

const getNFTById = handleAsync(async (req, res) => {
  const _id = req.params.id;
  const nft = await NFT.findOne({ _id });
  if (nft) return res.status(200).json({ message: "Success", data: nft });
  else return res.status(404).json({ message: "Fail", data: [] });
});

const removeNFTById = handleAsync(async (req, res) => {
  const { id } = req.params;

  const nftExists = await NFT.findById(id);
  if (!nftExists)
    return res.status(400).json({
      message: "Could'nt find any NFT associated with this id",
      data: [],
    });

  NFT.findOneAndDelete({ _id: id }, (err, result) => {
    if (err) {
      return res.status(400).json({ message: "Invalid Request", data: [] });
    } else {
      return res
        .status(200)
        .json({ message: "Success", data: [] });
    }
  });
});

const clearDB = handleAsync(async (req, res) => {
  const nfts = await NFT.deleteMany({});
  if (nfts) return res.status(200).json({ message: "Success", data: [] });
});

module.exports = {
  saveNFT,
  removeNFTById,
  getAllNFTs,
  getAllNFTs,
  clearDB,
  getAllFeaturedNFT,
  getNFTById,
};
