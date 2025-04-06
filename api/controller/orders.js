const Order = require ('../model/orders');
const Cart = require ('../model/cart');
const logger = require ('../util/logger');
const {generateOrderId} = require ('../util/helper');

/**
 * Api endpoint for creating the order
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.createOrder = async (req, res, next) => {
  const user = req.user;
  const userId = user._id;
  const {paymentMode} = req.body;
  try {
    const cart = await Cart.findOne ({userId});
    if (!cart) {
      logger.error ('Cart does not exists');
      return res.status (404).json ({message: 'Cart does not exists'});
    }
    const items = cart.items;
    const productsData = items.map (item => {
      return {
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
      };
    });
    const orderId = generateOrderId ();
    const orderExists = await Order.findOne ({orderId});
    if (orderExists) {
      logger.error (`Order already exists with id: ${orderId}`);
      return res.status (409).json ({message: 'Order already exists'});
    }
    const newOrder = new Order ({
      orderId: orderId,
      items: productsData,
      totalPrice: cart.totalPrice,
      paymentMode: paymentMode,
      orderStatus: 'pending',
      userId: userId,
    });
    // empty the cart
    await newOrder.save ();
    res.status (201).json ({message: 'New order created successfully'});
  } catch (error) {
    logger.error (`Error while creating order: ${error}`);
    res.status (500).json ({message: 'Error while creating order'});
  }
};

// get cart items remaining in cart controller
