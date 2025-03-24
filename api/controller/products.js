const Product = require ('../model/products');
const logger = require ('../util/logger');
const {
  isEmpty,
  isValidNumber,
  isValidProductName,
  isValidDescription,
} = require ('../util/validations');

/**
 * Adds the product if it doesn't already exists
 * @param {Object} req 
 * @param {Object} req.body = {name, description, price, category, stock}
 * @param {Object} res 
 * @param {Function} next 
 * @returns {Promise<void>}
 */
exports.addProducts = async (req, res, next) => {
  const {name, description, price, category, stock} = req.body;

  // Errors array to hold and return all validation errors
  let errors = [];
  if (isEmpty (name) || !isValidProductName (name)) {
    logger.error ('The product name entered by admin is invalid');
    errors.push ('Entered product name is invalid');
  }
  if (isEmpty (description) || !isValidDescription (description)) {
    logger.error ('The description entered by admin is invalid');
    errors.push ('Entered description is invalid');
  }
  if (isEmpty (price) || !isValidNumber (price)) {
    logger.error ('The price entered by admin is invalid');
    errors.push ('Enterd price is invalid');
  }
  if (isEmpty (category)) {
    logger.error ('The category entered by admin is invalid');
    errors.push ('Entered category is invalid');
  }
  if (isEmpty (stock) || !isValidNumber (stock)) {
    logger.error ('The stock enterd by admin is invalid');
    errors.push ('Entered stock is invalid');
  }

  if (errors.length > 0) {
    logger.error (`Validation error`);
    return res.status (422).json ({message: 'Validation error', errors});
  }
};
