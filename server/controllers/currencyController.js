const { handleAsync } = require("../helpers/handleAsync");
const Currency = require("../models/Currency");

const addCurrency = handleAsync(async (req, res) => {
  try {
    var { name, address } = req.body;

    const currency = new Currency({
      name, address
    });
    const savedCurrency = await currency.save();
    if (savedCurrency) return res.status(200).json({ message: "Success", data: [] });
    return res.status(400).json({ message: "Invalid Request", data: [] });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Sever failed", data: [] });
  }
});

const getAllCurrencies = handleAsync(async (req, res) => {
  const merches = await Currency.find();
  // .skip(1)
  if (merches) return res.status(200).json({ message: "Success", data: merches });
  else return res.status(400).json({ message: "Invalid Request", data: [] });
});

const removeCurrency = handleAsync(async (req, res) => {
  const { id } = req.params;

  const merchExists = await Currency.findById(id);
    if (!merchExists)
        return res.status(400).json({
            message: "Could'nt find any NFT associated with this id",
            data: [],
        });

    Currency.findOneAndDelete({ _id: id }, (err, result) => {
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

module.exports = {
	getAllCurrencies,
    addCurrency,
    removeCurrency
};
