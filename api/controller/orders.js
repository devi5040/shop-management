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

/**
 * Api endpoint for fetching order details
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 * @returns {Promise<void>}
 */
exports.getOrderDetails = async (req, res, next) => {
  const user = req.user;
  const userId = user._id;
  try {
    const order = await Order.find ({userId}).populate ('items.productId');
    if (!order) {
      logger.error ('Order does not exists');
      return res.status (404).json ({message: 'Order does not exists.'});
    }
    logger.info ('Order details fetched successfully.');
    res
      .status (200)
      .json ({message: 'Order details fetched successfully.', order});
  } catch (error) {
    logger.error (`Error while fetching order details. Error: ${error}`);
    res.status (500).json ({message: 'Error while fetching order details.'});
  }
};
