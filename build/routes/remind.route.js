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
const reminder_util_1 = __importDefault(require("../utils/reminder.util"));
const router = express_1.default.Router();
router.get('/get-all', verifyToken_middleware_1.verifyToken, (req, res, next) => {
    const { keyword, vehicle_id } = req.query;
    if ((typeof keyword === 'string' && keyword.trim() !== '') ||
        (typeof vehicle_id === 'string' && vehicle_id.trim())) {
        remind_controller_1.default.search(req, res, next);
    }
    else {
        remind_controller_1.default.getAll(req, res, next);
    }
});
router.get('/gps/get-all', verifyToken_middleware_1.verifyToken, remind_controller_1.default.getAllGPS);
router.get('/get-vehicle-id/:id', [(0, express_validator_1.param)('id', msg_constant_1.default.VALIDATE_DATA).isString()], verifyToken_middleware_1.verifyToken, remind_controller_1.default.getByVehicleId);
router.post('/add-remind', reminder_util_1.default.upload.array('images', 10), [
    (0, express_validator_1.body)('remind_category_id', msg_constant_1.default.VALIDATE_DATA).isNumeric(),
    (0, express_validator_1.body)('is_notified', msg_constant_1.default.VALIDATE_DATA).isNumeric(),
    (0, express_validator_1.body)('note_repair', msg_constant_1.default.NOT_EMPTY).isString(),
    (0, express_validator_1.body)('expiration_time', msg_constant_1.default.VALIDATE_DATA).isNumeric(),
], verifyToken_middleware_1.verifyToken, remind_controller_1.default.addRemind);
router.get('/get-category-all', verifyToken_middleware_1.verifyToken, remind_controller_1.default.getCategoryAll);
router.patch('/update-notified-off/:id', [(0, express_validator_1.param)('id', msg_constant_1.default.VALIDATE_DATA).isNumeric()], verifyToken_middleware_1.verifyToken, remind_controller_1.default.updateNotifiedOff);
router.patch('/update-notified-on/:id', [(0, express_validator_1.param)('id', msg_constant_1.default.VALIDATE_DATA).isNumeric()], verifyToken_middleware_1.verifyToken, remind_controller_1.default.updateNotifiedOn);
router.put('/update/:id', reminder_util_1.default.upload.array('images', 10), verifyToken_middleware_1.verifyToken, remind_controller_1.default.update);
router.put('/update-is-deleted/:id', [(0, express_validator_1.param)('id', msg_constant_1.default.VALIDATE_DATA).isNumeric()], verifyToken_middleware_1.verifyToken, remind_controller_1.default.updateIsDeleted);
router.post('/finish-remind/:id', [(0, express_validator_1.param)('id', msg_constant_1.default.VALIDATE_DATA).isNumeric()], verifyToken_middleware_1.verifyToken, remind_controller_1.default.finishRemind);
router.get('/get-finish-remind/:id', [(0, express_validator_1.param)('id', msg_constant_1.default.VALIDATE_DATA)], verifyToken_middleware_1.verifyToken, remind_controller_1.default.getFinishRemind);
router.get('/get-schedule/:id', verifyToken_middleware_1.verifyToken, remind_controller_1.default.getScheduleByRemindId);
exports.default = (app) => {
    app.use('/api/v1/remind/main', router);
};
