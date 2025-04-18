const express = require ('express');
const router = express.Router ();
const orderController = require ('../controller/orders');

// route definition for getting the order details
router.get ('/', orderController.getOrderDetails);

// route definition for creating an order
router.post ('/create-order', orderController.createOrder);

// route definition for getting the order status
router.get ('/order-status/:orderId', orderController.getOrderStatus);

// route definition for cancelling the order
router.post ('/cancel-order/:orderId', orderController.cancelOrder);

module.exports = router;
