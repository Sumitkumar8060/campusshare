// controllers/itemController.js

const Item = require("../models/Item");

// @desc   Create a new item
// @route  POST /api/items
const createItem = async (req, res) => {
  try {
    const {
      name, category, description, condition, listingType,
      price, rentPricePerDay, securityDeposit,
      availableFrom, availableUntil, quantity, location, images,
    } = req.body;

    if (!name || !category || !description || !condition || !listingType || !location) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const item = await Item.create({
      owner: req.user._id,
      name, category, description, condition, listingType,
      price, rentPricePerDay, securityDeposit,
      availableFrom, availableUntil, quantity, location, images,
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Get all items (with optional search/filter)
// @route  GET /api/items
const getItems = async (req, res) => {
  try {
    const { search, listingType, category, condition, available } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (listingType) query.listingType = listingType;
    if (category) query.category = category;
    if (condition) query.condition = condition;
    if (available) query.isAvailable = available === "true";

    const items = await Item.find(query)
      .populate("owner", "name college")
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Get single item by ID
// @route  GET /api/items/:id
const getItemById = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate("owner", "name college phone");

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Update an item (owner only)
// @route  PUT /api/items/:id
const updateItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // Ownership check
    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to edit this item" });
    }

    Object.assign(item, req.body);
    const updatedItem = await item.save();

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Delete an item (owner only)
// @route  DELETE /api/items/:id
const deleteItem = async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    if (item.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this item" });
    }

    await item.deleteOne();

    res.status(200).json({ message: "Item deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { createItem, getItems, getItemById, updateItem, deleteItem };