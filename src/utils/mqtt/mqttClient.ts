import configureEnvironment from '../../config/dotenv.config';
import { mylogger } from '../../logger';
import { remindFeature } from './features/remindFeature.feature';
import { v4 as uuidv4 } from 'uuid';

const { TOPIC_STATUS_GPS } = configureEnvironment();

const channel = {
    [TOPIC_STATUS_GPS as string]: remindFeature,
};

const handleMessageMqtt = async (
    client: any,
    { topic, mess }: { topic: string; mess: string },
) => {
    const requestId = uuidv4();
    try {
        if (topic && mess) {
            const data = JSON.parse(mess.toString());

            channel[topic]?.(client, data, requestId);
        }
    } catch (error: any) {
        console.log(error);
        mylogger.error('error data mqtt', [
            'handleMessageMqtt',
            requestId,
            { msg: error?.message, error, mqtt: mess?.toString() },
        ]);
    }
};

export default handleMessageMqtt;
