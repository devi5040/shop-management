const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const productSchema = new Schema ({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  price: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
  },
  productImage: {
    type: String,
  },
});

module.exports = mongoose.model ('product', productSchema);
