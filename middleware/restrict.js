const AppError = require("../utils/appError");

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You dont have permission to use this feature", 403)
      );
    }
    next();
  };
};
module.exports = restrictTo;
