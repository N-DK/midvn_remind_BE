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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = __importDefault(require("node-cron"));
const date_fns_1 = require("date-fns");
const redis_model_1 = __importDefault(require("../models/redis.model"));
const notify_services_1 = require("notify-services");
const database_model_1 = __importDefault(require("../models/database.model"));
const init_mysql_1 = require("../dbs/init.mysql");
const tableName_constant_1 = require("../constants/tableName.constant");
const dotenv_config_1 = __importDefault(require("../config/dotenv.config"));
const remind_service_1 = __importDefault(require("../services/remind.service"));
const { SV_NOTIFY } = (0, dotenv_config_1.default)();
let reminds = [];
const cronJobs = new Map();
class ScheduleUtils {
    constructor() {
        this.UNIT_MONTH = 30 * 24 * 60 * 60;
        this.databaseModel = new database_model_1.default();
        this.init();
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this.loadSchedules();
                this.restoreCronJobs();
                yield this.restoreCronJobsForExpired();
            }
            catch (error) {
                console.error('Error initializing schedules:', error);
            }
        });
    }
    restoreCronJobsForExpired() {
        return __awaiter(this, void 0, void 0, function* () {
            const reminds = yield this.loadReminds();
            // console.log('remind ', reminds);
            if (!(reminds === null || reminds === void 0 ? void 0 : reminds.length))
                return;
            for (const remind of reminds) {
                const expirationTime = new Date(remind.expiration_time + 86400000);
                // console.log(
                //     'expirationTime',
                //     expirationTime,
                //     'remind.expiration_time',
                //     remind.expiration_time,
                // );
                const cronJob = yield this.createCronJobForExpired(expirationTime, remind);
                cronJob.start();
            }
        });
    }
    createCronJobForExpired(expirationTime, remind) {
        return __awaiter(this, void 0, void 0, function* () {
            const month = expirationTime.getMonth() + 1;
            const day = expirationTime.getDate();
            const { remind_id, id } = remind, other = __rest(remind, ["remind_id", "id"]);
            const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
            // console.log('other', other);
            // console.log('schedule', remind.schedules);
            // console.table({ remind: remind.id, month, day });
            const cronJob = node_cron_1.default.schedule(`*/20 8-20 ${day} ${month} *`, // */20 8-20
            () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield remind_service_1.default.addRemind(Object.assign(Object.assign({}, other), { user: { userId: remind.user_id }, expiration_time: (Math.ceil(Date.now() / 1000) +
                            remind.cycle * this.UNIT_MONTH) *
                            1000, schedules: remind.schedules.map((s) => (Object.assign(Object.assign({}, s), { start: s.start + remind.cycle * this.UNIT_MONTH * 1000, end: s.end + remind.cycle * this.UNIT_MONTH * 1000 }))) }));
                    yield notify_services_1.remindFeature.sendNotifyRemind(SV_NOTIFY, {
                        name_remind: 'Hạn bảo dưỡng ' + remind.note_repair + ' NDK',
                        vehicle_name: 'Xe ' + remind.vehicles.join(', '),
                        user_id: remind.user_id,
                    });
                }
                catch (error) {
                    console.error('Error sending reminder notification:', error);
                }
                finally {
                    // cronJob.stop();
                    // console.log('cronJobs before', cronJobs.size);
                    this.destroyAllCronJobByRemindId(remind.id, 'schedule');
                    this.destroyAllCronJobByRemindId(remind.id, 'expire');
                    // console.log('cronJobs after', cronJobs.size);
                    if (isRedisReady) {
                        const result = yield redis_model_1.default.hDel('remind', remind.id.toString(), 'schedule.utils.ts', Date.now());
                    }
                    else {
                        yield remind_service_1.default.updateNotifiedOff(remind.id);
                    }
                }
            }), { name: `${id}-${expirationTime}-expire` });
            cronJobs.set(`${id}-${expirationTime}-expire`, cronJob);
            return cronJob;
        });
    }
    restoreCronJobs() {
        var _a;
        if (!(reminds === null || reminds === void 0 ? void 0 : reminds.length))
            return;
        for (const remind of reminds) {
            for (const schedule of (_a = remind === null || remind === void 0 ? void 0 : remind.schedules) !== null && _a !== void 0 ? _a : []) {
                const cronJob = this.createCronJob({
                    start: new Date(schedule.start),
                    end: new Date(schedule.end),
                    time: schedule.time,
                }, remind, () => __awaiter(this, void 0, void 0, function* () {
                    yield notify_services_1.remindFeature.sendNotifyRemind(SV_NOTIFY, {
                        name_remind: 'Gia hạn bảo dưỡng ' + remind.note_repair,
                        vehicle_name: remind.vehicles.join(', '),
                        user_id: remind.user_id,
                    });
                }));
                cronJob.start();
            }
        }
    }
    getRemindFromRedis() {
        return __awaiter(this, void 0, void 0, function* () {
            const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
            if (isRedisReady) {
                const results = yield redis_model_1.default.hGetAll('remind', 'remind.model.ts', Date.now());
                return results;
            }
            else {
                return { data: [], result: true };
            }
        });
    }
    getRemindFromRedisById(remind_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
            if (isRedisReady) {
                const results = yield redis_model_1.default.hGet('remind', remind_id, 'remind.model.ts', Date.now());
                return results;
            }
            else {
                return { data: [], result: true };
            }
        });
    }
    loadReminds() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
                if (!isRedisReady) {
                    const results = yield this.getReminds();
                    return results === null || results === void 0 ? void 0 : results.filter((item) => !(0, date_fns_1.isBefore)(new Date(item.expiration_time), (0, date_fns_1.startOfDay)(new Date())));
                }
                else {
                    const { data } = yield this.getRemindFromRedis();
                    return Object.values(data)
                        .filter((item) => {
                        // console.log(item);
                        item = JSON.parse(item);
                        return (item.is_received === 0 &&
                            item.is_notified === 0 &&
                            item.is_deleted === 0 &&
                            !(0, date_fns_1.isBefore)(new Date(item.expiration_time), (0, date_fns_1.startOfDay)(new Date())));
                    })
                        .map((item) => JSON.parse(item));
                }
            }
            catch (error) {
                console.error('Error loading reminds:', error);
                return [];
            }
        });
    }
    getReminds() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const results = yield this.databaseModel.select(conn, tableName_constant_1.tables.tableRemind, '*', 'is_notified = 0 AND is_deleted = 0 AND is_received = 0', []);
                    const reminds = yield Promise.all(results.map((item) => __awaiter(this, void 0, void 0, function* () {
                        const schedules = yield this.buildSchedule(item.id);
                        const vehicles = yield this.getVehiclesByRemindId(item.id);
                        return Object.assign(Object.assign({}, item), { schedules,
                            vehicles });
                    })));
                    return reminds;
                }
                catch (error) {
                }
                finally {
                    conn.release();
                }
            }
            catch (error) { }
        });
    }
    loadSchedules() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
                if (!isRedisReady) {
                    reminds = (_a = (yield this.getReminds())) !== null && _a !== void 0 ? _a : [];
                }
                else {
                    const result = yield this.getRemindFromRedis();
                    reminds =
                        (_b = Object.values(result === null || result === void 0 ? void 0 : result.data).map((item) => JSON.parse(item))) !== null && _b !== void 0 ? _b : [];
                }
            }
            catch (error) {
                console.error('Error loading schedules:', error);
            }
        });
    }
    destroyAllCronJobByRemindId(remind_id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            cronJobs.forEach((job, key) => {
                if (key.includes(remind_id) && key.includes(type)) {
                    // console.log('key', key, 'job', job);
                    job.stop();
                    cronJobs.delete(key);
                }
            });
        });
    }
    getVehiclesByRemindId(remind_id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const vehicles = yield this.databaseModel.selectWithJoins(conn, tableName_constant_1.tables.tableRemind, '*', `remind_id = ${remind_id}`, [], [
                        {
                            table: tableName_constant_1.tables.tableRemindVehicle,
                            on: `${tableName_constant_1.tables.tableRemindVehicle}.remind_id = ${tableName_constant_1.tables.tableRemind}.id`,
                            type: 'LEFT',
                        },
                    ]);
                    return vehicles.map((v) => v.vehicle_id);
                }
                catch (error) {
                }
                finally {
                    conn.release();
                }
            }
            catch (error) { }
        });
    }
    buildSchedule(remindId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const result = yield this.databaseModel.selectWithJoins(conn, tableName_constant_1.tables.tableRemindSchedule, '*', `remind_id = ${remindId}`, [], [
                        {
                            table: tableName_constant_1.tables.tableRemind,
                            on: `${tableName_constant_1.tables.tableRemindSchedule}.remind_id = ${tableName_constant_1.tables.tableRemind}.id`,
                            type: 'LEFT',
                        },
                    ]);
                    const groupedData = result
                        .filter((item) => item.is_notified === 0 &&
                        item.is_deleted === 0 &&
                        item.is_received === 0)
                        .reduce((acc, item) => {
                        if (!acc[item.remind_id]) {
                            acc[item.remind_id] = [];
                        }
                        acc[item.remind_id].push({
                            start: item.start,
                            end: item.end,
                            time: item.time,
                        });
                        return acc;
                    }, {});
                    return Object.values(groupedData)[0];
                }
                catch (error) {
                }
                finally {
                    conn.release();
                }
            }
            catch (error) { }
        });
    }
    isValidDateRange(currentDate, start, end) {
        return ((!(0, date_fns_1.isBefore)(currentDate, start) && !(0, date_fns_1.isAfter)(currentDate, end)) ||
            ((0, date_fns_1.isEqual)((0, date_fns_1.startOfDay)(currentDate), (0, date_fns_1.startOfDay)(start)) &&
                (0, date_fns_1.isEqual)((0, date_fns_1.startOfDay)(currentDate), (0, date_fns_1.startOfDay)(end))));
    }
    createCronJob(schedule, remind, callback) {
        const [hour, minute] = schedule.time.split(':').map(Number);
        const cronJob = node_cron_1.default.schedule(`${minute} ${hour} * * *`, () => __awaiter(this, void 0, void 0, function* () {
            const currentDate = new Date();
            if (!this.isValidDateRange(currentDate, schedule.start, schedule.end)) {
                cronJob.stop();
                const { data } = yield this.getRemindFromRedisById(remind.id);
                const r = JSON.parse(data);
                r.schedules = r.schedules.filter((s) => s.time !== schedule.time);
                reminds = reminds.map((item) => item.id === remind.id ? r : item);
                yield this.updateSchedulesInRedis(remind.id);
                return;
            }
            try {
                yield callback();
            }
            catch (error) {
                console.error('Error during cron job execution:', error);
            }
        }), { name: `${remind.id}-${schedule.time}-schedule` });
        cronJobs.set(`${remind.id}-${schedule.time}-schedule`, cronJob);
        return cronJob;
    }
    createSchedule(schedule, callback, remind) {
        return __awaiter(this, void 0, void 0, function* () {
            const cronJob = this.createCronJob(schedule, remind, callback);
            cronJob.start();
        });
    }
    updateSchedulesInRedis(remind_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
            if (isRedisReady) {
                try {
                    yield redis_model_1.default.hSet('remind', remind_id, JSON.stringify(reminds), 'remind.models.ts', Date.now());
                }
                catch (error) {
                    console.error('Error updating schedules in Redis:', error);
                }
            }
        });
    }
}
exports.default = new ScheduleUtils();
