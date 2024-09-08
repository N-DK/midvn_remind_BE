"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const dotenv_config_1 = __importDefault(require("../config/dotenv.config"));
const { SV_REAL_ALARM } = (0, dotenv_config_1.default)();
const axiosAlarm = axios_1.default.create({
    baseURL: SV_REAL_ALARM,
});
const handleRes = (response) => {
    if (response && response.data) {
        return response.data;
    }
    return response;
};
const handleError = (error) => {
    var _a;
    // console.log("error", error);
    // Handle errors
    throw ((_a = error === null || error === void 0 ? void 0 : error.response) === null || _a === void 0 ? void 0 : _a.data) || error;
};
axiosAlarm.interceptors.response.use(handleRes, handleError);
exports.default = axiosAlarm;
