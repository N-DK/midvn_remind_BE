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
const redis_1 = __importDefault(require("redis"));
const redis_config_1 = __importDefault(require("../config/redis.config"));
let client = {}, statusConnectRedis = {
    CONNECT: 'connect',
    END: 'end',
    RECONNECTING: 'reconnecting',
    ERROR: 'error',
};
const handleEventConnection = (connection) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        connection.on(statusConnectRedis.CONNECT, () => {
            console.log('connectRedis - status: connected');
        });
        connection.on(statusConnectRedis.END, () => {
            console.log('connectRedis - status: connection closed');
        });
        connection.on(statusConnectRedis.RECONNECTING, (attempt) => {
            console.log(`connectRedis - status: reconnecting, attempt: ${attempt}`);
        });
        connection.on(statusConnectRedis.ERROR, (err) => {
            console.log(`connectRedis - status: error ${err}`);
        });
        yield connection.connect();
    }
    catch (error) {
        console.log('error redis::::', error);
    }
});
class Redis {
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const instanceRedis = yield redis_1.default.createClient(Object.assign(Object.assign({}, redis_config_1.default), { socket: {
                        reconnectStrategy: function (retries) {
                            return Math.min(retries * 500, 10000);
                        },
                    } }));
                client.instanceConnect = instanceRedis;
                handleEventConnection(instanceRedis);
            }
            catch (error) {
                console.log({ error: JSON.stringify(error, null, 2) });
            }
        });
    }
    get() {
        try {
            return client;
        }
        catch (error) {
            console.log(error);
        }
    }
    close() {
        if (client.instanceConnect) {
            client.instanceConnect.quit();
        }
    }
}
const { init, get, close } = new Redis();
exports.default = { initRedis: init, getRedis: get, closeRedis: close };
