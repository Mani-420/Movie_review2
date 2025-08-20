const { ZodError } = require('zod');

const validate = (schema) => {
  return (req, res, next) => {
    try {
      // Validate the request against the schema
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace req objects with validated data
      req.body = validated.body || req.body;
      req.query = validated.query || req.query;
      req.params = validated.params || req.params;

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors,
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
      });
    }
  };
};

module.exports = validate;
