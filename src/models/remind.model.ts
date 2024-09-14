import { PoolConnection } from 'mysql2';
import DatabaseModel from './database.model';
import { tables } from '../constants/tableName.constant';
import redisModel from './redis.model';
import { remindFeature } from 'notify-services';
import scheduleUtils from '../utils/schedule.util';
import reminder from '../utils/reminder.util';
import GPSApi from '../api/GPS.api';
import configureEnvironment from '../config/dotenv.config';
import remindService from '../services/remind.service';

const { SV_NOTIFY } = configureEnvironment();
const UNIT_MONTH = 30 * 24 * 60 * 60;

class RemindModel extends DatabaseModel {
    constructor() {
        super();
    }

    private vehicleColumns = `
        ${tables.tableVehicleNoGPS}.id AS vehicle_id,
        ${tables.tableVehicleNoGPS}.license_plate AS license_plate,
        ${tables.tableVehicleNoGPS}.user_id AS user_id,
        ${tables.tableVehicleNoGPS}.license AS license,
        ${tables.tableVehicleNoGPS}.create_time AS vehicle_create_time,
        ${tables.tableVehicleNoGPS}.update_time AS vehicle_update_time,
        ${tables.tableVehicleNoGPS}.user_name AS user_name,
        ${tables.tableVehicleNoGPS}.user_address AS user_address
    `;

    private remindColumns = `
        ${tables.tableRemind}.id AS remind_id,
        ${tables.tableRemind}.img_url AS remind_img_url,
        ${tables.tableRemind}.note_repair AS note_repair,
        ${tables.tableRemind}.history_repair AS history_repair,
        ${tables.tableRemind}.current_kilometers AS current_kilometers,
        ${tables.tableRemind}.cumulative_kilometers AS cumulative_kilometers,
        ${tables.tableRemind}.expiration_time AS expiration_time,
        ${tables.tableRemind}.is_notified AS is_notified,
        ${tables.tableRemind}.is_received AS is_received,
        ${tables.tableRemind}.create_time AS remind_create_time,
        ${tables.tableRemind}.update_time AS remind_update_time,
        ${tables.tableRemind}.cycle AS cycle
    `;

    private remindCategoryColumns = `
        ${tables.tableRemindCategory}.id AS remind_category_id,
        ${tables.tableRemindCategory}.name AS category_name,
        ${tables.tableRemindCategory}.desc AS category_desc,
        ${tables.tableRemindCategory}.icon AS category_icon,
        ${tables.tableRemindCategory}.create_time AS category_create_time,
        ${tables.tableRemindCategory}.update_time AS category_update_time,
        ${tables.tableRemindCategory}.is_deleted AS category_is_deleted
    `;

    private tireColumns = `
        ${tables.tableRemindVehicle}.tire_seri AS tire_seri,
        ${tables.tableTire}.id AS tire
    `;

    private commonJoins: {
        table: string;
        on: string;
        type?: 'LEFT' | 'INNER' | 'RIGHT';
    }[] = [
        {
            table: tables.tableRemindVehicle,
            on: `${tables.tableVehicleNoGPS}.license_plate = ${tables.tableRemindVehicle}.vehicle_id`,
            type: 'LEFT',
        },
        {
            table: tables.tableRemind,
            on: `${tables.tableRemindVehicle}.remind_id = ${tables.tableRemind}.id`,
            type: 'LEFT',
        },
        {
            table: tables.tableRemindCategory,
            on: `${tables.tableRemind}.remind_category_id = ${tables.tableRemindCategory}.id`,
            type: 'LEFT',
        },
        {
            table: tables.tableTire,
            on: `${tables.tableTire}.seri = ${tables.tableRemindVehicle}.tire_seri`,
            type: 'LEFT',
        },
    ];

    async getAll(con: PoolConnection, userID: number) {
        const result = await this.selectWithJoins(
            con,
            tables.tableVehicleNoGPS,
            `${this.vehicleColumns}, ${this.remindColumns}, ${this.remindCategoryColumns}, ${this.tireColumns}`,
            `${tables.tableVehicleNoGPS}.user_id = ? AND ${tables.tableVehicleNoGPS}.is_deleted = 0`,
            [userID],
            this.commonJoins,
            `ORDER BY ${tables.tableRemind}.id IS NULL, ${tables.tableRemind}.expiration_time ASC`,
        );

        return result;
    }

