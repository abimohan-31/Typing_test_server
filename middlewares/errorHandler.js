import { sendResponse } from "../utils/responseHandler.js";

export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const message = err.message || "Internal Server Error";
  
  return sendResponse(res, statusCode, false, message, {
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};
