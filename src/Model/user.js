const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profilePicture: { type: String, default: null },
});

userSchema.methods.getJWT = function () {
  const jwt = require("jsonwebtoken");
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1day",
  });
  return token;
};

userSchema.methods.validatePassword = async function (password) {
  const bcrypt = require("bcrypt");
  const user = this;
  return await bcrypt.compare(password, user.password);
};
const User = mongoose.model("User", userSchema);
module.exports = User;
