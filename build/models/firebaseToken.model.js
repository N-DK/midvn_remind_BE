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
const database_model_1 = __importDefault(require("./database.model"));
const tableName_constant_1 = require("../constants/tableName.constant");
const error_response_1 = require("../core/error.response");
const httpStatusCode_1 = require("../core/httpStatusCode");
class TokenFirebase extends database_model_1.default {
    constructor() {
        super();
    }
    addToken(conn, data, userID, parentID) {
        return __awaiter(this, void 0, void 0, function* () {
            const tokenIsExist = yield this.select(conn, tableName_constant_1.tables.tableTokenFirebase, '*', 'token = ?', [data.token]);
            // console.log(tokenIsExist);
            if (tokenIsExist && tokenIsExist.length > 0) {
                throw new error_response_1.BusinessLogicError('Token đã tồn tại', ['Thêm token mới thất bại'], httpStatusCode_1.StatusCodes.CONFLICT);
            }
            const result = yield this.insert(conn, tableName_constant_1.tables.tableTokenFirebase, {
                user_id: userID,
                token: data.token,
                created_at: Date.now(),
            });
            const addToUser = yield this.insert(conn, tableName_constant_1.tables.tableUser, {
                user_id: userID,
                parent_id: parentID,
            });
            return result;
        });
    }
    deleteToken(conn, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.delete(conn, tableName_constant_1.tables.tableTokenFirebase, 'token = ?', data.token);
        });
    }
}
exports.default = new TokenFirebase();
