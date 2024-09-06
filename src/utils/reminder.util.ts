import { PoolConnection } from 'mysql2';
import cron from 'node-cron';
import DatabaseModel from '../models/database.model';
import { eventFeature, remindFeature } from 'notify-services';
import { getConnection } from '../dbs/init.mysql';
import GPSApi from '../api/GPS.api';
import { tables } from '../constants/tableName.constant';
import redisModel from '../models/redis.model';

const dataBaseModel = new DatabaseModel();

let connection: PoolConnection;

const reminder = {
    init: async () => {
        const { conn } = await getConnection();
        connection = conn;
    },

    start: async () => {
        cron.schedule('* * * * *', async () => {
            // Mỗi phút kiểm tra
            try {
                console.log('Đang kiểm tra nhắc nhở');
                const isRedisReady = redisModel.redis.instanceConnect.isReady;

                const now = Date.now(); // Lấy thời gian hiện tại
                // const gps = (await GPSApi.getGPSData())?.data; // Lấy dữ liệu GPS
                const gps: any = {};
                const whereClause = `is_received = 0 AND is_notified = 0 AND (expiration_time - ? <= time_before)`;
                // const whereClause = 'is_received = 0 AND is_notified = 0';
                const results: any = await dataBaseModel.select(
                    connection,
                    tables.tableRemind,
                    '*',
                    whereClause,
                    gps?.total_distance ? [now, gps?.total_distance] : [now],
                );

                // get all remind from redis
                const { data } = await redisModel.hGetAll(
                    'remind',
                    'remind.model.ts',
                    Date.now(),
                );

                const reminds = isRedisReady ? Object.values(data) : results;

                for (const remind of reminds) {
                    // select vehicle by remind id from tbl_remind_vehicle

                    await remindFeature.sendNotifyRemind(
                        'http://localhost:3007',
                        {
                            name_remind: remind.note_repair,
                            vehicle_name: remind.vehicles,
                            user_id: 5,
                        },
                    );
                }
            } catch (error) {
                console.log(error);
            }
        });
    },

    remindExpirationTime: () => {
        cron.schedule('* * * * *', () => {
            // Mỗi phút kiểm tra
            const now = Date.now();
            const results: any = dataBaseModel.select(
                connection,
                'tbl_remind',
                '*',
                'expiration_time <= ? AND is_notified = FALSE AND expiration_time - ? = time_before',
                [now],
            );

            for (const remind of results) {
                console.log(
                    `Reminder: ${remind.title} - ${remind.description}`,
                );

                // Gửi thông báo
                if (remind.expiration_time <= now) {
                    dataBaseModel.update(
                        connection,
                        'tbl_remind',
                        'is_notified = TRUE',
                        'id = ?',
                        [remind.id],
                    );
                }
            }
        });
    },
};

export default reminder;
