const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));
      return res.status(400).json({
        success: false,
        error: 'Validation error',
        errors,
      });
    }
    next();
  };
};

const validateRegister = validate(
  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phone: Joi.string().optional(),
    isAdmin: Joi.boolean().optional().default(false),
  })
);

const validateLogin = validate(
  Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  })
);

const validatePasswordReset = validate(
  Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
  })
);

const validateChangePassword = validate(
  Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  })
);

const validateResendVerification = validate(
  Joi.object({
    email: Joi.string().email().required(),
  })
);

const validateSocialLogin = validate(
  Joi.object({
    idToken: Joi.string().trim().optional(),
    id_token: Joi.string().trim().optional(),
  }).or('idToken', 'id_token').messages({
    'object.missing': 'Either idToken or id_token is required',
  })
);

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validatePasswordReset,
  validateChangePassword,
  validateResendVerification,
  validateSocialLogin,
};


