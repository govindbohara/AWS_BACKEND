const express = require("express");
const {
  uploadFile,
  getUploadedFile,
  uploadImage,
  listBucketsItems,
  getAllUploadedFiles,
  getSingleDocuments,
} = require("../controller/uploadController");
const { protect } = require("../middleware/protect");
const restrictTo = require("../middleware/restrict");

const router = express.Router();

router.post("/upload", protect, uploadImage, uploadFile);
router.get("/upload", protect, getUploadedFile);
router.get("/listbucket", listBucketsItems);
router.get("/alluploads", protect, restrictTo("ADMIN"), getAllUploadedFiles);
router.get("/document/:id", protect, getSingleDocuments);

module.exports = router;
