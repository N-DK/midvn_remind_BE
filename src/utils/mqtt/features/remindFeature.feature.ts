import { mylogger } from '../../../logger';
import redisModel from '../../../models/redis.model';
import { remindFeature as remindNotify } from 'notify-services';
import reminder from '../../reminder.util';

const remindFeature = async (client: any, data: any, requestId: any) => {
    const isRedisReady = redisModel.redis.instanceConnect.isReady;

    try {
        if (!data || !Object.keys(data).length) return;

        // if (data.imei === '2102000171') console.log('remindFeature', data);

        let reminds: any = [];

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

        reminds = await reminder.getRemindsByVehicleId(data.imei);

        if (reminds.length > 0) {
            // console.log('reminds', reminds);
            for (const remind of reminds) {
                const isOverKm =
                    data.total_distance >=
                    remind.current_kilometers +
                        remind.cumulative_kilometers -
                        remind.km_before;

                if (isOverKm) {
                    remindNotify.sendNotifyRemind('http://localhost:3007', {
                        name_remind: 'Vượt quá số km bảo dưỡng',
                        vehicle_name: data.vehicle_name,
                        user_id: 5, //remind.user_id,
                    });
                }
            }
        }
    } catch (error) {
        console.log(error);
        mylogger.error('message', ['nameFeature', requestId, error]);
    }
};

export { remindFeature };
