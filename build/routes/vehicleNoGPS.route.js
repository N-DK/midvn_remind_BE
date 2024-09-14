"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const msg_constant_1 = __importDefault(require("../constants/msg.constant"));
const vehicleNoGPS_controller_1 = __importDefault(require("../controllers/vehicleNoGPS.controller"));
const verifyToken_middleware_1 = require("../middlewares/verifyToken.middleware");
const router = express_1.default.Router();
router.get("/get-all", verifyToken_middleware_1.verifyToken, vehicleNoGPS_controller_1.default.getVehicleNoGPS);
router.get("/get/:id", [(0, express_validator_1.param)("id", msg_constant_1.default.VALIDATE_DATA).isNumeric()], verifyToken_middleware_1.verifyToken, vehicleNoGPS_controller_1.default.getVehicleNoGPSbyID);
router.post("/add-vehicle", [
    (0, express_validator_1.body)().isArray().withMessage(msg_constant_1.default.VALIDATE_DATA),
    (0, express_validator_1.body)("*.license_plate", msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
    (0, express_validator_1.body)("*.user_name", msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
    (0, express_validator_1.body)("*.license", msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
    (0, express_validator_1.body)("*.user_address", msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
], verifyToken_middleware_1.verifyToken, vehicleNoGPS_controller_1.default.addVehicleNoGPS);
router.put("/update-vehicle/:id", [
    (0, express_validator_1.param)("id", msg_constant_1.default.VALIDATE_DATA).isNumeric(),
    (0, express_validator_1.body)("license_plate", msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
    (0, express_validator_1.body)("license", msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
], verifyToken_middleware_1.verifyToken, vehicleNoGPS_controller_1.default.updateVehicleNoGPS);
router.put("/delete-vehicle/:id", [(0, express_validator_1.param)("id", msg_constant_1.default.VALIDATE_DATA).isNumeric()], verifyToken_middleware_1.verifyToken, vehicleNoGPS_controller_1.default.deleteVehicleNoGPS);
router.get("/search", (0, express_validator_1.body)("keyword", msg_constant_1.default.NOT_EMPTY)
    .isString()
    .withMessage(msg_constant_1.default.VALIDATE_DATA), verifyToken_middleware_1.verifyToken, vehicleNoGPS_controller_1.default.search);
router.delete("/convert-toNoGPS");
exports.default = (app) => {
    app.use("/api/v1/remind/vehicle-no-gps", router);
};
