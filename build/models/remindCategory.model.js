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
class RemindCategoryModel extends database_model_1.default {
    constructor() {
        super();
    }
    getAllRows(con) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.select(con, tableName_constant_1.tables.tableRemindCategory, '*', 'id IS NOT NULL', []);
            return result;
        });
    }
    getByUserID(con, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.select(con, tableName_constant_1.tables.tableRemindCategory, '*', 'user_id = ? OR user_id IS NULL', [userID]);
            return result;
        });
    }
    addCategory(con, data, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.insert(con, tableName_constant_1.tables.tableRemindCategory, {
                name: data.name,
                desc: data.desc,
                icon: data.icon.trim() === '' ? '➕' : data.icon,
                user_id: userID,
                create_time: Date.now(),
            });
            return result;
        });
    }
}
exports.default = new RemindCategoryModel();
