const { handleAsync } = require("../helpers/handleAsync");
const Merch = require("../models/Merch");
const Color = require("../models/Color");
const Size = require("../models/Size");
const Promise = require("bluebird");
const upload = require("./upload");
const Cart = require("../models/Cart");

const addMerch = handleAsync(async (req, res) => {
  try {
    const imageUrl = await upload(req.body.colors[0].file[0]);
    var {
      brand,
      title,
      description,
      colors
    } = req.body;
    if (
      !brand ||
      !title ||
      !description ||
      !imageUrl 
    )
      return res.status(400).json({
        message: "All fields are required",
        fields: [
          "brand",
          "title",
          "description",
          "imageUrl",
        ],
        data: [],
      });
      
    const addedAt = new Date();

    const merch = new Merch({
      brand,
      title,
      description,
      imageUrl,
      addedAt
    });
    const savedMerch = await merch.save();
    if (savedMerch) {
      const merchId = savedMerch._id;

      await Promise.map(colors, async (item) => {
        const imageUrl = await Promise.map(item.file, async file => await upload(file));
        const color = new Color({
          merchId,
          color: item.color,
          imageUrl
        })
    
        const result = await color.save();
        if (result) {
          const colorId = result._id;
          await Promise.map(item.sizes, async (subItem) => {
            const size = new Size({
              colorId,
              size: subItem.size,
              merchPrice: subItem.price,
              amount: subItem.amount,
            })
    
            await size.save();
          })
        }
      });
    }
    if (savedMerch) return res.status(200).json({ message: "Success", data: [] });
    return res.status(400).json({ message: "Invalid Request", data: [] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Sever failed", data: [] });
  }
});

const getAllMerches = handleAsync(async (req, res) => {
  const merches = await Merch.find().sort("addedAt");
  // .skip(1)
  if (merches) return res.status(200).json({ message: "Success", data: merches });
});

const getMerchById = handleAsync(async (req, res) => {
  const _id = req.params.id;
  const merch = await Merch.findOne({ _id });
  const colors = await Color.find({merchId: _id});
  const detailData = await Promise.map(colors, async color => {
    const sizes = await Size.find({colorId: color._id});
    return {
      ...color._doc,
      sizes
    }
  });

  if (merch) return res.status(200).json({ message: "Success", data: {...merch._doc, colors: detailData} });
  else return res.status(404).json({ message: "Fail", data: [] });
});

const removeMerch = handleAsync(async (req, res) => {
  const { id } = req.params;

  const merchExists = await Merch.findById(id);
  if (!merchExists)
    return res.status(400).json({
      message: "Could'nt find any NFT associated with this id",
      data: [],
    });

  await Cart.deleteMany({merchId: id});
  Merch.findOneAndDelete({ _id: id }, (err, result) => {
    if (err) {
      console.log("err", err);
      return res.status(400).json({ message: "Invalid Request", data: [] });
    } else {
      return res
        .status(200)
        .json({ message: "Success", data: [] });
    }
  });
});

const updateMerch = handleAsync(async (req, res) => {
	const { _id, ...data } = req.body;

	const exist = await Merch.findById(_id);
	if (!exist)  
		return res.status(400).json({
			message: "Could'nt find any NFT associated with this id",
			data: [],
		});

	const updateResult = await Merch.findByIdAndUpdate(_id, data);
	if (updateResult) return res.status(200).json({ message: "Success"});
	else return res.status(200).json({ message: "Failed"})
});

module.exports = {
	addMerch,
	getAllMerches,
	getMerchById,
	updateMerch,
	removeMerch
};
