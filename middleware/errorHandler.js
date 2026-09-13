export function errorHandler(error, _req, res, _next) {
  console.error("ERROR:", error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      error.message || "Something went wrong while processing the request.",
  });
}