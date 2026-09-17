// routes/itemRoutes.js

const express = require("express");
const router = express.Router();

const upload = require("../middleware/upload");

const {
  createItem, getItems, getItemById, updateItem, deleteItem,
} = require("../controllers/itemController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, upload.array("images", 5), createItem);
router.get("/", getItems);
router.get("/:id", getItemById);
router.put("/:id", protect, updateItem);
router.delete("/:id", protect, deleteItem);

module.exports = router;