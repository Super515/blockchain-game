const {
  saveTrade,
  getTradesByUserId,
  getAllTrades,
  completeTrade,
  deliveryTrade
} = require("../controllers/tradeController");
const isAdmin = require("../middlewares/isAdmin");

const router = require("express").Router();

router.post("/", saveTrade);
router.get("/all",  getAllTrades);
router.get("/user/:userId", getTradesByUserId);
router.post("/complete", completeTrade);
router.post("/delivery", deliveryTrade);

module.exports = router;
  