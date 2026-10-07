export const errorHandler = (err, req, res, next) => {
  console.error("ERROR:", err);

  // ==================== MONGOOSE VALIDATION ERROR ====================
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map(
      (error) => error.message
    );

    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors,
    });
  }

  // ==================== MONGOOSE CAST ERROR ====================
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: `Invalid ${err.path}: ${err.value}`,
    });
  }

  // ==================== DUPLICATE KEY ERROR ====================
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];

    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
    });
  }

  // ==================== JWT ERROR ====================
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // ==================== JWT EXPIRED ====================
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token expired. Please login again.",
    });
  }

  // ==================== JSON BODY ERROR ====================
  if (err instanceof SyntaxError && err.status === 400) {
    return res.status(400).json({
      success: false,
      message: "Invalid JSON",
    });
  }

  // ==================== CUSTOM ERROR ====================
  const statusCode = err.statusCode || err.status || 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error",
  });
};