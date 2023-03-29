const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const prisma = require("../utils/prisma");

const protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new AppError("You are not logged in.", 401));
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const freshUser = await prisma.user.findUnique({
    where: {
      id: decoded.id,
    },
  });

  if (!freshUser) {
    return next(
      new AppError("The user belonging to this token does not exist", 401)
    );
  }

  req.user = freshUser;

  next();
});

module.exports = { protect };
