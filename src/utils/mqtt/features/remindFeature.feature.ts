import { PoolConnection } from 'mysql2';
import { mylogger } from '../../../logger';
import DatabaseModel from '../../../models/database.model';
import redisModel from '../../../models/redis.model';
import { tables } from '../../../constants/tableName.constant';
import { remindFeature as remindNotify } from 'notify-services';
import scheduleUtil from '../../schedule.util';
import reminder from '../../reminder.util';
const databaseModel = new DatabaseModel();

const remindFeature = async (client: any, data: any, requestId: any) => {
    const isRedisReady = redisModel.redis.instanceConnect.isReady;

    try {
        if (!data || !Object.keys(data).length) return;

        // let reminds: any = [];

        // console.log(await reminder.getRemindsByVehicleId('08F596398A'));

        // if (isRedisReady) {
        //     const { data } = await redisModel.hGetAll(
        //         'remind',
        //         'remindFeature',
        //         requestId,
        //     );

        //     const results = Object.values(data)
        //         .map((item: any) => JSON.parse(item))
        //         .filter((item: any) => item.current_kilometers > 0);

        //     reminds = results;
        // }

        // km_before, current_kilometers, cumulative_kilometers
        // if(current_kilometers + cumulative_kilometers - km_before >= data.total_distance)
        // for (const remind of reminds) {
        // remindNotify.sendNotifyRemind('', {
        //     name_remind: '',
        //     vehicle_name: '',
        //     user_id,
        // });
        // }
    } catch (error) {
        console.log(error);
        mylogger.error('message', ['nameFeature', requestId, error]);
    }
};

export { remindFeature };
