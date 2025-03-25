const express = require ('express');
const router = express.Router ();
const productController = require ('../controller/products');
const {upload, uploadIfFileExists} = require ('../util/fileHelper');

// route definition for getting all products
router.get ('/products', productController.getAllProducts);

// route definition for fetching details of a product
router.get ('/details/:productId', productController.getProductDetails);

// route definition for adding product after uploading the file into s3
router.post (
  '/add-product',
  upload.single ('file'),
  productController.addProducts
);

// route definition for updating the product
router.put (
  '/update-product/:productId',
  uploadIfFileExists,
  productController.editProductsData
);

// route definition for deleting a product
router.delete ('/delete-product/:productId', productController.deleteProduct);
module.exports = router;
