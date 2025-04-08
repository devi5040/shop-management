const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const orderSchema = new Schema (
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    items: [
      {
        productId: {
          type: Schema.Types.ObjectId,
          ref: 'product',
          required: true,
        },
        quantity: {
          type: Number,
          default: 0,
        },
        price: {
          type: Number,
          default: 0,
        },
      },
    ],
    totalPrice: {
      type: Number,
      default: 0,
    },
    paymentMode: {
      type: String,
      required: true,
    },
    orderStatus: {
      type: String,
      required: true,
      enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'auth',
    },
  },
  {timestamps: true}
);

module.exports = mongoose.model ('order', orderSchema);
