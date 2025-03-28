const express = require ('express');
const router = express.Router ();
const {uploadIfBillExists} = require ('../util/fileHelper');
const expenseController = require ('../controller/expenses');

// route definition for fetching all expenses
router.get ('/', expenseController.getAllExpenses);

// route definition for adding the expense
router.post ('/add-expense', uploadIfBillExists, expenseController.addExpense);

module.exports = router;
