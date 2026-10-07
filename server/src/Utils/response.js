const response = {
  success: (res, statusCode, message, data = null) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  },

  error: (res, statusCode, message, errors = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  },
};

export default response;