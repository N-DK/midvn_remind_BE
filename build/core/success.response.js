"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OK = exports.DELETE = exports.CREATED = exports.UPDATE = exports.GET = void 0;
const msg_constant_1 = __importDefault(require("../constants/msg.constant"));
const { StatusCodes } = require('./httpStatusCode');
class SuccessResponse {
    constructor({ message = '', status = StatusCodes.OK, data = {}, options = {}, totalPage = -1, totalRecord = -1, }) {
        this.result = true;
        this.message = message;
        this.status = status;
        if (totalPage >= 0) {
            this.totalPage = totalPage;
            this.totalRecord = totalRecord;
        }
        this.data = data;
        this.options = options;
    }
    send(res, headers = {}) {
        return res.status(this.status).json(this);
    }
}
class Create extends SuccessResponse {
    constructor({ data = {}, options = {}, message = '' }) {
        super({ message, status: StatusCodes.CREATED, data, options });
    }
}
class Update extends SuccessResponse {
    constructor({ data = {}, options = {}, message = '' }) {
        super({ message, data, options });
    }
}
class Get extends SuccessResponse {
    constructor({ data = {}, totalPage = 0, totalRecord = 0, options = {}, message = '', }) {
        super({
            message,
            status: StatusCodes.OK,
            data,
            options,
            totalPage,
            totalRecord,
        });
    }
}
class Delete extends SuccessResponse {
    constructor({ data = {}, options = {}, message = '' }) {
        super({ message, status: StatusCodes.OK, data, options });
    }
}
class Ok extends SuccessResponse {
    constructor({ data = {}, options = {}, message = '' }) {
        super({ message, status: StatusCodes.OK, data, options });
    }
}
const CREATED = (res, data, options = {}, message = msg_constant_1.default.ADD_DATA_SUCCESS) => {
    new Create({
        message,
        data,
        options,
    }).send(res);
};
exports.CREATED = CREATED;
const UPDATE = (res, data, options = {}, message = msg_constant_1.default.UPDATE_DATA_SUCCESS) => {
    new Update({
        message,
        data,
        options,
    }).send(res);
};
exports.UPDATE = UPDATE;
const GET = (res, data, totalPage = 0, totalRecord = 0, options = {}, message = msg_constant_1.default.GET_DATA_SUCCESS) => {
    new Get({
        message,
        data,
        totalPage,
        totalRecord,
        options,
    }).send(res);
};
exports.GET = GET;
const DELETE = (res, data, options = {}, message = msg_constant_1.default.DELETE_DATA_SUCCESS) => {
    new Delete({
        message,
        data,
        options,
    }).send(res);
};
exports.DELETE = DELETE;
const OK = (res, data, options = {}, message = msg_constant_1.default.LOGIN_SUCCESS) => {
    new Ok({
        message,
        data,
        options,
    }).send(res);
};
exports.OK = OK;
