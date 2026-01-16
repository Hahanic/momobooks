function errorHandler(err, _req, res, _next) {
  res.status(500).json({ message: "Internal Server Error", error: err.message });
}

export default errorHandler;
