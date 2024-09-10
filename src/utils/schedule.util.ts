import cron, { schedule, ScheduledTask } from 'node-cron';
import { isBefore, isAfter, startOfDay, endOfDay, isEqual } from 'date-fns';
import redisModel from '../models/redis.model';
import { remindFeature } from 'notify-services';
import DatabaseModel from '../models/database.model';
import { getConnection } from '../dbs/init.mysql';
import { tables } from '../constants/tableName.constant';
import { PoolConnection } from 'mysql2';
import remindModel from '../models/remind.model';

// let schedules: {
//     remind: any;
//     schedule: { start: Date; end: Date; time: string };
// }[] = [];

let reminds: any[] = [];
const cronJobs = new Map<string, ScheduledTask>();

class ScheduleUtils {
    private databaseModel: DatabaseModel;
    private conn: PoolConnection;
    private readonly UNIT_MONTH = 30 * 24 * 60 * 60;

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

        // console.log('remind ', reminds);

        if (!reminds?.length) return;

        for (const remind of reminds) {
            const expirationTime = new Date(
                remind.expiration_time + 86400000, // + 86400000 // 1 day
            );

            // console.log(
            //     'expirationTime',
            //     expirationTime,
            //     'remind.expiration_time',
            //     remind.expiration_time,
            // );

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
        const { remind_id, id, ...other } = remind;
        const isRedisReady = redisModel.redis.instanceConnect.isReady;

        // if (isRedisReady) {
        //     const { data } = await this.getRemindFromRedis();

        //     schedules = Object.values(data).filter((item: any) => {
        //         item = JSON.parse(item);

        //         return item.remind_id === remind.remind_id;
        //     });
        // }

        // console.log('other', other);
        // console.log('schedule', remind.schedules);

        console.table({ remind: remind.id, month, day });

        const cronJob = cron.schedule(
            `*/20 8-20 ${day} ${month} *`, // */20 8-20
            async () => {
                try {
                    await remindModel.addRemind(this.conn, {
                        ...other,
                        user: { userId: remind.user_id },
                        expiration_time:
                            (Math.ceil(Date.now() / 1000) +
                                remind.cycle * this.UNIT_MONTH) *
                            1000,
                        schedules: remind.schedules.map((s: any) => ({
                            ...s,
                            start:
                                s.start + remind.cycle * this.UNIT_MONTH * 1000,
                            end: s.end + remind.cycle * this.UNIT_MONTH * 1000,
                        })),
                    });
                    await remindFeature.sendNotifyRemind(
                        'http://localhost:3007',
                        {
                            name_remind:
                                'Hạn bảo dưỡng ' + remind.note_repair + ' NDK',
                            vehicle_name: 'Xe ' + remind.vehicles.join(', '),
                            user_id: remind.user_id,
                        },
                    );
                } catch (error) {
                    console.error(
                        'Error sending reminder notification:',
                        error,
                    );
                } finally {
                    // cronJob.stop();
                    // console.log('cronJobs before', cronJobs.size);

                    this.destroyAllCronJobByRemindId(remind.id, 'schedule');
                    this.destroyAllCronJobByRemindId(remind.id, 'expire');

                    // console.log('cronJobs after', cronJobs.size);

                    if (isRedisReady) {
                        // const { data } = await this.getRemindFromRedis();

                        // const key = Object.keys(data).find((key: any) => {
                        //     const item = JSON.parse(data[key]);

                        //     return item.id === remind.id;
                        // });
                        // console.log('key', remind.id);
                        const result = await redisModel.hDel(
                            'remind',
                            remind.id.toString(),
                            'schedule.utils.ts',
                            Date.now(),
                        );

                        // console.log('result', result);
                    } else {
                        await this.databaseModel.update(
                            this.conn,
                            tables.tableRemind,
                            { is_notified: 1, update_time: Date.now() }, // Đánh dấu đã thông báo
                            'id',
                            remind.id,
                        );
                    }
                }
            },
            { name: `${id}-${expirationTime}-expire` },
        );
        cronJobs.set(`${id}-${expirationTime}-expire`, cronJob);
        return cronJob;
    }

    private restoreCronJobs() {
        if (!reminds?.length) return;

        for (const remind of reminds) {
            for (const schedule of remind.schedules) {
                const cronJob = this.createCronJob(
                    {
                        start: new Date(schedule.start),
                        end: new Date(schedule.end),
                        time: schedule.time,
                    },
                    remind,
                    async () => {
                        await remindFeature.sendNotifyRemind(
                            'http://localhost:3007',
                            {
                                name_remind:
                                    'Gia hạn bảo dưỡng ' + remind.note_repair,
                                vehicle_name: remind.vehicles.join(', '),
                                user_id: remind.user_id,
                            },
                        );
                    },
                );

                cronJob.start();
            }
        }
    }

    private async getRemindFromRedis() {
        const isRedisReady = redisModel.redis.instanceConnect.isReady;

        if (isRedisReady) {
            const results = await redisModel.hGetAll(
                'remind',
                'remind.model.ts',
                Date.now(),
            );

            return results;
        } else {
            return { data: [], result: true };
        }
    }

    private async getRemindFromRedisById(remind_id: any) {
        const isRedisReady = redisModel.redis.instanceConnect.isReady;

        if (isRedisReady) {
            const results = await redisModel.hGet(
                'remind',
                remind_id,
                'remind.model.ts',
                Date.now(),
            );

            return results;
        } else {
            return { data: [], result: true };
        }
    }

