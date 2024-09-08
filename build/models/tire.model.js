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
class TireModel extends database_model_1.default {
    constructor() {
        super();
    }
    getTiresByVehicleId(conn, vehicleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.select(conn, tableName_constant_1.tables.tableTire, 'id, seri, size, brand, license_plate', 'license_plate = ? AND is_deleted = 0', [vehicleId]);
            return result;
        });
    }
    addTire(conn, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { seri, size, brand, license_plate } = data;
            const result = yield this.insert(conn, tableName_constant_1.tables.tableTire, {
                seri,
                size,
                brand,
                license_plate,
                create_time: Date.now(),
            });
            return result;
        });
    }
    updateTire(conn, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { tire_id, seri, size, brand } = data;
            const result = yield this.update(conn, tableName_constant_1.tables.tableTire, { seri, size, brand, update_time: Date.now() }, 'id', tire_id);
            return result;
        });
    }
    deleteTire(conn, tire_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.update(conn, tableName_constant_1.tables.tableTire, { is_deleted: 1, update_time: Date.now() }, 'id', tire_id);
            return result;
        });
    }
    restoreTire(conn, tire_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.update(conn, tableName_constant_1.tables.tableTire, { is_deleted: 0, update_time: Date.now() }, 'id', tire_id);
            return result;
        });
    }
    search(conn, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.select(conn, tableName_constant_1.tables.tableTire, '*', `license_plate = '${data.vehicleID}' AND (seri LIKE '%${data.keyword}%' OR brand LIKE '%${data.keyword}%')`);
            return result;
        });
    }
}
exports.default = new TireModel();
