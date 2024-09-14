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
const redis_model_1 = __importDefault(require("./redis.model"));
const notify_services_1 = require("notify-services");
const schedule_util_1 = __importDefault(require("../utils/schedule.util"));
const reminder_util_1 = __importDefault(require("../utils/reminder.util"));
const GPS_api_1 = __importDefault(require("../api/GPS.api"));
const dotenv_config_1 = __importDefault(require("../config/dotenv.config"));
const remind_service_1 = __importDefault(require("../services/remind.service"));
const { SV_NOTIFY } = (0, dotenv_config_1.default)();
class RemindModel extends database_model_1.default {
    constructor() {
        super();
    }
    getAll(con, userID) {
        return __awaiter(this, void 0, void 0, function* () {
            // const isRedisReady = redisModel.redis.instanceConnect.isReady;
            // if (isRedisReady) {
            //     const { data } = await redisModel.hGetAll(
            //         'remind',
            //         'remind.model.ts',
            //         Date.now(),
            //     );
            //     // filter reminds by user_id and is_deleted = 0
            //     const reminds: any = Object.values(data)
            //         .filter(
            //             (remind: any) =>
            //                 JSON.parse(remind).user_id === userID &&
            //                 JSON.parse(remind).is_deleted === 0,
            //         )
            //         .map((item: any) => JSON.parse(item));
            //     return reminds;
            // }
            const result = yield this.selectWithJoins(con, tableName_constant_1.tables.tableVehicleNoGPS, `${tableName_constant_1.tables.tableVehicleNoGPS}.id AS vehicle_id,
                 ${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate AS license_plate,
                 ${tableName_constant_1.tables.tableVehicleNoGPS}.user_id AS user_id,
                 ${tableName_constant_1.tables.tableVehicleNoGPS}.license AS license,
                 ${tableName_constant_1.tables.tableVehicleNoGPS}.create_time AS vehicle_create_time,
                 ${tableName_constant_1.tables.tableVehicleNoGPS}.update_time AS vehicle_update_time,
                 ${tableName_constant_1.tables.tableVehicleNoGPS}.user_name AS user_name,
                 ${tableName_constant_1.tables.tableVehicleNoGPS}.user_address AS user_address,
  
                 ${tableName_constant_1.tables.tableRemind}.id AS remind_id,
                 ${tableName_constant_1.tables.tableRemind}.img_url AS remind_img_url,
                 ${tableName_constant_1.tables.tableRemind}.note_repair AS note_repair,
                 ${tableName_constant_1.tables.tableRemind}.history_repair AS history_repair,
                 ${tableName_constant_1.tables.tableRemind}.current_kilometers AS current_kilometers,
                 ${tableName_constant_1.tables.tableRemind}.cumulative_kilometers AS cumulative_kilometers,
                 ${tableName_constant_1.tables.tableRemind}.expiration_time AS expiration_time,
                 ${tableName_constant_1.tables.tableRemind}.is_notified AS is_notified,
                 ${tableName_constant_1.tables.tableRemind}.is_received AS is_received,
                 ${tableName_constant_1.tables.tableRemind}.create_time AS remind_create_time,
                 ${tableName_constant_1.tables.tableRemind}.update_time AS remind_update_time,
                 
                 ${tableName_constant_1.tables.tableRemindCategory}.id AS remind_category_id,
                 ${tableName_constant_1.tables.tableRemindCategory}.name AS category_name,
                 ${tableName_constant_1.tables.tableRemindCategory}.desc AS category_desc,
                 ${tableName_constant_1.tables.tableRemindCategory}.icon AS category_icon,
                 ${tableName_constant_1.tables.tableRemindCategory}.create_time AS category_create_time,
                 ${tableName_constant_1.tables.tableRemindCategory}.update_time AS category_update_time,
                 ${tableName_constant_1.tables.tableRemindCategory}.is_deleted AS category_is_deleted,
                  ${tableName_constant_1.tables.tableRemindVehicle}.tire_seri AS tire_seri,
                  ${tableName_constant_1.tables.tableTire}.id AS tire,
                  ${tableName_constant_1.tables.tableRemind}.cycle AS cycle`, `${tableName_constant_1.tables.tableVehicleNoGPS}.user_id = ? AND ${tableName_constant_1.tables.tableVehicleNoGPS}.is_deleted = 0`, [userID], [
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
                {
                    table: tableName_constant_1.tables.tableTire,
                    on: `${tableName_constant_1.tables.tableTire}.seri = ${tableName_constant_1.tables.tableRemindVehicle}.tire_seri`,
                    type: 'LEFT',
                },
            ], `ORDER BY ${tableName_constant_1.tables.tableRemind}.id IS NULL, ${tableName_constant_1.tables.tableRemind}.expiration_time ASC`);
            return result;
        });
    }
    getByVehicleId(con, vehicleID) {
        return __awaiter(this, void 0, void 0, function* () {
            // const isRedisReady = redisModel.redis.instanceConnect.isReady;
            // if (isRedisReady) {
            //     const { data } = await redisModel.hGetAll(
            //         'remind',
            //         'remind.model.ts',
            //         Date.now(),
            //     );
            //     const reminds: any = Object.values(data)
            //         .filter((remind: any) => {
            //             remind = JSON.parse(remind);
            //             return (
            //                 remind.vehicles.includes(vehicleID) &&
            //                 remind.is_deleted === 0
            //             );
            //         })
            //         .map((item: any) => JSON.parse(item));
            //     return reminds;
            // }
            const result = yield this.selectWithJoins(con, tableName_constant_1.tables.tableVehicleNoGPS, `${tableName_constant_1.tables.tableVehicleNoGPS}.id AS vehicle_id,
                   ${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate AS license_plate,
                   ${tableName_constant_1.tables.tableVehicleNoGPS}.user_id AS user_id,
                   ${tableName_constant_1.tables.tableVehicleNoGPS}.license AS license,
                   ${tableName_constant_1.tables.tableVehicleNoGPS}.create_time AS vehicle_create_time,
                   ${tableName_constant_1.tables.tableVehicleNoGPS}.update_time AS vehicle_update_time,
                   ${tableName_constant_1.tables.tableVehicleNoGPS}.user_name AS user_name,
                   ${tableName_constant_1.tables.tableVehicleNoGPS}.user_address AS user_address,
  
                   ${tableName_constant_1.tables.tableRemind}.id AS remind_id,
                   ${tableName_constant_1.tables.tableRemind}.img_url AS remind_img_url,
                   ${tableName_constant_1.tables.tableRemind}.note_repair AS note_repair,
                   ${tableName_constant_1.tables.tableRemind}.history_repair AS history_repair,
                   ${tableName_constant_1.tables.tableRemind}.current_kilometers AS current_kilometers,
                   ${tableName_constant_1.tables.tableRemind}.cumulative_kilometers AS cumulative_kilometers,
                   ${tableName_constant_1.tables.tableRemind}.expiration_time AS expiration_time,
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
                   ${tableName_constant_1.tables.tableRemindCategory}.is_deleted AS category_is_deleted
                   ${tableName_constant_1.tables.tableRemindVehicle}.tire_seri AS tire_seri,
                   ${tableName_constant_1.tables.tableTire}.id AS tire,
                   ${tableName_constant_1.tables.tableRemind}.cycle AS cycle
                   `, `${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate = ? AND ${tableName_constant_1.tables.tableVehicleNoGPS}.is_deleted = 0`, [vehicleID], [
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
                {
                    table: tableName_constant_1.tables.tableTire,
                    on: `${tableName_constant_1.tables.tableTire}.seri = ${tableName_constant_1.tables.tableRemindVehicle}.tire_seri`,
                    type: 'LEFT',
                },
            ], `ORDER BY ${tableName_constant_1.tables.tableRemind}.expiration_time ASC`);
            return result;
        });
    }
    getCurrentKilometersByVehicleId(vehicleID, token) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const res = yield GPS_api_1.default.getGPSData(token);
            const data = res === null || res === void 0 ? void 0 : res.data;
            if (!data)
                return 0;
            return (_b = (_a = data[vehicleID]) === null || _a === void 0 ? void 0 : _a.total_distance) !== null && _b !== void 0 ? _b : 0;
        });
    }
    addRemind(con, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
            if (data === null || data === void 0 ? void 0 : data.token) {
                const currentKilometers = yield this.getCurrentKilometersByVehicleId(data === null || data === void 0 ? void 0 : data.vehicles[0], data === null || data === void 0 ? void 0 : data.token);
                data.current_kilometers = currentKilometers;
            }
            try {
                const payload = {
                    img_url: (_a = data === null || data === void 0 ? void 0 : data.img_url) !== null && _a !== void 0 ? _a : null,
                    note_repair: (_b = data === null || data === void 0 ? void 0 : data.note_repair) !== null && _b !== void 0 ? _b : null,
                    history_repair: (_c = data === null || data === void 0 ? void 0 : data.history_repair) !== null && _c !== void 0 ? _c : null,
                    current_kilometers: (_d = data === null || data === void 0 ? void 0 : data.current_kilometers) !== null && _d !== void 0 ? _d : 0,
                    cumulative_kilometers: (data === null || data === void 0 ? void 0 : data.cumulative_kilometers)
                        ? Number(data === null || data === void 0 ? void 0 : data.cumulative_kilometers)
                        : 0,
                    expiration_time: parseInt((_e = data === null || data === void 0 ? void 0 : data.expiration_time) !== null && _e !== void 0 ? _e : 0),
                    is_deleted: 0,
                    km_before: (data === null || data === void 0 ? void 0 : data.km_before) ? Number(data === null || data === void 0 ? void 0 : data.km_before) : 0,
                    is_notified: parseInt((_f = data === null || data === void 0 ? void 0 : data.is_notified) !== null && _f !== void 0 ? _f : 0),
                    is_received: parseInt((_g = data === null || data === void 0 ? void 0 : data.is_received) !== null && _g !== void 0 ? _g : 0),
                    remind_category_id: parseInt(data === null || data === void 0 ? void 0 : data.remind_category_id),
                    cycle: parseInt((_h = data === null || data === void 0 ? void 0 : data.cycle) !== null && _h !== void 0 ? _h : 0),
                    create_time: Date.now(),
                    user_id: ((_j = data === null || data === void 0 ? void 0 : data.user) === null || _j === void 0 ? void 0 : _j.level) === 10
                        ? (_k = data === null || data === void 0 ? void 0 : data.user) === null || _k === void 0 ? void 0 : _k.userId
                        : (_m = (_l = data === null || data === void 0 ? void 0 : data.user) === null || _l === void 0 ? void 0 : _l.parentId) !== null && _m !== void 0 ? _m : (_o = data === null || data === void 0 ? void 0 : data.user) === null || _o === void 0 ? void 0 : _o.userId,
                };
                // console.log('payload', payload);
                const remind_id = yield this.insert(con, tableName_constant_1.tables.tableRemind, payload);
                const result = yield this.insertVehicles(con, remind_id, data === null || data === void 0 ? void 0 : data.vehicles, data === null || data === void 0 ? void 0 : data.tire_seri);
                const remind = Object.assign(Object.assign({}, payload), { schedules: (_p = data === null || data === void 0 ? void 0 : data.schedules) !== null && _p !== void 0 ? _p : [], id: remind_id, vehicles: (_q = data === null || data === void 0 ? void 0 : data.vehicles) !== null && _q !== void 0 ? _q : [] });
                yield this.updateRedis(remind_id, remind);
                yield this.scheduleCronJobForExpiration(remind);
                if (payload.is_notified === 0 && (data === null || data === void 0 ? void 0 : data.schedules)) {
                    for (const schedule of data === null || data === void 0 ? void 0 : data.schedules) {
                        yield this.handleSchedule(schedule, remind, data === null || data === void 0 ? void 0 : data.vehicles);
                    }
                }
                yield this.insertRemindSchedule(con, remind_id, data);
                return result;
            }
            catch (error) {
                console.error('Error adding remind:', error);
                throw error;
            }
        });
    }
    insertVehicles(con, remind_id, vehicles, tire_seri) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!vehicles || vehicles.length === 0) {
                return;
            }
            const values = vehicles === null || vehicles === void 0 ? void 0 : vehicles.map((vehicle) => `(${remind_id}, '${vehicle}', '${tire_seri !== null && tire_seri !== void 0 ? tire_seri : null}')`).join(',');
            const queryText = `INSERT INTO ${tableName_constant_1.tables.tableRemindVehicle} (remind_id, vehicle_id, tire_seri) VALUES ${values}`;
            const result = yield new Promise((resolve, reject) => {
                con.query(queryText, (err, result) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                });
            });
            return result;
        });
    }
    updateRedis(remind_id, remind) {
        return __awaiter(this, void 0, void 0, function* () {
            const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
            if (isRedisReady) {
                yield redis_model_1.default.hSet('remind', remind_id, JSON.stringify(remind), 'remind.models.ts', Date.now());
            }
        });
    }
    scheduleCronJobForExpiration(remind) {
        return __awaiter(this, void 0, void 0, function* () {
            const cronJob = yield schedule_util_1.default.createCronJobForExpired(new Date(remind.expiration_time + 86400000), remind);
            cronJob.start();
        });
    }
    handleSchedule(schedule, remind, vehicles) {
        return __awaiter(this, void 0, void 0, function* () {
            // Create and schedule reminders
            schedule_util_1.default.createSchedule({
                start: new Date(schedule.start),
                end: new Date(schedule.end),
                time: schedule.time,
            }, () => __awaiter(this, void 0, void 0, function* () {
                yield notify_services_1.remindFeature.sendNotifyRemind(SV_NOTIFY, {
                    name_remind: remind.note_repair + ' NDK',
                    vehicle_name: vehicles.join(', '),
                    user_id: remind.user_id,
                });
            }), remind);
        });
    }
    updateNotifiedOff(con, remindID) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.update(con, tableName_constant_1.tables.tableRemind, { is_notified: 1 }, 'id', remindID);
            const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
            schedule_util_1.default.destroyAllCronJobByRemindId(remindID, 'schedule');
            if (isRedisReady) {
                const { data } = yield redis_model_1.default.hGetAll('remind', 'remind.model.ts', Date.now());
                const reminds = Object.values(data).map((item) => JSON.parse(item));
                const remindIndex = reminds.findIndex((remind) => remind.id === remindID);
                if (remindIndex !== -1) {
                    let remind = reminds[remindIndex];
                    remind.is_notified = 1;
                    yield redis_model_1.default.hSet('remind', remindID, JSON.stringify(remind), 'remind.models.ts', Date.now());
                }
                else {
                    console.log(`Remind with ID ${remindID} not found in Redis`);
                }
            }
            return result;
        });
    }
    updateNotifiedON(con, remindID) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.update(con, tableName_constant_1.tables.tableRemind, { is_notified: 0 }, 'id', remindID);
            const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
            const results = yield this.select(con, tableName_constant_1.tables.tableRemind, '*', 'id = ?', [remindID]);
            const vehicles = yield schedule_util_1.default.getVehiclesByRemindId(remindID);
            const schedules = yield schedule_util_1.default.buildSchedule(remindID);
            const remind = Object.assign(Object.assign({}, results[0]), { schedules: schedules, vehicles: vehicles });
            // console.log(schedules);
            for (const schedule of schedules) {
                yield this.handleSchedule(schedule, remind, vehicles);
            }
            if (isRedisReady) {
                const { data } = yield redis_model_1.default.hGetAll('remind', 'remind.model.ts', Date.now());
                const reminds = Object.values(data).map((item) => JSON.parse(item));
                const remindIndex = reminds.findIndex((remind) => remind.id === remindID);
                if (remindIndex !== -1) {
                    let remind = reminds[remindIndex];
                    remind.is_notified = 0;
                    yield redis_model_1.default.hSet('remind', remindID, JSON.stringify(remind), 'remind.models.ts', Date.now());
                }
                else {
                    console.log(`Remind with ID ${remindID} not found in Redis`);
                }
            }
            return result;
        });
    }
    insertRemindSchedule(con, remindID, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            if (!data.schedules || ((_a = data === null || data === void 0 ? void 0 : data.schedules) === null || _a === void 0 ? void 0 : _a.length) === 0)
                return;
            const values = (_b = data === null || data === void 0 ? void 0 : data.schedules) === null || _b === void 0 ? void 0 : _b.map((schedule) => `(${remindID}, ${schedule.start}, ${schedule.end}, '${schedule.time}', ${Date.now()})`).join(',');
            const queryText = `INSERT INTO ${tableName_constant_1.tables.tableRemindSchedule} (remind_id, start, end, time, create_time) VALUES ${values}`;
            yield new Promise((resolve, reject) => {
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
    updateRemind(con, data, remindID) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
            const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
            const result = yield this.select(con, tableName_constant_1.tables.tableRemind, '*', 'id = ?', [remindID]);
            const remindOld = result[0];
            const payload = {
                img_url: data === null || data === void 0 ? void 0 : data.img_url,
                note_repair: (_a = data === null || data === void 0 ? void 0 : data.note_repair) !== null && _a !== void 0 ? _a : remindOld.note_repair,
                history_repair: (_b = data === null || data === void 0 ? void 0 : data.history_repair) !== null && _b !== void 0 ? _b : remindOld.history_repair,
                current_kilometers: (_c = data === null || data === void 0 ? void 0 : data.current_kilometers) !== null && _c !== void 0 ? _c : remindOld.current_kilometers,
                cumulative_kilometers: (_d = data === null || data === void 0 ? void 0 : data.cumulative_kilometers) !== null && _d !== void 0 ? _d : remindOld.cumulative_kilometers,
                expiration_time: (_e = data === null || data === void 0 ? void 0 : data.expiration_time) !== null && _e !== void 0 ? _e : remindOld.expiration_time,
                is_deleted: remindOld.is_deleted,
                km_before: (_f = data === null || data === void 0 ? void 0 : data.km_before) !== null && _f !== void 0 ? _f : remindOld.km_before,
                is_notified: (_g = data === null || data === void 0 ? void 0 : data.is_notified) !== null && _g !== void 0 ? _g : remindOld.is_notified,
                is_received: (_h = data === null || data === void 0 ? void 0 : data.is_received) !== null && _h !== void 0 ? _h : remindOld.is_received,
                remind_category_id: (_j = data === null || data === void 0 ? void 0 : data.remind_category_id) !== null && _j !== void 0 ? _j : remindOld.remind_category_id,
                cycle: (_k = data === null || data === void 0 ? void 0 : data.cycle) !== null && _k !== void 0 ? _k : remindOld.cycle,
                update_time: Date.now(),
                user_id: ((_l = data === null || data === void 0 ? void 0 : data.user) === null || _l === void 0 ? void 0 : _l.level) === 10
                    ? (_m = data === null || data === void 0 ? void 0 : data.user) === null || _m === void 0 ? void 0 : _m.userId
                    : (_p = (_o = data === null || data === void 0 ? void 0 : data.user) === null || _o === void 0 ? void 0 : _o.parentId) !== null && _p !== void 0 ? _p : remindOld.user_id,
            };
            const remind = Object.assign(Object.assign({}, payload), { schedules: (_q = data === null || data === void 0 ? void 0 : data.schedules) !== null && _q !== void 0 ? _q : [], id: remindID, vehicles: (_r = data === null || data === void 0 ? void 0 : data.vehicles) !== null && _r !== void 0 ? _r : [] });
            const results = yield this.update(con, tableName_constant_1.tables.tableRemind, payload, 'id', remindID);
            if ((data === null || data === void 0 ? void 0 : data.schedules) && payload.is_notified === 0) {
                yield this.delete(con, tableName_constant_1.tables.tableRemindSchedule, `remind_id = ${remindID}`);
                yield this.insertRemindSchedule(con, remindID, data);
                const vehicles = yield schedule_util_1.default.getVehiclesByRemindId(remindID);
                // console.log('vehicles', vehicles);
                schedule_util_1.default.destroyAllCronJobByRemindId(remindID, 'schedule');
                for (const schedule of data === null || data === void 0 ? void 0 : data.schedules) {
                    yield this.handleSchedule(schedule, remind, vehicles);
                }
            }
            if ((data === null || data === void 0 ? void 0 : data.expiration_time) && payload.is_notified === 0) {
                schedule_util_1.default.destroyAllCronJobByRemindId(remindID, 'expire');
                yield this.scheduleCronJobForExpiration(remind);
            }
            if (isRedisReady) {
                yield redis_model_1.default.hSet('remind', remindID, JSON.stringify(remind), 'remind.models.ts', Date.now());
            }
            return results;
        });
    }
    search(con, userID, query) {
        return __awaiter(this, void 0, void 0, function* () {
            // const isRedisReady = redisModel.redis.instanceConnect.isReady;
            // if (isRedisReady) {
            //     const { data } = await redisModel.hGetAll(
            //         'remind',
            //         'remind.model.ts',
            //         Date.now(),
            //     );
            //     const reminds: any = Object.values(data).filter((remind: any) => {
            //         remind = JSON.parse(remind);
            //         // filter by user_id, vehicle_id, keyword, is_deleted, is_received, note_repair, cumulative_kilometers
            //         return (
            //             remind.user_id === userID &&
            //             remind.is_deleted === 0 &&
            //             remind.is_received === 0 &&
            //             remind.vehicles.includes(query.vehicle_id) &&
            //             (remind.note_repair
            //                 .toLowerCase()
            //                 .includes(query.keyword.toLowerCase()) ||
            //                 remind.cumulative_kilometers
            //                     .toLowerCase()
            //                     .includes(query.keyword.toLowerCase()) ||
            //                 remind.category_name
            //                     .toLowerCase()
            //                     .includes(query.keyword.toLowerCase()) ||
            //                 remind.license_plate
            //                     .toLowerCase()
            //                     .includes(query.keyword.toLowerCase()) ||
            //                 remind.license
            //                     .toLowerCase()
            //                     .includes(query.keyword.toLowerCase()))
            //         );
            //     });
            //     return reminds;
            // }
            let params = [userID];
            if (query.keyword === null)
                query.keyword = '';
            let whereClause = `${tableName_constant_1.tables.tableVehicleNoGPS}.user_id = ? ${query.vehicle_id
                ? `AND ${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate = ${query.vehicle_id}`
                : ''} AND ${tableName_constant_1.tables.tableVehicleNoGPS}.is_deleted = 0 AND is_received = 0 AND 
              (         note_repair LIKE '%${query.keyword}%' OR
                  cumulative_kilometers LIKE '%${query.keyword}%' OR
                  ${tableName_constant_1.tables.tableRemindCategory}.name LIKE '%${query.keyword}%' OR
                  ${tableName_constant_1.tables.tableVehicleNoGPS}.license_plate LIKE '%${query.keyword}%' OR 
                  ${tableName_constant_1.tables.tableVehicleNoGPS}.license LIKE '%${query.keyword}%'
              )`;
            if (query.remind_category_id) {
                whereClause += ` AND ${tableName_constant_1.tables.tableRemind}.remind_category_id = ${query.remind_category_id}`;
            }
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
                 ${tableName_constant_1.tables.tableRemind}.is_notified AS is_notified,
                 ${tableName_constant_1.tables.tableRemind}.is_received AS is_received,
                 ${tableName_constant_1.tables.tableRemind}.create_time AS remind_create_time,
                 ${tableName_constant_1.tables.tableRemind}.update_time AS remind_update_time,
                 
                 ${tableName_constant_1.tables.tableRemindCategory}.id AS remind_category_id,
                 ${tableName_constant_1.tables.tableRemindCategory}.name AS category_name,
                 ${tableName_constant_1.tables.tableRemindCategory}.desc AS category_desc,
                 ${tableName_constant_1.tables.tableRemindCategory}.icon AS category_icon,
                 ${tableName_constant_1.tables.tableRemindCategory}.create_time AS category_create_time,
                 ${tableName_constant_1.tables.tableRemindCategory}.update_time AS category_update_time,
                 ${tableName_constant_1.tables.tableRemindCategory}.is_deleted AS category_is_deleted,
                 ${tableName_constant_1.tables.tableRemindVehicle}.tire_seri AS tire_seri,
                 ${tableName_constant_1.tables.tableTire}.id AS tire,
                 ${tableName_constant_1.tables.tableRemind}.cycle AS cycle
                 `, whereClause, params, [
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
                {
                    table: tableName_constant_1.tables.tableTire,
                    on: `${tableName_constant_1.tables.tableTire}.seri = ${tableName_constant_1.tables.tableRemindVehicle}.tire_seri`,
                    type: 'LEFT',
                },
            ], `ORDER BY ${tableName_constant_1.tables.tableRemind}.id IS NULL, ${tableName_constant_1.tables.tableRemind}.expiration_time ASC`);
            return result;
        });
    }
    updateIsDeleted(con, remindID) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.update(con, tableName_constant_1.tables.tableRemind, { is_deleted: 1 }, 'id', remindID);
            const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
            const { data } = yield redis_model_1.default.hGetAll('remind', 'remind.model.ts', Date.now());
            const reminds = isRedisReady ? Object.values(data) : result;
            if (isRedisReady) {
                const remindIndex = reminds.findIndex((remind) => remind.id === remindID);
                if (remindIndex !== -1) {
                    let remind = JSON.parse(reminds[remindIndex]);
                    remind.is_deleted = 1;
                    yield redis_model_1.default.hSet('remind', remindID, JSON.stringify(remind), 'remind.models.ts', Date.now());
                }
                else {
                    console.log(`Remind with ID ${remindID} not found in Redis`);
                }
            }
            return result;
        });
    }
    finishRemind(con, remindID, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            // //update current remind;
            // const isRedisReady = redisModel.redis.instanceConnect.isReady;
            // let remind: any;
            // const vehicles = await scheduleUtils.getVehiclesByRemindId(remindID);
            // if (isRedisReady) {
            //     const { data } = await redisModel.hGet(
            //         'remind',
            //         remindID.toString(),
            //         'remind.models.ts',
            //         Date.now(),
            //     );
            //     if (data !== null) {
            //         let remindJson = JSON.parse(data);
            //         remind = remindJson;
            //         remindJson.is_received = 1;
            //         remindJson.complete_date = Date.now();
            //         // FIX BUG: update remind in redis
            //         const remindUpdateRedis = redisModel.hSet(
            //             'remind',
            //             remindID.toString(),
            //             JSON.stringify(remindJson),
            //             'remind.models.ts',
            //             Date.now(),
            //         );
            //         // const deleteReids = redisModel.hDel(
            //         //     'remind',
            //         //     remindID.toString(),
            //         //     'remind.models.ts',
            //         //     Date.now(),
            //         // )
            //     }
            // } else {
            //     remind = (
            //         (await this.select(con, tables.tableRemind, '*', 'id = ?', [
            //             remindID,
            //         ])) as any
            //     )[0];
            //     remind.is_received = 1;
            //     remind.complete_date = Date.now();
            // }
            // const resultUpdate = await this.update(
            //     con,
            //     tables.tableRemind,
            //     { is_received: 1, complete_date: Date.now() },
            //     'id',
            //     remindID,
            // );
            // //get data current remindF
            // let dataRemindRedis: any = null;
            // if (isRedisReady) {
            //     dataRemindRedis = await redisModel.hGet(
            //         'remind',
            //         remindID.toString(),
            //         'remind.models.ts',
            //         Date.now(),
            //     );
            // }
            // const dataCurrentRemindmap: any = await this.select(
            //     con,
            //     tables.tableRemind,
            //     '*',
            //     'id = ?',
            //     [remindID],
            // );
            // let dataCurrentRemind = dataCurrentRemindmap[0];
            // const newExpDate =
            //     dataCurrentRemind.expiration_time +
            //     dataCurrentRemind.cycle * 30 * 24 * 60 * 60 * 1000;
            // //insert to schedule
            // const getSchedulebyID: any = await this.select(
            //     con,
            //     tables.tableRemindSchedule,
            //     '*',
            //     'remind_id = ?',
            //     remindID as any,
            // );
            // const schedules = getSchedulebyID.map((s: any) => ({
            //     ...s,
            //     start:
            //         s.start + dataCurrentRemind.cycle * (30 * 24 * 60 * 60) * 1000,
            //     end: s.end + dataCurrentRemind.cycle * (30 * 24 * 60 * 60) * 1000,
            //     time: s.time,
            // }));
            // //payload
            // const payload = {
            //     remind_category_id: dataCurrentRemind.remind_category_id,
            //     is_notified: 0,
            //     note_repair: dataCurrentRemind.note_repair,
            //     expiration_time: newExpDate,
            //     cumulative_kilometers: dataCurrentRemind.cumulative_kilometers,
            //     km_before: dataCurrentRemind.km_before,
            //     schedules: schedules,
            //     img_url: dataCurrentRemind.img_url,
            //     history_repair: dataCurrentRemind.history_repair,
            //     current_kilometers: dataCurrentRemind.current_kilometers,
            //     is_received: 0,
            //     create_time: Date.now(),
            //     cycle: dataCurrentRemind.cycle,
            //     user: { userId: user_id },
            //     vehicles,
            // };
            // const remind_id = await this.addRemind(con, payload);
            // // await this.insertRemindSchedule(con, remind_id as any, payload);
            // //insert new remind to redis
            // if (isRedisReady) {
            //     const newRemindRedis = await redisModel.hSet(
            //         'remind',
            //         remind_id as any,
            //         JSON.stringify(payload),
            //         'remind.models.ts',
            //         Date.now(),
            //     );
            // }
            // ========================================
            const result = yield this.select(con, tableName_constant_1.tables.tableRemind, '*', 'id = ?', [remindID]);
            const remindOld = result[0];
            // console.log('remindOld', remindOld);
            const vehicles = yield schedule_util_1.default.getVehiclesByRemindId(remindID);
            const schedules = yield schedule_util_1.default.buildSchedule(remindID);
            // const cumulative_kilometers =
            //     await this.getCurrentKilometersByVehicleId(vehicles[0], 'token');
            const payload = {
                note_repair: remindOld.note_repair,
                current_kilometers: remindOld.current_kilometers,
                cumulative_kilometers: remindOld.cumulative_kilometers,
                km_before: remindOld.km_before,
                remind_category_id: remindOld.remind_category_id,
                cycle: remindOld.cycle,
                user: { userId: user_id },
                vehicles,
                expiration_time: (Math.ceil(Date.now() / 1000) +
                    remindOld.cycle * 30 * 24 * 60 * 60) *
                    1000,
                schedules: schedules === null || schedules === void 0 ? void 0 : schedules.map((s) => (Object.assign(Object.assign({}, s), { start: s.start + remindOld.cycle * 30 * 24 * 60 * 60 * 1000, end: s.end + remindOld.cycle * 30 * 24 * 60 * 60 * 1000 }))),
            };
            yield remind_service_1.default.update({ is_received: 1 }, remindID);
            yield remind_service_1.default.addRemind(payload);
            schedule_util_1.default.destroyAllCronJobByRemindId(remindID, 'schedule');
            schedule_util_1.default.destroyAllCronJobByRemindId(remindID, 'expire');
            return payload;
        });
    }
    getFinishRemind(con, vehicle_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
            if (isRedisReady) {
                const { data } = yield redis_model_1.default.hGetAll('remind', 'remind.model.ts', Date.now());
                const reminds = Object.values(data).filter((remind) => {
                    remind = JSON.parse(remind);
                    return (remind.is_received === 1 &&
                        remind.vehicles.includes(vehicle_id));
                });
                return reminds;
            }
            const result = yield this.selectWithJoins(con, tableName_constant_1.tables.tableRemindVehicle, ` 
                 ${tableName_constant_1.tables.tableRemind}.id AS remind_id,
                 ${tableName_constant_1.tables.tableRemind}.img_url AS remind_img_url,
                 ${tableName_constant_1.tables.tableRemind}.note_repair AS note_repair,
                 ${tableName_constant_1.tables.tableRemind}.history_repair AS history_repair,
                 ${tableName_constant_1.tables.tableRemind}.current_kilometers AS current_kilometers,
                 ${tableName_constant_1.tables.tableRemind}.cumulative_kilometers AS cumulative_kilometers,
                 ${tableName_constant_1.tables.tableRemind}.expiration_time AS expiration_time,
                 ${tableName_constant_1.tables.tableRemind}.is_notified AS is_notified,
                 ${tableName_constant_1.tables.tableRemind}.is_received AS is_received,
                 ${tableName_constant_1.tables.tableRemind}.create_time AS remind_create_time,
                 ${tableName_constant_1.tables.tableRemind}.update_time AS remind_update_time,
                 
                 ${tableName_constant_1.tables.tableRemindCategory}.id AS remind_category_id,
                 ${tableName_constant_1.tables.tableRemindCategory}.name AS category_name,
                 ${tableName_constant_1.tables.tableRemindCategory}.desc AS category_desc,
                 ${tableName_constant_1.tables.tableRemindCategory}.icon AS category_icon,
                 ${tableName_constant_1.tables.tableRemindCategory}.create_time AS category_create_time,
                 ${tableName_constant_1.tables.tableRemindCategory}.update_time AS category_update_time,
                 ${tableName_constant_1.tables.tableRemindCategory}.is_deleted AS category_is_deleted`, `${tableName_constant_1.tables.tableRemind}.is_received = ? AND ${tableName_constant_1.tables.tableRemindVehicle}.vehicle_id = ${vehicle_id}`, '1', [
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
    getAllGPS(query) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // search when query.keyword is not null
                const { keyword, vehicle_id } = query;
                let reminds = yield reminder_util_1.default.getRemindsByVehicleId(vehicle_id);
                if (!(typeof keyword === 'string' && keyword.trim() !== ''))
                    return reminds;
                // search by keyword
                const results = reminds.filter((remind) => 
                // toLowerCase() for case-insensitive search
                remind.note_repair
                    .toLowerCase()
                    .includes(keyword.toLowerCase()) ||
                    remind.cumulative_kilometers.toString().includes(keyword) ||
                    remind.name.toLowerCase().includes(keyword.toLowerCase()));
                return results;
            }
            catch (error) {
                console.log('Error getting all GPS:', error);
            }
        });
    }
    getCategoryAll(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield reminder_util_1.default.getCategoryAllByUserId(userId);
        });
    }
    getScheduleByRemindId(remindId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield schedule_util_1.default.buildSchedule(remindId);
        });
    }
}
exports.default = new RemindModel();