    private async loadReminds() {
        try {
            const isRedisReady = redisModel.redis.instanceConnect.isReady;
            if (!isRedisReady) {
                const results = await this.getReminds();
                return results.filter(
                    (item) =>
                        !isBefore(
                            new Date(item.expiration_time),
                            startOfDay(new Date()),
                        ),
                );
            } else {
                const { data } = await this.getRemindFromRedis();

                return Object.values(data)
                    .filter((item: any) => {
                        // console.log(item);
                        item = JSON.parse(item);

                        return (
                            item.is_received === 0 &&
                            item.is_notified === 0 &&
                            item.is_deleted === 0 &&
                            !isBefore(
                                new Date(item.expiration_time),
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

    public async getReminds() {
        const results: any = await this.databaseModel.select(
            this.conn,
            tables.tableRemind,
            '*',
            'is_notified = 0 AND is_deleted = 0 AND is_received = 0',
            [],
        );

        const reminds = await Promise.all(
            results.map(async (item: any) => {
                const schedules = await this.buildSchedule(item.id);
                const vehicles = await this.getVehiclesByRemindId(item.id);
                return {
                    ...item,
                    schedules,
                    vehicles,
                };
            }),
        );
        return reminds;
    }

    private async loadSchedules() {
        try {
            const isRedisReady = redisModel.redis.instanceConnect.isReady;

            if (!isRedisReady) {
                reminds = await this.getReminds();
            } else {
                const result = await this.getRemindFromRedis();

                reminds =
                    Object.values(result?.data).map((item: any) =>
                        JSON.parse(item),
                    ) ?? [];
            }
        } catch (error) {
            console.error('Error loading schedules:', error);
        }
    }
    // const remind = reminds.find((item) => item.id === remind_id);
    // return remind?.schedules.some(
    //     (schedule: any) => job.getStatus() === `*/${schedule.time} * * * *`, // Thay thế cho job.cron?.source
    // );

    public async destroyAllCronJobByRemindId(remind_id: any, type: string) {
        cronJobs.forEach((job, key) => {
            if (key.includes(remind_id) && key.includes(type)) {
                // console.log('key', key, 'job', job);
                job.stop();
                cronJobs.delete(key);
            }
        });

        // console.log('cronJobs', cronJobs.size);

        // const cronJobs = Array.from(cron.getTasks()).filter(([_, job]) => {
        //     console.log('job', job);
        // });

        // cronJobs.forEach(([_, job]: [string, ScheduledTask]) => job.stop());
    }

    public async getVehiclesByRemindId(remind_id: any) {
        const vehicles: any = await this.databaseModel.selectWithJoins(
            this.conn,
            tables.tableVehicleNoGPS,
            '*',
            `remind_id = ${remind_id}`,
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

        return vehicles.map((v: any) => v.license_plate);
    }

    public async buildSchedule(remindId: any) {
        const result: any = await this.databaseModel.selectWithJoins(
            this.conn,
            tables.tableRemindSchedule,
            '*',
            `remind_id = ${remindId}`,
            [],
            [
                {
                    table: tables.tableRemind,
                    on: `${tables.tableRemindSchedule}.remind_id = ${tables.tableRemind}.id`,
                    type: 'LEFT',
                },
            ],
        );

        const groupedData = result
            .filter(
                (item: any) =>
                    item.is_notified === 0 &&
                    item.is_deleted === 0 &&
                    item.is_received === 0,
            )
            .reduce((acc: any, item: any) => {
                if (!acc[item.remind_id]) {
                    acc[item.remind_id] = [];
                }
                acc[item.remind_id].push({
                    start: item.start,
                    end: item.end,
                    time: item.time,
                });
                return acc;
            }, {});

        return Object.values(groupedData)[0];
    }

    private isValidDateRange(
        currentDate: Date,
        start: Date,
        end: Date,
    ): boolean {
        return (
            (!isBefore(currentDate, start) && !isAfter(currentDate, end)) ||
            (isEqual(startOfDay(currentDate), startOfDay(start)) &&
                isEqual(startOfDay(currentDate), startOfDay(end)))
        );
    }

    public createCronJob(
        schedule: { start: Date; end: Date; time: string },
        remind: any,
        callback: () => Promise<void>,
    ) {
        const [hour, minute] = schedule.time.split(':').map(Number);
        const cronJob = cron.schedule(
            `${minute} ${hour} * * *`,
            async () => {
                const currentDate = new Date();

                if (
                    !this.isValidDateRange(
                        currentDate,
                        schedule.start,
                        schedule.end,
                    )
                ) {
                    cronJob.stop();
                    const { data } = await this.getRemindFromRedisById(
                        remind.id,
                    );
                    const r = JSON.parse(data);
                    r.schedules = r.schedules.filter(
                        (s: any) => s.time !== schedule.time,
                    );
                    reminds = reminds.map((item) =>
                        item.id === remind.id ? r : item,
                    );
                    await this.updateSchedulesInRedis(remind.id);
                    return;
                }

                try {
                    await callback();
                } catch (error) {
                    console.error('Error during cron job execution:', error);
                }
            },
            { name: `${remind.id}-${schedule.time}-schedule` },
        );
        cronJobs.set(`${remind.id}-${schedule.time}-schedule`, cronJob);
        return cronJob;
    }

    public async createSchedule(
        schedule: { start: Date; end: Date; time: string },
        callback: () => Promise<void>,
        remind: any,
    ) {
        const cronJob = this.createCronJob(schedule, remind, callback);
        cronJob.start();
    }

    private async updateSchedulesInRedis(remind_id: any) {
        const isRedisReady = redisModel.redis.instanceConnect.isReady;
        if (isRedisReady) {
            try {
                await redisModel.hSet(
                    'remind',
                    remind_id,
                    JSON.stringify(reminds),
                    'remind.models.ts',
                    Date.now(),
                );
            } catch (error) {
                console.error('Error updating schedules in Redis:', error);
            }
        }
    }
}

export default new ScheduleUtils();
