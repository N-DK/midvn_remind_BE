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
const init_mysql_1 = require("../dbs/init.mysql");
const node_cron_1 = __importDefault(require("node-cron"));
const os_1 = __importDefault(require("os"));
const process_1 = __importDefault(require("process"));
class IssueTask {
    checkOverload(minute = 15) {
        return node_cron_1.default.schedule(`*/${minute} * * * *`, function () {
            return __awaiter(this, void 0, void 0, function* () {
                // console.log("---------------------");
                // console.log("running a task every 10 seconds");
                const numOfConnectDB = yield (0, init_mysql_1.getActiveConnections)();
                // console.log("numOfConnectDB", numOfConnectDB);
                const platform = os_1.default.platform();
                const totalmem = os_1.default.totalmem();
                const numCores = os_1.default.cpus().length;
                const memoryUse = process_1.default.memoryUsage().rss;
                const versionNode = process_1.default.version;
                console.table([
                    {
                        versionNode,
                        platform,
                        totalmem: totalmem / 1024 / 1024 / 1024 + ' GB',
                        numCores,
                        memoryUse: memoryUse / 1024 / 1024 + ' MB',
                        numOfConnectDB,
                    },
                ]);
            });
        });
    }
}
exports.default = new IssueTask();
