const { body, validationResult } = require('express-validator');

const validatePayment = [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('description').isLength({ min: 5 }).withMessage('Description must be at least 5 characters long'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = validatePayment;
