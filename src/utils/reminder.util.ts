import { PoolConnection } from 'mysql2';
import DatabaseModel from '../models/database.model';
import { getConnection } from '../dbs/init.mysql';
import { tables } from '../constants/tableName.constant';
import multer from 'multer';
import path from 'path';
import appRoot from 'app-root-path';
import redisModel from '../models/redis.model';

const dataBaseModel = new DatabaseModel();

let connection: PoolConnection;
const storage = multer.diskStorage({
    destination: './uploads',
    filename: function (req, file, cb) {
        return cb(null, file.originalname);
    },
});
const reminder = {
    init: async () => {
        const { conn } = await getConnection();
        connection = conn;
    },
    getRemindsByVehicleId: async (vehicleId: string) => {
        const isRedisReady = redisModel.redis.instanceConnect.isReady;

        if (isRedisReady) {
            const { data } = await redisModel.hGetAll(
                'remind',
                'reminder.utils.ts',
                Date.now(),
            );
            const results = data.filter((item: any) => {
                item = JSON.parse(item);
                return (
                    item.vehicles.includes(vehicleId) && item.is_received === 0
                );
            });

            return results;
        }

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

    getCategoryAllByUserId: async (userId: number) => {
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
            groupByVehicleId[item.vehicle_id].push(Object.values(other));
        });

        return groupByVehicleId;
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
