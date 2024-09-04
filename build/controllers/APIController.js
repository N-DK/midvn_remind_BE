"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class APIController {
    // [GET] /
    index(req, res, next) {
        res.send('Hello World!');
    }
}
exports.default = new APIController();
