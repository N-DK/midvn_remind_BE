"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const msg_constant_1 = __importDefault(require("../constants/msg.constant"));
const verifyToken_middleware_1 = require("../middlewares/verifyToken.middleware");
const remind_controller_1 = __importDefault(require("../controllers/remind.controller"));
const router = express_1.default.Router();
// router.get("/get-all", verifyToken, remindController.getAll);
// router.get("/search", verifyToken, remindController.search);
router.get('/get-all', verifyToken_middleware_1.verifyToken, (req, res, next) => {
    const { keyword } = req.query;
    if (typeof keyword === 'string' && keyword.trim() !== '') {
        remind_controller_1.default.search(req, res, next);
    }
    else {
        remind_controller_1.default.getAll(req, res, next);
    }
});
router.get('/get-vehicle-id/:id', [(0, express_validator_1.param)('id', msg_constant_1.default.VALIDATE_DATA).isString()], verifyToken_middleware_1.verifyToken, remind_controller_1.default.getByVehicleId);
// payload:
// {
//   remind_category_id: 1,
//   is_notified: 0,
//   note_repair: "Thay nhớt",
//   expiration_time: 1000,
//   cumulative_kilometers: 1000,
//   time_before: 1,
//   vehicles: ["1", "2", "3"]
// }
router.post('/add-remind', verifyToken_middleware_1.verifyToken, [
    (0, express_validator_1.body)('remind_category_id', msg_constant_1.default.VALIDATE_DATA).isNumeric(),
    (0, express_validator_1.body)('is_notified', msg_constant_1.default.VALIDATE_DATA).isNumeric(),
    (0, express_validator_1.body)('note_repair', msg_constant_1.default.NOT_EMPTY).isString(),
    (0, express_validator_1.body)('expiration_time', msg_constant_1.default.VALIDATE_DATA).isNumeric(),
    // body('km_before', constants.VALIDATE_DATA).isNumeric(),
    (0, express_validator_1.body)('vehicles', msg_constant_1.default.VALIDATE_DATA).isArray(),
    (0, express_validator_1.body)('schedules', msg_constant_1.default.VALIDATE_DATA).isArray(),
], remind_controller_1.default.addRemind);
// search
router.patch('/update-notified-off/:id', verifyToken_middleware_1.verifyToken, [(0, express_validator_1.param)('id', msg_constant_1.default.VALIDATE_DATA).isNumeric()], remind_controller_1.default.updateNotifiedOff);
router.patch('/update-notified-on/:id', verifyToken_middleware_1.verifyToken, [(0, express_validator_1.param)('id', msg_constant_1.default.VALIDATE_DATA).isNumeric()], remind_controller_1.default.updateNotifiedOn);
router.put('/update/:id', [
// param("id", constants.VALIDATE_DATA).isNumeric(),
// body("name").isString().withMessage(constants.VALIDATE_DATA),
// body("img_url").isString().withMessage(constants.VALIDATE_DATA),
// body("note_repair").isString().withMessage(constants.VALIDATE_DATA),
// body("history_repair").isString().withMessage(constants.VALIDATE_DATA),
// body("current_kilometres").withMessage(constants.VALIDATE_DATA),
// body("cumulative_kilometers").withMessage(constants.VALIDATE_DATA),
// body("expiration_time").withMessage(constants.VALIDATE_DATA),
// body("time_before").withMessage(constants.VALIDATE_DATA),
// body("is_notified").withMessage(constants.VALIDATE_DATA),
// body("is_received").withMessage(constants.VALIDATE_DATA),
// body("update_time").withMessage(constants.VALIDATE_DATA),
], verifyToken_middleware_1.verifyToken, remind_controller_1.default.update);
/**
 * @swagger
 * /items:
 *   post:
 *     summary: Retrieve a list of items
 *     responses:
 *       200:
 *         description: A list of items.
 */
router.put('/update-is-deleted/:id', [(0, express_validator_1.param)('id', msg_constant_1.default.VALIDATE_DATA).isNumeric()], verifyToken_middleware_1.verifyToken, remind_controller_1.default.updateIsDeleted);
// yes ==> call api current_kilometers = current_kilometers of result return from api, cumulative_kilometers = cumulative_kilometers of remind_id
//         expiration_time = Date.now() + (Date.now() - expiration_time of remind_id)
//         time_before = time_before of remind_id
//         return {expiration_time, time_before, cumulative_kilometers}
// no ==> is_received = 1, update_time = Date.now() return {}
// router.patch(
//     '/finish-remind/:id',
//     [
//         param('id', constants.VALIDATE_DATA).isNumeric(),
//         body('is_continue', constants.VALIDATE_DATA).isNumeric(),
//     ],
//     verifyToken,
//     remindController.finishRemind,
// );
exports.default = (app) => {
    app.use('/api/v1/remind/main', router);
};
