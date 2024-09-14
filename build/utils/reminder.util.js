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
const database_model_1 = __importDefault(require("../models/database.model"));
const init_mysql_1 = require("../dbs/init.mysql");
const tableName_constant_1 = require("../constants/tableName.constant");
const multer_1 = __importDefault(require("multer"));
const redis_model_1 = __importDefault(require("../models/redis.model"));
const schedule_util_1 = __importDefault(require("./schedule.util"));
const dataBaseModel = new database_model_1.default();
const storage = multer_1.default.diskStorage({
    destination: './src/uploads',
    filename: function (req, file, cb) {
        return cb(null, `${file.fieldname}-${Date.now()}${file.originalname}`);
    },
});
let remindsVehicles;
const reminder = {
    init: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const isRedisReady = redis_model_1.default.redis.instanceConnect.isReady;
            let interval = null;
            // Hàm để lấy dữ liệu từ database
            const fetchFromDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
                console.log('Fetching data from database...');
                remindsVehicles = yield reminder.getReminds();
            });
            // Hàm để kiểm tra kết nối Redis và cập nhật dữ liệu
            const checkRedisConnection = (isResync) => __awaiter(void 0, void 0, void 0, function* () {
                if (redis_model_1.default.redis.instanceConnect.isReady) {
                    clearInterval(interval);
                    interval = null;
                    console.log('Redis reconnected and data resynced.');
                    if (isResync)
                        yield reminder.resyncReminds();
                }
                else {
                    yield fetchFromDatabase();
                }
            });
            // Nếu Redis không sẵn sàng, lấy dữ liệu từ database
            if (!isRedisReady) {
                yield fetchFromDatabase();
                // Kiểm tra lại Redis mỗi 60 giây
                interval = setInterval(() => __awaiter(void 0, void 0, void 0, function* () { return yield checkRedisConnection(true); }), 60 * 1000);
            }
            // Xử lý sự kiện khi Redis gặp lỗi
            redis_model_1.default.redis.instanceConnect.on('error', () => __awaiter(void 0, void 0, void 0, function* () {
                if (!interval) {
                    console.log('Redis connection lost. Switching to database...');
                    yield fetchFromDatabase();
                    // Kiểm tra lại Redis mỗi phút để khôi phục kết nối
                    interval = setInterval(() => __awaiter(void 0, void 0, void 0, function* () { return yield checkRedisConnection(false); }), 60 * 1000);
                }
            }));
            // Xử lý sự kiện khi Redis kết nối lại
            redis_model_1.default.redis.instanceConnect.on('connect', () => __awaiter(void 0, void 0, void 0, function* () {
                console.log('Redis connection restored.');
                yield reminder.resyncReminds();
            }));
        }
        catch (error) {
            console.error('Error initializing reminder: ', error);
        }
    }),
    resyncReminds: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.time('RESYNC DATE FROM DATABASE');
            const reminds = yield schedule_util_1.default.getReminds();
            console.log('Reminds:', reminds === null || reminds === void 0 ? void 0 : reminds.length);
            yield redis_model_1.default.del('remind', 'init.redis.ts', Date.now());
            console.log('Deleted previous reminds in Redis');
            for (const remind of reminds) {
                yield redis_model_1.default.hSet('remind', remind.id, JSON.stringify(remind), 'init.redis.ts', Date.now());
            }
            console.timeEnd('RESYNC DATE FROM DATABASE');
        }
        catch (error) {
            console.error('Error during resync:', error);
        }
    }),
    getRemindsByVehicleId: (vehicleId) => __awaiter(void 0, void 0, void 0, function* () {
        // const isRedisReady = redisModel.redis.instanceConnect.isReady;
        // if (isRedisReady) {
        //     const { data } = await redisModel.hGetAll(
        //         'remind',
        //         'reminder.utils.ts',
        //         Date.now(),
        //     );
        //     const results = data.filter((item: any) => {
        //         item = JSON.parse(item);
        //         return (
        //             item.vehicles.includes(vehicleId) && item.is_received === 0
        //         );
        //     });
        //     return results;
        // }
        try {
            const { conn } = yield (0, init_mysql_1.getConnection)();
            try {
                const results = yield dataBaseModel.selectWithJoins(conn, tableName_constant_1.tables.tableRemindVehicle, `${tableName_constant_1.tables.tableRemindCategory}.*, ${tableName_constant_1.tables.tableRemindCategory}.name as category_name,${tableName_constant_1.tables.tableRemindVehicle}.*, ${tableName_constant_1.tables.tableRemind}.*`, 'vehicle_id = ? AND is_received = 0', [vehicleId], [
                    {
                        table: tableName_constant_1.tables.tableRemind,
                        on: `${tableName_constant_1.tables.tableRemind}.id = ${tableName_constant_1.tables.tableRemindVehicle}.remind_id`,
                        type: 'LEFT',
                    },
                    {
                        table: tableName_constant_1.tables.tableRemindCategory,
                        on: `${tableName_constant_1.tables.tableRemindCategory}.id = ${tableName_constant_1.tables.tableRemind}.remind_category_id`,
                        type: 'LEFT',
                    },
                ], `ORDER BY ${tableName_constant_1.tables.tableRemind}.expiration_time ASC`);
                return results;
            }
            catch (error) {
            }
            finally {
                conn.release();
            }
        }
        catch (error) { }
    }),
    getReminds: () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!remindsVehicles) {
                const { conn } = yield (0, init_mysql_1.getConnection)();
                try {
                    const results = yield dataBaseModel.selectWithJoins(conn, tableName_constant_1.tables.tableRemindVehicle, `${tableName_constant_1.tables.tableRemindCategory}.*, ${tableName_constant_1.tables.tableRemindVehicle}.*, ${tableName_constant_1.tables.tableRemind}.*`, `is_received = 0 AND is_notified = 0`, [], [
                        {
                            table: tableName_constant_1.tables.tableRemind,
                            on: `${tableName_constant_1.tables.tableRemind}.id = ${tableName_constant_1.tables.tableRemindVehicle}.remind_id`,
                            type: 'LEFT',
                        },
                        {
                            table: tableName_constant_1.tables.tableRemindCategory,
                            on: `${tableName_constant_1.tables.tableRemindCategory}.id = ${tableName_constant_1.tables.tableRemind}.remind_category_id`,
                            type: 'LEFT',
                        },
                    ]);
                    const groupByVehicleId = {};
                    results.forEach((item) => {
                        const { vehicle_id } = item, other = __rest(item, ["vehicle_id"]);
                        if (!groupByVehicleId[item.vehicle_id]) {
                            groupByVehicleId[item.vehicle_id] = [];
                        }
                        groupByVehicleId[item.vehicle_id].push(Object.assign({}, other));
                    });
                    remindsVehicles = groupByVehicleId;
                }
                catch (error) {
                }
                finally {
                    conn.release();
                }
                return remindsVehicles;
            }
        }
        catch (error) { }
    }),
    getCategoryAllByUserId: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        // const isRedisReady = redisModel.redis.instanceConnect.isReady;
        // if (isRedisReady) {
        //     const { data } = await redisModel.hGetAll(
        //         'remind',
        //         'reminder.utils.ts',
        //         Date.now(),
        //     );
        //     const results = data.filter((item: any) => {
        //         item = JSON.parse(item);
        //         return (item.user_id = userId && item.is_received === 0);
        //     });
        //     return results;
        // }
        try {
            const { conn } = yield (0, init_mysql_1.getConnection)();
            try {
                const results = yield dataBaseModel.selectWithJoins(conn, tableName_constant_1.tables.tableRemindVehicle, `vehicle_id, icon`, `${tableName_constant_1.tables.tableRemind}.user_id = ? AND is_received = 0`, [userId], [
                    {
                        table: tableName_constant_1.tables.tableRemind,
                        on: `${tableName_constant_1.tables.tableRemind}.id = ${tableName_constant_1.tables.tableRemindVehicle}.remind_id`,
                        type: 'LEFT',
                    },
                    {
                        table: tableName_constant_1.tables.tableRemindCategory,
                        on: `${tableName_constant_1.tables.tableRemindCategory}.id = ${tableName_constant_1.tables.tableRemind}.remind_category_id`,
                        type: 'LEFT',
                    },
                ]);
                const groupByVehicleId = {};
                results.forEach((item) => {
                    const { vehicle_id } = item, other = __rest(item, ["vehicle_id"]);
                    if (!groupByVehicleId[item.vehicle_id]) {
                        groupByVehicleId[item.vehicle_id] = [];
                    }
                    groupByVehicleId[item.vehicle_id].push(...Object.values(other));
                });
                return groupByVehicleId;
            }
            catch (error) {
            }
            finally {
                conn.release();
            }
        }
        catch (error) { }
        try {
        }
        catch (error) {
            // console.log('Error: ', error);
        }
    }),
    // Hàm gom nhóm các phần tử trong vehicles
    groupVehiclesWithObjects: (imei) => __awaiter(void 0, void 0, void 0, function* () {
        const results = yield redis_model_1.default.hGetAll('remind', 'reminder.utils.ts', Date.now());
        const records = Object.values(results.data).map((item) => JSON.parse(item));
        const grouped = {};
        // Duyệt qua từng bản ghi
        records.forEach((record) => {
            record.vehicles.forEach((vehicle) => {
                // Nếu vehicle chưa có trong grouped, khởi tạo một mảng rỗng
                if (!grouped[vehicle]) {
                    grouped[vehicle] = [];
                }
                // Thêm bản ghi vào mảng của vehicle
                if (record.is_notified === 0 && record.is_received === 0) {
                    grouped[vehicle].push(record);
                }
            });
        });
        return grouped[imei];
    }),
    // Cấu hình upload
    upload: (0, multer_1.default)({ storage }),
};
// multer({
//     storage,
//     // limits: { fileSize: 1024 * 1024 * 5 }, // Giới hạn kích thước file 5MB
//     fileFilter: (req, file, cb) => {
//         const filetypes = /jpeg|jpg|png|gif/;
//         const extname = filetypes.test(
//             path.extname(file.originalname).toLowerCase(),
//         );
//         const mimetype = filetypes.test(file.mimetype);
//         if (mimetype && extname) {
//             return cb(null, true);
//         } else {
//             cb(new Error('Only images are allowed!'));
//         }
//     },
// }),
exports.default = reminder;
