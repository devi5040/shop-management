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
 * @param {*} req 
 * @param {Object} req.body = {title, description, date, totalExpense}
 * @param {*} res 
 * @param {*} next 
 * @returns {Promise<void>}
 */
exports.addExpense = async (req, res, next) => {
  const {title, description, date, totalExpense} = req.body;
  const errors = [];
  if (req.file) {
    const fileUrl = req.file.location;
  }

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
