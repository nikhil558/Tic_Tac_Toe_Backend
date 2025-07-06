const mongoose = require("mongoose");

const connectionDb = async () => {
  await mongoose.connect(process.env.DB_CONNECTION_STRING);
};
module.exports = connectionDb;
