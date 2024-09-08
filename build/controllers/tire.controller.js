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
const tire_service_1 = __importDefault(require("../services/tire.service"));
const success_response_1 = require("../core/success.response");
class TireController {
    constructor() {
        this.getTireByVehicleId = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { vehicleId } = req.params;
            const tires = yield tire_service_1.default.getTiresByVehicleId(vehicleId);
            (0, success_response_1.GET)(res, tires);
        }));
        this.search = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const vehicleID = req.params.vehicleId;
            const { keyword } = req.query;
            const dataBody = { vehicleID, keyword };
            const data = yield tire_service_1.default.search(dataBody);
            (0, success_response_1.GET)(res, data);
        }));
        this.addTire = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            // { seri, size, brand, vehicleId }
            const data = req.body;
            const tire = yield tire_service_1.default.addTire(data);
            (0, success_response_1.CREATED)(res, tire);
        }));
        this.updateTire = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            // { tire_id, seri, size, brand }
            const tire_id = req.params;
            const data = Object.assign(Object.assign({}, req.body), tire_id);
            const tire = yield tire_service_1.default.updateTire(data);
            (0, success_response_1.UPDATE)(res, tire);
        }));
        this.deleteTire = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const tire = yield tire_service_1.default.deleteTire(Number(id));
            (0, success_response_1.UPDATE)(res, tire);
        }));
        this.restoreTire = (0, catchAsync_helper_1.default)((req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const tire = yield tire_service_1.default.restoreTire(Number(id));
            (0, success_response_1.UPDATE)(res, tire);
        }));
    }
}
exports.default = new TireController();
