"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseError = exports.BusinessLogicError = exports.Api409Error = exports.Api404Error = exports.Api403Error = exports.Api401Error = exports.Api400Error = void 0;
const httpStatusCode_1 = require("./httpStatusCode");
class BaseError extends Error {
    constructor(message, status, errors, isOperational) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype); //set
        this.status = status;
        this.errors = errors;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.BaseError = BaseError;
class Api409Error extends BaseError {
    constructor(message = httpStatusCode_1.ReasonPhrases.CONFLICT, errors = [], status = httpStatusCode_1.StatusCodes.CONFLICT, isOperational = true) {
        super(message, status, errors, isOperational);
    }
}
exports.Api409Error = Api409Error;
class Api403Error extends BaseError {
    constructor(message = httpStatusCode_1.ReasonPhrases.FORBIDDEN, errors = [], status = httpStatusCode_1.StatusCodes.FORBIDDEN, isOperational = true) {
        super(message, status, errors, isOperational);
    }
}
exports.Api403Error = Api403Error;
class Api401Error extends BaseError {
    constructor(message = httpStatusCode_1.ReasonPhrases.UNAUTHORIZED, errors = [], status = httpStatusCode_1.StatusCodes.UNAUTHORIZED, isOperational = true) {
        super(message, status, errors, isOperational);
    }
}
exports.Api401Error = Api401Error;
class Api400Error extends BaseError {
    constructor(message = httpStatusCode_1.ReasonPhrases.METHOD_NOT_ALLOWED, errors = [], status = httpStatusCode_1.StatusCodes.BAD_REQUEST, isOperational = true) {
        super(message, status, errors, isOperational);
    }
}
exports.Api400Error = Api400Error;
class BusinessLogicError extends BaseError {
    constructor(message = httpStatusCode_1.ReasonPhrases.INTERNAL_SERVER_ERROR, errors = [], status = httpStatusCode_1.StatusCodes.INTERNAL_SERVER_ERROR, isOperational = true) {
        super(message, status, errors, isOperational);
    }
}
exports.BusinessLogicError = BusinessLogicError;
class Api404Error extends BaseError {
    constructor(message = httpStatusCode_1.ReasonPhrases.NOT_FOUND, errors = [], status = httpStatusCode_1.StatusCodes.NOT_FOUND, isOperational = true) {
        super(message, status, errors, isOperational);
    }
}
exports.Api404Error = Api404Error;
