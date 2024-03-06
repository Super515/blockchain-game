const {
    getAllCurrencies,
    addCurrency,
    removeCurrency
  } = require("../controllers/currencyController");
  const isAdmin = require("../middlewares/isAdmin");
  
  const router = require("express").Router();
  
  router.get("/all", getAllCurrencies);
  router.post("/add", isAdmin, addCurrency);
  router.post("/delete/:id", isAdmin, removeCurrency);
  
  module.exports = router;
    