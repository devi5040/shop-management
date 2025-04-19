const express = require ('express');
const router = express.Router ();
const cartController = require ('../controller/cart');
const {checkAuth} = require ('../util/auth');

// route definition for getting cart items
router.get ('/', checkAuth, cartController.getCart);

// route definition for adding item to cart
router.post ('/add-cart', checkAuth, cartController.addToCart);

//route definition for removing an item from the cart
router.post (
  '/remove-item/:productId',
  checkAuth,
  cartController.deleteCartItem
);

// route definition for incrementing cart quantity
router.post (
  '/increment-quantity/:productId',
  checkAuth,
  cartController.incrementQuantity
);

// route definition for decrementing cart quantity
router.post (
  '/decrement-quantity/:productId',
  checkAuth,
  cartController.decrementQuantity
);

module.exports = router;
