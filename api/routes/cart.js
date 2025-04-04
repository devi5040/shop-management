const express = require ('express');
const router = express.Router ();
const cartController = require ('../controller/cart');

// route definition for adding item to cart
router.post ('/add-cart', cartController.addToCart);

//route definition for removing an item from the cart
router.post ('/remove-item/:productId', cartController.deleteCartItem);

// route definition for incrementing cart quantity
router.post (
  '/increment-quantity/:productId',
  cartController.incrementQuantity
);

module.exports = router;
