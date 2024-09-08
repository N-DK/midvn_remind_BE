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
let schedules = [];
class ScheduleUtils {
    constructor() {
        this.databaseModel = new database_model_1.default();
        this.init();
        this.conn = null;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.conn = (yield (0, init_mysql_1.getConnection)()).conn;
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
            if (!(reminds === null || reminds === void 0 ? void 0 : reminds.length))
                return;
            for (const remind of reminds) {
                const expirationTime = new Date(remind.expiration_time * 1000);
                console.log('expirationTime', expirationTime);
                const cronJob = yield this.createCronJobForExpired(expirationTime, remind);
                cronJob.start();
            }
        });
    }
    createCronJobForExpired(expirationTime, remind) {
        return __awaiter(this, void 0, void 0, function* () {
            const month = expirationTime.getMonth() + 1;
            const day = expirationTime.getDate();
            const { remind_id, vehicles, id } = remind, other = __rest(remind, ["remind_id", "vehicles", "id"]);
            console.log('other', other);
            console.table({ remind: remind.remind_id, month, day });
            const cronJob = node_cron_1.default.schedule(`* * ${day} ${month} *`, // */20 8-20
            () => __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.databaseModel.update(this.conn, tableName_constant_1.tables.tableRemind, { is_notified: 1 }, // Đánh dấu đã thông báo
                    'id', remind.id);
                    yield this.databaseModel.insert(this.conn, tableName_constant_1.tables.tableRemind, Object.assign(Object.assign({}, other), { expiration_time: Date.now() }));
                    yield notify_services_1.remindFeature.sendNotifyRemind('http://localhost:3007', {
                        name_remind: 'Hạn bảo dưỡng ' + remind.note_repair + ' NDK',
                        vehicle_name: 'Xe ' + remind.vehicles.join(', '),
                        user_id: 5,
                    });
                }
                catch (error) {
                    console.error('Error sending reminder notification:', error);
                }
                finally {
                    cronJob.stop();
                }
            }));
            return cronJob;
        });
    }
    restoreCronJobs() {
        if (!(schedules === null || schedules === void 0 ? void 0 : schedules.length))
            return;
        for (const { remind, schedule } of schedules) {
            const cronJob = this.createCronJob(schedule, remind, () => __awaiter(this, void 0, void 0, function* () {
                yield notify_services_1.remindFeature.sendNotifyRemind('http://localhost:3007', {
                    name_remind: remind.note_repair + ' NDK',
                    vehicle_name: remind.vehicles.join(', '),
                    user_id: 5,
                });
            }));
            cronJob.start();
        }
    }
    loadReminds() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
                if (!isRedisReady) {
                    const results = yield this.databaseModel.select(this.conn, tableName_constant_1.tables.tableRemind, '*', 'is_received = 0 AND is_notified = 0', []);
                    return yield Promise.all(results.map((item) => __awaiter(this, void 0, void 0, function* () {
                        item.remind_id = item.id;
                        return (yield this.buildSchedule(item, this.conn))
                            .remind;
                    })));
                }
                else {
                    const { data } = yield redis_model_1.default.hGetAll('remind', 'remind.model.ts', Date.now());
                    return Object.values(data)
                        .filter((item) => {
                        item = JSON.parse(item);
                        return (item.is_received === 0 &&
                            item.is_notified === 0 &&
                            !(0, date_fns_1.isBefore)(new Date(item.expiration_time * 1000), (0, date_fns_1.startOfDay)(new Date())));
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
    loadSchedules() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
                if (!isRedisReady) {
                    const result = yield this.databaseModel.selectWithJoins(this.conn, tableName_constant_1.tables.tableRemindSchedule, '*', 'remind_id IS NOT NULL', [], [
                        {
                            table: tableName_constant_1.tables.tableRemind,
                            on: `${tableName_constant_1.tables.tableRemindSchedule}.remind_id = ${tableName_constant_1.tables.tableRemind}.id`,
                            type: 'LEFT',
                        },
                    ]);
                    schedules = yield Promise.all(result.map((item) => __awaiter(this, void 0, void 0, function* () { return this.buildSchedule(item, this.conn); })));
                }
                else {
                    const result = yield redis_model_1.default.get('schedules', 'schedule.util.ts', Date.now());
                    schedules = (_a = JSON.parse(result === null || result === void 0 ? void 0 : result.data)) !== null && _a !== void 0 ? _a : [];
                }
            }
            catch (error) {
                console.error('Error loading schedules:', error);
            }
        });
    }
    buildSchedule(item, conn) {
        return __awaiter(this, void 0, void 0, function* () {
            const vehicles = yield this.databaseModel.selectWithJoins(conn, tableName_constant_1.tables.tableVehicleNoGPS, '*', `remind_id = ${item.remind_id}`, [], [
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
            ]);
            return {
                remind: Object.assign(Object.assign({}, item), { vehicles: vehicles.map((v) => v.license_plate) }),
                schedule: {
                    start: new Date(item.start * 1000),
                    end: new Date(item.end * 1000),
                    time: item.time,
                },
            };
        });
    }
    isValidDateRange(currentDate, start, end) {
        return !(0, date_fns_1.isBefore)(currentDate, start) && !(0, date_fns_1.isAfter)(currentDate, end);
    }
    createCronJob(schedule, remind, callback) {
        const [hour, minute] = schedule.time.split(':').map(Number);
        const cronJob = node_cron_1.default.schedule(`${minute} ${hour} * * *`, () => __awaiter(this, void 0, void 0, function* () {
            const currentDate = new Date();
            if (!this.isValidDateRange(currentDate, schedule.start, schedule.end)) {
                cronJob.stop();
                schedules = schedules.filter((s) => s.remind.remind_id !== remind.remind_id);
                yield this.updateSchedulesInRedis();
                return;
            }
            try {
                yield callback();
            }
            catch (error) {
                console.error('Error during cron job execution:', error);
            }
        }));
        return cronJob;
    }
    createSchedule(schedule, callback, remind) {
        return __awaiter(this, void 0, void 0, function* () {
            const cronJob = this.createCronJob(schedule, remind, callback);
            cronJob.start();
            schedules.push({ remind, schedule });
            yield this.updateSchedulesInRedis();
        });
    }
    updateSchedulesInRedis() {
        return __awaiter(this, void 0, void 0, function* () {
            const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
            if (isRedisReady) {
                try {
                    yield redis_model_1.default.set('schedules', JSON.stringify(schedules), 'schedule.util.ts', Date.now());
                }
                catch (error) {
                    console.error('Error updating schedules in Redis:', error);
                }
            }
        });
    }
}
exports.default = new ScheduleUtils();
