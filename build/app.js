"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const path_1 = __importDefault(require("path"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const app = (0, express_1.default)();
app.use((0, morgan_1.default)('dev'));
app.use((0, helmet_1.default)());
app.use(helmet_1.default.frameguard({
    action: 'deny',
})); //not a browser should be allowed to render a page in the <frame>, <iframe>, <embed> and <object> HTML elements.
app.use((0, compression_1.default)({
    level: 6, // level compress
    threshold: 100 * 1024, // > 100kb threshold to compress
    filter: (req) => {
        return !req.headers['x-no-compress'];
    },
}));
app.use((0, cors_1.default)({ origin: true, credentials: true })); // origin: true cho phép client truy cập.
// config uploads folder
app.use(express_1.default.static(path_1.default.join(__dirname, 'uploads')));
// body-parser config
const bodyParser = require('body-parser');
app.use(bodyParser.json({ limit: '10kb' }));
app.use(bodyParser.urlencoded({ limit: '10kb', extended: true }));
//init db
const init_mysql_1 = require("./dbs/init.mysql");
(0, init_mysql_1.initDB)();
//init redis
// const { initRedis } = require('./dbs/init.redis');
// initRedis();
//init mqtt client
// const { initMqtt } = require('./config/mqtt.config');
// initMqtt();
// import routes
const routes_1 = __importDefault(require("./routes"));
(0, routes_1.default)(app);
//midleware handle error
// const {
//     is404Handler,
//     logErrorMiddleware,
//     returnError,
// } = require('./middlewares/handleErrors.middleware');
// app.use(is404Handler);
// app.use(logErrorMiddleware);
// app.use(returnError);
//init cron job
// const tasks = require("./tasks/issure.task");
// tasks.checkOverload().start();
exports.default = app;
