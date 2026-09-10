const express = require("express");
const router = express.Router();
const {
  createRequest, getMyRequests, getIncomingRequests, acceptRequest, rejectRequest,
} = require("../controllers/requestController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createRequest);
router.get("/my", protect, getMyRequests);
router.get("/incoming", protect, getIncomingRequests);
router.patch("/:id/accept", protect, acceptRequest);
router.patch("/:id/reject", protect, rejectRequest);

module.exports = router;