const express = require ('express');
const router = express.Router ();
const {uploadIfBillExists} = require ('../util/fileHelper');
const expenseController = require ('../controller/expenses');

// route definition for fetching all expenses
router.get ('/', expenseController.getAllExpenses);

// route definition for fetching detail for an expense
router.get ('/expense-details/:expenseId', expenseController.getExpense);

// route definition for adding the expense
router.post ('/add-expense', uploadIfBillExists, expenseController.addExpense);

// route definition for updating the expense
router.put (
  '/update-expense/:expenseId',
  uploadIfBillExists,
  expenseController.updateExpense
);

// route definition for deleting the expense
router.delete ('/delete-expense/:expenseId', expenseController.deleteExpense);

module.exports = router;
