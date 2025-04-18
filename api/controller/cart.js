const Cart = require ('../model/cart');
const User = require ('../model/auth');
const Product = require ('../model/products');
const logger = require ('../util/logger');

/**
 * Add items to the cart.
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 * @returns {Promise<void>}
 */
exports.addToCart = async (req, res, next) => {
  const user = req.user;
  const userId = user._id.toString ();
  const {productId, quantity} = req.body;

  if (!userId) {
    logger.error ('User has to login to add items to the cart');
    return res
      .status (403)
      .json ({message: 'User has to login to add items to the cart'});
  }

  try {
    // Check for user existence
    const user = await User.findById (userId);
    if (!user) {
      logger.error ('User does not exist');
      return res.status (404).json ({message: 'User does not exists'});
    }

    // Check for product existence
    const product = await Product.findById (productId);
    if (!product) {
      logger.error ('Product does not exists');
      return res
        .status (404)
        .json ({message: 'Product does not exists in the inventory'});
    }

    // Calculate total price for that product
    const productPrice = product.price * quantity;

    // Check if cart exists for the user
    const cart = await Cart.findOne ({userId});
    logger.info (`cart is : ${cart}`);

    // If doesn't exists then create the cart and add items to the cart
    if (!cart) {
      const cartData = new Cart ({
        userId,
        items: [
          {productId: productId, quantity: quantity, price: productPrice},
        ],
        totalPrice: productPrice,
      });
      await cartData.save ();
      logger.info ('cart created successfully');
    } else {
      const cartId = cart._id;
      // If cart exists then access that and add current product to that
      // check if the product already exists in the cart
      const isProductExists = await Cart.findOne ({
        'items.productId': productId,
      });
      let cartData;
      if (!isProductExists) {
        cartData = {
          items: [...cart.items, {productId, quantity, price: productPrice}],
          totalPrice: cart.totalPrice + productPrice,
        };
      } else {
        cartData = {
          items: cart.items.map (
            item =>
              item.productId.toString () === productId.toString ()
                ? {
                    ...item._doc,
                    quantity: item.quantity + quantity,
                    price: item.price + productPrice,
                  }
                : item
          ),
          totalPrice: cart.totalPrice + productPrice,
        };
      }
      await Cart.findByIdAndUpdate (cartId.toString (), cartData, {
        new: true,
        runValidators: true,
      });
      logger.info ('cart updated successfully');
    }
    res
      .status (200)
      .json ({message: 'Product has been added to the cart successfully'});
  } catch (error) {
    logger.error (`Error while adding item to the cart: ${error}`);
    res.status (500).json ({message: 'Error while adding item to the cart'});
  }
};

/**
 * Removes the item from the cart if it exists
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 * @returns {Promise<void>}
 */
exports.deleteCartItem = async (req, res, next) => {
  const user = req.user;
  const userId = user._id.toString ();
  const productId = req.params.productId;
  try {
    const cart = await Cart.findOne ({userId});
    if (!cart) {
      logger.error ('cart does not exists');
      return res.status (404).json ({message: 'Cart does not exists'});
    }

    if (userId.toString () === cart.userId.toString ()) {
      logger.error ('User not authorized');
      return res.status (403).json ({message: 'User not authorized'});
    }

    const cartId = cart._id.toString ();
    const product = await Cart.findOne ({'items.productId': productId});
    let productPrice;

    if (!product) {
      logger.info (`Product does not exists in the cart`);
      return res
        .status (404)
        .json ({message: 'Product does not exists in the cart'});
    }

    const cartData = {
      items: cart.items.filter (item => {
        if (item.productId.toString () === productId.toString ())
          productPrice = item.price;
        return item.productId.toString () !== productId.toString ();
      }),
      totalPrice: cart.totalPrice - productPrice,
    };

    const data = await Cart.findByIdAndUpdate (cartId, cartData, {
      new: true,
      runValidators: true,
    });
    logger.info (`The item has been removed successfully from the cart`);
    res.status (200).json ({
      message: 'removed The item has been removed successfully from the cart',
      cart: data,
    });
  } catch (error) {
    logger.error (`Error while deleting cart items: ${error}`);
    res.status (500).json ({message: 'Error while deleting cart items.'});
  }
};

