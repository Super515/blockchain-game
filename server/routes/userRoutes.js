const {
    getUser,
    registerUser,
    updateUser,
    deleteUser,
} = require("../controllers/userController");

const isAdmin = require("../middlewares/isAdmin");

const router = require("express").Router();

router.get("/get/:walletAddress", getUser);
router.post("/register", registerUser);
router.put("/update", updateUser);
router.delete("/delete", isAdmin, deleteUser);

module.exports = router;
