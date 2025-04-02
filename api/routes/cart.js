const express = require ('express');
const router = express.Router ();
const cartController = require ('../controller/cart');

// route definition for adding item to cart
router.post ('/add-cart', cartController.addToCart);

module.exports = router;
