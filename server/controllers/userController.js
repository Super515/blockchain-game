const { handleAsync } = require("../helpers/handleAsync");
const User = require("../models/User");

const getUser = handleAsync(async (req, res) => {
    const { walletAddress } = req.params;
    const user = await User.findOne({ walletAddress });
    
    // .skip(1)
    if (user) {
        const {__v, ...userData } = user._doc;
        return res.status(200).json({ message: "Success", data: userData });
    }
    else return res.status(200).json({ message: "Failed", data: [] });
});

const registerUser = handleAsync(async (req, res) => {
    const data = req.body;
    const walletAddress = data.walletAddress;

    const findUser = await User.findOne({walletAddress});
    if (findUser) return res.status(200).json({ message: "Existed"});
    const newUser = new User(data);

    const result = await newUser.save();
    if (result) return res.status(200).json({ message: "Success"});
    else return res.status(200).json({ message: "Failed"});
});

const updateUser = handleAsync(async (req, res) => {
    const {walletAddress, ...extraData} = req.body;
    
    const result = await User.updateOne({walletAddress}, { $set: {...extraData} });
    if (result) return res.status(200).json({ message: "Success"});
    else return res.status(200).json({ message: "Failed"});
});

const deleteUser = handleAsync(async (req, res) => {
    const { _id } = req.param;
    
    const result = await User.deleteOne({ _id });
    if (result) return res.status(200).json({ message: "Success"});
    else return res.status(200).json({ message: "Failed"});
});

module.exports = {
    getUser,
    registerUser,
    updateUser,
    deleteUser,
}