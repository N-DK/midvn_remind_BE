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
const msg_constant_1 = __importDefault(require("../constants/msg.constant"));
class DatabaseModel {
    //get all + get by id + get where in
    select(db_1, tableName_1) {
        return __awaiter(this, arguments, void 0, function* (db, tableName, fields = '*', where = '', conditions = [], orderByField = 'id', orderBySort = 'DESC', offset = 0, limit = 10) {
            return yield new Promise((resolve, reject) => {
                const query = `SELECT ${fields} FROM ${tableName} WHERE ${where} ORDER BY ${orderByField} ${orderBySort} LIMIT ${offset},${limit}`;
                db.query(query, conditions, (err, dataRes) => {
                    // console.log(query);
                    // console.log(conditions);
                    if (err) {
                        console.log(err);
                        return reject({ msg: msg_constant_1.default.ERROR });
                    }
                    // console.log(dataRes);
                    return resolve(dataRes);
                });
            });
        });
    }
    // insert
    insert(db, tableName, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                const query = `INSERT INTO ${tableName} SET ?`;
                db.query(query, data, (err, dataRes) => {
                    if (err) {
                        return reject({ msg: err.sqlMessage });
                    }
                    return resolve(dataRes === null || dataRes === void 0 ? void 0 : dataRes.insertId);
                });
            });
        });
    }
    // insertIgnore
    insertIgnore(db, tableName, fields, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                const query = `INSERT IGNORE INTO ${tableName} (${fields}) VALUES ?`;
                db.query(query, [data], (err, dataRes) => {
                    if (err) {
                        console.log(err);
                        return reject({ msg: msg_constant_1.default.ERROR });
                    }
                    // console.log('dataRes.insertId', dataRes.insertId);
                    return resolve(dataRes.insertId);
                });
            });
        });
    }
    // insertDuplicate
    insertDuplicate(db, tableName, field, dataInsert, dataUpdate) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                const query = `INSERT INTO ${tableName} (${field}) VALUES ? ON DUPLICATE KEY UPDATE ${dataUpdate}`;
                // console.log(query);
                db.query(query, [dataInsert], (err, dataRes) => {
                    if (err) {
                        console.log(err);
                        return reject({ msg: msg_constant_1.default.ERROR });
                    }
                    // console.log('dataRes.insertId', dataRes.insertId);
                    return resolve(dataRes === null || dataRes === void 0 ? void 0 : dataRes.insertId);
                });
            });
        });
    }
    // insertMulti
    insertMulti(db, tableName, fields, data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                const query = `INSERT INTO ${tableName} (${fields}) VALUES ?`;
                db.query(query, [data], (err, dataRes) => {
                    if (err) {
                        console.log(err);
                        return reject({ msg: msg_constant_1.default.ERROR });
                    }
                    // console.log('dataRes.insertId', dataRes.insertId);
                    return resolve(dataRes === null || dataRes === void 0 ? void 0 : dataRes.insertId);
                });
            });
        });
    }
    //update
    update(db_1, tableName_1, data_1, field_1, condition_1) {
        return __awaiter(this, arguments, void 0, function* (db, tableName, data, field, condition, fieldNameError = 'ID', checkExit = true) {
            return yield new Promise((resolve, reject) => {
                const query = typeof data === 'string'
                    ? `UPDATE ${tableName} SET ${data} WHERE ${field} IN (?)`
                    : `UPDATE ${tableName} SET ? WHERE ${field} IN (?)`;
                db.query(query, typeof data === 'string'
                    ? condition
                    : typeof data === 'object'
                        ? [data, condition]
                        : [data, ...condition], (err, dataRes) => {
                    if (err) {
                        console.log(err);
                        return reject({ msg: err.sqlMessage });
                    }
                    if (dataRes.affectedRows === 0 && checkExit) {
                        return reject({
                            msg: `${fieldNameError} ${msg_constant_1.default.NOT_EXITS}`,
                        });
                    }
                    return resolve(dataRes);
                });
            });
        });
    }
    //updata multi rows with multi conditions
    updatMultiRowsWithMultiConditions(db_1, tableName_1) {
        return __awaiter(this, arguments, void 0, function* (db, tableName, updates = [], dataSendNextPromise = '', fieldNameError = 'ID', operator = 'AND') {
            return yield new Promise((resolve, reject) => {
                if (updates.length === 0) {
                    return reject('Giá trị truyền vào không hợp lệ');
                }
                const updateStatements = updates.map((update) => {
                    const { field, conditions } = update;
                    const caseStatements = conditions.map((condition) => {
                        const { conditionField, conditionValue, updateValue } = condition;
                        if (Array.isArray(conditionField) &&
                            Array.isArray(conditionValue)) {
                            const resultConditon = conditionField.map((item, i) => `${item} = "${conditionValue[i]}"`);
                            return `WHEN ${resultConditon.join(` ${operator} `)} THEN "${updateValue}"`;
                        }
                        else {
                            return `WHEN ${conditionField} = ${conditionValue} THEN ${updateValue}`;
                        }
                    });
                    return `
                ${field} = CASE 
                    ${caseStatements.join(' ')}
                    ELSE ${field} 
                END
            `;
                });
                const updateQuery = `UPDATE ${tableName} SET ${updateStatements.join(', ')}`;
                db.query(updateQuery, (err, dataRes) => {
                    if (err) {
                        console.log(err);
                        return reject({ msg: msg_constant_1.default.ERROR });
                    }
                    if (dataRes.affectedRows === 0) {
                        return reject({
                            msg: `${fieldNameError} ${msg_constant_1.default.NOT_EXITS}`,
                        });
                    }
                    return resolve(dataSendNextPromise);
                });
            });
        });
    }
    // Delete
    delete(db_1, tableName_1, where_1) {
        return __awaiter(this, arguments, void 0, function* (db, tableName, where, conditions = [], fieldNameError = 'ID', checkExit = true) {
            return yield new Promise((resolve, reject) => {
                const query = `DELETE FROM ${tableName} WHERE ${where}`;
                db.query(query, conditions, (err, dataRes) => {
                    if (err) {
                        console.log(err);
                        return reject({ msg: msg_constant_1.default.ERROR });
                    }
                    if (dataRes.affectedRows === 0 && checkExit) {
                        return reject({
                            msg: `${fieldNameError} ${msg_constant_1.default.NOT_EXITS}`,
                        });
                    }
                    resolve(dataRes);
                });
            });
        });
    }
    //sum
    sum(db, tableName, field, where) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield new Promise((resolve, reject) => {
                const query = `SELECT SUM(${field}) as total_sum FROM ${tableName} WHERE ${where}`;
                db.query(query, (err, dataRes) => {
                    // console.log(query);
                    if (err) {
                        console.log(err);
                        return reject({ msg: msg_constant_1.default.ERROR });
                    }
                    return resolve(dataRes);
                });
            });
        });
    }
    //count
    count(db_1, tableName_1) {
        return __awaiter(this, arguments, void 0, function* (db, tableName, field = '*', where = '', conditions = []) {
            return yield new Promise((resolve, reject) => {
                const query = `SELECT COUNT(${field}) as total FROM ${tableName} WHERE ${where}`;
                db.query(query, conditions, (err, dataRes) => {
                    // console.log(query);
                    if (err) {
                        console.log(err);
                        return reject({ msg: msg_constant_1.default.ERROR });
                    }
                    return resolve(dataRes);
                });
            });
        });
    }
    //----------------------------------------------------
    selectWithJoins(db_1, mainTable_1) {
        return __awaiter(this, arguments, void 0, function* (db, mainTable, fields = '*', where = '', conditions = [], joins = []) {
            return yield new Promise((resolve, reject) => {
                const joinClauses = joins
                    .map((join) => {
                    const joinType = join.type ? `${join.type} JOIN` : 'JOIN';
                    return `${joinType} ${join.table} ON ${join.on}`;
                })
                    .join(' ');
                const query = `SELECT ${fields} FROM ${mainTable} ${joinClauses} WHERE ${where}`;
                // console.log(query);
                db.query(query, conditions, (err, dataRes) => {
                    if (err) {
                        console.log(err);
                        return reject({
                            msg: 'Error occurred while querying the database.',
                        });
                    }
                    return resolve(dataRes);
                });
            });
        });
    }
}
exports.default = DatabaseModel;
