"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const msg_constant_1 = __importDefault(require("../constants/msg.constant"));
const remindCategory_controller_1 = __importDefault(require("../controllers/remindCategory.controller"));
const verifyToken_middleware_1 = require("../middlewares/verifyToken.middleware");
const router = express_1.default.Router();
router.get('/get-all', verifyToken_middleware_1.verifyToken, remindCategory_controller_1.default.getAllRows);
router.get('/get-all/by-user', verifyToken_middleware_1.verifyToken, remindCategory_controller_1.default.getByUserId);
router.post('/add', [
    (0, express_validator_1.body)('name', msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
    (0, express_validator_1.body)('desc', msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
    (0, express_validator_1.body)('icon', msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
], verifyToken_middleware_1.verifyToken, remindCategory_controller_1.default.addCategory);
exports.default = (app) => {
    app.use('/api/v1/remind/category', router);
};
