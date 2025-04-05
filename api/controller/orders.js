const Order = require ('../model/orders');
const Cart = require ('../model/cart');
const logger = require ('../util/logger');

exports.createOrder = async (req, res, next) => {
  const user = req.user;
  const userId = user._id;
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
    const newOrder = new Order ({
      orderId: '3d33',
      items: productsData,
      totalPrice: cart.totalPrice,
      paymentMode: 'online',
      orderStatus: 'pending',
      userId: userId,
    });
    await newOrder.save ();
    res.status (201).json ({message: 'New order created successfully'});
  } catch (error) {
    logger.error (`Error while creating order: ${error}`);
    res.status (500).json ({message: 'Error while creating order'});
  }
};

// get cart items remaining in cart controller
