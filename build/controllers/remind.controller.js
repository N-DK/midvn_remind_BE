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
const catchAsync_helper_1 = __importDefault(require("../helper/catchAsync.helper"));
const remind_service_1 = __importDefault(require("../services/remind.service"));
const success_response_1 = require("../core/success.response");
class RemindController {
    constructor() {
        this.getAll = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const data = yield remind_service_1.default.getAll(req.body.user.userId);
            (0, success_response_1.GET)(res, data);
        }));
        this.getByVehicleId = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const data = yield remind_service_1.default.getByVehicleId(req.params.id);
            (0, success_response_1.GET)(res, data);
        }));
        this.addRemind = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            if (Array.isArray(req.files) && req.files.length > 0) {
                req.body.img_url = req.files
                    .map((file) => file.path.replace('src', ''))
                    .join(', ');
            }
            if (typeof req.body.vehicles === 'string') {
                req.body.vehicles = JSON.parse(req.body.vehicles);
            }
            if (typeof req.body.schedules === 'string') {
                req.body.schedules = JSON.parse(req.body.schedules);
            }
            const data = req.body;
            const remind = yield remind_service_1.default.addRemind(data);
            (0, success_response_1.CREATED)(res, remind);
        }));
        this.updateNotifiedOff = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const result = yield remind_service_1.default.updateNotifiedOff(parseInt(req.params.id));
            (0, success_response_1.UPDATE)(res, result);
        }));
        this.updateNotifiedOn = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const result = yield remind_service_1.default.updateNotifiedOn(parseInt(req.params.id));
            (0, success_response_1.UPDATE)(res, result);
        }));
        this.update = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            req.body.img_url = null;
            if (Array.isArray(req.files) && req.files.length > 0) {
                req.body.img_url = req.files
                    .map((file) => file.path.replace('src', ''))
                    .join(', ');
            }
            if (typeof req.body.vehicles === 'string') {
                req.body.vehicles = JSON.parse(req.body.vehicles);
            }
            if (typeof req.body.schedules === 'string') {
                req.body.schedules = JSON.parse(req.body.schedules);
            }
            const data = req.body;
            const remind = yield remind_service_1.default.update(data, parseInt(req.params.id));
            (0, success_response_1.UPDATE)(res, remind);
        }));
        this.search = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const data = yield remind_service_1.default.search(req.body.user.userId, req.query);
            (0, success_response_1.GET)(res, data);
        }));
        this.updateIsDeleted = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const result = yield remind_service_1.default.updateIsDeleted(parseInt(req.params.id));
            (0, success_response_1.UPDATE)(res, result);
        }));
        this.finishRemind = (0, catchAsync_helper_1.default)((req, res, Next) => __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const result = yield remind_service_1.default.finishRemind(parseInt(req.params.id), ((_b = (_a = req.body) === null || _a === void 0 ? void 0 : _a.user) === null || _b === void 0 ? void 0 : _b.level) === 10
                ? req.body.user.userId
                : req.body.user.parentId);
            (0, success_response_1.UPDATE)(res, result);
        }));
        this.getFinishRemind = (0, catchAsync_helper_1.default)((req, res, Next) => __awaiter(this, void 0, void 0, function* () {
            const result = yield remind_service_1.default.getFinishRemind(req.params.id, req.body.user.userId);
            (0, success_response_1.GET)(res, result);
        }));
        this.getAllGPS = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const data = yield remind_service_1.default.getAllGPS(req.query);
            (0, success_response_1.GET)(res, data);
        }));
        this.getCategoryAll = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const data = yield remind_service_1.default.getCategoryAll(req.body.user.userId);
            (0, success_response_1.GET)(res, data);
        }));
        this.getScheduleByRemindId = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const data = yield remind_service_1.default.getScheduleByRemindId(parseInt(req.params.id));
            (0, success_response_1.GET)(res, data);
        }));
    }
}
exports.default = new RemindController();
