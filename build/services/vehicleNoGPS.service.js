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
const error_response_1 = require("../core/error.response");
const httpStatusCode_1 = require("../core/httpStatusCode");
const init_mysql_1 = require("../dbs/init.mysql");
const vehicleNoGPS_model_1 = __importDefault(require("../models/vehicleNoGPS.model"));
class VehicleNoGPSService {
    getVehicleNoGPS(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const data = yield vehicleNoGPS_model_1.default.getAllRowsByUserID(conn, userID);
                    return data;
                }
                catch (error) {
                    throw error;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                throw new error_response_1.BusinessLogicError(error.msg);
            }
        });
    }
    getVehicleNoGPSbyID(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const vehicle = yield vehicleNoGPS_model_1.default.getVehicleNoGPSbyID(conn, data);
                    return vehicle;
                }
                catch (error) {
                    throw error;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                throw new error_response_1.BusinessLogicError(error);
            }
        });
    }
    addVehicleNoGPS(data, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const result = vehicleNoGPS_model_1.default
                        .addVehicleNoGPS(conn, data, userID)
                        .then((data) => {
                        return data;
                    })
                        .catch((error) => {
                        throw new error_response_1.BusinessLogicError("Trùng dữ liệu trong fields", [error.sqlMessage], httpStatusCode_1.StatusCodes.CONFLICT);
                    });
                    return result;
                }
                catch (error) {
                    throw error;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                throw new error_response_1.BusinessLogicError(error.msg);
            }
        });
    }
    updateVehicleNoGPS(data, vehicleID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const result = vehicleNoGPS_model_1.default
                        .updateVehicleNoGPS(conn, data, vehicleID)
                        .then((data) => {
                        return data;
                    })
                        .catch((error) => {
                        throw new error_response_1.BusinessLogicError("Trùng dữ liệu trong fields", [error.sqlMessage], httpStatusCode_1.StatusCodes.CONFLICT);
                    });
                    return result;
                }
                catch (error) {
                    throw error;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                throw new error_response_1.BusinessLogicError(error.msg);
            }
        });
    }
    deleteVehicleNoGPS(vehicleID, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const result = vehicleNoGPS_model_1.default.deleteVehicleNoGPS(conn, userID, vehicleID);
                    return result;
                }
                catch (error) {
                    throw error;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                throw new error_response_1.BusinessLogicError(error.msg);
            }
        });
    }
    search(data, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const result = yield vehicleNoGPS_model_1.default.search(conn, data, userID);
                    return result;
                }
                catch (error) {
                    throw error;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                throw new error_response_1.BusinessLogicError(error.msg);
            }
        });
    }
}
exports.default = new VehicleNoGPSService();
