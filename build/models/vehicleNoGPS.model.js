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
const tableName_constant_1 = require("../constants/tableName.constant");
const database_model_1 = __importDefault(require("./database.model"));
const error_response_1 = require("../core/error.response");
const httpStatusCode_1 = require("../core/httpStatusCode");
class VehicleNoGPS extends database_model_1.default {
    constructor() {
        super();
    }
    getAllRowsByUserID(con, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.select(con, tableName_constant_1.tables.tableVehicleNoGPS, 'id, license_plate, user_id, license', 'user_id = ? AND is_deleted = 0', [userID]);
            return result;
        });
    }
    getVehicleNoGPSbyID(con, vehicleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.select(con, tableName_constant_1.tables.tableVehicleNoGPS, 'id,license_plate, user_id, license', 'id = ? AND is_deleted = 0', [vehicleId]);
            return result;
        });
    }
    addVehicleNoGPS(con, data, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            let queryText = `INSERT INTO ${tableName_constant_1.tables.tableVehicleNoGPS} 
            (license_plate, user_id, license, create_time, update_time, user_name, user_address) 
            VALUES `;
            data.forEach((item) => {
                queryText += `('${item.license_plate}', ${userID}, '${item.license}', ${Date.now()}, NULL, '${item.user_name}', '${item.user_address}'),`;
            });
            // Loại bỏ dấu phẩy cuối cùng để đảm bảo cú pháp SQL hợp lệ
            queryText = queryText.slice(0, -1);
            // Sử dụng ON DUPLICATE KEY UPDATE để ghi đè thông tin nếu trùng license_plate
            queryText += ` ON DUPLICATE KEY UPDATE 
            license = VALUES(license), 
            user_name = VALUES(user_name), 
            user_address = VALUES(user_address), 
            update_time = ${Date.now()}`;
            return new Promise((resolve, reject) => {
                con.query(queryText, (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                });
            });
        });
    }
    updateVehicleNoGPS(con, data, vehicleID) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.update(con, tableName_constant_1.tables.tableVehicleNoGPS, {
                license_plate: data.license_plate,
                license: data.license,
                update_time: Date.now(),
                user_name: data.user_name,
                user_address: data.user_address,
            }, 'id', vehicleID);
            return result;
        });
    }
    deleteVehicleNoGPS(con, user_id, vehicleID) {
        return __awaiter(this, void 0, void 0, function* () {
            const check = yield this.getVehicleNoGPSbyID(con, vehicleID);
            if (check[0].user_id !== user_id) {
                throw new error_response_1.BusinessLogicError('Đã xảy ra lỗi', ['Không được phép'], httpStatusCode_1.StatusCodes.FORBIDDEN);
            }
            const result = yield this.update(con, tableName_constant_1.tables.tableVehicleNoGPS, { is_deleted: 1 }, 'id', vehicleID);
            return result;
        });
    }
    search(con, data, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.selectWithJoins(con, tableName_constant_1.tables.tableVehicleNoGPS, `${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate AS license_plate,
                 ${tableName_constant_1.tables.tableVehicleNoGPS}.user_id AS user_id,
                 ${tableName_constant_1.tables.tableVehicleNoGPS}.license AS license,
                 ${tableName_constant_1.tables.tableVehicleNoGPS}.create_time AS vehicle_create_time,
                 ${tableName_constant_1.tables.tableVehicleNoGPS}.update_time AS vehicle_update_time,
                 
                 ${tableName_constant_1.tables.tableRemind}.id AS remind_id,
                 ${tableName_constant_1.tables.tableRemind}.img_url AS remind_img_url,
                 ${tableName_constant_1.tables.tableRemind}.note_repair AS note_repair,
                 ${tableName_constant_1.tables.tableRemind}.history_repair AS history_repair,
                 ${tableName_constant_1.tables.tableRemind}.current_kilometers AS current_kilometers,
                 ${tableName_constant_1.tables.tableRemind}.cumulative_kilometers AS cumulative_kilometers,
                 ${tableName_constant_1.tables.tableRemind}.expiration_time AS expiration_time,
                 ${tableName_constant_1.tables.tableRemind}.time_before AS time_before,
                 ${tableName_constant_1.tables.tableRemind}.is_notified AS is_notified,
                 ${tableName_constant_1.tables.tableRemind}.is_received AS is_received,
                 ${tableName_constant_1.tables.tableRemind}.create_time AS remind_create_time,
                 ${tableName_constant_1.tables.tableRemind}.update_time AS remind_update_time,
                 
                 ${tableName_constant_1.tables.tableRemindCategory}.id AS category_id,
                 ${tableName_constant_1.tables.tableRemindCategory}.name AS category_name,
                 ${tableName_constant_1.tables.tableRemindCategory}.desc AS category_desc,
                 ${tableName_constant_1.tables.tableRemindCategory}.icon AS category_icon,
                 ${tableName_constant_1.tables.tableRemindCategory}.create_time AS category_create_time,
                 ${tableName_constant_1.tables.tableRemindCategory}.update_time AS category_update_time,
                 ${tableName_constant_1.tables.tableRemindCategory}.is_deleted AS category_is_deleted`, `${tableName_constant_1.tables.tableVehicleNoGPS}.user_id = ? AND (${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate LIKE '%${data.keyword}%' OR ${tableName_constant_1.tables.tableVehicleNoGPS}.license LIKE '%${data.keyword}%') AND ${tableName_constant_1.tables.tableVehicleNoGPS}.is_deleted = 0`, [user_id], [
                {
                    table: tableName_constant_1.tables.tableRemindVehicle,
                    on: `${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate = ${tableName_constant_1.tables.tableRemindVehicle}.vehicle_id`,
                    type: 'INNER',
                },
                {
                    table: tableName_constant_1.tables.tableRemind,
                    on: `${tableName_constant_1.tables.tableRemindVehicle}.remind_id = ${tableName_constant_1.tables.tableRemind}.id`,
                    type: 'INNER',
                },
                {
                    table: tableName_constant_1.tables.tableRemindCategory,
                    on: `${tableName_constant_1.tables.tableRemind}.remind_category_id = ${tableName_constant_1.tables.tableRemindCategory}.id`,
                    type: 'INNER',
                },
            ]);
            return result;
        });
    }
}
exports.default = new VehicleNoGPS();
