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
const remind_model_1 = __importDefault(require("../models/remind.model"));
class RemindService {
    getAll(userID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const result = yield remind_model_1.default.getAll(conn, userID);
                    return result;
                }
                catch (error) {
                    throw error;
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    getByVehicleId(vehicleId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const result = yield remind_model_1.default.getByVehicleId(conn, vehicleId);
                    return result;
                }
                catch (error) {
                    throw error;
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    addRemind(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const remind = yield remind_model_1.default.addRemind(conn, data);
                    return remind;
                }
                catch (error) {
                    throw error;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                console.log(error);
                throw error;
            }
        });
    }
    updateNotifiedOff(remindID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const remind = yield remind_model_1.default.updateNotifiedOff(conn, remindID);
                    return remind;
                }
                catch (error) {
                    throw error;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                throw new error_response_1.BusinessLogicError('Đã xảy ra lỗi', [error.msg], error.status);
            }
        });
    }
    update(data, remindID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const remind = yield remind_model_1.default.updateRemind(conn, data, remindID);
                    return remind;
                }
                catch (error) {
                    throw error;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                throw new error_response_1.BusinessLogicError('Đã xảy ra lỗi', [error.msg], error.status);
            }
        });
    }
    updateNotifiedOn(remindID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const remind = yield remind_model_1.default.updateNotifiedON(conn, remindID);
                    return remind;
                }
                catch (error) {
                    throw error;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                throw new error_response_1.BusinessLogicError('Đã xảy ra lỗi', [error.msg], error.status);
            }
        });
    }
    search(userID, query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const result = yield remind_model_1.default.search(conn, userID, query);
                    return result;
                }
                catch (error) {
                    throw error;
                }
            }
            catch (error) {
                throw error;
            }
        });
    }
    updateIsDeleted(remindID) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const remind = yield remind_model_1.default.updateIsDeleted(conn, remindID);
                    return remind;
                }
                catch (error) {
                    throw error;
                }
                finally {
                    conn.release();
                }
            }
            catch (error) {
                throw new error_response_1.BusinessLogicError('Đã xảy ra lỗi', [error.msg], error.status);
            }
        });
    }
}
exports.default = new RemindService();
