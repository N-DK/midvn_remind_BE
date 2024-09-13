import { PoolConnection } from 'mysql2';
import DatabaseModel from '../models/database.model';
import { getActiveConnections, getConnection } from '../dbs/init.mysql';
import { tables } from '../constants/tableName.constant';
import multer from 'multer';
import redisModel from '../models/redis.model';

const dataBaseModel = new DatabaseModel();

const storage = multer.diskStorage({
    destination: './src/uploads',
    filename: function (req, file, cb) {
        return cb(null, file.originalname);
    },
});
let remindsVehicles: any;

const reminder = {
    init: async () => {
        try {
            // 20s clear remindsVehicles = undefined dùng setInterval
            const isRedisReady = redisModel.redis.instanceConnect.isReady;
            if (!isRedisReady) {
                console.log('CACHE FROM DATABASE -- REDIS NOT READY');
                remindsVehicles = await new Promise(async (resolve, reject) => {
                    try {
                        const result = await reminder.getReminds(); // Gọi phương thức getReminds và đợi nó hoàn tất
                        resolve(result); // Kết quả từ getReminds được giải quyết
                    } catch (error) {
                        reject(error); // Nếu có lỗi, từ chối promise với lỗi đó
                    }
                });
                const interval = setInterval(async () => {
                    const isRedisReady =
                        redisModel.redis.instanceConnect.isReady;
                    console.log('CLEAR REMINDS VEHICLES FROM DATABASE');
                    if (isRedisReady) {
                        clearInterval(interval);
                    } else {
                        remindsVehicles = await reminder.getReminds();
                    }
                }, 1 * 60 * 1000);
            }
        } catch (error) {
            console.log('Error init reminder: ', error);
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

        try {
            const { conn } = await getConnection();
            try {
                const results: any = await dataBaseModel.selectWithJoins(
                    conn,
                    tables.tableRemindVehicle,
                    `${tables.tableRemindCategory}.*, ${tables.tableRemindCategory}.name as category_name,${tables.tableRemindVehicle}.*, ${tables.tableRemind}.*`,
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
            } catch (error) {
            } finally {
                conn.release();
            }
        } catch (error) {}
    },

    getReminds: async () => {
        try {
            if (!remindsVehicles) {
                const { conn } = await getConnection();

                try {
                    const results: any = await dataBaseModel.selectWithJoins(
                        conn,
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
                } catch (error) {
                } finally {
                    conn.release();
                }
                return remindsVehicles;
            }
        } catch (error) {}
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

        try {
            const { conn } = await getConnection();

            try {
                const results: any = await dataBaseModel.selectWithJoins(
                    conn,
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
                    groupByVehicleId[item.vehicle_id].push(
                        ...Object.values(other),
                    );
                });

                return groupByVehicleId;
            } catch (error) {
            } finally {
                conn.release();
            }
        } catch (error) {}

        try {
        } catch (error) {
            // console.log('Error: ', error);
        }
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
