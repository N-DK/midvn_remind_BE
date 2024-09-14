"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const msg_constant_1 = __importDefault(require("../constants/msg.constant"));
const verifyToken_middleware_1 = require("../middlewares/verifyToken.middleware");
const tire_controller_1 = __importDefault(require("../controllers/tire.controller"));
const router = express_1.default.Router();
// router.get(
//   "/get-all/:vehicleId",
//   verifyToken,
//   tireController.getTireByVehicleId
// );
// router.get(
//     "/search",
//     [
//       body("license_plate", constants.NOT_EMPTY)
//         .isString()
//         .withMessage(constants.VALIDATE_DATA),
//       body("keyword", constants.NOT_EMPTY)
//         .isString()
//         .withMessage(constants.VALIDATE_DATA),
//     ],
//     verifyToken,
//     tireController.search
//   );
router.get('/get-all/:vehicleId', verifyToken_middleware_1.verifyToken, (req, res, next) => {
    const { keyword } = req.query;
    if (typeof keyword === 'string' && keyword.trim() !== '') {
        tire_controller_1.default.search(req, res, next);
    }
    else {
        tire_controller_1.default.getTireByVehicleId(req, res, next);
    }
});
router.post('/add-tire', [
    (0, express_validator_1.body)('seri', msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
    (0, express_validator_1.body)('size', msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
    (0, express_validator_1.body)('brand', msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
    (0, express_validator_1.body)('license_plate', msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
], verifyToken_middleware_1.verifyToken, tire_controller_1.default.addTire);
router.patch('/delete-tire/:id', verifyToken_middleware_1.verifyToken, tire_controller_1.default.deleteTire);
router.patch('/restore-tire/:id', verifyToken_middleware_1.verifyToken, tire_controller_1.default.restoreTire);
router.put('/update-tire/:tire_id', verifyToken_middleware_1.verifyToken, [
    (0, express_validator_1.body)('seri', msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
    (0, express_validator_1.body)('size', msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
    (0, express_validator_1.body)('brand', msg_constant_1.default.NOT_EMPTY)
        .isString()
        .withMessage(msg_constant_1.default.VALIDATE_DATA),
], tire_controller_1.default.updateTire);
exports.default = (app) => {
    app.use('/api/v1/remind/tire', router);
};
