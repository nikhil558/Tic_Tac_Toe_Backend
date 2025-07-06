const express = require("express");
const { userAuth } = require("../Middleware/auth");
const { validateProfileUpdate } = require("../Utills/validation");
const User = require("../Model/user");
const bcrypt = require("bcrypt");
const multer = require("multer");
const { storage } = require("../Config/cloudinary");
const upload = multer({ storage });

const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;
    res
      .status(200)
      .json({ response: user, message: "User profile fetched successfully" });
  } catch (error) {
    console.log("Error fetching user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

profileRouter.put(
  "/profile/update",
  userAuth,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const { firstName, lastName } = req.body;
      const profilePicUrl = req.file ? req.file.path : undefined;
      const updateInfo = { firstName, lastName, profilePicture: profilePicUrl };
      const user = req.user;
      let changes = {};

      Object.keys(updateInfo).forEach((key) => {
        if (updateInfo[key] !== undefined && updateInfo[key] !== user[key]) {
          changes[key] = updateInfo[key];
        }
      });

      if (Object.keys(changes).length === 0) {
        return res.status(400).json({ message: "No changes to update" });
      }

      validateProfileUpdate(changes);

      Object.assign(user, changes);
      const updatedUser = await user.save();

      res.status(200).json({
        response: updatedUser,
        message: "User profile updated successfully",
      });
    } catch (error) {
      console.log("Error updating user profile:", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

profileRouter.put("/profile/password", async (req, res) => {
  const { oldPassword, newPassword, email } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const isPasswordValid = await user.validatePassword(oldPassword);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid old password" });
    }
    const hashPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.log("Error validating email:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = profileRouter;
