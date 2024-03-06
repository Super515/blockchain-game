const router = require("express").Router();

const {
  addMerch,
  updateMerch,
  getMerchById,
  getAllMerches,
  removeMerch,
} = require("../controllers/merchController");

router.get("/all", getAllMerches);
router.get("/:id", getMerchById);

router.use(require("../middlewares/isAdmin"));

router.post("/add", addMerch);
router.put("/update", updateMerch);
router.post("/delete/:id", removeMerch);

module.exports = router;
