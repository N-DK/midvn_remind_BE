import { PoolConnection } from 'mysql2';
import DatabaseModel from '../models/database.model';
import { getConnection } from '../dbs/init.mysql';
import { tables } from '../constants/tableName.constant';
import multer from 'multer';
import redisModel from '../models/redis.model';

const dataBaseModel = new DatabaseModel();

let connection: PoolConnection;
const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
        return cb(null, file.originalname);
    },
});
let remindsVehicles: any;

const reminder = {
    init: async () => {
        try {
            const { conn } = await getConnection();
            connection = conn;
            // 20s clear remindsVehicles = undefined dùng setInterval
            // remindsVehicles = await reminder.getReminds();
            // setInterval(async () => {
            //     remindsVehicles = await reminder.getReminds();
            // }, 1 * 60 * 1000);
        } catch (error) {
            console.log('Error: ', error);
        }
    },
    getRemindsByVehicleId: async (vehicleId: string) => {
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

        const results: any = await dataBaseModel.selectWithJoins(
            connection,
            tables.tableRemindVehicle,
            `${tables.tableRemindCategory}.*, ${tables.tableRemindVehicle}.*, ${tables.tableRemind}.*`,
            'vehicle_id = ? AND is_received = 0',
            [vehicleId],
            [
                {
                    table: tables.tableRemind,
                    on: `${tables.tableRemind}.id = ${tables.tableRemindVehicle}.remind_id`,
                    type: 'LEFT',
                },
                {
                    table: tables.tableRemindCategory,
                    on: `${tables.tableRemindCategory}.id = ${tables.tableRemind}.remind_category_id`,
                    type: 'LEFT',
                },
            ],
            `ORDER BY ${tables.tableRemind}.expiration_time ASC`,
        );

        return results;
    },

    getReminds: async () => {
        if (!remindsVehicles) {
            const results: any = await dataBaseModel.selectWithJoins(
                connection,
                tables.tableRemindVehicle,
                `${tables.tableRemindCategory}.*, ${tables.tableRemindVehicle}.*, ${tables.tableRemind}.*`,
                `is_received = 0 AND is_notified = 0`,
                [],
                [
                    {
                        table: tables.tableRemind,
                        on: `${tables.tableRemind}.id = ${tables.tableRemindVehicle}.remind_id`,
                        type: 'LEFT',
                    },
                    {
                        table: tables.tableRemindCategory,
                        on: `${tables.tableRemindCategory}.id = ${tables.tableRemind}.remind_category_id`,
                        type: 'LEFT',
                    },
                ],
            );

            const groupByVehicleId: any = {};
            results.forEach((item: any) => {
                const { vehicle_id, ...other } = item;
                if (!groupByVehicleId[item.vehicle_id]) {
                    groupByVehicleId[item.vehicle_id] = [];
                }
                groupByVehicleId[item.vehicle_id].push({ ...other });
            });

            remindsVehicles = groupByVehicleId;
        }
        return remindsVehicles;
    },

    getCategoryAllByUserId: async (userId: number) => {
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

        const results: any = await dataBaseModel.selectWithJoins(
            connection,
            tables.tableRemindVehicle,
            `vehicle_id, icon`,
            `${tables.tableRemind}.user_id = ? AND is_received = 0`,
            [userId],
            [
                {
                    table: tables.tableRemind,
                    on: `${tables.tableRemind}.id = ${tables.tableRemindVehicle}.remind_id`,
                    type: 'LEFT',
                },
                {
                    table: tables.tableRemindCategory,
                    on: `${tables.tableRemindCategory}.id = ${tables.tableRemind}.remind_category_id`,
                    type: 'LEFT',
                },
            ],
        );

        const groupByVehicleId: any = {};
        results.forEach((item: any) => {
            const { vehicle_id, ...other } = item;
            if (!groupByVehicleId[item.vehicle_id]) {
                groupByVehicleId[item.vehicle_id] = [];
            }
            groupByVehicleId[item.vehicle_id].push(...Object.values(other));
        });

        return groupByVehicleId;
    },

    // Hàm gom nhóm các phần tử trong vehicles
    groupVehiclesWithObjects: async (imei: any) => {
        const results = await redisModel.hGetAll(
            'remind',
            'reminder.utils.ts',
            Date.now(),
        );

        const records = Object.values(results.data).map((item: any) =>
            JSON.parse(item),
        );

        const grouped: any = {};

        // Duyệt qua từng bản ghi
        records.forEach((record: any) => {
            record.vehicles.forEach((vehicle: any) => {
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
    },
    // Cấu hình upload
    upload: multer({ storage }),
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

export default reminder;
