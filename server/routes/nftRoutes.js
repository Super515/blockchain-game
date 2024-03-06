const router = require("express").Router();

const {
  saveNFT,
  getNFTById,
  getAllNFTs,
  getAllFeaturedNFT,
  removeNFTById,
  clearDB,
} = require("../controllers/nftController");

// router.use(require("../middlewares/isAuthenticated"));

router.get("/all", getAllNFTs);
router.get("/featured", getAllFeaturedNFT);
router.get("/:id", getNFTById);

router.use(require("../middlewares/isAdmin"));

router.delete("/clear", clearDB);
router.post("/:id", removeNFTById);
router.post("/", saveNFT);

module.exports = router;
