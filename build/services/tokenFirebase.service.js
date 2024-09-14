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
const init_mysql_1 = require("../dbs/init.mysql");
const firebaseToken_model_1 = __importDefault(require("../models/firebaseToken.model"));
class TokenFirebaseService {
    addToken(data, userID, parentId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const result = yield firebaseToken_model_1.default.addToken(conn, data, userID, parentId);
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
                throw error;
            }
        });
    }
    deleteToken(data) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const result = yield firebaseToken_model_1.default.deleteToken(conn, data);
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
                throw error;
            }
        });
    }
}
exports.default = new TokenFirebaseService();
