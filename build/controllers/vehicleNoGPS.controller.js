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
const success_response_1 = require("../core/success.response");
const vehicleNoGPS_service_1 = __importDefault(require("../services/vehicleNoGPS.service"));
const catchAsync_helper_1 = __importDefault(require("../helper/catchAsync.helper"));
class VehicleNoGPSController {
    constructor() {
        this.getVehicleNoGPS = (0, catchAsync_helper_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vehicles = yield vehicleNoGPS_service_1.default.getVehicleNoGPS(req.body.user.userId);
            (0, success_response_1.GET)(res, vehicles);
        }));
        this.getVehicleNoGPSbyID = (0, catchAsync_helper_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const vehicle = yield vehicleNoGPS_service_1.default.getVehicleNoGPSbyID(req.params.id);
            (0, success_response_1.GET)(res, vehicle);
        }));
        this.addVehicleNoGPS = (0, catchAsync_helper_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = req.body;
            const user_id = req.body.user.userId;
            const result = yield vehicleNoGPS_service_1.default.addVehicleNoGPS(data, user_id);
            (0, success_response_1.CREATED)(res, result);
        }));
        this.updateVehicleNoGPS = (0, catchAsync_helper_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const data = req.body;
            const result = yield vehicleNoGPS_service_1.default.updateVehicleNoGPS(data, parseInt(req.params.id));
            (0, success_response_1.UPDATE)(res, result);
        }));
        this.deleteVehicleNoGPS = (0, catchAsync_helper_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const user_id = req.body.user.userId;
            const result = yield vehicleNoGPS_service_1.default.deleteVehicleNoGPS(parseInt(req.params.id), user_id);
            (0, success_response_1.DELETE)(res, result);
        }));
        this.search = (0, catchAsync_helper_1.default)((req, res) => __awaiter(this, void 0, void 0, function* () {
            const user_id = req.body.user.userId;
            const dataBody = req.body;
            const data = yield vehicleNoGPS_service_1.default.search(dataBody, user_id);
            (0, success_response_1.GET)(res, data);
        }));
    }
}
exports.default = new VehicleNoGPSController();
