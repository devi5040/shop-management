const {S3Client,DeleteObjectCommand} = require ('@aws-sdk/client-s3');
const multer = require ('multer');
const multerS3 = require ('multer-s3');
const logger = require ('./logger');
require ('dotenv').config ();

const s3 = new S3Client ({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_ACCESS_SECRET_KEY,
  },
});

// folder name for uploading file in amazon s3
let folderName;

// List of allowed file types
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes (file.mimiTypes)) {
    cb (null, true);
  } else {
    logger.error ('The file uploaded is not an image');
    cb (new Error ('The file is not an image'), false);
  }
};

// Uploading the file to the amazon s3
const upload = multer ({
  storage: multerS3 ({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    // Function to set metadata for the uploaded file
    metadata: (req, file, cb) => {
      cb (null, {fieldName: file.fieldname});
    },
    // Function to determine the file name in S3
    key: (req, file, cb) => {
      folderName = 'products';
      const fileName = `${Date.now ()}-${file.originalname}`;
      cb (null, `${folderName}/${fileName}`);
    },
    fileFilter: fileFilter,
    limits: {fileSize: 25 * 1024 * 1024},
  }),
});

// Helper middleware to handle file uploads only if a file exists - product update
const uploadIfFileExists = (req, res, next) => {
  // Check if the request contains a file
  if (!req.headers["content-type"]?.includes("multipart/form-data")) {
    return next(); // No file uploaded, skip multer
  }

  // If there's a file, process it with multer
  upload.single("file")(req, res, next);
};

//Helper function for removing the image from s3 bucket while deleting a product
const removeImageFromS3 = async(imageUrl) =>{
  const arr = imageUrl.split('/');

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `product/${arr[4]}`,
  };

  try {
    const response = await s3.send(new DeleteObjectCommand(params));
    logger.info(`Image removed from s3 successfully. response:${JSON.stringify(response)}`)
  } catch (error) {
    logger.error(`Error while deleting image from s3:${error}`)
  }
}

module.exports = {upload, uploadIfFileExists, removeImageFromS3};
