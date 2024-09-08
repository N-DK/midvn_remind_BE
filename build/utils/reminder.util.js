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
const node_cron_1 = __importDefault(require("node-cron"));
const database_model_1 = __importDefault(require("../models/database.model"));
const init_mysql_1 = require("../dbs/init.mysql");
const dataBaseModel = new database_model_1.default();
let connection;
const reminder = {
    init: () => __awaiter(void 0, void 0, void 0, function* () {
        const { conn } = yield (0, init_mysql_1.getConnection)();
        connection = conn;
    }),
    start: () => __awaiter(void 0, void 0, void 0, function* () {
        // TEST
        // cron.schedule('* * * * *', async () => {
        //     // Mỗi phút kiểm tra
        //     try {
        //         console.log('Đang kiểm tra nhắc nhở');
        //         scheduleUtls.createSchedule(
        //             {
        //                 start: new Date('2024-7-09'),
        //                 end: new Date('2024-7-9'),
        //                 time: '11:28',
        //             },
        //             async () => {
        //                 // Mỗi ngày 0h kiểm tra
        //                 console.log('Đang kiểm tra nhắc nhở hàng ngày');
        //                 await remindFeature.sendNotifyRemind(
        //                     'http://localhost:3007',
        //                     {
        //                         name_remind: ' NDK',
        //                         vehicle_name: '123',
        //                         user_id: 5,
        //                     },
        //                 );
        //             },
        //         );
        //         const isRedisReady = redisModel.redis.instanceConnect.isReady;
        //         const now = Date.now(); // Lấy thời gian hiện tại
        //         // const gps = (await GPSApi.getGPSData())?.data; // Lấy dữ liệu GPS
        //         const gps: any = {};
        //         let reminds = [];
        //         if (isRedisReady) {
        //             // get all remind from redis
        //             const { data } = await redisModel.hGetAll(
        //                 'remind',
        //                 'remind.model.ts',
        //                 Date.now(),
        //             );
        //             reminds = Object.values(data);
        //         } else {
        //             const whereClause = `is_received = 0  AND is_notified = 0 AND (expiration_time - ? <= time_before)`;
        //             const results: any = await dataBaseModel.select(
        //                 connection,
        //                 tables.tableRemind,
        //                 '*',
        //                 whereClause,
        //                 gps?.total_distance
        //                     ? [now, gps?.total_distance]
        //                     : [now],
        //             );
        //             reminds = results;
        //         }
        //         for (const r of reminds) {
        //             // select vehicle by remind id from tbl_remind_vehicle
        //             const remind = JSON.parse(r);
        //             // await remindFeature.sendNotifyRemind(
        //             //     'http://localhost:3007',
        //             //     {
        //             //         name_remind: remind.note_repair + ' NDK',
        //             //         vehicle_name: remind.vehicles,
        //             //         user_id: remind.user_id,
        //             //     },
        //             // );
        //         }
        //     } catch (error) {
        //         console.log(error);
        //     }
        // });
    }),
    remindExpirationTime: () => {
        node_cron_1.default.schedule('* * * * *', () => {
            // Mỗi phút kiểm tra
            const now = Date.now();
            const results = dataBaseModel.select(connection, 'tbl_remind', '*', 'expiration_time <= ? AND is_notified = FALSE AND expiration_time - ? = time_before', [now]);
            for (const remind of results) {
                console.log(`Reminder: ${remind.title} - ${remind.description}`);
                // Gửi thông báo
                if (remind.expiration_time <= now) {
                    dataBaseModel.update(connection, 'tbl_remind', 'is_notified = TRUE', 'id = ?', [remind.id]);
                }
            }
        });
    },
};
exports.default = reminder;
