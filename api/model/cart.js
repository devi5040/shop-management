const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const cartItemSchema = new Schema ({
  productId: {
    type: Schema.Types.ObjectId,
    ref: 'product',
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const cartSchema = new Schema (
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'auth',
      required: true,
    },
    items: [cartItemSchema],
    totalPrice: {
      type: Number,
      required: true,
    },
  },
  {timestamps: true}
);

module.exports = mongoose.model ('cart', cartSchema);
