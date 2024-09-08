"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const remindCategory_route_1 = __importDefault(require("./remindCategory.route"));
const vehicleNoGPS_route_1 = __importDefault(require("./vehicleNoGPS.route"));
const tire_route_1 = __importDefault(require("./tire.route"));
const tokenFirebase_route_1 = __importDefault(require("./tokenFirebase.route"));
const remind_route_1 = __importDefault(require("./remind.route"));
exports.default = (app) => {
    (0, remindCategory_route_1.default)(app);
    (0, vehicleNoGPS_route_1.default)(app);
    (0, tire_route_1.default)(app);
    (0, tokenFirebase_route_1.default)(app);
    (0, remind_route_1.default)(app);
};
