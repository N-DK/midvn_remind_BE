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
exports.initDB = exports.pool = exports.getConnection = void 0;
const mysql2_1 = __importDefault(require("mysql2"));
const db_config_1 = __importDefault(require("../config/db.config"));
const msg_constant_1 = __importDefault(require("../constants/msg.constant"));
const pool = mysql2_1.default.createPool(db_config_1.default);
exports.pool = pool;
class Database {
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                pool.getConnection((err, conn) => {
                    if (err) {
                        return reject({ msg: msg_constant_1.default.SERVER_ERROR });
                    }
                    resolve({ conn, connPromise: conn.promise() });
                });
            });
        });
    }
    init() {
        pool.getConnection(function (err, conn) {
            if (err) {
                return console.log('error when connecting to Database', err);
            }
            else {
                console.log(`SUCCESS:: CONNECTED TO DATABASE >> ${db_config_1.default.host}`);
                conn.release();
            }
        });
    }
}
const { getConnection, init } = new Database();
exports.getConnection = getConnection;
exports.initDB = init;
