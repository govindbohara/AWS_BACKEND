const express = require("express");
const router = express.Router();
const {
  loginController,
  addUserController,
  getUserDetails,
  forgotPassword,
  changePassword,
} = require("../controller/userController");
const { protect } = require("../middleware/protect");
const restrictTo = require("../middleware/restrict");

// router.post("/signup", restrictTo(["ADMIN"]), signupController);
router.post("/login", loginController);
router.post("/add-user", protect, restrictTo("ADMIN"), addUserController);
router.get("/profile", protect, getUserDetails);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", changePassword);
module.exports = router;
