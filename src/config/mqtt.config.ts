import mqtt, { MqttClient } from 'mqtt';
import { v4 as uuidv4 } from 'uuid';

import { mylogger } from '../logger';
import configureEnvironment from './dotenv.config';
import handleMessageMqtt from '../utils/mqtt/mqttClient';

const { SV_MQTT, PORT_SV_MQTT, USERNAME_MQTT, PASSWORD, TOPIC_STATUS_GPS } =
    configureEnvironment();

const configMqtt = {
    port: PORT_SV_MQTT,
    username: USERNAME_MQTT,
    password: PASSWORD,
};

let client: any = {};

const statusConnectMqtt = {
    CONNECT: 'connect',
    CLOSE: 'close',
    RECONNECT: 'reconnect',
    ERROR: 'error',
    DISCONNECT: 'disconnect',
};

const listTopicSubscribe = [TOPIC_STATUS_GPS];

async function handleEventConnectiion(connection: any) {
    try {
        connection.on(statusConnectMqtt.CONNECT, (ack: any) => {
            console.log('connection mqtt - status:successfully');
            mylogger.log('connection mqtt - status:successfully', [
                'config mqtt',
                uuidv4(),
                ack,
            ]);
            connection.subscribe(
                listTopicSubscribe,
                (err: any, granted: any) => {
                    if (err) {
                        mylogger.error('subscribe mqtt - status:error', [
                            'config mqtt',
                            uuidv4(),
                            err,
                        ]);
                    } else {
                        if (granted.length) {
                            granted.forEach(
                                ({
                                    topic,
                                    qos,
                                }: {
                                    topic: string;
                                    qos: string;
                                }) => {
                                    mylogger.log(`subscribe ${topic} success`, [
                                        'config mqtt',
                                        uuidv4(),
                                        { topic, qos },
                                    ]);
                                },
                            );
                        }
                    }
                },
            );
        });

        connection.on(statusConnectMqtt.RECONNECT, (attempt: any) => {
            mylogger.error('connection mqtt - status:reconnect', [
                'config mqtt',
                uuidv4(),
                attempt,
            ]);
        });

        connection.on(statusConnectMqtt.ERROR, (err: any) => {
            mylogger.error('connection mqtt - status:error', [
                'config mqtt',
                uuidv4(),
                err,
            ]);
        });

        connection.on('message', (topic: string, mess: string) => {
            handleMessageMqtt(connection, { topic, mess });
        });

        connection.on(statusConnectMqtt.CLOSE, (err: any) => {
            mylogger.warning('connection mqtt - status:close', [
                'config mqtt',
                uuidv4(),
                err,
            ]);
        });

        connection.on(statusConnectMqtt.DISCONNECT, (err: any) => {
            mylogger.warning('connection mqtt - status:disconnect', [
                'config mqtt',
                uuidv4(),
                err,
            ]);
        });
    } catch (error) {
        mylogger.error('error mqtt client', ['config mqtt', uuidv4(), error]);
    }
}

async function init() {
    try {
        const instanceMqtt = mqtt.connect(
            SV_MQTT as string,
            {
                ...configMqtt,
            } as any,
        );
        client.instanceMqtt = instanceMqtt;
        handleEventConnectiion(instanceMqtt);
    } catch (error) {
        mylogger.error('error mqtt client', ['config mqtt', uuidv4(), error]);
    }
}

async function getClient() {
    try {
        return client;
    } catch (error) {
        mylogger.error('error getClient mqtt ', [
            'config mqtt',
            uuidv4(),
            error,
        ]);
    }
}
export { init as initMqtt, getClient as getClientMqtt };