    async getByVehicleId(con: PoolConnection, vehicleID: string) {
        const result = await this.selectWithJoins(
            con,
            tables.tableVehicleNoGPS,
            `${this.vehicleColumns}, ${this.remindColumns}, ${this.remindCategoryColumns}, ${this.tireColumns}`,
            `${tables.tableVehicleNoGPS}.license_plate = ? AND ${tables.tableVehicleNoGPS}.is_deleted = 0`,
            [vehicleID],
            this.commonJoins,
            `ORDER BY ${tables.tableRemind}.expiration_time ASC`,
        );

        return result;
    }

    async search(con: PoolConnection, userID: number, query: any) {
        const params: any[] = [userID];
        let whereClause = `${tables.tableVehicleNoGPS}.user_id = ? AND ${tables.tableVehicleNoGPS}.is_deleted = 0 AND is_received = 0`;

        if (query.vehicle_id) {
            whereClause += ` AND ${tables.tableVehicleNoGPS}.license_plate = ?`;
            params.push(query.vehicle_id);
        }

        if (query.keyword) {
            whereClause += ` AND (
                ${tables.tableVehicleNoGPS}.license_plate LIKE ? OR 
                ${tables.tableVehicleNoGPS}.license LIKE ? OR
                note_repair LIKE ? OR 
                cumulative_kilometers LIKE ? OR
                ${tables.tableRemindCategory}.name LIKE ?
            )`;
            const keyword = `%${query.keyword}%`;
            params.push(keyword, keyword, keyword, keyword, keyword);
        }

        if (query.remind_category_id) {
            whereClause += ` AND ${tables.tableRemind}.remind_category_id = ?`;
            params.push(query.remind_category_id);
        }

        const result = await this.selectWithJoins(
            con,
            tables.tableVehicleNoGPS,
            `${this.vehicleColumns}, ${this.remindColumns}, ${this.remindCategoryColumns}, ${this.tireColumns}`,
            whereClause,
            params,
            this.commonJoins,
            `ORDER BY ${tables.tableRemind}.id IS NULL, ${tables.tableRemind}.expiration_time ASC`,
        );

        return result;
    }

    async getCurrentKilometersByVehicleId(vehicleID: string, token: string) {
        if (!vehicleID || !token) return 0;

        const res = await GPSApi.getGPSData(token);

        const data = res?.data;
        if (!data) return 0;
        return data[vehicleID]?.total_distance ?? 0;
    }

    async addRemind(con: PoolConnection, data: any) {
        if (data?.token) {
            const currentKilometers =
                await this.getCurrentKilometersByVehicleId(
                    data?.vehicles[0],
                    data?.token,
                );
            data.current_kilometers = currentKilometers;
        }

        try {
            const payload = {
                img_url: data?.img_url ?? null,
                note_repair: data?.note_repair ?? null,
                history_repair: data?.history_repair ?? null,
                current_kilometers: data?.current_kilometers ?? 0,
                cumulative_kilometers: data?.cumulative_kilometers
                    ? Number(data?.cumulative_kilometers)
                    : 0,
                expiration_time: parseInt(data?.expiration_time ?? 0),
                is_deleted: 0,
                km_before: data?.km_before ? Number(data?.km_before) : 0,
                is_notified: parseInt(data?.is_notified ?? 0),
                is_received: parseInt(data?.is_received ?? 0),
                remind_category_id: parseInt(data?.remind_category_id),
                cycle: parseInt(data?.cycle ?? 0),
                create_time: Date.now(),
                user_id:
                    data?.user?.level === 10
                        ? data?.user?.userId
                        : data?.user?.parentId ?? data?.user?.userId,
            };

            // console.log('payload', payload);

            const remind_id: any = await this.insert(
                con,
                tables.tableRemind,
                payload,
            );

            const result = await this.insertVehicles(
                con,
                remind_id,
                data?.vehicles,
                data?.tire_seri,
            );

            const remind = {
                ...payload,
                schedules: data?.schedules ?? [],
                id: remind_id,
                vehicles: data?.vehicles ?? [],
            };

            await this.updateRedis(remind_id, remind);

            await this.scheduleCronJobForExpiration(remind);

            if (payload.is_notified === 0 && data?.schedules) {
                for (const schedule of data?.schedules) {
                    await this.handleSchedule(schedule, remind, data?.vehicles);
                }
            }

            await this.insertRemindSchedule(con, remind_id, data);

            return result;
        } catch (error) {
            console.error('Error adding remind:', error);
            throw error;
        }
    }

