const catchAsync = require("../utils/catchAsync");
const prisma = require("../utils/prisma");
const appError = require("../utils/appError");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { sendEmail } = require("../utils/mailServer");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};
const cookieOptions = {
  expires:
    Date.now() + process.env.JWT_COOKIES_EXPIRES_IN * 24 * 60 * 60 * 1000,

  httpOnly: true,
};
if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
const createToken = (user, status, res) => {
  const token = signToken(user.id);
  res.cookie("jwt", token, cookieOptions);

  res.status(status).json({
    status: "success",
    token,
    data: {
      user: user,
    },
  });
};

const loginController = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (!user) {
    return next(new appError("User does not exist", 404));
  }

  const comparePassword = await bcrypt.compare(password, user.password);

  if (comparePassword) {
    createToken(user, 200, res);
  } else {
    return next(new appError("Invalid user or password", 404));
  }
});

// const signupController = catchAsync(async (req, res, next) => {
//   const { email, password, name, role } = req.body;

//   const alreadyUserExists = await prisma.user.findMany({
//     where: {
//       email: email,
//     },
//   });

//   if (alreadyUserExists.length > 0 && alreadyUserExists[0].email === email) {
//     return next(new appError("User already exists", 404));
//   }

//   const encryptedPassword = await bcrypt.hash(password, 12);

//   const newUser = await prisma.user.create({
//     data: {
//       email: email,
//       password: encryptedPassword,
//       name: name,
//       role: role,
//     },
//   });

//   createToken(newUser, 201, res);
// });

const addUserController = catchAsync(async (req, res, next) => {
  const { email, password, name, role } = req.body;

  const alreadyUserExists = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (alreadyUserExists) {
    return next(new appError("User already exists", 404));
  }

  const encryptedPassword = await bcrypt.hash(password, 12);

  const newUser = await prisma.user.create({
    data: {
      email: email,
      password: encryptedPassword,
      name: name,
      role: role,
    },
  });
  res.status(201).json({
    status: "success",
    message: "User added successfully",
    data: newUser,
  });
});

const getUserDetails = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  res.status(200).json({
    status: "success",
    data: user,
  });
});

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });
  if (!user) {
    return next(new appError("This user does not exist", 404));
  }
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenKey = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const passwordResetExpiresDate = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      passwordResetToken: resetTokenKey,
      passwordResetExpires: passwordResetExpiresDate,
    },
  });

  const resetUrl = `${req.protocol}://localhost:3000/resetPassword/${resetToken}`;

  await sendEmail({
    email: email,
    subject: "Reset password link",
    message: `Please click on the link to reset your password ${resetUrl}`,
  });

  res.status(200).json({
    status: "success",
    message: "Please check your email for reset password link",
  });
});

const changePassword = catchAsync(async (req, res, next) => {
  const { token, newPassword, confirmPassword } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const resetUser = await prisma.user.findUnique({
    where: {
      passwordResetToken: hashedToken,
    },
  });

  const isTokenExpired = resetUser.passwordResetExpires < new Date();

  if (!resetUser) {
    return next(new appError("Invalid token. Please try again.", 404));
  }
  if (isTokenExpired) {
    return next(new appError("Reset token expired. Please try again.", 404));
  }

  if (newPassword !== confirmPassword) {
    return next(new appError("Password does not match", 404));
  }

  const encryptedPassword = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: {
      id: resetUser.id,
    },
    data: {
      password: encryptedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });
  res.status(200).json({
    status: "success",
    message: "Password changed successfully",
  });
});
module.exports = {
  loginController,
  addUserController,
  getUserDetails,
  forgotPassword,
  changePassword,
};
