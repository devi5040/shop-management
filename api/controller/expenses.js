const Expenses = require ('../model/expenses.js');
const logger = require ('../util/logger.js');
const {
  isEmpty,
  isValidDescription,
  isValidNumber,
  isValidDate,
} = require ('../util/validations.js');

/**
 * Add the expense and add bill image url only if the bill file exists
 * @param {Object} req 
 * @param {Object} req.body = {title, description, date, totalExpense}
 * @param {Object} res 
 * @param {Function} next 
 * @returns {Promise<void>}
 */
exports.addExpense = async (req, res, next) => {
  const {title, description, date, totalExpense} = req.body;
  const errors = [];
  let fileUrl = null;
  if (req.file) fileUrl = req.file.location;

  if (isEmpty (title)) {
    logger.error ('Title is empty');
    errors.push ('Title is invalid');
  }
  if (isEmpty (description) || !isValidDescription (description)) {
    logger.error ('Description is invalid');
    errors.push ('Description is invalid');
  }
  if (isEmpty (date) || !isValidDate (date)) {
    logger.error ('Date is invalid');
    errors.push ('Date is invalid');
  }
  if (isEmpty (totalExpense) || !isValidNumber (totalExpense)) {
    logger.error ('Total expense is invalid');
    errors.push ('Total expense is invalid');
  }
  if (errors.length > 0)
    return res.status (422).json ({message: 'Validation error', errors});
  try {
    const expenseExists = await Expenses.findOne ({title});
    if (expenseExists) {
      logger.error ('The expense already exists');
      return res
        .status (409)
        .json ({message: 'The expense you entered already exists'});
    }
    const newExpense = new Expenses ({
      title,
      description,
      date,
      billImageUrl: fileUrl,
      totalExpense,
    });
    await newExpense.save ();
    logger.info (`Expense added successfully. expenseId: ${newExpense._id}`);
    res.status (201).json ({message: 'Expense added successfully'});
  } catch (error) {
    logger.error (`Error while adding expense:${error}`);
    res.status (500).json ({message: 'Error while adding expense'});
  }
};

/**
 * Fetching all expenses stored in the database
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 * @returns {Promise<void>}
 */
exports.getAllExpenses = async (req, res, next) => {
  try {
    const expenses = await Expenses.find ();
    if (!expenses) {
      logger.error ('expenses does not found');
      return res.status (404).json ({message: 'Expenses does not exists'});
    }
    logger.info (`Expenses are fetched successfully`);
    res
      .status (200)
      .json ({message: 'Responses are fetched successfully', expenses});
  } catch (error) {
    logger.error (`Error while fetching expenses: ${error}`);
    res.status (500).json ({message: 'Error while fetching expenses'});
  }
};

/**
 * Fetch the expense details by given expense id
 * @param {Object} req 
 * @param {Object} req.params.expenseId
 * @param {Object} res 
 * @param {Function} next 
 * @returns {Promise<void>}
 */
exports.getExpense = async (req, res, next) => {
  const expenseId = req.params.expenseId;
  try {
    const expense = await Expenses.findById (expenseId);
    if (!expense) {
      logger.error (`The expense does not found for id:${expenseId}`);
      return res.status (404).json ({message: 'The expense does not exists'});
    }
    logger.info (`The exspense has been fetched successfully. ${expense}`);
    res.status (200).json ({message: 'Details fetched successfully', expense});
  } catch (error) {
    logger.error (
      `Error while fetching expense with id:${expenseId} Error: ${error}`
    );
    res.status (500).json ({message: 'Error while fetching expense details'});
  }
};

/**
 * Update an expense by given expense id and values
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 * @returns {Promise<void>}
 */
exports.updateExpense = async (req, res, next) => {
  const expenseId = req.params.expenseId;
  const expenseData = req.body;
  if (req.file) expenseData.billImageUrl = req.file.location;

  const errors = [];
  if (expenseData.title && isEmpty (expenseData.title)) {
    logger.error ('Title is empty');
    errors.push ('Title is invalid');
  }
  if (
    expenseData.description &&
    (isEmpty (expenseData.description) ||
      !isValidDescription (expenseData.description))
  ) {
    logger.error ('Description is invalid');
    errors.push ('Description is invalid');
  }
  if (
    expenseData.date &&
    (isEmpty (expenseData.date) || !isValidDate (expenseData.date))
  ) {
    logger.error ('Date is invalid');
    errors.push ('Date is invalid');
  }
  if (
    expenseData.totalExpense &&
    (isEmpty (expenseData.totalExpense) ||
      !isValidNumber (expenseData.totalExpense))
  ) {
    logger.error ('Total expense is invalid');
    errors.push ('Total expense is invalid');
  }
  if (errors.length > 0)
    return res.status (422).json ({message: 'Validation error', errors});

  try {
    const expense = await Expenses.findById (expenseId);
    if (!expense) {
      logger.error (`Expense does not found with id: ${expenseId}`);
      return res.status (404).json ({message: 'Expense does not found'});
    }
    const isExpenseExists = await Expenses.findOne ({title: expenseData.title});
    if (isExpenseExists) {
      logger.error ('Expense with this name already exists.');
      return res
        .status (409)
        .json ({message: 'Expense with this name already exists.'});
    }
    await Expenses.findByIdAndUpdate (expenseId, expenseData, {
      runValidators: true,
      new: true,
    });
    logger.info ('Expense updated successfully');
    res.status (200).json ({message: 'Expense updated successfully'});
  } catch (error) {
    logger.error (`Error while updating the expense. ${error}`);
    res.status (500).json ({message: 'Error while updating the expense.'});
  }
};

/**
 * Delete the expense if it exists
 * @param {Object} req 
 * @param {Object} res 
 * @param {Function} next 
 * @returns {Promise<void>}
 */
exports.deleteExpense = async (req, res, next) => {
  const expenseId = req.params.expenseId;
  try {
    const isExpenseExists = await Expenses.findById (expenseId);
    if (!isExpenseExists) {
      logger.error (`Expense does not exists for id: ${expenseId}`);
      return res.status (404).json ({message: 'Expense does not exists'});
    }
    await Expenses.findByIdAndDelete (expenseId);
    logger.info ('The expense deleted successfully');
    res.status (200).json ({message: 'The expense deleted successfully'});
  } catch (error) {
    logger.error (`Error while deleting the expense: ${error}`);
    res.status (500).json ({message: 'Error while deleting the expense'});
  }
};
