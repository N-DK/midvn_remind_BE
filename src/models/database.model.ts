import { PoolConnection, QueryError, QueryResult } from 'mysql2';
import constants from '../constants/msg.constant';

class DatabaseModel {
    //get all + get by id + get where in
    async select(
        db: PoolConnection,
        tableName: string,
        fields = '*',
        where = '',
        conditions: any = [],
        orderByField = 'id',
        orderBySort = 'DESC',
        offset = 0,
        limit = 1000,
    ) {
        return await new Promise((resolve, reject) => {
            const query = `SELECT ${fields} FROM ${tableName} WHERE ${where} ORDER BY ${orderByField} ${orderBySort} LIMIT ${offset},${limit}`;
            db.query(
                query,
                conditions,
                (err: QueryError | null, dataRes: QueryResult) => {
                    // console.log(query);
                    // console.log(conditions);
                    if (err) {
                        console.log(err);
                        return reject({ msg: constants.ERROR });
                    }
                    // console.log(dataRes);
                    return resolve(dataRes);
                },
            );
        });
    }

    // insert
    async insert(db: PoolConnection, tableName: string, data: any) {
        return await new Promise((resolve, reject) => {
            const query = `INSERT INTO ${tableName} SET ?`;
            db.query(query, data, (err: any | null, dataRes: any) => {
                if (err) {
                    return reject({ msg: err.sqlMessage });
                }
                return resolve(dataRes?.insertId);
            });
        });
    }

    // insertIgnore
    async insertIgnore(
        db: PoolConnection,
        tableName: string,
        fields: string,
        data: any,
    ) {
        return await new Promise((resolve, reject) => {
            const query = `INSERT IGNORE INTO ${tableName} (${fields}) VALUES ?`;
            db.query(query, [data], (err, dataRes: any) => {
                if (err) {
                    console.log(err);
                    return reject({ msg: constants.ERROR });
                }
                // console.log('dataRes.insertId', dataRes.insertId);
                return resolve(dataRes.insertId);
            });
        });
    }

    // insertDuplicate
    async insertDuplicate(
        db: PoolConnection,
        tableName: string,
        field: string,
        dataInsert: any,
        dataUpdate: any,
    ) {
        return await new Promise((resolve, reject) => {
            const query = `INSERT INTO ${tableName} (${field}) VALUES ? ON DUPLICATE KEY UPDATE ${dataUpdate}`;
            // console.log(query);
            db.query(query, [dataInsert], (err, dataRes: any) => {
                if (err) {
                    console.log(err);
                    return reject({ msg: constants.ERROR });
                }
                // console.log('dataRes.insertId', dataRes.insertId);
                return resolve(dataRes?.insertId);
            });
        });
    }

    // insertMulti
    async insertMulti(
        db: PoolConnection,
        tableName: string,
        fields: string,
        data: any,
    ) {
        return await new Promise((resolve, reject) => {
            const query = `INSERT INTO ${tableName} (${fields}) VALUES ?`;
            db.query(query, [data], (err, dataRes: any) => {
                if (err) {
                    console.log(err);
                    return reject({ msg: constants.ERROR });
                }
                // console.log('dataRes.insertId', dataRes.insertId);
                return resolve(dataRes?.insertId);
            });
        });
    }

    //update
    async update(
        db: PoolConnection,
        tableName: string,
        data: any,
        field: string,
        condition: any,
        fieldNameError = 'ID',
        checkExit = true,
    ) {
        return await new Promise((resolve, reject) => {
            const query =
                typeof data === 'string'
                    ? `UPDATE ${tableName} SET ${data} WHERE ${field} IN (?)`
                    : `UPDATE ${tableName} SET ? WHERE ${field} IN (?)`;
            db.query(
                query,
                typeof data === 'string'
                    ? condition
                    : typeof data === 'object'
                    ? [data, condition]
                    : [data, ...condition],
                (err: any, dataRes: any) => {
                    if (err) {
                        console.log(err);
                        return reject({ msg: err.sqlMessage });
                    }
                    if (dataRes.affectedRows === 0 && checkExit) {
                        return reject({
                            msg: `${fieldNameError} ${constants.NOT_EXITS}`,
                        });
                    }
                    return resolve(dataRes);
                },
            );
        });
    }

