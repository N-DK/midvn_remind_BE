"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_validator_1 = require("express-validator");
const error_response_1 = require("../core/error.response");
const msg_constant_1 = __importDefault(require("../constants/msg.constant"));
const statusCodes_1 = __importDefault(require("../core/statusCodes"));
const catchAsync = (fn) => (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return next(new error_response_1.BusinessLogicError(msg_constant_1.default.ERROR, errors.array()));
        }
        return yield Promise.resolve(fn(req, res, next));
    }
    catch (err) {
        return next(new error_response_1.BusinessLogicError((err === null || err === void 0 ? void 0 : err.msg) ||
            (((err === null || err === void 0 ? void 0 : err.status) === 401 ||
                (err === null || err === void 0 ? void 0 : err.status) === 403 ||
                (err === null || err === void 0 ? void 0 : err.status) === 409) &&
                (err === null || err === void 0 ? void 0 : err.message)) ||
            msg_constant_1.default.SERVER_ERROR, (err === null || err === void 0 ? void 0 : err.errors) || [], (err === null || err === void 0 ? void 0 : err.status) || statusCodes_1.default.INTERNAL_SERVER_ERROR));
    }
});
exports.default = catchAsync;
