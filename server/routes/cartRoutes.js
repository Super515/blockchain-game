const {
    getCart,
    addMerch,
    removeMerch,
    buyAll,
    increaseAmount,
    getCartNum,
} = require("../controllers/cartController");

const router = require("express").Router();

router.get("/:userId", getCart);
router.post("/add", addMerch);
router.post("/buy", buyAll);
router.delete("/remove",  removeMerch);
router.post("/increase", increaseAmount);
router.post("/getCartNum", getCartNum);

module.exports = router;
  