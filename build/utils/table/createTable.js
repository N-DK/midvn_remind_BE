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
Object.defineProperty(exports, "__esModule", { value: true });
const createTable = (db, tableName) => __awaiter(void 0, void 0, void 0, function* () {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
            id int(11) NOT NULL AUTO_INCREMENT,
            imei varchar(45) NOT NULL,
            lat varchar(45) NOT NULL,
            lng varchar(45) NOT NULL,
            start_time bigint(20) DEFAULT NULL,
            tollboth_name varchar(255) NOT NULL,
            dri varchar(45) DEFAULT NULL,
            create_at bigint(20) DEFAULT NULL,
            PRIMARY KEY (id),
            KEY idx_imei_tollboth_name (imei, tollboth_name)
        )`;
    try {
        db.query(createTableQuery, (err) => {
            if (err) {
                throw new Error(`Failed to create table ${tableName}: ${err.message}`);
            }
        });
    }
    catch (err) {
        throw new Error(`Failed to create table ${tableName}: ${err.message}`);
    }
});
exports.default = createTable;
