require("dotenv-flow").config();
const express = require("express");
const connectionDb = require("./Config/database");
const cookieParser = require("cookie-parser");
const app = express();
const server = require("http").createServer(app);
const cors = require("cors");

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development"
        ? "http://localhost:5173"
        : "https://tic-tac-toe-web-gilt.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const userRouter = require("./Routes/userRoute");
const profileRouter = require("./Routes/profileRouter");
const historyRouter = require("./Routes/historyRouter");
const connectSocket = require("./Utills/socket");

app.use("/", userRouter);
app.use("/", profileRouter);
app.use("/", historyRouter);

connectSocket(server);

server.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});

connectionDb()
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.log("Something went wrong while connecting to the database", err);
  });
