const Product = require ('../model/products');
const logger = require ('../util/logger');
const {
  isEmpty,
  isValidNumber,
  isValidProductName,
  isValidDescription,
} = require ('../util/validations');
const {removeImageFromS3} = require('../util/fileHelper')

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

/**
 * Search the product with the given product id and update the information received.
 * @param {Object} req 
 * @param {Object} req.body
 * @param {Object} res 
 * @param {Function} next 
 * @returns {Promise<void>}
 */
exports.editProductsData = async (req, res, next) => {
  const productId = req.params.productId;
  const updateData = req.body;
  if(req.file)
    updateData.productImage = req.file.location
  const errors = [];
  if (
    updateData.name &&
    (isEmpty (updateData.name) || !isValidProductName (updateData.name))
  ) {
    logger.error ('The product name entered is not valid');
    errors.push ('Product name is invalid');
  }
  if (
    updateData.description &&
    (isEmpty (updateData.description) ||
      !isValidDescription (updateData.description))
  ) {
    logger.error ('The product description entered is not valid');
    errors.push ('Product description is invalid');
  }
  if (
    updateData.price &&
    (isEmpty (updateData.price) || !isValidNumber (updateData.price))
  ) {
    logger.error ('The product price entered is not valid');
    errors.push ('Product price is invalid');
  }
  if (updateData.category && isEmpty (updateData.category)) {
    logger.error ('The product category entered is not valid');
    errors.push ('Product category is invalid');
  }
  if (
    updateData.stock &&
    (isEmpty (updateData.stock) || !isValidNumber (updateData.stock))
  ) {
    logger.error (
      `The product stock entered is not valid: ${updateData.stock}`
    );
    errors.push ('Product stock is invalid');
  }

  if (errors.length > 0)
    return res
      .status (422)
      .json ({message: 'Validation error occured', errors});
  try {
    const isProductExists = await Product.findOne ({
      name: updateData.name?.trim (),
    });
    if (isProductExists) {
      logger.error ('The product already exists.');
      return res
        .status (409)
        .json ({message: 'The product with entered name already exists.'});
    }
    const updateProduct = await Product.findByIdAndUpdate (
      productId,
      updateData,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updateProduct) {
      logger.error (`Product does not found: ${updateProduct}`);
      return res.status (404).json ({message: 'Product does not found'});
    }
    logger.info (
      `Product updated successfully. product details:${updateProduct}`
    );
    res.status (200).json ({message: 'Product updated successfully'});
  } catch (error) {
    logger.error (`Error while updating product: ${error}`);
    res.status (500).json ({message: 'Error while updating the product'});
  }
};

/**
 * Delete the product with provided product id
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 * @returns {Promise<void>}
 */
exports.deleteProduct = async(req,res,next)=>{
  const productId = req.params.productId;
  try {
    const product = await Product.findById(productId);
    if(!product){
      logger.error(`The product does not exists. Product id: ${productId}`)
      return res.status(404).json({message:"The product does not exists"})
    }
    removeImageFromS3(product.productImage)
    await Product.findByIdAndDelete(productId);
    logger.info(`The product has been deleted successfully. Product Id: ${productId}`)
    res.status(200).json({message:'The product deleted successfully'})
  } catch (error) {
    logger.error(`Error while deleting the product: ${error}`)
    res.status(500).json({message:"Error while deleting the product"})
  }
}