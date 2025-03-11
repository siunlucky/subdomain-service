import logger from "../utils/logger.js";
import BaseError from "../base_classes/base-error.js";
import StatusCodes from "../errors/status-codes.js";
import { INVALID_CREDENTIALS, SERVER_PROBLEM } from "../errors/error-codes.js";

export const errorHandler = (err, _req, res, _next) => {
  const statusCode = Object.values(StatusCodes).find((code) => code.message === err.statusCode);

  if (err.name === "ValidationError") {
    const errorObj = {};

    for (const error of err.details) {
      errorObj[error.path] = [error.message];
    }

    return res.status(StatusCodes.BAD_REQUEST.code).json({
      code: 400,
      status: StatusCodes.BAD_REQUEST.message,
      recordsTotal: 0,
      data: null,
      errors: {
        name: err.name,
        message: err.message,
        validation: errorObj,
      },
    });
  }

  //   if (err.name == "SequelizeValidationError") {
  //     return res.status(400).json(err);
  //   }

  if (err instanceof BaseError) {
    console.error(err);
    return res.status(statusCode.code).json({
      code: err.errorCode,
      status: err.statusCode,
      recordsTotal: 0,
      data: null,
      errors: {
        name: err.errorName,
        message: err.message,
        validation: null
      },
    });
  }
  console.error(err);
  return res.status(StatusCodes.INTERNAL_SERVER.code).json({
    code: 500,
    status: StatusCodes.INTERNAL_SERVER.message,
    recordsTotal: 0,
    data: null,
    errors: {
      name: err.name,
      message: err.message,
      validation: null
    },
  });
};

export default errorHandler;