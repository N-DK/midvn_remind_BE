import DatabaseModel from '../models/database.model';
import { getConnection } from '../dbs/init.mysql';
import { tables } from '../constants/tableName.constant';
import multer from 'multer';
import redisModel from '../models/redis.model';
import scheduleUtil from './schedule.util';
import path from 'path';
import fs from 'fs';
import appRoot from 'app-root-path';
import remindModel from '../models/remind.model';
import sharp from 'sharp';
import remindService from '../services/remind.service';

const dataBaseModel = new DatabaseModel();

const uploadDir = path.join('./build/src/uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: uploadDir,
    filename: function (req, file, cb) {
        return cb(null, `${file.originalname}`);
    },
});
let remindsVehicles: any;
let isProcess = false;
const DIR = './build/src/';

const reminder = {
    init: async () => {
        try {
            const isRedisReady = redisModel?.redis?.instanceConnect?.isReady;
            let interval: any = null;

            const fetchFromDatabase = async () => {
                console.time('Fetching data from database...');
                remindsVehicles = await reminder.getReminds(true);
                console.timeEnd('Fetching data from database...');
            };

            const checkRedisConnection = async (isResync: boolean) => {
                if (redisModel?.redis?.instanceConnect?.isReady) {
                    clearInterval(interval);
                    interval = null;
                    console.log('Redis reconnected and data resynced.');
                    if (isResync) await reminder.resyncReminds();
                } else {
                    await fetchFromDatabase();
                }
            };

            if (!isRedisReady) {
                await fetchFromDatabase();

                interval = setInterval(
                    async () => await checkRedisConnection(true),
                    10 * 1000,
                );
            }

            redisModel?.redis?.instanceConnect?.on('error', async () => {
                if (!interval) {
                    console.log(
                        'Redis connection lost. Switching to database...',
                    );
                    await fetchFromDatabase();

                    interval = setInterval(
                        async () => await checkRedisConnection(false),
                        60 * 1000,
                    );
                }
            });

            redisModel?.redis?.instanceConnect?.on('connect', async () => {
                console.log('Redis connection restored.');
                await reminder.resyncReminds();
            });
        } catch (error) {
            console.error('Error initializing reminder: ', error);
        }
    },

    resyncReminds: async () => {
        try {
            console.time('RESYNC DATE FROM DATABASE');
            const reminds: any = await scheduleUtil.getReminds();
            console.log('Reminds:', reminds?.length);

            await redisModel.del('remind', 'init.redis.ts', Date.now());
            console.log('Deleted previous reminds in Redis');

            for (const remind of reminds) {
                await redisModel.hSet(
                    'remind',
                    remind.id,
                    JSON.stringify(remind),
                    'init.redis.ts',
                    Date.now(),
                );
            }

            console.timeEnd('RESYNC DATE FROM DATABASE');
        } catch (error) {
            console.error('Error during resync:', error);
        }
    },

    getRemindsByVehicleId: async (vehicleId: string) => {
        try {
            const { conn } = await getConnection();
            try {
                const results: any = await dataBaseModel.selectWithJoins(
                    conn,
                    tables.tableRemindVehicle,
                    `${tables.tableRemindCategory}.*, ${tables.tableRemindCategory}.name as category_name,${tables.tableRemindVehicle}.*, ${tables.tableRemind}.*`,
                    `vehicle_id = ? AND is_received = 0 AND ${tables.tableRemind}.is_deleted = 0`,
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

    getReminds: async (isResync: boolean) => {
        try {
            if ((!remindsVehicles && !isProcess) || isResync) {
                console.log('Resyncing data from database...');
                isProcess = true;
                const { conn } = await getConnection();

                try {
                    const results: any = await dataBaseModel.selectWithJoins(
                        conn,
                        tables.tableRemindVehicle,
                        `${tables.tableRemindCategory}.*, ${tables.tableRemindVehicle}.*, ${tables.tableRemind}.*`,
                        `is_received = 0 AND is_notified = 0 AND ${tables.tableRemind}.is_deleted = 0`,
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
                    isProcess = remindsVehicles ? false : true;
                    return groupByVehicleId;
                } catch (error) {
                } finally {
                    isProcess = remindsVehicles ? false : true;
                    conn.release();
                }
            }
            isProcess = remindsVehicles ? false : true;
            return remindsVehicles;
        } catch (error) {}
    },

    getCategoryAllByUserId: async (userId: number) => {
        try {
            const { conn } = await getConnection();

            try {
                const results: any = await dataBaseModel.selectWithJoins(
                    conn,
                    tables.tableRemindVehicle,
                    `${remindModel.vehicleGPSColumns}, ${remindModel.remindColumns}, ${remindModel.remindCategoryColumns}, ${remindModel.tireColumns}`,
                    `${tables.tableRemind}.user_id = ? AND is_received = 0 AND ${tables.tableRemind}.is_deleted = 0`,
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
                    const { license_plate, icon, ...other } = item;
                    if (!groupByVehicleId[item.license_plate]) {
                        groupByVehicleId[item.license_plate] = [];
                    }
                    groupByVehicleId[item.license_plate].push({
                        icon,
                        remind: { ...other },
                    });
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

    upload: multer({
        storage,
        limits: { fileSize: 1024 * 1024 * 2 }, // Giới hạn kích thước file 2MB
        fileFilter: (req, file, cb) => {
            const filetypes = /jpeg|jpg|png|gif/;
            const extname = filetypes.test(
                path.extname(file.originalname).toLowerCase(),
            );

            const mimetype = filetypes.test(file.mimetype);

            if (mimetype && extname) {
                return cb(null, true);
            } else {
                cb(new Error('Only images are allowed!'));
            }
        },
    }),

    moveToUploads: async (
        vehicles: any[],
        img_url: string,
        remindId: number,
    ) => {
        try {
            const new_img_url: string[] = [];

            for (const vehicle of vehicles) {
                try {
                    const uploadDir = `${DIR}uploads/${vehicle}`;

                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }
                    const images = img_url?.split(', ');
                    for (const image of images ?? []) {
                        const date = new Date();
                        const imageData = fs.readFileSync(`${DIR}${image}`);

                        const files = fs.readdirSync(uploadDir);
                        const count = files.length;
                        const fileName = `${remindId}_${date.getDate()}_${
                            date.getMonth() + 1
                        }_${date.getFullYear()}_${count + 1}.png`;

                        if (
                            !new_img_url.includes(
                                `uploads/${vehicle}/${fileName}`,
                            )
                        ) {
                            new_img_url.push(`uploads/${vehicle}/${fileName}`);
                        }
                        fs.writeFileSync(
                            `${DIR}uploads/${vehicle}/${fileName}`,
                            imageData,
                        );
                    }
                } catch (error) {
                    console.log('error', error);
                }
            }

            // const images = img_url?.split(', ') ?? [];

            // for (const image of images) {
            //     fs.unlinkSync(`${DIR}${image}`);
            // }

            const thumbnail_urls: string[] = [];
            for (const image of new_img_url) {
                const inputImagePath = `${DIR}${image}`;
                const outputDir = `${DIR}uploads/thumbnail/${
                    image.split('/')[1]
                }`;
                const outputImagePath = `${outputDir}/${image
                    .split('/')
                    .pop()}`;

                if (!fs.existsSync(outputDir)) {
                    fs.mkdirSync(outputDir, { recursive: true });
                }

                sharp(inputImagePath)
                    .resize(100, 100)
                    .toFile(outputImagePath)
                    .then(() => {
                        // console.log('Thumbnail created successfully!');
                    })
                    .catch((err) => {
                        console.error('Error creating thumbnail:', err);
                    });
                thumbnail_urls.push(outputImagePath.replace(DIR, ''));
            }

            await remindService.updateImage(remindId, {
                img_url: new_img_url.join(', '),
                thumbnail_urls: thumbnail_urls.join(', '),
            });
        } catch (error) {
            console.log('error', error);
        }
    },

    clearUploads: async (data: any, remindId: any) => {
        try {
            const vehicles = await scheduleUtil.getVehiclesByRemindId(remindId);

            for (const vehicle of data?.vehicles ?? vehicles) {
                const uploadDir = `${DIR}uploads/${vehicle}`;
                const uploadThumbnailDir = `${DIR}uploads/thumbnail/${vehicle}`;

                // xóa file chứa remind_id
                if (fs.existsSync(uploadDir)) {
                    const files = fs.readdirSync(uploadDir);
                    for (const file of files) {
                        if (file.includes(remindId.toString())) {
                            fs.unlinkSync(`${uploadDir}/${file}`);
                        }
                    }
                }

                // xóa file thumbnail
                if (fs.existsSync(uploadThumbnailDir)) {
                    const files = fs.readdirSync(uploadThumbnailDir);
                    for (const file of files) {
                        if (file.includes(remindId.toString())) {
                            fs.unlinkSync(`${uploadThumbnailDir}/${file}`);
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    },

    clearUploadsThumbnailByRemind: async (remindId: any) => {
        try {
            const vehicles = await scheduleUtil.getVehiclesByRemindId(remindId);
            for (const vehicle of vehicles) {
                const uploadThumbnailDir = `${DIR}uploads/thumbnail/${vehicle}`;
                // xóa file thumbnail
                if (fs.existsSync(uploadThumbnailDir)) {
                    const files = fs.readdirSync(uploadThumbnailDir);
                    for (const file of files) {
                        if (file.includes(remindId.toString())) {
                            fs.unlinkSync(`${uploadThumbnailDir}/${file}`);
                        }
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    },

    clearUploadsFolder: async (img_url: any) => {
        const images = img_url?.split(', ') ?? [];

        for (const image of images) {
            fs.unlinkSync(`${DIR}${image}`);
        }
    },

    // req.files
    //     .map((file) =>
    //                     file.path.replace(`src/`, '').replace('build/', ''),
    //                 )
    //                 .join(', ');

    convertImage: (files: any) => {
        return files
            .map((file: any) =>
                file.path.replace(`src/`, '').replace('build/', ''),
            )
            .join(', ');
    },
};

export default reminder;
