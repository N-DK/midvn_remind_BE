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
exports.saveTable = void 0;
const setting_constant_1 = require("../../constants/setting.constant");
const getTableName_1 = __importDefault(require("./getTableName"));
const checkTableExists_1 = require("./checkTableExists");
const createTable_1 = __importDefault(require("./createTable"));
const saveTable = (con, deviceId) => __awaiter(void 0, void 0, void 0, function* () {
    const tableName = (0, getTableName_1.default)(setting_constant_1.setting.initialNameOfTableReportChargingStation, deviceId);
    const isExists = yield (0, checkTableExists_1.tableExists)(con, tableName);
    if (!isExists)
        yield (0, createTable_1.default)(con, tableName);
    return tableName;
});
exports.saveTable = saveTable;
