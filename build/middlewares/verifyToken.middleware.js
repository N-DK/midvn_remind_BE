"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const error_response_1 = require("../core/error.response");
const dotenv_config_1 = __importDefault(require("../config/dotenv.config"));
const { JWT_SECRET_KEY } = (0, dotenv_config_1.default)();
const verifyToken = (req, res, next) => {
    const token = req.headers['x-mobicam-token'];
    if (!token) {
        return next(new error_response_1.Api401Error('No token provided'));
    }
    // buffer from base64
    const user = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    if (user) {
        req.body.user = user;
        next();
    }
    else {
        return next(new error_response_1.Api401Error('Unauthorized'));
    }
    // jwt.verify(token, JWT_SECRET_KEY as string, (err: any, user: any) => {
    //     if (err) {
    //         return next(new Api401Error('Unauthorized'));
    //     }
    //     req.body.user = user;
    //     next();
    // });
};
exports.verifyToken = verifyToken;
