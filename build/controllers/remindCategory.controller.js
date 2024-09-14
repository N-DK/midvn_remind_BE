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
const remindCategory_service_1 = __importDefault(require("../services/remindCategory.service"));
const success_response_1 = require("../core/success.response");
class RemindCategoryController {
    constructor() {
        this.getAllRows = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const data = yield remindCategory_service_1.default.getAllRows();
            (0, success_response_1.GET)(res, data);
        }));
        this.getByUserId = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const data = yield remindCategory_service_1.default.getByUserID(req.body.user.userId);
            (0, success_response_1.GET)(res, data);
        }));
        this.addCategory = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const dataBody = req.body;
            const data = yield remindCategory_service_1.default.addCategory(dataBody, parseInt(req.body.user.userId));
            (0, success_response_1.GET)(res, data);
        }));
    }
}
exports.default = new RemindCategoryController();
