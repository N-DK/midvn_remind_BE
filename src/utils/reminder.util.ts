import { PoolConnection } from 'mysql2';
import cron, { schedule } from 'node-cron';
import DatabaseModel from '../models/database.model';
import { remindFeature } from 'notify-services';
import { getConnection } from '../dbs/init.mysql';
import GPSApi from '../api/GPS.api';
import { tables } from '../constants/tableName.constant';
import redisModel from '../models/redis.model';
import scheduleUtls from './schedule.util';

const dataBaseModel = new DatabaseModel();

let connection: PoolConnection;

const reminder = {
    init: async () => {
        const { conn } = await getConnection();
        connection = conn;
    },
    getRemindsByVehicleId: async (vehicleId: string) => {
        const results: any = await dataBaseModel.selectWithJoins(
            connection,
            tables.tableRemindVehicle,
            `${tables.tableRemindCategory}.*, ${tables.tableRemindVehicle}.*, ${tables.tableRemind}.*`,
            'vehicle_id = ?',
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
        );

        return results;
    },
};

export default reminder;
