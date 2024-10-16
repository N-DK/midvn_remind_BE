import { mylogger } from '../../../logger';
import redisModel from '../../../models/redis.model';
import { remindFeature as remindNotify } from 'notify-services';
import reminder from '../../reminder.util';
import configureEnvironment from '../../../config/dotenv.config';

const { SV_NOTIFY } = configureEnvironment();
const remindFeature = async (client: any, data: any, requestId: any) => {
    const isRedisReady = redisModel?.redis?.instanceConnect?.isReady;

    try {
        if (!data || !Object.keys(data).length) return;

        let reminds: any[] = [];

        if (isRedisReady) {
            reminds =
                (await reminder.groupVehiclesWithObjects(data?.imei)) || [];
        } else {
            const result = await reminder.getReminds(false);

            reminds = result?.[data.imei] || [];
        }

        if (reminds?.length > 0) {
            await processRemind(data, reminds);
        }
    } catch (error) {
        mylogger.error('message', ['nameFeature', requestId, error]);
    }
};

const processRemind = async (data: any, reminds: any[]) => {
    // console.log(`${data?.vehicle_name} - ${reminds.length}`);

    for (const remind of reminds) {
        const isOverKm =
            data.total_distance >=
            remind.current_kilometers +
                remind.cumulative_kilometers -
                remind.km_before;

        if (isOverKm && remind.current_kilometers > 0) {
            await remindNotify.sendNotifyRemind(SV_NOTIFY as string, {
                name_remind: 'Vượt quá số km bảo dưỡng',
                vehicle_name: data?.vehicle_name,
                user_id: remind?.user_id,
            });
        }
    }
};

export { remindFeature };
