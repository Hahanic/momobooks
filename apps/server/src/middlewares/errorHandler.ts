import { NextFunction, Request, Response } from "express";

function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction) {
  res.status(500).json({ message: "Internal Server Error", error: err.message });
}

export default errorHandler;
