const express = require ('express');
const router = express.Router ();
const {uploadIfBillExists} = require ('../util/fileHelper');
const expenseController = require ('../controller/expenses');
const {checkAuth} = require ('../util/auth');

// route definition for fetching all expenses
router.get ('/', checkAuth, expenseController.getAllExpenses);

// route definition for fetching detail for an expense
router.get (
  '/expense-details/:expenseId',
  checkAuth,
  expenseController.getExpense
);

// route definition for adding the expense
router.post (
  '/add-expense',
  checkAuth,
  uploadIfBillExists,
  expenseController.addExpense
);

// route definition for updating the expense
router.put (
  '/update-expense/:expenseId',
  checkAuth,
  uploadIfBillExists,
  expenseController.updateExpense
);

// route definition for deleting the expense
router.delete (
  '/delete-expense/:expenseId',
  checkAuth,
  expenseController.deleteExpense
);

module.exports = router;
