const express = require ('express');
const router = express.Router ();
const orderController = require ('../controller/orders');

// route definition for getting the order details
router.get ('/', orderController.getOrderDetails);

// route definition for creating an order
router.post ('/create-order', orderController.createOrder);

module.exports = router;
