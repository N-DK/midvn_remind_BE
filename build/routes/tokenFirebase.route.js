"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const msg_constant_1 = __importDefault(require("../constants/msg.constant"));
const verifyToken_middleware_1 = require("../middlewares/verifyToken.middleware");
const firebaseToken_controlller_1 = __importDefault(require("../controllers/firebaseToken.controlller"));
const router = express_1.default.Router();
router.post("/add", [
    (0, express_validator_1.body)("token", msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
], verifyToken_middleware_1.verifyToken, firebaseToken_controlller_1.default.addFirebaseToken);
router.delete("/delete", [
    (0, express_validator_1.body)("token", msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
], verifyToken_middleware_1.verifyToken, firebaseToken_controlller_1.default.deleteFirebaseToken);
exports.default = (app) => {
    app.use("/api/v1/token-firebase", router);
};
