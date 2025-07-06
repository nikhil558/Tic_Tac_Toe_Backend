const express = require("express");
const History = require("../Model/history");

const historyRouter = express.Router();
const { userAuth } = require("../Middleware/auth");

historyRouter.post("/history/add", userAuth, async (req, res) => {
  try {
    const { userId, targetUserId, result, isDraw } = req.body;

    const newHistory = new History({
      userId,
      targetUserId,
      result,
      isDraw,
    });

    const savedHistory = await newHistory.save();
    res.status(201).json({
      response: savedHistory,
      message: "Game history added successfully",
    });
  } catch (error) {
    console.error("Error adding game history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

historyRouter.get("/history/view", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const history = await History.find({
      $or: [{ userId }, { targetUserId: userId }],
    })
      .populate("userId", "firstName lastName profilePicture")
      .populate("targetUserId", "firstName lastName profilePicture")
      .populate("result", "firstName lastName profilePicture");

    res.status(200).json({
      response: history.reverse(),
      message: "Game history fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching game history:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = historyRouter;
