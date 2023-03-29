const AppError = require("./../utils/appError");

const sendDevError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    err: err,
    stack: err.stack,
    message: err.message,
  });
};

const sendProdError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error("ERROR!!!!!!");
    res.status(500).json({
      status: "error",
      message: "Something went wrong!!",
    });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendDevError(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };

    sendProdError(error, res);
  }
};
