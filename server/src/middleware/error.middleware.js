export function notFoundHandler(req, res) {
  return res.status(404).json({
    message: `Route ${req.method} ${req.originalUrl} was not found.`,
  });
}

export function errorHandler(error, req, res, next) {
  console.error("[suraksha]", error);

  return res.status(error.statusCode || 500).json({
    message: error.message || "Unexpected server error.",
  });
}
