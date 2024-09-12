import { mylogger } from '../../../logger';
import redisModel from '../../../models/redis.model';
import { remindFeature as remindNotify } from 'notify-services';
import reminder from '../../reminder.util';
import configureEnvironment from '../../../config/dotenv.config';

const { SV_NOTIFY } = configureEnvironment();

const remindFeature = async (client: any, data: any, requestId: any) => {
    const isRedisReady = redisModel.redis.instanceConnect.isReady;
    let reminds: any = [];

    try {
        if (!data || !Object.keys(data).length) return;

        if (isRedisReady) {
            reminds =
                (await reminder.groupVehiclesWithObjects(data.imei)) ?? [];
        }

        if (reminds.length === 0) {
            const result = await reminder.getReminds();
            reminds = result[data.imei] ?? [];
        }

        if (reminds.length > 0) {
            console.log(`${data.vehicle_name} - ${reminds.length}`);
            for (const remind of reminds) {
                const isOverKm =
                    data.total_distance >=
                    remind.current_kilometers +
                        remind.cumulative_kilometers -
                        remind.km_before;

                if (isOverKm) {
                    remindNotify.sendNotifyRemind(SV_NOTIFY as string, {
                        name_remind: 'Vượt quá số km bảo dưỡng',
                        vehicle_name: data.vehicle_name,
                        user_id: remind.user_id, //remind.user_id,
                    });
                }
            }
        }
    } catch (error) {
        console.log('Error', error);
        mylogger.error('message', ['nameFeature', requestId, error]);
    }
};

export { remindFeature };

// if (data.imei === '2102000171') console.log('remindFeature', data);

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

// if (reminds.length === 0) {
//     console.log('===>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', reminds);
//     reminds = await reminder.get(data.imei);
// }
