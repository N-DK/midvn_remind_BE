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
const init_mysql_1 = require("../dbs/init.mysql");
const tire_model_1 = __importDefault(require("../models/tire.model"));
class TireService {
    getTiresByVehicleId(vehicleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const data = yield tire_model_1.default.getTiresByVehicleId(conn, vehicleId);
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
    addTire(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const tire = yield tire_model_1.default.addTire(conn, data);
                    return tire;
                }
                catch (error) {
                    throw error;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                throw new error_response_1.BusinessLogicError("Đã xảy ra lỗi", [error.msg], error.status);
            }
        });
    }
    updateTire(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const tire = yield tire_model_1.default.updateTire(conn, data);
                    return tire;
                }
                catch (error) {
                    throw error;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                throw new error_response_1.BusinessLogicError(`${error.msg}`, [error.msg], error.status);
            }
        });
    }
    deleteTire(tire_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const tire = yield tire_model_1.default.deleteTire(conn, tire_id);
                    return tire;
                }
                catch (error) {
                    throw error;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                throw new error_response_1.BusinessLogicError(`${error.msg}`, [error.msg], error.status);
            }
        });
    }
    restoreTire(tire_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const tire = yield tire_model_1.default.restoreTire(conn, tire_id);
                    return tire;
                }
                catch (error) {
                    throw error;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                throw new error_response_1.BusinessLogicError(`${error.msg}`, [error.msg], error.status);
            }
        });
    }
    search(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const tires = yield tire_model_1.default.search(conn, data);
                    return tires;
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
exports.default = new TireService();
