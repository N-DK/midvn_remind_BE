"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = void 0;
const error_response_1 = require("../core/error.response");
const verifyToken = (req, res, next) => {
    const token = req.headers['x-mobicam-token'];
    if (!token) {
        return next(new error_response_1.Api401Error('No token provided'));
    }
    const user = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    if (user) {
        req.body.user = user;
        next();
    }
    else {
        return next(new error_response_1.Api401Error('Unauthorized'));
    }
};
exports.verifyToken = verifyToken;
