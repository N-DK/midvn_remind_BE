import cron from 'node-cron';
import { isBefore, isAfter } from 'date-fns';
import redisModel from '../models/redis.model';
import { remindFeature } from 'notify-services';
import DatabaseModel from '../models/database.model';
import { getConnection } from '../dbs/init.mysql';
import { tables } from '../constants/tableName.constant';

let schedules: {
    remind: any;
    schedule: { start: Date; end: Date; time: string };
}[];

class ScheduleUtils {
    isRedisReady: boolean;

    constructor() {
        this.init();
        this.isRedisReady = redisModel.redis.instanceConnect.isReady;
    }

    private async init() {
        // Tải các schedules từ Redis
        await this.loadSchedules();

        // Khôi phục các cron jobs sau khi đã tải xong
        this.restoreCronJobs();
    }

    restoreCronJobs() {
        if (!schedules.length) return;

        for (const item of schedules) {
            const { remind, schedule } = item;

            const cronJob = this.createCronJob(schedule, remind, async () => {
                await remindFeature.sendNotifyRemind('http://localhost:3007', {
                    name_remind: remind.note_repair + ' NDK',
                    vehicle_name: remind.vehicles.join(', '),
                    user_id: 5,
                });
            });
            cronJob.start(); // Bắt đầu cron job
        }
    }

    private async loadSchedules() {
        try {
            if (!this.isRedisReady) {
                const databaseModel = new DatabaseModel();
                const { conn } = await getConnection();
                const result: any = await databaseModel.selectWithJoins(
                    conn,
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
                    result.map(async (item: any) => {
                        const vehicles: any =
                            await databaseModel.selectWithJoins(
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
                                vehicles: vehicles.map(
                                    (v: any) => v.license_plate,
                                ),
                            },
                            schedule: {
                                start: new Date(item.start * 1000),
                                end: new Date(item.end * 1000),
                                time: item.time,
                            },
                        };
                    }),
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
            console.error('Error loading schedules from Redis:', error);
        }
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
        const { start, end, time } = schedule;
        const [hour, minute] = time.split(':').map(Number);
        const cronJob = cron.schedule(`${minute} ${hour} * * *`, async () => {
            const currentDate = new Date();

            // if (isAfter(currentDate, new Date(remind.expiration_time * 1000))) {
            //     console.log('Bạn có muốn tiếp tục chu kỳ không?');
            //     return;
            // }

            if (!this.isValidDateRange(currentDate, start, end)) {
                console.log('Out of date range, stopping the cron job.');
                cronJob.stop(); // Dừng cron job
                schedules = schedules.filter(
                    (schedule) =>
                        schedule.remind.remind_id !== remind.remind_id,
                ); // Xóa cron job khỏi danh sách
                await this.updateSchedulesInRedis(); // Cập nhật vào Redis
                return;
            }

            try {
                // Thực thi callback nếu trong khoảng thời gian mong muốn
                await callback();
            } catch (error) {
                console.error('Error during cron job execution:', error);
            }
        });

        return cronJob;
    }

    async createSchedule(
        schedule: { start: Date; end: Date; time: string },
        callback: () => Promise<void>,
        remind: any,
    ) {
        // Tạo cron job
        const cronJob = this.createCronJob(schedule, remind, callback);
        cronJob.start();
        schedules.push({ remind, schedule });
        await this.updateSchedulesInRedis(); // Cập nhật vào Redis
    }

    private async updateSchedulesInRedis() {
        try {
            const isRedisReady = redisModel.redis.instanceConnect.isReady;
            if (isRedisReady) {
                await redisModel.set(
                    'schedules',
                    JSON.stringify(schedules),
                    'schedule.util.ts',
                    Date.now(),
                );
            }
        } catch (error) {
            console.error('Error updating schedules in Redis:', error);
        }
    }
}

export default new ScheduleUtils();
