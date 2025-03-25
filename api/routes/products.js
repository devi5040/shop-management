const express = require ('express');
const router = express.Router ();
const productController = require ('../controller/products');
const upload = require ('../util/fileHelper');

// route definition for adding product after uploading the file into s3
router.post (
  '/add-product',
  upload.single ('file'),
  productController.addProducts
);

module.exports = router;