    async insertVehicles(
        con: PoolConnection,
        remind_id: number,
        vehicles: any[],
        tire_seri: string | null,
    ) {
        if (!vehicles || vehicles.length === 0) {
            return;
        }

        const values = vehicles
            ?.map(
                (vehicle: any) =>
                    `(${remind_id}, '${vehicle}', '${tire_seri ?? null}')`,
            )
            .join(',');

        const queryText = `INSERT INTO ${tables.tableRemindVehicle} (remind_id, vehicle_id, tire_seri) VALUES ${values}`;
        const result = await new Promise((resolve, reject) => {
            con.query(queryText, (err: any, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        return result;
    }

    async updateRedis(remind_id: number, remind: any) {
        const isRedisReady = redisModel.redis.instanceConnect.isReady;

        if (isRedisReady) {
            await redisModel.hSet(
                'remind',
                remind_id,
                JSON.stringify(remind),
                'remind.models.ts',
                Date.now(),
            );
        }
    }

    async scheduleCronJobForExpiration(remind: any) {
        const cronJob = await scheduleUtils.createCronJobForExpired(
            new Date(remind.expiration_time + 86400000),
            remind,
        );
        cronJob.start();
    }

    async handleSchedule(schedule: any, remind: any, vehicles: any[]) {
        // Create and schedule reminders
        scheduleUtils.createSchedule(
            {
                start: new Date(schedule.start),
                end: new Date(schedule.end),
                time: schedule.time,
            },
            async () => {
                await remindFeature.sendNotifyRemind(SV_NOTIFY as string, {
                    name_remind: remind.note_repair + ' NDK',
                    vehicle_name: vehicles.join(', '),
                    user_id: remind.user_id,
                });
            },
            remind,
        );
    }

    async updateNotifiedOff(con: PoolConnection, remindID: number) {
        const result = await this.update(
            con,
            tables.tableRemind,
            { is_notified: 1 },
            'id',
            remindID,
        );

        const isRedisReady = redisModel.redis.instanceConnect.isReady;

        scheduleUtils.destroyAllCronJobByRemindId(remindID, 'schedule');

        if (isRedisReady) {
            const { data } = await redisModel.hGetAll(
                'remind',
                'remind.model.ts',
                Date.now(),
            );
            const reminds: any = Object.values(data).map((item: any) =>
                JSON.parse(item),
            );
            const remindIndex = reminds.findIndex(
                (remind: any) => remind.id === remindID,
            );

            if (remindIndex !== -1) {
                let remind = reminds[remindIndex];
                remind.is_notified = 1;
                await redisModel.hSet(
                    'remind',
                    remindID,
                    JSON.stringify(remind),
                    'remind.models.ts',
                    Date.now(),
                );
            } else {
                console.log(`Remind with ID ${remindID} not found in Redis`);
            }
        }
        return result;
    }

    async updateNotifiedON(con: PoolConnection, remindID: number) {
        const result = await this.update(
            con,
            tables.tableRemind,
            { is_notified: 0 },
            'id',
            remindID,
        );

        const isRedisReady = redisModel.redis.instanceConnect.isReady;

        const results: any = await this.select(
            con,
            tables.tableRemind,
            '*',
            'id = ?',
            [remindID],
        );

        const vehicles = await scheduleUtils.getVehiclesByRemindId(remindID);
        const schedules: any = await scheduleUtils.buildSchedule(remindID);

        const remind = {
            ...results[0],
            schedules: schedules,
            vehicles: vehicles,
        };

        // console.log(schedules);

        for (const schedule of schedules) {
            await this.handleSchedule(schedule, remind, vehicles);
        }

        if (isRedisReady) {
            const { data } = await redisModel.hGetAll(
                'remind',
                'remind.model.ts',
                Date.now(),
            );
            const reminds: any = Object.values(data).map((item: any) =>
                JSON.parse(item),
            );

            const remindIndex = reminds.findIndex(
                (remind: any) => remind.id === remindID,
            );
            if (remindIndex !== -1) {
                let remind = reminds[remindIndex];
                remind.is_notified = 0;
                await redisModel.hSet(
                    'remind',
                    remindID,
                    JSON.stringify(remind),
                    'remind.models.ts',
                    Date.now(),
                );
            } else {
                console.log(`Remind with ID ${remindID} not found in Redis`);
            }
        }

        return result;
    }

    async insertRemindSchedule(
        con: PoolConnection,
        remindID: number,
        data: any,
    ) {
        if (!data.schedules || data?.schedules?.length === 0) return;
        const values = data?.schedules
            ?.map(
                (schedule: any) =>
                    `(${remindID}, ${schedule.start}, ${schedule.end}, '${
                        schedule.time
                    }', ${Date.now()})`,
            )
            .join(',');
        const queryText = `INSERT INTO ${tables.tableRemindSchedule} (remind_id, start, end, time, create_time) VALUES ${values}`;
        await new Promise((resolve, reject) => {
            con.query(queryText, (err: any, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
    }

    async updateRemind(con: PoolConnection, data: any, remindID: number) {
        const isRedisReady = redisModel.redis.instanceConnect.isReady;
        const result: any = await this.select(
            con,
            tables.tableRemind,
            '*',
            'id = ?',
            [remindID],
        );
        const remindOld = result[0];

        const payload = {
            img_url: data?.img_url,
            note_repair: data?.note_repair ?? remindOld.note_repair,
            history_repair: data?.history_repair ?? remindOld.history_repair,
            current_kilometers:
                data?.current_kilometers ?? remindOld.current_kilometers,
            cumulative_kilometers:
                data?.cumulative_kilometers ?? remindOld.cumulative_kilometers,
            expiration_time: data?.expiration_time ?? remindOld.expiration_time,
            is_deleted: remindOld.is_deleted,
            km_before: data?.km_before ?? remindOld.km_before,
            is_notified: data?.is_notified ?? remindOld.is_notified,
            is_received: data?.is_received ?? remindOld.is_received,
            remind_category_id:
                data?.remind_category_id ?? remindOld.remind_category_id,
            cycle: data?.cycle ?? remindOld.cycle,
            update_time: Date.now(),
            user_id:
                data?.user?.level === 10
                    ? data?.user?.userId
                    : data?.user?.parentId ?? remindOld.user_id,
        };

        const remind = {
            ...payload,
            schedules: data?.schedules ?? [],
            id: remindID,
            vehicles: data?.vehicles ?? [],
        };

        const results: any = await this.update(
            con,
            tables.tableRemind,
            payload,
            'id',
            remindID,
        );

        if (data?.schedules && payload.is_notified === 0) {
            await this.delete(
                con,
                tables.tableRemindSchedule,
                `remind_id = ${remindID}`,
            );

            await this.insertRemindSchedule(con, remindID, data);

            const vehicles = await scheduleUtils.getVehiclesByRemindId(
                remindID,
            );

            // console.log('vehicles', vehicles);

            scheduleUtils.destroyAllCronJobByRemindId(remindID, 'schedule');
            for (const schedule of data?.schedules) {
                await this.handleSchedule(schedule, remind, vehicles);
            }
        }

        if (data?.expiration_time && payload.is_notified === 0) {
            scheduleUtils.destroyAllCronJobByRemindId(remindID, 'expire');
            await this.scheduleCronJobForExpiration(remind);
        }

        if (isRedisReady) {
            await redisModel.hSet(
                'remind',
                remindID,
                JSON.stringify(remind),
                'remind.models.ts',
                Date.now(),
            );
        }

        return results;
    }

    async updateIsDeleted(con: PoolConnection, remindID: number) {
        const result = await this.update(
            con,
            tables.tableRemind,
            { is_deleted: 1 },
            'id',
            remindID,
        );
        const isRedisReady = redisModel.redis.instanceConnect.isReady;

        const { data } = await redisModel.hGetAll(
            'remind',
            'remind.model.ts',
            Date.now(),
        );
        const reminds: any = isRedisReady ? Object.values(data) : result;
        if (isRedisReady) {
            const remindIndex = reminds.findIndex(
                (remind: any) => remind.id === remindID,
            );

            if (remindIndex !== -1) {
                let remind = JSON.parse(reminds[remindIndex]);
                remind.is_deleted = 1;
                await redisModel.hSet(
                    'remind',
                    remindID,
                    JSON.stringify(remind),
                    'remind.models.ts',
                    Date.now(),
                );
            } else {
                console.log(`Remind with ID ${remindID} not found in Redis`);
            }
        }
        return result;
    }

    async finishRemind(
        con: PoolConnection,
        remindID: number,
        user_id: number,
        data: any,
    ) {
        try {
            const result: any = await this.select(
                con,
                tables.tableRemind,
                '*',
                'id = ?',
                [remindID],
            );

            const remindOld = result?.[0];

            const vehicles = await scheduleUtils.getVehiclesByRemindId(
                remindID,
            );
            const schedules: any = await scheduleUtils.buildSchedule(remindID);
            const cumulative_kilometers =
                await this.getCurrentKilometersByVehicleId(
                    vehicles[0],
                    data?.token,
                );
            const payload = {
                note_repair: remindOld.note_repair,
                current_kilometers: remindOld.current_kilometers,
                cumulative_kilometers: cumulative_kilometers,
                km_before: remindOld.km_before,
                remind_category_id: remindOld.remind_category_id,
                cycle: remindOld.cycle,
                user: { userId: user_id },
                vehicles,
                expiration_time:
                    (Math.ceil(Date.now() / 1000) +
                        remindOld.cycle * UNIT_MONTH) *
                    1000,
                schedules: schedules?.map((s: any) => ({
                    ...s,
                    start: s.start + remindOld.cycle * UNIT_MONTH * 1000,
                    end: s.end + remindOld.cycle * UNIT_MONTH * 1000,
                })),
            };
            await remindService.update({ is_received: 1 }, remindID);
            await remindService.addRemind(payload);
            scheduleUtils.destroyAllCronJobByRemindId(remindID, 'schedule');
            scheduleUtils.destroyAllCronJobByRemindId(remindID, 'expire');

            return payload;
        } catch (error) {
            console.log('Error finish remind:', error);
        }
    }

    async getFinishRemind(
        con: PoolConnection,
        vehicle_id: string,
        user_id: number,
    ) {
        const isRedisReady = redisModel.redis.instanceConnect.isReady;
        if (isRedisReady) {
            const { data } = await redisModel.hGetAll(
                'remind',
                'remind.model.ts',
                Date.now(),
            );
            const reminds: any = Object.values(data).filter((remind: any) => {
                remind = JSON.parse(remind);
                return (
                    remind.is_received === 1 &&
                    remind.vehicles.includes(vehicle_id)
                );
            });
            return reminds;
        }
        const result = await this.selectWithJoins(
            con,
            tables.tableRemindVehicle,
            ` 
                 ${tables.tableRemind}.id AS remind_id,
                 ${tables.tableRemind}.img_url AS remind_img_url,
                 ${tables.tableRemind}.note_repair AS note_repair,
                 ${tables.tableRemind}.history_repair AS history_repair,
                 ${tables.tableRemind}.current_kilometers AS current_kilometers,
                 ${tables.tableRemind}.cumulative_kilometers AS cumulative_kilometers,
                 ${tables.tableRemind}.expiration_time AS expiration_time,
                 ${tables.tableRemind}.is_notified AS is_notified,
                 ${tables.tableRemind}.is_received AS is_received,
                 ${tables.tableRemind}.create_time AS remind_create_time,
                 ${tables.tableRemind}.update_time AS remind_update_time,
                 
                 ${tables.tableRemindCategory}.id AS remind_category_id,
                 ${tables.tableRemindCategory}.name AS category_name,
                 ${tables.tableRemindCategory}.desc AS category_desc,
                 ${tables.tableRemindCategory}.icon AS category_icon,
                 ${tables.tableRemindCategory}.create_time AS category_create_time,
                 ${tables.tableRemindCategory}.update_time AS category_update_time,
                 ${tables.tableRemindCategory}.is_deleted AS category_is_deleted`,
            `${tables.tableRemind}.is_received = ? AND ${tables.tableRemindVehicle}.vehicle_id = ${vehicle_id}`,
            '1',
            [
                {
                    table: tables.tableRemind,
                    on: `${tables.tableRemindVehicle}.remind_id = ${tables.tableRemind}.id`,
                    type: 'INNER',
                },
                {
                    table: tables.tableRemindCategory,
                    on: `${tables.tableRemind}.remind_category_id = ${tables.tableRemindCategory}.id`,
                    type: 'INNER',
                },
            ],
        );
        return result;
    }

    async getAllGPS(query: any) {
        try {
            // search when query.keyword is not null
            const { keyword, vehicle_id } = query;

            let reminds: any = await reminder.getRemindsByVehicleId(vehicle_id);

            if (!(typeof keyword === 'string' && keyword.trim() !== ''))
                return reminds;
            // search by keyword
            const results = reminds.filter(
                (remind: any) =>
                    // toLowerCase() for case-insensitive search
                    remind.note_repair
                        .toLowerCase()
                        .includes(keyword.toLowerCase()) ||
                    remind.cumulative_kilometers.toString().includes(keyword) ||
                    remind.name.toLowerCase().includes(keyword.toLowerCase()),
            );

            return results;
        } catch (error) {
            console.log('Error getting all GPS:', error);
        }
    }

    async getCategoryAll(userId: any) {
        return await reminder.getCategoryAllByUserId(userId);
    }

    async getScheduleByRemindId(remindId: any) {
        return await scheduleUtils.buildSchedule(remindId);
    }
}

export default new RemindModel();
