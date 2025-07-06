const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, lastName, email, password } = req.body;
  console.log("Validating sign-up data:", req.body);
  if (!firstName || !lastName) {
    throw new Error("Name is incorrect");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is incorrect");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Password is incorrect");
  }
};

const validateProfileUpdate = (req) => {
  const Updation_Allowed_Fields = ["firstName", "lastName", "profilePicture"];

  const isUpdateAllow = Object.keys(req).every((field) =>
    Updation_Allowed_Fields.includes(field)
  );

  if (!isUpdateAllow) {
    throw new Error("Invalid fields");
  }
};

module.exports = { validateSignUpData, validateProfileUpdate };
