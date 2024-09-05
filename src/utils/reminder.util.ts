import { PoolConnection } from 'mysql2';
import cron from 'node-cron';
import DatabaseModel from '../models/database.model';
import { eventFeature } from 'notify-services';
import { getConnection } from '../dbs/init.mysql';
import GPSApi from '../api/GPS.api';
import { tables } from '../constants/tableName.constant';

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
            const now = Date.now(); // Lấy thời gian hiện tại
            const gps = (await GPSApi.getGPSData()).data || 0; // Lấy dữ liệu GPS
            const whereClause = `is_received = 0 AND is_notified = 0 AND (expiration_time - ? <= time_before ${
                gps.total_distance ? 'OR cumulative_kilometers >= ?' : ''
            })`;
            const reminds: any = dataBaseModel.select(
                connection,
                tables.tableRemind,
                '*',
                whereClause,
                [now, gps.total_distance],
            );

            for (const remind of reminds) {
                // Gửi thông báo
                console.log(
                    `Gửi thông báo: ${remind.title} - ${remind.description}`,
                );
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
                eventFeature.sendNotifyEvent('', {
                    user_name: remind.user_name,
                    event_name: remind.title,
                    company_name: remind.company_name,
                    location_name: remind.location_name,
                    time: remind.scheduled_date,
                });

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
