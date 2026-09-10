// models/Item.js

const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    category: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    condition: {
        type: String,
        enum: ["New", "Good", "Fair", "Poor"],
        required: true,
    },
    listingType: {
        type: String,
        enum: ["Sell", "Rent", "GiveAway"],
        required: true,
    },
    price: {
        type: Number,
        default: 0,
    },
    rentPricePerDay: {
        type: Number,
        default: 0,
    },
    securityDeposit: {
        type: Number,
        default: 0,
    },
    availableFrom: {
        type: Date,
    },
    availableUntil: {
        type: Date,
    },
    quantity: {
        type: Number,
        default: 1,
    },
    location: {
        type: String,
        required: true,
    },
    images: {
        type: [String],
        default: [],
    },
    isAvailable: {
        type: Boolean,
        default: true,
    },
    },
    {
        timestamps: true,
    }
);

const Item = mongoose.model("Item", itemSchema);

module.exports = Item;