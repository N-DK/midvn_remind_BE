import cron from 'node-cron';
import { isBefore, isAfter, startOfDay } from 'date-fns';
import redisModel from '../models/redis.model';
import { remindFeature } from 'notify-services';
import DatabaseModel from '../models/database.model';
import { getConnection } from '../dbs/init.mysql';
import { tables } from '../constants/tableName.constant';
import { PoolConnection } from 'mysql2';

let schedules: {
    remind: any;
    schedule: { start: Date; end: Date; time: string };
}[] = [];

class ScheduleUtils {
    // private isRedisReady: boolean;
    private databaseModel: DatabaseModel;
    private conn: PoolConnection;

    constructor() {
        this.databaseModel = new DatabaseModel();
        this.init();
        this.conn = null as unknown as PoolConnection;
    }

    private async init() {
        try {
            this.conn = (await getConnection()).conn;
            await this.loadSchedules();
            this.restoreCronJobs();
            await this.restoreCronJobsForExpired();
        } catch (error) {
            console.error('Error initializing schedules:', error);
        }
    }

    private async restoreCronJobsForExpired() {
        const reminds: any = await this.loadReminds();

        if (!reminds?.length) return;

        for (const remind of reminds) {
            const expirationTime = new Date(
                remind.expiration_time * 1000, // + 86400000 // 1 day
            );

            console.log('expirationTime', expirationTime);

            const cronJob = await this.createCronJobForExpired(
                expirationTime,
                remind,
            );
            cronJob.start();
        }
    }

    public async createCronJobForExpired(expirationTime: Date, remind: any) {
        const month = expirationTime.getMonth() + 1;
        const day = expirationTime.getDate();
        const { remind_id, vehicles, id, ...other } = remind;

        console.log('other', other);

        console.table({ remind: remind.remind_id, month, day });

        const cronJob = cron.schedule(
            `* * ${day} ${month} *`, // */20 8-20
            async () => {
                try {
                    await this.databaseModel.update(
                        this.conn,
                        tables.tableRemind,
                        { is_notified: 1 }, // Đánh dấu đã thông báo
                        'id',
                        remind.id,
                    );
                    await this.databaseModel.insert(
                        this.conn,
                        tables.tableRemind,
                        {
                            ...other,
                            expiration_time: Date.now(),
                        },
                    );
                    await remindFeature.sendNotifyRemind(
                        'http://localhost:3007',
                        {
                            name_remind:
                                'Hạn bảo dưỡng ' + remind.note_repair + ' NDK',
                            vehicle_name: 'Xe ' + remind.vehicles.join(', '),
                            user_id: 5,
                        },
                    );
                } catch (error) {
                    console.error(
                        'Error sending reminder notification:',
                        error,
                    );
                } finally {
                    cronJob.stop();
                }
            },
        );

        return cronJob;
    }

    private restoreCronJobs() {
        if (!schedules?.length) return;

        for (const { remind, schedule } of schedules) {
            const cronJob = this.createCronJob(schedule, remind, async () => {
                await remindFeature.sendNotifyRemind('http://localhost:3007', {
                    name_remind: remind.note_repair + ' NDK',
                    vehicle_name: remind.vehicles.join(', '),
                    user_id: 5,
                });
            });
            cronJob.start();
        }
    }

    private async loadReminds() {
        try {
            const isRedisReady = redisModel.redis.instanceConnect.isReady;
            if (!isRedisReady) {
                const results: any = await this.databaseModel.select(
                    this.conn,
                    tables.tableRemind,
                    '*',
                    'is_received = 0 AND is_notified = 0',
                    [],
                );

                return await Promise.all(
                    results.map(async (item: any) => {
                        item.remind_id = item.id;

                        return (await this.buildSchedule(item, this.conn))
                            .remind;
                    }),
                );
            } else {
                const { data } = await redisModel.hGetAll(
                    'remind',
                    'remind.model.ts',
                    Date.now(),
                );

                return Object.values(data)
                    .filter((item: any) => {
                        item = JSON.parse(item);

                        return (
                            item.is_received === 0 &&
                            item.is_notified === 0 &&
                            !isBefore(
                                new Date(item.expiration_time * 1000),
                                startOfDay(new Date()),
                            )
                        );
                    })
                    .map((item: any) => JSON.parse(item));
            }
        } catch (error) {
            console.error('Error loading reminds:', error);
            return [];
        }
    }

    private async loadSchedules() {
        try {
            const isRedisReady = redisModel.redis.instanceConnect.isReady;

            if (!isRedisReady) {
                const result: any = await this.databaseModel.selectWithJoins(
                    this.conn,
                    tables.tableRemindSchedule,
                    '*',
                    'remind_id IS NOT NULL',
                    [],
                    [
                        {
                            table: tables.tableRemind,
                            on: `${tables.tableRemindSchedule}.remind_id = ${tables.tableRemind}.id`,
                            type: 'LEFT',
                        },
                    ],
                );

                schedules = await Promise.all(
                    result.map(async (item: any) =>
                        this.buildSchedule(item, this.conn),
                    ),
                );
            } else {
                const result = await redisModel.get(
                    'schedules',
                    'schedule.util.ts',
                    Date.now(),
                );

                schedules = JSON.parse(result?.data) ?? [];
            }
        } catch (error) {
            console.error('Error loading schedules:', error);
        }
    }

    private async buildSchedule(item: any, conn: any) {
        const vehicles: any = await this.databaseModel.selectWithJoins(
            conn,
            tables.tableVehicleNoGPS,
            '*',
            `remind_id = ${item.remind_id}`,
            [],
            [
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
            ],
        );

        return {
            remind: {
                ...item,
                vehicles: vehicles.map((v: any) => v.license_plate),
            },
            schedule: {
                start: new Date(item.start * 1000),
                end: new Date(item.end * 1000),
                time: item.time,
            },
        };
    }

    private isValidDateRange(
        currentDate: Date,
        start: Date,
        end: Date,
    ): boolean {
        return !isBefore(currentDate, start) && !isAfter(currentDate, end);
    }

    public createCronJob(
        schedule: { start: Date; end: Date; time: string },
        remind: any,
        callback: () => Promise<void>,
    ) {
        const [hour, minute] = schedule.time.split(':').map(Number);
        const cronJob = cron.schedule(`${minute} ${hour} * * *`, async () => {
            const currentDate = new Date();

            if (
                !this.isValidDateRange(
                    currentDate,
                    schedule.start,
                    schedule.end,
                )
            ) {
                cronJob.stop();
                schedules = schedules.filter(
                    (s) => s.remind.remind_id !== remind.remind_id,
                );
                await this.updateSchedulesInRedis();
                return;
            }

            try {
                await callback();
            } catch (error) {
                console.error('Error during cron job execution:', error);
            }
        });

        return cronJob;
    }

    public async createSchedule(
        schedule: { start: Date; end: Date; time: string },
        callback: () => Promise<void>,
        remind: any,
    ) {
        const cronJob = this.createCronJob(schedule, remind, callback);
        cronJob.start();
        schedules.push({ remind, schedule });
        await this.updateSchedulesInRedis();
    }

    private async updateSchedulesInRedis() {
        const isRedisReady = redisModel.redis.instanceConnect.isReady;
        if (isRedisReady) {
            try {
                await redisModel.set(
                    'schedules',
                    JSON.stringify(schedules),
                    'schedule.util.ts',
                    Date.now(),
                );
            } catch (error) {
                console.error('Error updating schedules in Redis:', error);
            }
        }
    }
}

export default new ScheduleUtils();