    //updata multi rows with multi conditions
    async updatMultiRowsWithMultiConditions(
        db: PoolConnection,
        tableName: string,
        updates = [],
        dataSendNextPromise = '',
        fieldNameError = 'ID',
        operator = 'AND',
    ) {
        return await new Promise((resolve, reject) => {
            if (updates.length === 0) {
                return reject('Giá trị truyền vào không hợp lệ');
            }
            const updateStatements = updates.map((update) => {
                const { field, conditions }: { field: string; conditions: [] } =
                    update;

                const caseStatements = conditions.map((condition) => {
                    const { conditionField, conditionValue, updateValue }: any =
                        condition;
                    if (
                        Array.isArray(conditionField) &&
                        Array.isArray(conditionValue)
                    ) {
                        const resultConditon = conditionField.map(
                            (item: any, i: number) =>
                                `${item} = "${conditionValue[i]}"`,
                        );
                        return `WHEN ${resultConditon.join(
                            ` ${operator} `,
                        )} THEN "${updateValue}"`;
                    } else {
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
            const updateQuery = `UPDATE ${tableName} SET ${updateStatements.join(
                ', ',
            )}`;
            db.query(updateQuery, (err, dataRes: any) => {
                if (err) {
                    console.log(err);
                    return reject({ msg: constants.ERROR });
                }
                if (dataRes.affectedRows === 0) {
                    return reject({
                        msg: `${fieldNameError} ${constants.NOT_EXITS}`,
                    });
                }
                return resolve(dataSendNextPromise);
            });
        });
    }

    // Delete
    async delete(
        db: PoolConnection,
        tableName: string,
        where: string,
        conditions = [],
        fieldNameError = 'ID',
        checkExit = true,
    ) {
        return await new Promise((resolve, reject) => {
            const query = `DELETE FROM ${tableName} WHERE ${where}`;

            // console.log(query);

            db.query(query, conditions, (err, dataRes: any) => {
                if (err) {
                    console.log(err);
                    return reject({ msg: constants.ERROR });
                }
                if (dataRes.affectedRows === 0 && checkExit) {
                    return reject({
                        msg: `${fieldNameError} ${constants.NOT_EXITS}`,
                    });
                }
                resolve(dataRes);
            });
        });
    }

    //sum
    async sum(
        db: PoolConnection,
        tableName: string,
        field: string,
        where: string,
    ) {
        return await new Promise((resolve, reject) => {
            const query = `SELECT SUM(${field}) as total_sum FROM ${tableName} WHERE ${where}`;
            db.query(query, (err, dataRes) => {
                // console.log(query);
                if (err) {
                    console.log(err);
                    return reject({ msg: constants.ERROR });
                }
                return resolve(dataRes);
            });
        });
    }

    //count
    async count(
        db: PoolConnection,
        tableName: string,
        field: string = '*',
        where: string = '',
        conditions: any[] = [],
    ) {
        return await new Promise((resolve, reject) => {
            const query = `SELECT COUNT(${field}) as total FROM ${tableName} WHERE ${where}`;
            db.query(query, conditions, (err, dataRes) => {
                if (err) {
                    console.log(err);
                    return reject({ msg: constants.ERROR });
                }
                return resolve(dataRes);
            });
        });
    }

    //----------------------------------------------------
    async selectWithJoins(
        db: PoolConnection,
        mainTable: string,
        fields: string = '*',
        where: string = '',
        conditions: any = [],
        joins: {
            table: string;
            on: string;
            type?: 'LEFT' | 'INNER' | 'RIGHT';
        }[] = [],
        orderBy: string = '',
    ) {
        return await new Promise((resolve, reject) => {
            if (!db) {
                return reject({ msg: 'Database connection is required.' });
            }

            const joinClauses = joins
                .map((join) => {
                    const joinType = join.type ? `${join.type} JOIN` : 'JOIN';
                    return `${joinType} ${join.table} ON ${join.on}`;
                })
                .join(' ');
            const query = `SELECT ${fields} FROM ${mainTable} ${joinClauses} WHERE ${where} ${orderBy}`;

            db.query(
                query,
                conditions,
                (err: QueryError | null, dataRes: QueryResult) => {
                    if (err) {
                        console.log(err);
                        return reject({
                            msg: 'Error occurred while querying the database.',
                        });
                    }
                    return resolve(dataRes);
                },
            );
        });
    }
}

export default DatabaseModel;
