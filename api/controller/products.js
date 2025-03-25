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
  const fileUrl = req.file.location;

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
  if (!isEmpty (stock) && !isValidNumber (stock)) {
    logger.error ('The stock enterd by admin is invalid');
    errors.push ('Entered stock is invalid');
  }
  if (!req.file) {
    logger.error ('No file is uploaded');
    errors.push ('Please upload a product image');
  }

  if (errors.length > 0) {
    logger.error (`Validation error`);
    return res.status (422).json ({message: 'Validation error', errors});
  }
  try {
    const isProductExists = await Product.findOne ({name: name.trim ()});
    if (isProductExists) {
      logger.error ('The product you are adding already exists');
      return res
        .status (409)
        .json ({message: 'The product you are adding already exists.'});
    }
    const newProduct = new Product ({
      name,
      description,
      price,
      category,
      stock,
      productImage: fileUrl,
    });
    await newProduct.save ();
    logger.info (
      `The product has been added successfullty with id: ${newProduct._id}`
    );
    res
      .status (201)
      .json ({message: 'The product has been added successfully'});
  } catch (error) {
    logger.error (`Some error occured while adding product: ${error}`);
    return res.status (500).json ({message: 'Error while adding product'});
  }
};
