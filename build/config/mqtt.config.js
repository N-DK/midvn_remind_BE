"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMqtt = init;
exports.getClientMqtt = getClient;
const mqtt_1 = __importDefault(require("mqtt"));
const uuid_1 = require("uuid");
const logger_1 = require("../logger");
const dotenv_config_1 = __importDefault(require("./dotenv.config"));
const mqttClient_1 = __importDefault(require("../utils/mqtt/mqttClient"));
const { SV_MQTT, PORT_SV_MQTT, USERNAME_MQTT, PASSWORD, TOPIC_STATUS_GPS } = (0, dotenv_config_1.default)();
const configMqtt = {
    port: PORT_SV_MQTT,
    username: USERNAME_MQTT,
    password: PASSWORD,
};
let client = {};
const statusConnectMqtt = {
    CONNECT: 'connect',
    CLOSE: 'close',
    RECONNECT: 'reconnect',
    ERROR: 'error',
    DISCONNECT: 'disconnect',
};
const listTopicSubscribe = [TOPIC_STATUS_GPS];
function handleEventConnectiion(connection) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            connection.on(statusConnectMqtt.CONNECT, (ack) => {
                console.log('connection mqtt - status:successfully');
                logger_1.mylogger.log('connection mqtt - status:successfully', [
                    'config mqtt',
                    (0, uuid_1.v4)(),
                    ack,
                ]);
                connection.subscribe(listTopicSubscribe, (err, granted) => {
                    if (err) {
                        logger_1.mylogger.error('subscribe mqtt - status:error', [
                            'config mqtt',
                            (0, uuid_1.v4)(),
                            err,
                        ]);
                    }
                    else {
                        if (granted.length) {
                            granted.forEach(({ topic, qos, }) => {
                                logger_1.mylogger.log(`subscribe ${topic} success`, [
                                    'config mqtt',
                                    (0, uuid_1.v4)(),
                                    { topic, qos },
                                ]);
                            });
                        }
                    }
                });
            });
            connection.on(statusConnectMqtt.RECONNECT, (attempt) => {
                logger_1.mylogger.error('connection mqtt - status:reconnect', [
                    'config mqtt',
                    (0, uuid_1.v4)(),
                    attempt,
                ]);
            });
            connection.on(statusConnectMqtt.ERROR, (err) => {
                logger_1.mylogger.error('connection mqtt - status:error', [
                    'config mqtt',
                    (0, uuid_1.v4)(),
                    err,
                ]);
            });
            connection.on('message', (topic, mess) => {
                (0, mqttClient_1.default)(connection, { topic, mess });
            });
            connection.on(statusConnectMqtt.CLOSE, (err) => {
                logger_1.mylogger.warning('connection mqtt - status:close', [
                    'config mqtt',
                    (0, uuid_1.v4)(),
                    err,
                ]);
            });
            connection.on(statusConnectMqtt.DISCONNECT, (err) => {
                logger_1.mylogger.warning('connection mqtt - status:disconnect', [
                    'config mqtt',
                    (0, uuid_1.v4)(),
                    err,
                ]);
            });
        }
        catch (error) {
            logger_1.mylogger.error('error mqtt client', ['config mqtt', (0, uuid_1.v4)(), error]);
        }
    });
}
function init() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const instanceMqtt = mqtt_1.default.connect(SV_MQTT, Object.assign({}, configMqtt));
            client.instanceMqtt = instanceMqtt;
            handleEventConnectiion(instanceMqtt);
        }
        catch (error) {
            logger_1.mylogger.error('error mqtt client', ['config mqtt', (0, uuid_1.v4)(), error]);
        }
    });
}
function getClient() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return client;
        }
        catch (error) {
            logger_1.mylogger.error('error getClient mqtt ', [
                'config mqtt',
                (0, uuid_1.v4)(),
                error,
            ]);
        }
    });
}
