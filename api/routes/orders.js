const express = require ('express');
const router = express.Router ();
const orderController = require ('../controller/orders');
const {checkAuth} = require ('../util/auth');

// route definition for getting the order details
router.get ('/', checkAuth, orderController.getOrderDetails);

// route definition for creating an order
router.post ('/create-order', checkAuth, orderController.createOrder);

// route definition for getting the order status
router.get (
  '/order-status/:orderId',
  checkAuth,
  orderController.getOrderStatus
);

// route definition for cancelling the order
router.post ('/cancel-order/:orderId', checkAuth, orderController.cancelOrder);

module.exports = router;