/**
 * Api endpoint for incrementing cart item quantity
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.incrementQuantity = async (req, res, next) => {
  const user = req.user;
  const userId = user._id.toString ();
  const productId = req.params.productId;
  try {
    const cart = await Cart.findOne ({userId});
    if (!cart) {
      logger.error ('The cart does not exists');
      return res.status (404).json ({message: 'The cart does not exists'});
    }

    if (userId.toString () === cart.userId.toString ()) {
      logger.error ('User not authorized');
      return res.status (403).json ({message: 'User not authorized'});
    }

    const cartId = cart._id.toString ();
    const product = await Product.findById (productId);
    const price = product.price;

    const productExists = await Cart.findOne ({'items.productId': productId});
    if (!productExists) {
      logger.error ('The product does not exists in the cart');
      return res
        .status (404)
        .json ({message: 'The product does not exist in the cart'});
    }

    const cartData = {
      items: cart.items.map (
        item =>
          item.productId.toString () === productId.toString ()
            ? {...item._doc, quantity: item.quantity + 1}
            : item
      ),
      totalPrice: cart.totalPrice + price,
    };
    const data = await Cart.findByIdAndUpdate (cartId, cartData, {
      runValidators: true,
      new: true,
    });
    logger.error ('The quantity updated successfully');
    res
      .status (200)
      .json ({message: 'The cart updated successfully', cart: data});
  } catch (error) {
    logger.error (`Error while incrementing quantity in cart: ${error}`);
    res.status (500).json ({message: 'Error while updating cart.'});
  }
};

/**
 * Api endpoint for incrementing cart item quantity
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */
exports.decrementQuantity = async (req, res, next) => {
  const user = req.user;
  const userId = user._id.toString ();
  const productId = req.params.productId;
  try {
    const cart = await Cart.findOne ({userId});
    if (!cart) {
      logger.error ('The cart does not exists');
      return res.status (404).json ({message: 'The cart does not exists'});
    }

    if (userId.toString () === cart.userId.toString ()) {
      logger.error ('User not authorized');
      return res.status (403).json ({message: 'User not authorized'});
    }

    const cartId = cart._id.toString ();
    const product = await Product.findById (productId);
    const price = product.price;

    const productExists = await Cart.findOne ({'items.productId': productId});
    if (!productExists) {
      logger.error ('The product does not exists in the cart');
      return res
        .status (404)
        .json ({message: 'The product does not exist in the cart'});
    }

    const cartData = {
      items: cart.items.map (
        item =>
          item.productId.toString () === productId.toString ()
            ? {...item._doc, quantity: item.quantity - 1}
            : item
      ),
      totalPrice: cart.totalPrice + price,
    };
    const data = await Cart.findByIdAndUpdate (cartId, cartData, {
      runValidators: true,
      new: true,
    });
    logger.error ('The quantity updated successfully');
    res
      .status (200)
      .json ({message: 'The cart updated successfully', cart: data});
  } catch (error) {
    logger.error (`Error while incrementing quantity in cart: ${error}`);
    res.status (500).json ({message: 'Error while updating cart.'});
  }
};

/**
 * Api endpoint for getting cart details
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 * @returns {Promise<void>}
 */
exports.getCart = async (req, res, next) => {
  const user = req.user;
  const userId = user._id.toString ();
  try {
    const cart = await Cart.findOne ({userId}).populate ('items.productId');
    if (!cart) {
      logger.error ('Cart does not exists');
      return res.status (404).json ({message: 'Cart does not exists'});
    }

    if (userId.toString () === cart.userId.toString ()) {
      logger.error ('User not authorized');
      return res.status (403).json ({message: 'User not authorized'});
    }

    logger.info ('Cart details fetched successfully');
    res
      .status (200)
      .json ({message: 'Cart details fetched successfully', cart});
  } catch (error) {
    logger.error (`Error while fetching cart details. Error:${error}`);
    res.status (500).json ({message: 'Error while fetching cart details'});
  }
};
