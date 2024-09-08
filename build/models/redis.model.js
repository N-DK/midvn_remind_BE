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
Object.defineProperty(exports, "__esModule", { value: true });
const init_redis_1 = require("../dbs/init.redis");
const logger_1 = require("../logger");
class RedisModel {
    constructor() {
        this.redis = (0, init_redis_1.getRedis)();
        this.get = this.get.bind(this);
        this.hGet = this.hGet.bind(this);
        this.hGetAll = this.hGetAll.bind(this);
        this.set = this.set.bind(this);
        this.setWithExpired = this.setWithExpired.bind(this);
        this.hSet = this.hSet.bind(this);
        this.setnx = this.setnx.bind(this);
        this.expire = this.expire.bind(this);
        this.ttl = this.ttl.bind(this);
        this.exists = this.exists.bind(this);
        this.hdelOneKey = this.hdelOneKey.bind(this);
        this.del = this.del.bind(this);
        this.hDel = this.hDel.bind(this);
    }
    get(key, path, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { instanceConnect: client } = this.redis;
                const data = yield client.get(key);
                return { result: true, data };
            }
            catch (error) {
                console.log(error);
                logger_1.mylogger.error('interact get redis error', [
                    path || '',
                    requestId || Date.now,
                    error,
                ]);
                return { result: false, error };
            }
        });
    }
    hGet(key, field, path, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { instanceConnect: client } = this.redis;
                // console.log("key, field, path, requestId", key, field, path, requestId);
                const data = yield client.hGet(key, field);
                return { result: true, data };
            }
            catch (error) {
                // console.log(error);
                logger_1.mylogger.error('interact hGet redis error', [
                    path || '',
                    requestId || Date.now,
                    error,
                ]);
                return { result: false, error };
            }
        });
    }
    hGetAll(key, path, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { instanceConnect: client } = this.redis;
                const data = yield client.hGetAll(key);
                return { result: true, data };
            }
            catch (error) {
                console.log(error);
                logger_1.mylogger.error('interact hGetAll redis error', [
                    path || '',
                    requestId || Date.now,
                    error,
                ]);
                return { result: false, error };
            }
        });
    }
    set(key, value, path, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { instanceConnect: client } = this.redis;
                yield client.set(key, value);
                return { result: true, data: [] };
            }
            catch (error) {
                logger_1.mylogger.error('interact set redis error', [
                    path || '',
                    requestId || Date.now,
                    error,
                ]);
                return { result: false, error };
            }
        });
    }
    hSet(key, field, value, path, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { instanceConnect: client } = this.redis;
                // console.log("field", field);
                // console.log("key", key);
                // console.log("client", value);
                yield client.hSet(key, field, value);
                return { result: true, data: [] };
            }
            catch (error) {
                console.log(error);
                logger_1.mylogger.error('interact hSet redis error', [
                    path || '',
                    requestId || Date.now,
                    error,
                ]);
                return { result: false, error };
            }
        });
    }
    setWithExpired(key_1, value_1) {
        return __awaiter(this, arguments, void 0, function* (key, value, times = 30, path, requestId) {
            try {
                const { instanceConnect: client } = this.redis;
                // console.log({ key, value, times, path, requestId });
                yield client.setEx(key, times, value);
                return { result: true, data: [] };
            }
            catch (error) {
                logger_1.mylogger.error('interact setWithExpired redis error', [
                    path || '',
                    requestId || Date.now,
                    error,
                ]);
                return { result: false, error };
            }
        });
    }
    setnx(key, value, path, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { instanceConnect: client } = this.redis;
                yield client.setNX(key, value);
                return { result: true, data: [] };
            }
            catch (error) {
                logger_1.mylogger.error('interact setnx redis error', [
                    path || '',
                    requestId || Date.now,
                    error,
                ]);
                return { result: false, error };
            }
        });
    }
    expire(key, ttl, path, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { instanceConnect: client } = this.redis;
                return yield client.expire(key, ttl);
            }
            catch (error) {
                logger_1.mylogger.error('interact expire redis error', [
                    path || '',
                    requestId || Date.now,
                    error,
                ]);
                throw error.msg;
            }
        });
    }
    ttl(key, path, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { instanceConnect: client } = this.redis;
                const data = yield client.ttl(key);
                return { result: true, data };
            }
            catch (error) {
                logger_1.mylogger.error('interact ttl redis error', [
                    path || '',
                    requestId || Date.now,
                    error,
                ]);
                return { result: false, error };
            }
        });
    }
    exists(key, path, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { instanceConnect: client } = this.redis;
                const data = yield client.exists(key);
                return { result: true, data };
            }
            catch (error) {
                logger_1.mylogger.error('interact exists redis error', [
                    path || '',
                    requestId || Date.now,
                    error,
                ]);
                return { result: false, error };
            }
        });
    }
    hdelOneKey(key, field, path, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { instanceConnect: client } = this.redis;
                yield client.hDel(key, field);
                return { result: true, data: [] };
            }
            catch (error) {
                console.log('error', error);
                logger_1.mylogger.error('interact hdelOneKey redis error', [
                    path || '',
                    requestId || Date.now,
                    error,
                ]);
                return { result: false, error };
            }
        });
    }
    del(key, path, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { instanceConnect: client } = this.redis;
                yield client.del(key);
                return { result: true, data: [] };
            }
            catch (error) {
                logger_1.mylogger.error('interact del redis error', [
                    path || '',
                    requestId || Date.now,
                    error,
                ]);
                return { result: false, error };
            }
        });
    }
    hDel(key, field, path, requestId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { instanceConnect: client } = this.redis;
                yield client.hDel(key, field);
                return { result: true, data: [] };
            }
            catch (error) {
                logger_1.mylogger.error('interact hDel redis error', [
                    path || '',
                    requestId || Date.now,
                    error,
                ]);
                return { result: false, error };
            }
        });
    }
}
exports.default = new RedisModel();
