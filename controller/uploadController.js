const catchAsync = require("../utils/catchAsync");
const multer = require("multer");
const AppError = require("../utils/appError");
const AWS = require("aws-sdk");
const prisma = require("../utils/prisma");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

const awsConfig = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
};

const S3 = new AWS.S3({
  credentials: awsConfig,
});

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("text/csv")) {
    cb(null, true);
  } else {
    cb(new AppError("Please upload valid file", 400), false);
  }
};

const upload = multer({
  fileFilter: multerFilter,
});

const uploadImage = upload.fields([
  {
    name: "files",
    maxCount: 3,
  },
]);

const uploadFileToS3 = (fileData, userId) => {
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${userId}/${Date.now()}-${fileData.originalname}`,
      Body: fileData.buffer,
    };

    S3.upload(params, (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
      }
      resolve(data);
    });
  });
};

const uploadFile = catchAsync(async (req, res, next) => {
  const files = req.files;

  if (files.files && files.files.length > 0) {
    const fileData = files.files.map((file) =>
      uploadFileToS3(file, req.user.id)
    );
    const response = await Promise.all(fileData);

    const sendingData = response.map((data) => {
      return {
        key: data.Key,
        createdBy: req.user.id,
        objectUrl: data.Location,
        orderNumber: req.body.orderNumber,
      };
    });

    const uploadkeyToDb = await prisma.document.createMany({
      data: sendingData,
      skipDuplicates: true,
    });

    res.status(201).json({
      status: "success",
      message: "File uploaded successfully",
      count: uploadkeyToDb.count,
      data: response,
    });
  }
});

const getUploadedFile = catchAsync(async (req, res, next) => {
  const allDocuments = await prisma.document.findMany({
    where: {
      createdBy: req.user.id,
    },
    include: {
      user: true,
    },
  });
  res.status(200).json({
    status: "success",
    data: allDocuments,
  });
});

const listBucketsItems = catchAsync(async (req, res, next) => {
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
  };
  S3.listObjects(params, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        status: "error",
        message: "Something went wrong",
      });
    } else {
      console.log(data);
      res.status(200).json({
        status: "success",
        data: data,
      });
    }
  });
});

const getAllUploadedFiles = catchAsync(async (req, res, next) => {
  const allDocuments = await prisma.document.findMany({
    include: {
      user: true,
    },
  });
  res.status(200).json({
    status: "success",
    data: allDocuments,
  });
});

const getSingleDocuments = catchAsync(async (req, res, next) => {
  const document = await prisma.document.findMany({
    where: {
      createdBy: parseInt(req.params.id),
    },
    include: {
      user: true,
    },
  });
  res.status(200).json({
    status: "success",
    data: document,
  });
});

module.exports = {
  uploadFile,
  getUploadedFile,
  uploadImage,
  listBucketsItems,
  getAllUploadedFiles,
  getSingleDocuments,
};
