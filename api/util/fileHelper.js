const {S3Client} = require ('@aws-sdk/client-s3');
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

module.exports = upload;
