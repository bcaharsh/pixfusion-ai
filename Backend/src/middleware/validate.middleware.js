const ApiError = require('../utils/ApiError');

const validate = (schema) => {
  return (req, res, next) => {
    const validationOptions = {
      abortEarly: false, // Return all errors
      allowUnknown: true, // Ignore unknown props
      stripUnknown: true // Remove unknown props
    };

    const toValidate = {};
    
    if (schema.body) toValidate.body = req.body;
    if (schema.params) toValidate.params = req.params;
    if (schema.query) toValidate.query = req.query;

    const errors = {};
    let hasErrors = false;

    // Validate each part
    Object.keys(toValidate).forEach(key => {
      if (schema[key]) {
        const { error, value } = schema[key].validate(
          toValidate[key],
          validationOptions
        );

        if (error) {
          hasErrors = true;
          errors[key] = error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message.replace(/"/g, '')
          }));
        } else {
          // Update req with validated and sanitized values
          req[key] = value;
        }
      }
    });

    if (hasErrors) {
      const errorMessage = Object.values(errors)
        .flat()
        .map(err => err.message)
        .join(', ');

      throw new ApiError(400, errorMessage, errors);
    }

    next();
  };
};

module.exports = validate;