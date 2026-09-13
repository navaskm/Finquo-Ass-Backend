import multer from "multer";

export function errorHandler(error, _req, res, _next) {
  console.error("ERROR:", error);

  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "This file is larger than the 25 MB limit.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "The uploaded audio file could not be processed.",
    });
  }

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    message:
      error.message ||
      "Something went wrong while processing the request.",
  });
}