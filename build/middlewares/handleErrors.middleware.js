"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.is404Handler = exports.isOperationalError = exports.returnError = exports.logErrorMiddleware = exports.logError = void 0;
const error_response_1 = require("../core/error.response");
const logError = (err) => {
    console.error('logErrorMiddleware::::', err);
};
exports.logError = logError;
const logErrorMiddleware = (err, req, res, next) => {
    logError(err);
    if (err.status !== 401) {
        // ...
    }
    next(err);
};
exports.logErrorMiddleware = logErrorMiddleware;
const returnError = (error, req, res, next) => {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
        result: false,
        status: statusCode,
        message: error.message || 'Internal server error',
        errors: error.errors,
    });
};
exports.returnError = returnError;
const isOperationalError = (error) => {
    if (error instanceof error_response_1.BaseError) {
        return error.isOperational;
    }
    return false;
};
exports.isOperationalError = isOperationalError;
const is404Handler = (req, res, next) => {
    const error = new error_response_1.Api404Error();
    next(error);
};
exports.is404Handler = is404Handler;
const handleCastErrorDB = (err) => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new error_response_1.BusinessLogicError(message);
};
const handleDuplicateFieldsDB = (err) => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new error_response_1.BusinessLogicError(message);
};
const handleValidationErrorDB = (err) => {
    const errors = Object.values(err.errors).map((el) => el.message);
    console.log(errors);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new error_response_1.BusinessLogicError(message);
};
const handlerJWTError = (err) => {
    console.error(err);
    const message = `Invalid token. Please login again!`;
    return new error_response_1.Api401Error(message);
};
const handlerJWTExpiredError = (err) => {
    console.error(err);
    const message = `Your token has expired! Please log in again.`;
    return new error_response_1.Api403Error(message);
};
