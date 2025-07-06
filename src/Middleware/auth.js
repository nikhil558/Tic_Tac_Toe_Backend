const jwt = require("jsonwebtoken");
const User = require("../Model/user");

const userAuth = async (req, res, next) => {
  try {
    const { "Tic-Tac-Toe": token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please Login");
    }

    const decode = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decode._id);
    if (!user) {
      throw new Error("Invalid User");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send(err.message);
  }
};

module.exports = { userAuth };
