
const Request = require("../models/Request");
const Item = require("../models/Item");
const Notification = require("../models/Notification");


// @desc   Create a request for an item (rent or buy)
// @route  POST /api/requests
const createRequest = async (req, res) => {
  try {
    const { itemId, message } = req.body;

    if (!itemId) {
      return res.status(400).json({ message: "itemId is required" });
    }

    // 1. Find the item
    const item = await Item.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    // 2. Prevent requesting your own item
    if (item.owner.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot request your own item" });
    }

    // 3. Prevent requesting an unavailable item
    if (!item.isAvailable) {
      return res.status(400).json({ message: "This item is not currently available" });
    }

    // 4. Prevent duplicate active requests from the same user for the same item
    const existingRequest = await Request.findOne({
      item: itemId,
      requester: req.user._id,
      status: "PENDING",
    });
    if (existingRequest) {
      return res.status(400).json({ message: "You already have a pending request for this item" });
    }

    // 5. Create the request
    const request = await Request.create({
      item: itemId,
      requester: req.user._id,
      owner: item.owner,
      message: message || "",
      status: "PENDING",
    });

    // Create a notification for the item's owner
    await Notification.create({
      recipient: item.owner,
      sender: req.user._id,
      request: request._id,
      item: item._id,
      type: "NEW_REQUEST",
      message: `${req.user.name} wants to ${item.listingType === "Rent" ? "rent" : "buy"} your ${item.name}.`,
    });

    res.status(201).json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Get requests I made (as requester)
// @route  GET /api/requests/my
const getMyRequests = async (req, res) => {
  try {
    const requests = await Request.find({ requester: req.user._id })
      .populate("item", "name listingType price rentPricePerDay images")
      .populate("owner", "name college")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Get requests I received (as owner)
// @route  GET /api/requests/incoming
const getIncomingRequests = async (req, res) => {
  try {
    const requests = await Request.find({ owner: req.user._id })
      .populate("item", "name listingType price rentPricePerDay images")
      .populate("requester", "name college phone")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Accept a request (owner only)
// @route  PATCH /api/requests/:id/accept
const acceptRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    // Only the owner of the item can accept
    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to accept this request" });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    request.status = "ACCEPTED";
    await request.save();

    // Mark the item as unavailable since it's now rented/sold
    await Item.findByIdAndUpdate(request.item, { isAvailable: false });

    // Notify the requester
    const item = await Item.findById(request.item);
    await Notification.create({
      recipient: request.requester,
      sender: req.user._id,
      request: request._id,
      item: request.item,
      type: "REQUEST_ACCEPTED",
      message: `Your request for ${item.name} has been accepted by ${req.user.name}.`,
    });

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc   Reject a request (owner only)
// @route  PATCH /api/requests/:id/reject
const rejectRequest = async (req, res) => {
  try {
    const request = await Request.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: "Request not found" });
    }

    if (request.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to reject this request" });
    }

    if (request.status !== "PENDING") {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }

    request.status = "REJECTED";
    await request.save();

    const item = await Item.findById(request.item);
    await Notification.create({
      recipient: request.requester,
      sender: req.user._id,
      request: request._id,
      item: request.item,
      type: "REQUEST_REJECTED",
      message: `Your request for ${item.name} was rejected.`,
    });

    res.status(200).json(request);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createRequest, getMyRequests, getIncomingRequests, acceptRequest, rejectRequest,
};