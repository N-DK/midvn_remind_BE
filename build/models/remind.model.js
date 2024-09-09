'use strict';
var __awaiter =
    (this && this.__awaiter) ||
    function (thisArg, _arguments, P, generator) {
        function adopt(value) {
            return value instanceof P
                ? value
                : new P(function (resolve) {
                      resolve(value);
                  });
        }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator['throw'](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : adopt(result.value).then(fulfilled, rejected);
            }
            step(
                (generator = generator.apply(thisArg, _arguments || [])).next(),
            );
        });
    };
var __importDefault =
    (this && this.__importDefault) ||
    function (mod) {
        return mod && mod.__esModule ? mod : { default: mod };
    };
Object.defineProperty(exports, '__esModule', { value: true });
const database_model_1 = __importDefault(require('./database.model'));
const tableName_constant_1 = require('../constants/tableName.constant');
const redis_model_1 = __importDefault(require('./redis.model'));
const notify_services_1 = require('notify-services');
const schedule_util_1 = __importDefault(require('../utils/schedule.util'));
const INFINITY = 2147483647;
class RemindModel extends database_model_1.default {
    constructor() {
        super();
    }
    getAll(con, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.selectWithJoins(
                con,
                tableName_constant_1.tables.tableVehicleNoGPS,
                `${tableName_constant_1.tables.tableVehicleNoGPS}.id AS vehicle_id,
               ${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate AS license_plate,
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
               ${tableName_constant_1.tables.tableRemindCategory}.is_deleted AS category_is_deleted`,
                `${tableName_constant_1.tables.tableVehicleNoGPS}.user_id = ? AND ${tableName_constant_1.tables.tableVehicleNoGPS}.is_deleted = 0`,
                [userID],
                [
                    {
                        table: tableName_constant_1.tables.tableRemindVehicle,
                        on: `${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate = ${tableName_constant_1.tables.tableRemindVehicle}.vehicle_id`,
                        type: 'LEFT',
                    },
                    {
                        table: tableName_constant_1.tables.tableRemind,
                        on: `${tableName_constant_1.tables.tableRemindVehicle}.remind_id = ${tableName_constant_1.tables.tableRemind}.id`,
                        type: 'LEFT',
                    },
                    {
                        table: tableName_constant_1.tables.tableRemindCategory,
                        on: `${tableName_constant_1.tables.tableRemind}.remind_category_id = ${tableName_constant_1.tables.tableRemindCategory}.id`,
                        type: 'LEFT',
                    },
                ],
            );
            return result;
        });
    }
    getByVehicleId(con, vehicleID) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.selectWithJoins(
                con,
                tableName_constant_1.tables.tableVehicleNoGPS,
                `${tableName_constant_1.tables.tableVehicleNoGPS}.id AS vehicle_id,
                 ${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate AS license_plate,
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
                 ${tableName_constant_1.tables.tableRemindCategory}.is_deleted AS category_is_deleted`,
                `${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate = ? AND ${tableName_constant_1.tables.tableVehicleNoGPS}.is_deleted = 0`,
                [vehicleID],
                [
                    {
                        table: tableName_constant_1.tables.tableRemindVehicle,
                        on: `${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate = ${tableName_constant_1.tables.tableRemindVehicle}.vehicle_id`,
                        type: 'LEFT',
                    },
                    {
                        table: tableName_constant_1.tables.tableRemind,
                        on: `${tableName_constant_1.tables.tableRemindVehicle}.remind_id = ${tableName_constant_1.tables.tableRemind}.id`,
                        type: 'LEFT',
                    },
                    {
                        table: tableName_constant_1.tables.tableRemindCategory,
                        on: `${tableName_constant_1.tables.tableRemind}.remind_category_id = ${tableName_constant_1.tables.tableRemindCategory}.id`,
                        type: 'LEFT',
                    },
                ],
            );
            return result;
        });
    }
    addRemind(con, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
            try {
                const payload = {
                    img_url:
                        (_a =
                            data === null || data === void 0
                                ? void 0
                                : data.img_url) !== null && _a !== void 0
                            ? _a
                            : null,
                    note_repair:
                        (_b =
                            data === null || data === void 0
                                ? void 0
                                : data.note_repair) !== null && _b !== void 0
                            ? _b
                            : null,
                    history_repair:
                        (_c =
                            data === null || data === void 0
                                ? void 0
                                : data.history_repair) !== null && _c !== void 0
                            ? _c
                            : null,
                    current_kilometers:
                        (_d =
                            data === null || data === void 0
                                ? void 0
                                : data.current_kilometers) !== null &&
                        _d !== void 0
                            ? _d
                            : 0,
                    cumulative_kilometers:
                        (_e =
                            data === null || data === void 0
                                ? void 0
                                : data.cumulative_kilometers) !== null &&
                        _e !== void 0
                            ? _e
                            : 0,
                    expiration_time:
                        (_f =
                            data === null || data === void 0
                                ? void 0
                                : data.expiration_time) !== null &&
                        _f !== void 0
                            ? _f
                            : 0,
                    is_deleted: 0,
                    km_before:
                        (_g =
                            data === null || data === void 0
                                ? void 0
                                : data.km_before) !== null && _g !== void 0
                            ? _g
                            : INFINITY,
                    is_notified:
                        (_h =
                            data === null || data === void 0
                                ? void 0
                                : data.is_notified) !== null && _h !== void 0
                            ? _h
                            : 0,
                    is_received:
                        (_j =
                            data === null || data === void 0
                                ? void 0
                                : data.is_received) !== null && _j !== void 0
                            ? _j
                            : 0,
                    remind_category_id: data.remind_category_id,
                    create_time: Date.now(),
                };
                const remind_id = yield this.insert(
                    con,
                    tableName_constant_1.tables.tableRemind,
                    payload,
                );
                const result = yield this.insertVehicles(
                    con,
                    remind_id,
                    data === null || data === void 0 ? void 0 : data.vehicles,
                    data === null || data === void 0 ? void 0 : data.tire_seri,
                );
                const remind = Object.assign(Object.assign({}, payload), {
                    remind_id,
                    vehicles:
                        (_k =
                            data === null || data === void 0
                                ? void 0
                                : data.vehicles) !== null && _k !== void 0
                            ? _k
                            : [],
                });
                yield this.updateRedis(remind_id, remind);
                yield this.scheduleCronJobForExpiration(remind);
                for (const schedule of data === null || data === void 0
                    ? void 0
                    : data.schedules) {
                    yield this.handleSchedule(
                        schedule,
                        remind,
                        data === null || data === void 0
                            ? void 0
                            : data.vehicles,
                    );
                }
                const values =
                    (_l =
                        data === null || data === void 0
                            ? void 0
                            : data.schedules) === null || _l === void 0
                        ? void 0
                        : _l
                              .map(
                                  (schedule) =>
                                      `(${remind_id}, ${schedule.start}, ${
                                          schedule.end
                                      }, '${schedule.time}', ${Date.now()})`,
                              )
                              .join(',');
                const queryText = `INSERT INTO ${tableName_constant_1.tables.tableRemindSchedule} (remind_id, start, end, time, create_time) VALUES ${values}`;
                yield new Promise((resolve, reject) => {
                    con.query(queryText, (err, result) => {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(result);
                        }
                    });
                });
                return result;
            } catch (error) {
                console.error('Error adding remind:', error);
                throw error;
            }
        });
    }
    insertVehicles(con, remind_id, vehicles, tire_seri) {
        return __awaiter(this, void 0, void 0, function* () {
            const values =
                vehicles === null || vehicles === void 0
                    ? void 0
                    : vehicles
                          .map(
                              (vehicle) =>
                                  `(${remind_id}, '${vehicle}', '${
                                      tire_seri !== null && tire_seri !== void 0
                                          ? tire_seri
                                          : null
                                  }')`,
                          )
                          .join(',');
            const queryText = `INSERT INTO ${tableName_constant_1.tables.tableRemindVehicle} (remind_id, vehicle_id, tire_seri) VALUES ${values}`;
            const result = yield new Promise((resolve, reject) => {
                con.query(queryText, (err, result) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                });
            });
            return result;
        });
    }
    updateRedis(remind_id, remind) {
        return __awaiter(this, void 0, void 0, function* () {
            const isRedisReady =
                redis_model_1.default.redis.instanceConnect.isReady;
            if (isRedisReady) {
                yield redis_model_1.default.hSet(
                    'remind',
                    remind_id,
                    JSON.stringify(remind),
                    'remind.models.ts',
                    Date.now(),
                );
            }
        });
    }
    scheduleCronJobForExpiration(remind) {
        return __awaiter(this, void 0, void 0, function* () {
            const cronJob =
                yield schedule_util_1.default.createCronJobForExpired(
                    new Date(remind.expiration_time + 86400000),
                    remind,
                );
            cronJob.start();
        });
    }
    handleSchedule(schedule, remind, vehicles) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create and schedule reminders
            schedule_util_1.default.createSchedule(
                {
                    start: new Date(schedule.start),
                    end: new Date(schedule.end),
                    time: schedule.time,
                },
                () =>
                    __awaiter(this, void 0, void 0, function* () {
                        yield notify_services_1.remindFeature.sendNotifyRemind(
                            'http://localhost:3007',
                            {
                                name_remind: remind.note_repair + ' NDK',
                                vehicle_name: vehicles.join(', '),
                                user_id: 5,
                            },
                        );
                    }),
                remind,
            );
        });
    }
    updateNotifiedOff(con, remindID) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.update(
                con,
                tableName_constant_1.tables.tableRemind,
                { is_notified: 1 },
                'id',
                remindID,
            );
            const isRedisReady =
                redis_model_1.default.redis.instanceConnect.isReady;
            const { data } = yield redis_model_1.default.hGetAll(
                'remind',
                'remind.model.ts',
                Date.now(),
            );
            const reminds = isRedisReady ? Object.values(data) : result;
            if (isRedisReady) {
                const remindIndex = reminds.findIndex(
                    (remind) => remind.id === remindID,
                );
                if (remindIndex !== -1) {
                    let remind = JSON.parse(reminds[remindIndex]);
                    remind.is_notified = 1;
                    yield redis_model_1.default.hSet(
                        'remind',
                        remindID,
                        JSON.stringify(remind),
                        'remind.models.ts',
                        Date.now(),
                    );
                } else {
                    console.log(
                        `Remind with ID ${remindID} not found in Redis`,
                    );
                }
            }
            return result;
        });
    }
    updateNotifiedON(con, remindID) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.update(
                con,
                tableName_constant_1.tables.tableRemind,
                { is_notified: 0 },
                'id',
                remindID,
            );
            const isRedisReady =
                redis_model_1.default.redis.instanceConnect.isReady;
            const { data } = yield redis_model_1.default.hGetAll(
                'remind',
                'remind.model.ts',
                Date.now(),
            );
            const reminds = isRedisReady ? Object.values(data) : result;
            if (isRedisReady) {
                const remindIndex = reminds.findIndex(
                    (remind) => remind.id === remindID,
                );
                if (remindIndex !== -1) {
                    let remind = JSON.parse(reminds[remindIndex]);
                    remind.is_notified = 0;
                    yield redis_model_1.default.hSet(
                        'remind',
                        remindID,
                        JSON.stringify(remind),
                        'remind.models.ts',
                        Date.now(),
                    );
                } else {
                    console.log(
                        `Remind with ID ${remindID} not found in Redis`,
                    );
                }
            }
            return result;
        });
    }
    updateRemind(con, data, remindID) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j;
            const result = yield this.update(
                con,
                tableName_constant_1.tables.tableRemind,
                {
                    img_url:
                        (_a =
                            data === null || data === void 0
                                ? void 0
                                : data.img_url) !== null && _a !== void 0
                            ? _a
                            : null,
                    note_repair:
                        (_b =
                            data === null || data === void 0
                                ? void 0
                                : data.note_repair) !== null && _b !== void 0
                            ? _b
                            : null,
                    history_repair:
                        (_c =
                            data === null || data === void 0
                                ? void 0
                                : data.history_repair) !== null && _c !== void 0
                            ? _c
                            : null,
                    current_kilometers:
                        (_d =
                            data === null || data === void 0
                                ? void 0
                                : data.current_kilometers) !== null &&
                        _d !== void 0
                            ? _d
                            : 0,
                    cumulative_kilometers:
                        (_e =
                            data === null || data === void 0
                                ? void 0
                                : data.cumulative_kilometers) !== null &&
                        _e !== void 0
                            ? _e
                            : 0,
                    expiration_time:
                        (_f =
                            data === null || data === void 0
                                ? void 0
                                : data.time_expire) !== null && _f !== void 0
                            ? _f
                            : 0,
                    time_before:
                        (_g =
                            data === null || data === void 0
                                ? void 0
                                : data.time_before) !== null && _g !== void 0
                            ? _g
                            : INFINITY,
                    is_notified:
                        (_h =
                            data === null || data === void 0
                                ? void 0
                                : data.is_notified) !== null && _h !== void 0
                            ? _h
                            : 0,
                    is_received:
                        (_j =
                            data === null || data === void 0
                                ? void 0
                                : data.is_notified) !== null && _j !== void 0
                            ? _j
                            : 0,
                    update_time: Date.now(),
                },
                'id',
                remindID,
            );
            const isRedisReady =
                redis_model_1.default.redis.instanceConnect.isReady;
            if (isRedisReady) {
                yield redis_model_1.default.hSet(
                    'remind',
                    remindID,
                    JSON.stringify(result),
                    'remind.models.ts',
                    Date.now(),
                );
            }
            return result;
        });
    }
    search(con, userID, query) {
        return __awaiter(this, void 0, void 0, function* () {
            let params = [userID];
            let whereClause = `${
                tableName_constant_1.tables.tableVehicleNoGPS
            }.user_id = ? ${
                query.vehicle_id
                    ? `AND ${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate = ${query.vehicle_id}`
                    : ''
            } AND ${
                tableName_constant_1.tables.tableVehicleNoGPS
            }.is_deleted = 0 AND 
            (
                note_repair LIKE '%${query.keyword}%' OR
                cumulative_kilometers LIKE '%${query.keyword}%' OR
                ${
                    tableName_constant_1.tables.tableRemindCategory
                }.name LIKE '%${query.keyword}%' OR
                ${
                    tableName_constant_1.tables.tableVehicleNoGPS
                }.license_plate LIKE '%${query.keyword}%' OR 
                ${
                    tableName_constant_1.tables.tableVehicleNoGPS
                }.license LIKE '%${query.keyword}%'
            )`;
            const result = yield this.selectWithJoins(
                con,
                tableName_constant_1.tables.tableVehicleNoGPS,
                `${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate AS license_plate,
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
               ${tableName_constant_1.tables.tableRemindCategory}.is_deleted AS category_is_deleted`,
                whereClause,
                params,
                [
                    {
                        table: tableName_constant_1.tables.tableRemindVehicle,
                        on: `${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate = ${tableName_constant_1.tables.tableRemindVehicle}.vehicle_id`,
                        type: 'LEFT',
                    },
                    {
                        table: tableName_constant_1.tables.tableRemind,
                        on: `${tableName_constant_1.tables.tableRemindVehicle}.remind_id = ${tableName_constant_1.tables.tableRemind}.id`,
                        type: 'LEFT',
                    },
                    {
                        table: tableName_constant_1.tables.tableRemindCategory,
                        on: `${tableName_constant_1.tables.tableRemind}.remind_category_id = ${tableName_constant_1.tables.tableRemindCategory}.id`,
                        type: 'LEFT',
                    },
                ],
            );
            return result;
        });
    }
    updateIsDeleted(con, remindID) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.update(
                con,
                tableName_constant_1.tables.tableRemind,
                { is_deleted: 1 },
                'id',
                remindID,
            );
            const isRedisReady =
                redis_model_1.default.redis.instanceConnect.isReady;
            const { data } = yield redis_model_1.default.hGetAll(
                'remind',
                'remind.model.ts',
                Date.now(),
            );
            const reminds = isRedisReady ? Object.values(data) : result;
            if (isRedisReady) {
                const remindIndex = reminds.findIndex(
                    (remind) => remind.id === remindID,
                );
                if (remindIndex !== -1) {
                    let remind = JSON.parse(reminds[remindIndex]);
                    remind.is_deleted = 1;
                    yield redis_model_1.default.hSet(
                        'remind',
                        remindID,
                        JSON.stringify(remind),
                        'remind.models.ts',
                        Date.now(),
                    );
                } else {
                    console.log(
                        `Remind with ID ${remindID} not found in Redis`,
                    );
                }
            }
            return result;
        });
    }
}
exports.default = new RemindModel();
