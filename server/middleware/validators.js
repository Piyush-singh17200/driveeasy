const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(400).json({
    error: 'Validation failed',
    details: extractedErrors
  });
};

exports.carValidator = [
  body('name').notEmpty().withMessage('Car name is required').trim(),
  body('brand').notEmpty().withMessage('Brand is required').trim(),
  body('model').notEmpty().withMessage('Model is required').trim(),
  body('category').isIn(['Sedan', 'SUV', 'Hatchback', 'Luxury', 'Sports', 'Electric', 'Van']).withMessage('Invalid category'),
  body('pricePerDay').isNumeric().withMessage('Price per day must be a number'),
  body('transmission').isIn(['Manual', 'Automatic', 'CVT']).withMessage('Invalid transmission type'),
  body('fuel').isIn(['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']).withMessage('Invalid fuel type'),
  body('seats').isInt({ min: 2, max: 20 }).withMessage('Seats must be between 2 and 20'),
  validate
];

exports.bookingValidator = [
  body('carId').isMongoId().withMessage('Invalid Car ID'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  validate
];
