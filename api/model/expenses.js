const mongoose = require ('mongoose');
const Schema = mongoose.Schema;

const expensesSchema = new Schema (
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    billImageUrl: {
      type: String,
      required: true,
    },
    totalExpense: {
      type: String,
      required: true,
    },
  },
  {timestamps: true}
);

module.exports = mongoose.model ('expenses', expensesSchema);
