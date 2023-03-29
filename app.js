const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const prisma = require("./utils/prisma");
const userRoutes = require("./routes/userRoutes");
const AppError = require("./utils/appError");
const uploadRoutes = require("./routes/uploadRoutes");
const globalErrorHandler = require("./controller/errorController");

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/", uploadRoutes);

app.use("*", (req, res, next) => {
  next(new AppError(`Cant find the url ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("server listening on port 8000");
});
